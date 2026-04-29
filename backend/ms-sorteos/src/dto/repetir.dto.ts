import { IsUUID, IsInt } from 'class-validator';

export class RepetirDto {
  @IsUUID()
  sorteo_id: string;

  @IsInt()
  numero: number;
}