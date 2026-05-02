import { Controller, Post, Get, Body, Param, Query, UseGuards } from '@nestjs/common';
import { SorteosService } from './sorteos.service';
import { CrearSorteoDto } from '../dto/crear-sorteo.dto';
import { AgregarPremioDto } from '../dto/agregar-premio.dto';
import { ConfirmarGanadorDto } from '../dto/confirmar-ganador.dto';
import { RepetirDto } from '../dto/repetir.dto';
import { GirarRuletaDto } from '../dto/girar-ruleta.dto';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { SorteosGateway } from '../gateway/sorteos.gateway';

@Controller('sorteos')
export class SorteosController {
  constructor(
    private sorteosService: SorteosService,
    private sorteosGateway: SorteosGateway,
  ) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  async crear(@Body() data: CrearSorteoDto) {
    return this.sorteosService.crear(data);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  async listar(@Query('evento_id') evento_id: string) {
    return this.sorteosService.listarPorEvento(evento_id);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  async obtener(@Param('id') id: string) {
    return this.sorteosService.obtenerPorId(id);
  }

  @Post('premios')
  @UseGuards(JwtAuthGuard)
  async agregarPremio(@Body() data: AgregarPremioDto) {
    return this.sorteosService.agregarPremio(data);
  }

  @Get(':id/numeros-elegibles')
  @UseGuards(JwtAuthGuard)
  async numerosElegibles(@Param('id') id: string) {
    return this.sorteosService.obtenerNumerosElegibles(id);
  }

  @Post('girar')
  @UseGuards(JwtAuthGuard)
  async girar(@Body() { sorteo_id }: GirarRuletaDto) {
    this.sorteosGateway.emitRuletaGirando(sorteo_id);
    const ganador = await this.sorteosService.girar(sorteo_id);
    this.sorteosGateway.emitGanadorSeleccionado(sorteo_id, ganador);
    return ganador;
  }

  @Post('confirmar-ganador')
  @UseGuards(JwtAuthGuard)
  async confirmarGanador(@Body() data: ConfirmarGanadorDto) {
    const ganador = await this.sorteosService.confirmarGanador(data);
    this.sorteosGateway.emitGanadorConfirmado(data.sorteo_id, ganador);
    return ganador;
  }

  @Post('repetir')
  @UseGuards(JwtAuthGuard)
  async repetir(@Body() { sorteo_id, numero }: RepetirDto) {
    return this.sorteosService.repetir(sorteo_id, numero);
  }

  @Post(':id/finalizar')
  @UseGuards(JwtAuthGuard)
  async finalizar(@Param('id') id: string) {
    return this.sorteosService.finalizar(id);
  }

  @Get(':id/resumen')
  @UseGuards(JwtAuthGuard)
  async resumen(@Param('id') id: string) {
    return this.sorteosService.resumen(id);
  }
}