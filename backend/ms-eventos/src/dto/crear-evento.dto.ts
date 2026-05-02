import { IsString, IsOptional, IsDateString, IsEnum, IsInt, Min } from 'class-validator';

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

  @IsOptional()
  @IsString()
  lugar?: string;

  @IsOptional()
  @IsString()
  hora?: string;

  @IsDateString()
  fecha: string;

  @IsOptional()
  @IsEnum(EstadoEvento)
  estado?: EstadoEvento;

  @IsOptional()
  @IsString()
  whatsapp_link?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  aforo_maximo?: number;
}