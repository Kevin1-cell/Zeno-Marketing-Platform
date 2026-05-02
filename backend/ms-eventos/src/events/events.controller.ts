import { Controller, Get, Post, Put, Patch, Delete, Body, Param, Query, UseGuards, NotFoundException } from '@nestjs/common';
import { EventsService } from './events.service';
import { CrearEventoDto } from '../dto/crear-evento.dto';
import { EditarEventoDto } from '../dto/editar-evento.dto';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { EventsGateway } from '../gateway/events.gateway';
import { EstadoEvento } from '@prisma/client';

@Controller('eventos')
export class EventsController {
  constructor(
    private readonly eventsService: EventsService,
    private readonly eventsGateway: EventsGateway,
  ) {}

  // Endpoint público para obtener TODOS los eventos activos (sin autenticación)
  @Get('activos')
  async getEventosActivos() {
    const eventos = await this.eventsService.listar(EstadoEvento.ACTIVO, false);
    return eventos;
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  async crear(@Body() data: CrearEventoDto) {
    return this.eventsService.crear(data);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  async listar(@Query('estado') estado?: EstadoEvento) {
    return this.eventsService.listar(estado);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  async obtener(@Param('id') id: string) {
    return this.eventsService.obtenerPorId(id);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  async editar(@Param('id') id: string, @Body() data: EditarEventoDto) {
    return this.eventsService.editar(id, data);
  }

  @Patch(':id/estado')
  @UseGuards(JwtAuthGuard)
  async cambiarEstado(@Param('id') id: string, @Body('estado') estado: EstadoEvento) {
    const evento = await this.eventsService.cambiarEstado(id, estado);
    const stats = await this.eventsService.obtenerEstadisticas(id);
    this.eventsGateway.emitStatsUpdate(id, stats);
    return evento;
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  async eliminar(@Param('id') id: string) {
    return this.eventsService.eliminarLogico(id);
  }

  @Patch(':id/restaurar')
  @UseGuards(JwtAuthGuard)
  async restaurar(@Param('id') id: string) {
    return this.eventsService.restaurar(id);
  }

  @Get(':id/estadisticas')
  @UseGuards(JwtAuthGuard)
  async obtenerEstadisticas(@Param('id') id: string) {
    return this.eventsService.obtenerEstadisticas(id);
  }
}