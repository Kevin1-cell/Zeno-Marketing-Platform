import { IsUUID } from 'class-validator';

export class GirarRuletaDto {
  @IsUUID()
  sorteo_id: string;
}