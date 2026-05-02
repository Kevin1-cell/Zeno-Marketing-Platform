import { IsUUID, IsEnum } from 'class-validator';
import { Nivel } from './registro-participante.dto';

export class ConvertirInvitadoDto {
  @IsUUID()
  id: string;

  @IsEnum(Nivel)
  nivel: Nivel;
}