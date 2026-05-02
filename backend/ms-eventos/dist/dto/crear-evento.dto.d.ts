export declare enum EstadoEvento {
    ACTIVO = "ACTIVO",
    FINALIZADO = "FINALIZADO"
}
export declare class CrearEventoDto {
    nombre: string;
    descripcion?: string;
    lugar?: string;
    hora?: string;
    fecha: string;
    estado?: EstadoEvento;
    whatsapp_link?: string;
    aforo_maximo?: number;
}
