import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CrearSorteoDto, ModoPremio, NivelFilter } from '../dto/crear-sorteo.dto';
import { AgregarPremioDto } from '../dto/agregar-premio.dto';
import { ConfirmarGanadorDto } from '../dto/confirmar-ganador.dto';
import { randomInt } from 'crypto';

@Injectable()
export class SorteosService {
  private exclusionesTemporales: Map<string, Set<number>> = new Map();

  constructor(private prisma: PrismaService) {}

  async crear(data: CrearSorteoDto) {
    const evento = await this.prisma.evento.findUnique({ where: { id: data.evento_id } });
    if (!evento) throw new NotFoundException('Evento no encontrado');
    return this.prisma.sorteo.create({
      data: {
        nombre: data.nombre,
        evento_id: data.evento_id,
        nivel_filtro: data.nivel_filtro || NivelFilter.TODOS,
        modo_premios: data.modo_premios || ModoPremio.MANUAL,
        estado: 'PENDIENTE',
      },
    });
  }

  async agregarPremio(data: AgregarPremioDto) {
    const sorteo = await this.prisma.sorteo.findUnique({ where: { id: data.sorteo_id } });
    if (!sorteo) throw new NotFoundException('Sorteo no encontrado');
    if (sorteo.modo_premios !== 'PRE_CARGA') {
      throw new BadRequestException('Este sorteo no usa modo PRE_CARGA');
    }
    return this.prisma.premio.create({
      data: {
        sorteo_id: data.sorteo_id,
        descripcion: data.descripcion,
        orden: data.orden,
        asignado: false,
      },
    });
  }

  async obtenerNumerosElegibles(sorteoId: string) {
    const sorteo = await this.prisma.sorteo.findUnique({
      where: { id: sorteoId },
      include: { evento: true },
    });
    if (!sorteo) throw new NotFoundException('Sorteo no encontrado');

    const where: any = {
      evento_id: sorteo.evento_id,
      confirmado: true,
    };
    if (sorteo.nivel_filtro !== 'TODOS') {
      where.nivel = sorteo.nivel_filtro;
    }
    const participantes = await this.prisma.participante.findMany({
      where,
      select: { id: true, numero_asignado: true, nombre_completo: true, telefon: true },
    });

    const ganadoresPrevios = await this.prisma.ganador.findMany({
      where: { sorteo_id: sorteoId },
      select: { numero_ganador: true },
    });
    const numerosGanados = new Set(ganadoresPrevios.map(g => g.numero_ganador));

    const tempExclusions = this.exclusionesTemporales.get(sorteoId) || new Set();

    const elegibles = participantes
      .filter(p => p.numero_asignado !== null && !numerosGanados.has(p.numero_asignado) && !tempExclusions.has(p.numero_asignado))
      .map(p => ({
        numero: p.numero_asignado as number,
        nombre: p.nombre_completo,
        telefono: p.telefon,
        participante_id: p.id,
      }));

    return elegibles;
  }

  async girar(sorteoId: string) {
    const elegibles = await this.obtenerNumerosElegibles(sorteoId);
    if (elegibles.length === 0) {
      throw new BadRequestException('No hay números elegibles para este sorteo');
    }
    const randomIndex = randomInt(0, elegibles.length);
    return elegibles[randomIndex];
  }

  async confirmarGanador(data: ConfirmarGanadorDto) {
    const { sorteo_id, numero_ganador, participante_id, premio_descripcion } = data;
    const sorteo = await this.prisma.sorteo.findUnique({ where: { id: sorteo_id } });
    if (!sorteo) throw new NotFoundException('Sorteo no encontrado');

    const participante = await this.prisma.participante.findUnique({ where: { id: participante_id } });
    if (!participante || !participante.confirmado) {
      throw new BadRequestException('Participante no válido o no confirmado');
    }

    const yaGanador = await this.prisma.ganador.findFirst({
      where: { sorteo_id, numero_ganador },
    });
    if (yaGanador) {
      throw new ConflictException('Este número ya tiene un ganador asignado');
    }

    // Modo PRE_CARGA: buscar siguiente premio no asignado
    let premioAsignado: { id: string } | null = null;
    if (sorteo.modo_premios === 'PRE_CARGA') {
      const siguientePremio = await this.prisma.premio.findFirst({
        where: { sorteo_id, asignado: false },
        orderBy: { orden: 'asc' },
      });
      if (!siguientePremio) {
        throw new BadRequestException('No hay más premios disponibles en modo PRE_CARGA');
      }
      await this.prisma.premio.update({
        where: { id: siguientePremio.id },
        data: { asignado: true },
      });
      premioAsignado = { id: siguientePremio.id };
    }

    const ganador = await this.prisma.ganador.create({
      data: {
        sorteo_id,
        participante_id,
        numero_ganador,
        premio_id: (sorteo.modo_premios === 'PRE_CARGA' && premioAsignado) ? premioAsignado.id : null,
        premio_descripcion: (sorteo.modo_premios === 'MANUAL') ? premio_descripcion : null,
        confirmado_en: new Date(),
      },
      include: { participante: true, premio: true },
    });

    // Eliminar exclusión temporal de este número
    const tempEx = this.exclusionesTemporales.get(sorteo_id);
    if (tempEx) {
      tempEx.delete(numero_ganador);
    }

    if (sorteo.estado === 'PENDIENTE') {
      await this.prisma.sorteo.update({
        where: { id: sorteo_id },
        data: { estado: 'EN_CURSO' },
      });
    }

    return ganador;
  }

  async repetir(sorteoId: string, numero: number) {
    let tempSet = this.exclusionesTemporales.get(sorteoId);
    if (!tempSet) {
      tempSet = new Set<number>();
      this.exclusionesTemporales.set(sorteoId, tempSet);
    }
    tempSet.add(numero);
    return { message: `Número ${numero} excluido temporalmente` };
  }

  async finalizar(sorteoId: string) {
    const sorteo = await this.prisma.sorteo.findUnique({ where: { id: sorteoId } });
    if (!sorteo) throw new NotFoundException('Sorteo no encontrado');
    await this.prisma.sorteo.update({
      where: { id: sorteoId },
      data: { estado: 'FINALIZADO' },
    });
    this.exclusionesTemporales.delete(sorteoId);
    return { message: 'Sorteo finalizado' };
  }

  async listarPorEvento(evento_id: string) {
    return this.prisma.sorteo.findMany({
      where: { evento_id },
      include: { premios: true, ganadores: { include: { participante: true } } },
    });
  }

  async resumen(sorteoId: string) {
    const sorteo = await this.prisma.sorteo.findUnique({
      where: { id: sorteoId },
      include: {
        evento: true,
        premios: true,
        ganadores: {
          include: { participante: true, premio: true },
          orderBy: { confirmado_en: 'asc' },
        },
      },
    });
    if (!sorteo) throw new NotFoundException('Sorteo no encontrado');
    return sorteo;
  }
}