import { PrismaService } from '../prisma/prisma.service';
import { RegistroParticipanteDto } from '../dto/registro-participante.dto';
import { Participante } from '@prisma/client';
export declare class ParticipantsService {
    private prisma;
    constructor(prisma: PrismaService);
    registrar(data: RegistroParticipanteDto): Promise<Participante>;
    confirmar(id: string): Promise<Participante>;
    listarPorEvento(evento_id: string, soloConfirmados?: boolean): Promise<{
        id: string;
        evento_id: string;
        nombre_completo: string;
        telefon: string;
        nivel: import("@prisma/client").$Enums.Nivel;
        confirmado: boolean;
        numero_asignado: number | null;
        created_at: Date;
    }[]>;
    obtenerPorId(id: string): Promise<{
        id: string;
        evento_id: string;
        nombre_completo: string;
        telefon: string;
        nivel: import("@prisma/client").$Enums.Nivel;
        confirmado: boolean;
        numero_asignado: number | null;
        created_at: Date;
    }>;
}
