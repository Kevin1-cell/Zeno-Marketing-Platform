import { IsString, IsNotEmpty, IsEnum, IsOptional, IsBoolean } from 'class-validator';

export enum Nivel {
  C1 = 'C1',
  C2 = 'C2',
  C3 = 'C3',
}

export enum TipoParticipante {
  EMPLEADO = 'EMPLEADO',
  INVITADO = 'INVITADO',
}

export class RegistroParticipanteDto {
  @IsString()
  @IsNotEmpty()
  nombre_completo: string;

  @IsString()
  @IsNotEmpty()
  telefon: string;

  @IsEnum(Nivel)
  @IsOptional()
  nivel?: Nivel; // solo requerido si tipo = EMPLEADO

  @IsString()
  @IsNotEmpty()
  evento_id: string;

  @IsEnum(TipoParticipante)
  @IsOptional()
  tipo?: TipoParticipante = TipoParticipante.EMPLEADO;

  @IsBoolean()
  @IsOptional()
  se_unio?: boolean; // solo para invitados

  @IsString()
  @IsOptional()
  recompensa?: string; // solo para invitados
}