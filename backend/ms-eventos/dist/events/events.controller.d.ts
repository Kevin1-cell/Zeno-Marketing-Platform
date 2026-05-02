import { EventsService } from './events.service';
import { CrearEventoDto } from '../dto/crear-evento.dto';
import { EditarEventoDto } from '../dto/editar-evento.dto';
import { EventsGateway } from '../gateway/events.gateway';
import { EstadoEvento } from '@prisma/client';
export declare class EventsController {
    private readonly eventsService;
    private readonly eventsGateway;
    constructor(eventsService: EventsService, eventsGateway: EventsGateway);
    getEventosActivos(): Promise<{
        id: string;
        nombre: string;
        descripcion: string | null;
        lugar: string | null;
        hora: string | null;
        fecha: Date;
        estado: import("@prisma/client").$Enums.EstadoEvento;
        whatsapp_link: string | null;
        aforo_maximo: number | null;
        eliminado: boolean;
        created_at: Date;
    }[]>;
    crear(data: CrearEventoDto): Promise<{
        id: string;
        nombre: string;
        descripcion: string | null;
        lugar: string | null;
        hora: string | null;
        fecha: Date;
        estado: import("@prisma/client").$Enums.EstadoEvento;
        whatsapp_link: string | null;
        aforo_maximo: number | null;
        eliminado: boolean;
        created_at: Date;
    }>;
    listar(estado?: EstadoEvento): Promise<{
        id: string;
        nombre: string;
        descripcion: string | null;
        lugar: string | null;
        hora: string | null;
        fecha: Date;
        estado: import("@prisma/client").$Enums.EstadoEvento;
        whatsapp_link: string | null;
        aforo_maximo: number | null;
        eliminado: boolean;
        created_at: Date;
    }[]>;
    obtener(id: string): Promise<{
        id: string;
        nombre: string;
        descripcion: string | null;
        lugar: string | null;
        hora: string | null;
        fecha: Date;
        estado: import("@prisma/client").$Enums.EstadoEvento;
        whatsapp_link: string | null;
        aforo_maximo: number | null;
        eliminado: boolean;
        created_at: Date;
    }>;
    editar(id: string, data: EditarEventoDto): Promise<{
        id: string;
        nombre: string;
        descripcion: string | null;
        lugar: string | null;
        hora: string | null;
        fecha: Date;
        estado: import("@prisma/client").$Enums.EstadoEvento;
        whatsapp_link: string | null;
        aforo_maximo: number | null;
        eliminado: boolean;
        created_at: Date;
    }>;
    cambiarEstado(id: string, estado: EstadoEvento): Promise<{
        id: string;
        nombre: string;
        descripcion: string | null;
        lugar: string | null;
        hora: string | null;
        fecha: Date;
        estado: import("@prisma/client").$Enums.EstadoEvento;
        whatsapp_link: string | null;
        aforo_maximo: number | null;
        eliminado: boolean;
        created_at: Date;
    }>;
    eliminar(id: string): Promise<{
        id: string;
        nombre: string;
        descripcion: string | null;
        lugar: string | null;
        hora: string | null;
        fecha: Date;
        estado: import("@prisma/client").$Enums.EstadoEvento;
        whatsapp_link: string | null;
        aforo_maximo: number | null;
        eliminado: boolean;
        created_at: Date;
    }>;
    restaurar(id: string): Promise<{
        id: string;
        nombre: string;
        descripcion: string | null;
        lugar: string | null;
        hora: string | null;
        fecha: Date;
        estado: import("@prisma/client").$Enums.EstadoEvento;
        whatsapp_link: string | null;
        aforo_maximo: number | null;
        eliminado: boolean;
        created_at: Date;
    }>;
    obtenerEstadisticas(id: string): Promise<{
        total: number;
        confirmados: number;
        porNivel: {
            C1: number;
            C2: number;
            C3: number;
        };
    }>;
}
