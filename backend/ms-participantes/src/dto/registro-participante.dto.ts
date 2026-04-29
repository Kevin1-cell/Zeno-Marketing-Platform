import { IsString, IsNotEmpty, IsEnum } from 'class-validator';

export enum Nivel {
  C1 = 'C1',
  C2 = 'C2',
  C3 = 'C3',
}

export class RegistroParticipanteDto {
  @IsString()
  @IsNotEmpty()
  nombre_completo: string;

  @IsString()
  @IsNotEmpty()
  telefon: string;

  @IsEnum(Nivel)
  nivel: Nivel;

  @IsString()
  @IsNotEmpty()
  evento_id: string; // el frontend debe enviar el ID del evento activo
}