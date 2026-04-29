import { IsUUID } from 'class-validator';

export class ConfirmarParticipanteDto {
  @IsUUID()
  id: string;
}