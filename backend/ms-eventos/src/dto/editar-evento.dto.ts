import { IsString, IsOptional, IsDateString, IsEnum, IsInt, Min } from 'class-validator';
import { EstadoEvento } from './crear-evento.dto';

export class EditarEventoDto {
  @IsOptional()
  @IsString()
  nombre?: string;

  @IsOptional()
  @IsString()
  descripcion?: string;

  @IsOptional()
  @IsString()
  lugar?: string;

  @IsOptional()
  @IsString()
  hora?: string;

  @IsOptional()
  @IsDateString()
  fecha?: string;

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