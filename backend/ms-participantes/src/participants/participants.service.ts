import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RegistroParticipanteDto } from '../dto/registro-participante.dto';
import { Participante } from '@prisma/client';

@Injectable()
export class ParticipantsService {
  constructor(private prisma: PrismaService) {}

  // Registro público / manual (asigna número)
  async registrar(data: RegistroParticipanteDto): Promise<Participante> {
    const existente = await this.prisma.participante.findUnique({
      where: {
        telefon_evento_id: {
          telefon: data.telefon,
          evento_id: data.evento_id,
        },
      },
    });
    if (existente) throw new ConflictException('Ya existe un registro con este teléfono para este evento');

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
        },
      });
    });
  }

  async confirmar(id: string): Promise<Participante> {
    const participante = await this.prisma.participante.findUnique({ where: { id } });
    if (!participante) throw new NotFoundException('Participante no encontrado');
    return await this.prisma.participante.update({
      where: { id },
      data: { confirmado: true },
    });
  }

  async listarPorEvento(evento_id: string, soloConfirmados?: boolean) {
    const where: any = { evento_id };
    if (soloConfirmados) where.confirmado = true;
    return await this.prisma.participante.findMany({
      where,
      orderBy: { numero_asignado: 'asc' },
    });
  }

  async obtenerPorId(id: string) {
    const participante = await this.prisma.participante.findUnique({ where: { id } });
    if (!participante) throw new NotFoundException('Participante no encontrado');
    return participante;
  }
}