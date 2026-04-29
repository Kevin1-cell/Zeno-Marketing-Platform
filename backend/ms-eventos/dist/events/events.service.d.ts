import { PrismaService } from '../prisma/prisma.service';
import { CrearEventoDto } from '../dto/crear-evento.dto';
import { EditarEventoDto } from '../dto/editar-evento.dto';
import { EstadoEvento } from '@prisma/client';
export declare class EventsService {
    private prisma;
    constructor(prisma: PrismaService);
    crear(data: CrearEventoDto): Promise<{
        id: string;
        nombre: string;
        descripcion: string | null;
        fecha: Date;
        estado: import("@prisma/client").$Enums.EstadoEvento;
        whatsapp_link: string | null;
        created_at: Date;
    }>;
    listar(estado?: EstadoEvento): Promise<{
        id: string;
        nombre: string;
        descripcion: string | null;
        fecha: Date;
        estado: import("@prisma/client").$Enums.EstadoEvento;
        whatsapp_link: string | null;
        created_at: Date;
    }[]>;
    obtenerPorId(id: string): Promise<{
        id: string;
        nombre: string;
        descripcion: string | null;
        fecha: Date;
        estado: import("@prisma/client").$Enums.EstadoEvento;
        whatsapp_link: string | null;
        created_at: Date;
    }>;
    editar(id: string, data: EditarEventoDto): Promise<{
        id: string;
        nombre: string;
        descripcion: string | null;
        fecha: Date;
        estado: import("@prisma/client").$Enums.EstadoEvento;
        whatsapp_link: string | null;
        created_at: Date;
    }>;
    cambiarEstado(id: string, estado: EstadoEvento): Promise<{
        id: string;
        nombre: string;
        descripcion: string | null;
        fecha: Date;
        estado: import("@prisma/client").$Enums.EstadoEvento;
        whatsapp_link: string | null;
        created_at: Date;
    }>;
    obtenerEstadisticas(eventoId: string): Promise<{
        total: number;
        confirmados: number;
        porNivel: {
            C1: number;
            C2: number;
            C3: number;
        };
    }>;
}
