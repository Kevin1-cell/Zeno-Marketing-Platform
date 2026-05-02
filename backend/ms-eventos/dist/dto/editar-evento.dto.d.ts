import { EstadoEvento } from './crear-evento.dto';
export declare class EditarEventoDto {
    nombre?: string;
    descripcion?: string;
    lugar?: string;
    hora?: string;
    fecha?: string;
    estado?: EstadoEvento;
    whatsapp_link?: string;
    aforo_maximo?: number;
}
