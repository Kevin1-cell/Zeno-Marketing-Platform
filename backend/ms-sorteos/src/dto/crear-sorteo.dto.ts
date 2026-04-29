import { IsString, IsUUID, IsEnum, IsOptional } from 'class-validator';

export enum NivelFilter {
  C1 = 'C1',
  C2 = 'C2',
  C3 = 'C3',
  TODOS = 'TODOS',
}

export enum ModoPremio {
  PRE_CARGA = 'PRE_CARGA',
  MANUAL = 'MANUAL',
}

export class CrearSorteoDto {
  @IsUUID()
  evento_id: string;

  @IsString()
  nombre: string;

  @IsEnum(NivelFilter)
  @IsOptional()
  nivel_filtro?: NivelFilter;

  @IsEnum(ModoPremio)
  @IsOptional()
  modo_premios?: ModoPremio;
}