import { Controller, Post, Body, Get, Query, Patch, Param, UseGuards } from '@nestjs/common';
import { ParticipantsService } from './participants.service';
import { RegistroParticipanteDto } from '../dto/registro-participante.dto';
import { ConfirmarParticipanteDto } from '../dto/confirmar-participante.dto';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { ParticipantsGateway } from '../gateway/participants.gateway';

@Controller('participantes')
export class ParticipantsController {
  constructor(
    private readonly participantsService: ParticipantsService,
    private readonly participantsGateway: ParticipantsGateway,
  ) {}

  @Post('registro')
  async registrar(@Body() data: RegistroParticipanteDto) {
    const participante = await this.participantsService.registrar(data);
    return {
      message: 'Registro exitoso. Espera confirmación del administrador.',
      participante: {
        id: participante.id,
        nombre_completo: participante.nombre_completo,
        numero_asignado: participante.numero_asignado,
        confirmado: participante.confirmado,
      },
    };
  }

  @Post('manual')
  @UseGuards(JwtAuthGuard)
  async registrarManual(@Body() data: RegistroParticipanteDto) {
    return await this.participantsService.registrar(data);
  }

  @Patch('confirmar')
  @UseGuards(JwtAuthGuard)
  async confirmar(@Body() { id }: ConfirmarParticipanteDto) {
    const participante = await this.participantsService.confirmar(id);
    this.participantsGateway.emitConfirmado(participante);
    return participante;
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  async listar(@Query('evento_id') evento_id: string, @Query('solo_confirmados') soloConfirmados?: string) {
    return this.participantsService.listarPorEvento(evento_id, soloConfirmados === 'true');
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  async obtener(@Param('id') id: string) {
    return this.participantsService.obtenerPorId(id);
  }
}