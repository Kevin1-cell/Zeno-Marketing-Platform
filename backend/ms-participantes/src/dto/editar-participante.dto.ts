import { IsString, IsOptional, IsEnum, IsBoolean, IsInt } from 'class-validator';
import { Nivel, TipoParticipante } from './registro-participante.dto';

export class EditarParticipanteDto {
  @IsString()
  @IsOptional()
  nombre_completo?: string;

  @IsString()
  @IsOptional()
  telefon?: string;

  @IsEnum(Nivel)
  @IsOptional()
  nivel?: Nivel;

  @IsEnum(TipoParticipante)
  @IsOptional()
  tipo?: TipoParticipante;

  @IsBoolean()
  @IsOptional()
  se_unio?: boolean;

  @IsString()
  @IsOptional()
  recompensa?: string;

  // No se permite editar numero_asignado directamente
  @IsInt()
  @IsOptional()
  numero_asignado?: never;
}