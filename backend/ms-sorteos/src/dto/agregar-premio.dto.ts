import { IsString, IsInt, IsUUID } from 'class-validator';

export class AgregarPremioDto {
  @IsUUID()
  sorteo_id: string;

  @IsString()
  descripcion: string;

  @IsInt()
  orden: number;
}