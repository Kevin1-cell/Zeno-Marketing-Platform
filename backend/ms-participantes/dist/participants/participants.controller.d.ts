import { ParticipantsService } from './participants.service';
import { RegistroParticipanteDto } from '../dto/registro-participante.dto';
import { ConfirmarParticipanteDto } from '../dto/confirmar-participante.dto';
import { EditarParticipanteDto } from '../dto/editar-participante.dto';
import { ConvertirInvitadoDto } from '../dto/convertir-invitado.dto';
import { ParticipantsGateway } from '../gateway/participants.gateway';
export declare class ParticipantsController {
    private readonly participantsService;
    private readonly participantsGateway;
    constructor(participantsService: ParticipantsService, participantsGateway: ParticipantsGateway);
    registrar(data: RegistroParticipanteDto): Promise<{
        message: string;
        participante: {
            id: string;
            created_at: Date;
            evento_id: string;
            nombre_completo: string;
            telefon: string;
            nivel: import("@prisma/client").$Enums.Nivel | null;
            confirmado: boolean;
            numero_asignado: number | null;
            tipo: import("@prisma/client").$Enums.TipoParticipante;
            se_unio: boolean | null;
            recompensa: string | null;
        };
    }>;
    confirmar({ id }: ConfirmarParticipanteDto): Promise<{
        id: string;
        created_at: Date;
        evento_id: string;
        nombre_completo: string;
        telefon: string;
        nivel: import("@prisma/client").$Enums.Nivel | null;
        confirmado: boolean;
        numero_asignado: number | null;
        tipo: import("@prisma/client").$Enums.TipoParticipante;
        se_unio: boolean | null;
        recompensa: string | null;
    }>;
    convertirInvitado(dto: ConvertirInvitadoDto): Promise<{
        id: string;
        created_at: Date;
        evento_id: string;
        nombre_completo: string;
        telefon: string;
        nivel: import("@prisma/client").$Enums.Nivel | null;
        confirmado: boolean;
        numero_asignado: number | null;
        tipo: import("@prisma/client").$Enums.TipoParticipante;
        se_unio: boolean | null;
        recompensa: string | null;
    }>;
    editar(id: string, data: EditarParticipanteDto): Promise<{
        id: string;
        created_at: Date;
        evento_id: string;
        nombre_completo: string;
        telefon: string;
        nivel: import("@prisma/client").$Enums.Nivel | null;
        confirmado: boolean;
        numero_asignado: number | null;
        tipo: import("@prisma/client").$Enums.TipoParticipante;
        se_unio: boolean | null;
        recompensa: string | null;
    }>;
    listar(evento_id: string, soloConfirmados?: string, tipo?: string, soloInvitadosNoUnidos?: string): Promise<{
        id: string;
        created_at: Date;
        evento_id: string;
        nombre_completo: string;
        telefon: string;
        nivel: import("@prisma/client").$Enums.Nivel | null;
        confirmado: boolean;
        numero_asignado: number | null;
        tipo: import("@prisma/client").$Enums.TipoParticipante;
        se_unio: boolean | null;
        recompensa: string | null;
    }[]>;
    consultar(telefon: string, evento_id: string): Promise<{
        id: string;
        created_at: Date;
        evento_id: string;
        nombre_completo: string;
        telefon: string;
        nivel: import("@prisma/client").$Enums.Nivel | null;
        confirmado: boolean;
        numero_asignado: number | null;
        tipo: import("@prisma/client").$Enums.TipoParticipante;
        se_unio: boolean | null;
        recompensa: string | null;
    }>;
    registrarManual(data: RegistroParticipanteDto): Promise<{
        id: string;
        created_at: Date;
        evento_id: string;
        nombre_completo: string;
        telefon: string;
        nivel: import("@prisma/client").$Enums.Nivel | null;
        confirmado: boolean;
        numero_asignado: number | null;
        tipo: import("@prisma/client").$Enums.TipoParticipante;
        se_unio: boolean | null;
        recompensa: string | null;
    }>;
    obtener(id: string): Promise<{
        id: string;
        created_at: Date;
        evento_id: string;
        nombre_completo: string;
        telefon: string;
        nivel: import("@prisma/client").$Enums.Nivel | null;
        confirmado: boolean;
        numero_asignado: number | null;
        tipo: import("@prisma/client").$Enums.TipoParticipante;
        se_unio: boolean | null;
        recompensa: string | null;
    }>;
}
