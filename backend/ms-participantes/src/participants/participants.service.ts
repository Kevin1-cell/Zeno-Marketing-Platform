import { Injectable, ConflictException, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RegistroParticipanteDto, TipoParticipante } from '../dto/registro-participante.dto';
import { EditarParticipanteDto } from '../dto/editar-participante.dto';
import { ConvertirInvitadoDto } from '../dto/convertir-invitado.dto';
import { Participante, Nivel } from '@prisma/client';

@Injectable()
export class ParticipantsService {
  constructor(private prisma: PrismaService) {}

  private validarTelefono(telefon: string) {
    if (!/^\d{10}$/.test(telefon)) {
      throw new BadRequestException('El número de teléfono debe tener exactamente 10 dígitos');
    }
  }

  private async verificarAforo(eventoId: string) {
    const evento = await this.prisma.evento.findUnique({
      where: { id: eventoId },
      select: { aforo_maximo: true }
    });
    if (evento?.aforo_maximo) {
      const totalParticipantes = await this.prisma.participante.count({
        where: { evento_id: eventoId }
      });
      if (totalParticipantes >= evento.aforo_maximo) {
        throw new BadRequestException('El aforo máximo para este evento se ha llenado. Por favor, contacta al administrador.');
      }
    }
  }

  // Registro público de empleados (tipo EMPLEADO, confirmado = false, asigna número)
  async registrar(data: RegistroParticipanteDto): Promise<Participante> {
    if (data.tipo === TipoParticipante.INVITADO) {
      return this.registrarInvitado(data);
    }

    this.validarTelefono(data.telefon);
    if (!data.nivel) {
      throw new BadRequestException('Para empleados el nivel es obligatorio');
    }

    const evento = await this.prisma.evento.findFirst({
      where: { id: data.evento_id, estado: 'ACTIVO', eliminado: false },
    });
    if (!evento) throw new BadRequestException('Evento no válido');

    const existente = await this.prisma.participante.findUnique({
      where: { telefon_evento_id: { telefon: data.telefon, evento_id: data.evento_id } },
    });
    if (existente) throw new ConflictException('Ya existe un registro con este teléfono');

    // Validar aforo antes de crear
    await this.verificarAforo(data.evento_id);

    return await this.prisma.$transaction(async (tx) => {
      const maxNumero = await tx.participante.aggregate({
        where: { evento_id: data.evento_id },
        _max: { numero_asignado: true },
      });
      const nextNumero = (maxNumero._max.numero_asignado || 0) + 1;
      return await tx.participante.create({
        data: {
          nombre_completo: data.nombre_completo,
          telefon: data.telefon,
          nivel: data.nivel,
          evento_id: data.evento_id,
          numero_asignado: nextNumero,
          confirmado: false,
          tipo: TipoParticipante.EMPLEADO,
        },
      });
    });
  }

  // Registro público de invitados (tipo INVITADO, sin número, confirmado = false)
  async registrarInvitado(data: RegistroParticipanteDto): Promise<Participante> {
    this.validarTelefono(data.telefon);

    const evento = await this.prisma.evento.findFirst({
      where: { id: data.evento_id, estado: 'ACTIVO', eliminado: false },
    });
    if (!evento) throw new BadRequestException('Evento no válido');

    const existente = await this.prisma.participante.findUnique({
      where: { telefon_evento_id: { telefon: data.telefon, evento_id: data.evento_id } },
    });
    if (existente) throw new ConflictException('Ya existe un registro con este teléfono');

    // Validar aforo antes de crear
    await this.verificarAforo(data.evento_id);

    return await this.prisma.participante.create({
      data: {
        nombre_completo: data.nombre_completo,
        telefon: data.telefon,
        nivel: null,
        evento_id: data.evento_id,
        numero_asignado: null,
        confirmado: false,
        tipo: TipoParticipante.INVITADO,
        se_unio: data.se_unio ?? false,
        recompensa: data.recompensa ?? null,
      },
    });
  }

  // Registro manual por admin (EMPLEADO, confirmado = true, asigna número) – SIN validación de aforo
  async registrarManual(data: RegistroParticipanteDto): Promise<Participante> {
    if (data.tipo === TipoParticipante.INVITADO) {
      return this.registrarManualInvitado(data);
    }

    this.validarTelefono(data.telefon);
    if (!data.nivel) {
      throw new BadRequestException('Para empleados el nivel es obligatorio');
    }

    const existente = await this.prisma.participante.findUnique({
      where: { telefon_evento_id: { telefon: data.telefon, evento_id: data.evento_id } },
    });
    if (existente) throw new ConflictException('Ya existe un registro con este teléfono');

    return await this.prisma.$transaction(async (tx) => {
      const maxNumero = await tx.participante.aggregate({
        where: { evento_id: data.evento_id },
        _max: { numero_asignado: true },
      });
      const nextNumero = (maxNumero._max.numero_asignado || 0) + 1;
      return await tx.participante.create({
        data: {
          nombre_completo: data.nombre_completo,
          telefon: data.telefon,
          nivel: data.nivel,
          evento_id: data.evento_id,
          numero_asignado: nextNumero,
          confirmado: true,
          tipo: TipoParticipante.EMPLEADO,
        },
      });
    });
  }

  async registrarManualInvitado(data: RegistroParticipanteDto): Promise<Participante> {
    this.validarTelefono(data.telefon);

    const existente = await this.prisma.participante.findUnique({
      where: { telefon_evento_id: { telefon: data.telefon, evento_id: data.evento_id } },
    });
    if (existente) throw new ConflictException('Ya existe un registro con este teléfono');

    return await this.prisma.participante.create({
      data: {
        nombre_completo: data.nombre_completo,
        telefon: data.telefon,
        nivel: null,
        evento_id: data.evento_id,
        numero_asignado: null,
        confirmado: false,
        tipo: TipoParticipante.INVITADO,
        se_unio: data.se_unio ?? false,
        recompensa: data.recompensa ?? null,
      },
    });
  }

  // Confirmar empleado
  async confirmar(id: string): Promise<Participante> {
    const participante = await this.prisma.participante.findUnique({ where: { id } });
    if (!participante) throw new NotFoundException('Participante no encontrado');
    if (participante.tipo === 'INVITADO') {
      throw new BadRequestException('Los invitados no se confirman directamente. Use "Convertir a empleado".');
    }
    return await this.prisma.participante.update({
      where: { id },
      data: { confirmado: true },
    });
  }

  async convertirInvitadoAEmpleado(dto: ConvertirInvitadoDto): Promise<Participante> {
    const participante = await this.prisma.participante.findUnique({ where: { id: dto.id } });
    if (!participante) throw new NotFoundException('Participante no encontrado');
    if (participante.tipo !== 'INVITADO') {
      throw new BadRequestException('Solo se puede convertir un participante de tipo invitado');
    }

    return await this.prisma.$transaction(async (tx) => {
      const maxNumero = await tx.participante.aggregate({
        where: { evento_id: participante.evento_id },
        _max: { numero_asignado: true },
      });
      const nextNumero = (maxNumero._max.numero_asignado || 0) + 1;
      return await tx.participante.update({
        where: { id: dto.id },
        data: {
          nivel: dto.nivel,
          numero_asignado: nextNumero,
          confirmado: true,
          se_unio: true,
        },
      });
    });
  }

  // Editar participante
  async editarParticipante(id: string, data: EditarParticipanteDto): Promise<Participante> {
    const participante = await this.prisma.participante.findUnique({ where: { id } });
    if (!participante) throw new NotFoundException('Participante no encontrado');

    if (data.telefon && data.telefon !== participante.telefon) {
      this.validarTelefono(data.telefon);
      const existente = await this.prisma.participante.findUnique({
        where: {
          telefon_evento_id: {
            telefon: data.telefon,
            evento_id: participante.evento_id,
          },
        },
      });
      if (existente && existente.id !== id) {
        throw new ConflictException('Ya existe otro participante con ese teléfono en este evento');
      }
    }

    if (data.tipo === 'EMPLEADO' && participante.tipo === 'INVITADO') {
      throw new BadRequestException('Para convertir un invitado a empleado use el endpoint específico');
    }

    return await this.prisma.participante.update({
      where: { id },
      data: {
        nombre_completo: data.nombre_completo,
        telefon: data.telefon,
        nivel: data.nivel,
        tipo: data.tipo,
        se_unio: data.se_unio,
        recompensa: data.recompensa,
      },
    });
  }

  async listarPorEvento(evento_id: string, filtros?: { soloConfirmados?: boolean; tipo?: string; soloInvitadosNoUnidos?: boolean }) {
    const where: any = { evento_id };
    if (filtros?.soloConfirmados) where.confirmado = true;
    if (filtros?.tipo) where.tipo = filtros.tipo;
    if (filtros?.soloInvitadosNoUnidos) {
      where.tipo = 'INVITADO';
      where.se_unio = false;
    }
    return await this.prisma.participante.findMany({
      where,
      orderBy: { numero_asignado: 'asc' },
    });
  }

  async consultarPorTelefono(telefon: string, evento_id: string) {
    return this.prisma.participante.findUnique({
      where: { telefon_evento_id: { telefon, evento_id } },
    });
  }

  async obtenerPorId(id: string) {
    const participante = await this.prisma.participante.findUnique({ where: { id } });
    if (!participante) throw new NotFoundException('Participante no encontrado');
    return participante;
  }
}