import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CrearEventoDto } from '../dto/crear-evento.dto';
import { EditarEventoDto } from '../dto/editar-evento.dto';
import { EstadoEvento } from '@prisma/client';

@Injectable()
export class EventsService {
  constructor(private prisma: PrismaService) {}

  async crear(data: CrearEventoDto) {
    const fechaEvento = new Date(data.fecha);
    if (fechaEvento <= new Date()) {
      throw new BadRequestException('La fecha del evento debe ser futura');
    }
    return this.prisma.evento.create({
      data: {
        nombre: data.nombre,
        descripcion: data.descripcion,
        lugar: data.lugar,
        hora: data.hora,
        fecha: fechaEvento,
        estado: data.estado || EstadoEvento.ACTIVO,
        whatsapp_link: data.whatsapp_link,
        aforo_maximo: data.aforo_maximo,
        eliminado: false,
      },
    });
  }

  async listar(estado?: EstadoEvento, incluirEliminados = false) {
    const where: any = {};
    if (estado !== undefined) where.estado = estado;
    if (!incluirEliminados) where.eliminado = false;
    return this.prisma.evento.findMany({
      where,
      orderBy: { fecha: 'desc' },
    });
  }

  async obtenerPorId(id: string, incluirEliminados = false) {
    const evento = await this.prisma.evento.findFirst({
      where: {
        id,
        ...(incluirEliminados ? {} : { eliminado: false }),
      },
    });
    if (!evento) throw new NotFoundException('Evento no encontrado');
    return evento;
  }

  async editar(id: string, data: EditarEventoDto) {
    await this.obtenerPorId(id);
    if (data.fecha) {
      const fechaEvento = new Date(data.fecha);
      if (fechaEvento <= new Date()) {
        throw new BadRequestException('La fecha del evento debe ser futura');
      }
    }
    return this.prisma.evento.update({
      where: { id },
      data: {
        nombre: data.nombre,
        descripcion: data.descripcion,
        lugar: data.lugar,
        hora: data.hora,
        fecha: data.fecha ? new Date(data.fecha) : undefined,
        estado: data.estado,
        whatsapp_link: data.whatsapp_link,
        aforo_maximo: data.aforo_maximo,
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

  async eliminarLogico(id: string) {
    await this.obtenerPorId(id);
    return this.prisma.evento.update({
      where: { id },
      data: { eliminado: true },
    });
  }

  async restaurar(id: string) {
    const evento = await this.prisma.evento.findFirst({ where: { id, eliminado: true } });
    if (!evento) throw new NotFoundException('Evento no encontrado o no está eliminado');
    return this.prisma.evento.update({
      where: { id },
      data: { eliminado: false },
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