import { IsUUID, IsInt, IsOptional, IsString } from 'class-validator';

export class ConfirmarGanadorDto {
  @IsUUID()
  sorteo_id: string;

  @IsInt()
  numero_ganador: number;

  @IsUUID()
  participante_id: string;

  // Solo para modo MANUAL
  @IsOptional()
  @IsString()
  premio_descripcion?: string;

  // Solo para modo PRE_CARGA (opcional: id del premio asignado automáticamente)
  @IsOptional()
  @IsUUID()
  premio_id?: string;
}