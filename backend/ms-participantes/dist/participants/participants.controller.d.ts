import { ParticipantsService } from './participants.service';
import { RegistroParticipanteDto } from '../dto/registro-participante.dto';
import { ConfirmarParticipanteDto } from '../dto/confirmar-participante.dto';
import { ParticipantsGateway } from '../gateway/participants.gateway';
export declare class ParticipantsController {
    private readonly participantsService;
    private readonly participantsGateway;
    constructor(participantsService: ParticipantsService, participantsGateway: ParticipantsGateway);
    registrar(data: RegistroParticipanteDto): Promise<{
        message: string;
        participante: {
            id: string;
            nombre_completo: string;
            numero_asignado: number | null;
            confirmado: boolean;
        };
    }>;
    registrarManual(data: RegistroParticipanteDto): Promise<{
        id: string;
        evento_id: string;
        nombre_completo: string;
        telefon: string;
        nivel: import("@prisma/client").$Enums.Nivel;
        confirmado: boolean;
        numero_asignado: number | null;
        created_at: Date;
    }>;
    confirmar({ id }: ConfirmarParticipanteDto): Promise<{
        id: string;
        evento_id: string;
        nombre_completo: string;
        telefon: string;
        nivel: import("@prisma/client").$Enums.Nivel;
        confirmado: boolean;
        numero_asignado: number | null;
        created_at: Date;
    }>;
    listar(evento_id: string, soloConfirmados?: string): Promise<{
        id: string;
        evento_id: string;
        nombre_completo: string;
        telefon: string;
        nivel: import("@prisma/client").$Enums.Nivel;
        confirmado: boolean;
        numero_asignado: number | null;
        created_at: Date;
    }[]>;
    obtener(id: string): Promise<{
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
