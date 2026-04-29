import { IsString, IsOptional, IsDateString, IsEnum } from 'class-validator';

export enum EstadoEvento {
  ACTIVO = 'ACTIVO',
  FINALIZADO = 'FINALIZADO',
}

export class CrearEventoDto {
  @IsString()
  nombre: string;

  @IsOptional()
  @IsString()
  descripcion?: string;

  @IsDateString()
  fecha: string;

  @IsOptional()
  @IsEnum(EstadoEvento)
  estado?: EstadoEvento;

  @IsOptional()
  @IsString()
  whatsapp_link?: string;
}