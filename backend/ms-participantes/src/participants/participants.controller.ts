import { Controller, Post, Body, Get, Query, Patch, Param, UseGuards, NotFoundException, Delete } from '@nestjs/common';
import { ParticipantsService } from './participants.service';
import { RegistroParticipanteDto } from '../dto/registro-participante.dto';
import { ConfirmarParticipanteDto } from '../dto/confirmar-participante.dto';
import { EditarParticipanteDto } from '../dto/editar-participante.dto';
import { ConvertirInvitadoDto } from '../dto/convertir-invitado.dto';
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
    this.participantsGateway.emitNuevoParticipante(participante);
    return {
      message: participante.tipo === 'INVITADO' 
        ? 'Registro de invitado exitoso.' 
        : 'Registro exitoso. Espera confirmación del administrador.',
      participante,
    };
  }

  @Patch('confirmar')
  @UseGuards(JwtAuthGuard)
  async confirmar(@Body() { id }: ConfirmarParticipanteDto) {
    const participante = await this.participantsService.confirmar(id);
    this.participantsGateway.emitConfirmado(participante);
    return participante;
  }

  @Post('convertir')
  @UseGuards(JwtAuthGuard)
  async convertirInvitado(@Body() dto: ConvertirInvitadoDto) {
    const participante = await this.participantsService.convertirInvitadoAEmpleado(dto);
    this.participantsGateway.emitConfirmado(participante); // notificar cambio
    return participante;
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  async editar(@Param('id') id: string, @Body() data: EditarParticipanteDto) {
    const participante = await this.participantsService.editarParticipante(id, data);
    // Emitir evento para actualizar en tiempo real
    this.participantsGateway.emitConfirmado(participante);
    return participante;
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  async listar(
    @Query('evento_id') evento_id: string,
    @Query('solo_confirmados') soloConfirmados?: string,
    @Query('tipo') tipo?: string,
    @Query('solo_invitados_no_unidos') soloInvitadosNoUnidos?: string,
  ) {
    return this.participantsService.listarPorEvento(evento_id, {
      soloConfirmados: soloConfirmados === 'true',
      tipo,
      soloInvitadosNoUnidos: soloInvitadosNoUnidos === 'true',
    });
  }

  @Get('consulta')
  async consultar(@Query('telefon') telefon: string, @Query('evento_id') evento_id: string) {
    const participante = await this.participantsService.consultarPorTelefono(telefon, evento_id);
    if (!participante) throw new NotFoundException('No estás registrado');
    return participante;
  }

  @Post('manual')
  @UseGuards(JwtAuthGuard)
  async registrarManual(@Body() data: RegistroParticipanteDto) {
    const participante = await this.participantsService.registrarManual(data);
    this.participantsGateway.emitConfirmado(participante);
    return participante;
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  async obtener(@Param('id') id: string) {
    return this.participantsService.obtenerPorId(id);
  }
}