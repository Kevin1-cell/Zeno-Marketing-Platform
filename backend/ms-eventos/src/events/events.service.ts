import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CrearEventoDto } from '../dto/crear-evento.dto';
import { EditarEventoDto } from '../dto/editar-evento.dto';
import { EstadoEvento } from '@prisma/client';

@Injectable()
export class EventsService {
  constructor(private prisma: PrismaService) {}

  async crear(data: CrearEventoDto) {
    return this.prisma.evento.create({
      data: {
        nombre: data.nombre,
        descripcion: data.descripcion,
        fecha: new Date(data.fecha),
        estado: data.estado || EstadoEvento.ACTIVO,
        whatsapp_link: data.whatsapp_link,
      },
    });
  }

  async listar(estado?: EstadoEvento) {
    const where = estado ? { estado } : {};
    return this.prisma.evento.findMany({
      where,
      orderBy: { fecha: 'desc' },
    });
  }

  async obtenerPorId(id: string) {
    const evento = await this.prisma.evento.findUnique({ where: { id } });
    if (!evento) throw new NotFoundException('Evento no encontrado');
    return evento;
  }

  async editar(id: string, data: EditarEventoDto) {
  await this.obtenerPorId(id);
  return this.prisma.evento.update({
    where: { id },
    data: {
      nombre: data.nombre,
      descripcion: data.descripcion,
      fecha: data.fecha ? new Date(data.fecha) : undefined,
      estado: data.estado,
      whatsapp_link: data.whatsapp_link,
    },
  });
}

  async cambiarEstado(id: string, estado: EstadoEvento) {
    await this.obtenerPorId(id);
    return this.prisma.evento.update({
      where: { id },
      data: { estado },
    });
  }

  async obtenerEstadisticas(eventoId: string) {
    const participantes = await this.prisma.participante.findMany({
      where: { evento_id: eventoId },
    });
    const total = participantes.length;
    const confirmados = participantes.filter(p => p.confirmado).length;
    const porNivel = {
      C1: participantes.filter(p => p.nivel === 'C1').length,
      C2: participantes.filter(p => p.nivel === 'C2').length,
      C3: participantes.filter(p => p.nivel === 'C3').length,
    };
    return { total, confirmados, porNivel };
  }
}