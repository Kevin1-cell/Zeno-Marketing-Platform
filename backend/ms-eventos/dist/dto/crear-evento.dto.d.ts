export declare enum EstadoEvento {
    ACTIVO = "ACTIVO",
    FINALIZADO = "FINALIZADO"
}
export declare class CrearEventoDto {
    nombre: string;
    descripcion?: string;
    fecha: string;
    estado?: EstadoEvento;
    whatsapp_link?: string;
}
