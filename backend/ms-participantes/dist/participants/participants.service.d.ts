import { PrismaService } from '../prisma/prisma.service';
import { RegistroParticipanteDto } from '../dto/registro-participante.dto';
import { EditarParticipanteDto } from '../dto/editar-participante.dto';
import { ConvertirInvitadoDto } from '../dto/convertir-invitado.dto';
import { Participante } from '@prisma/client';
export declare class ParticipantsService {
    private prisma;
    constructor(prisma: PrismaService);
    private validarTelefono;
    private verificarAforo;
    registrar(data: RegistroParticipanteDto): Promise<Participante>;
    registrarInvitado(data: RegistroParticipanteDto): Promise<Participante>;
    registrarManual(data: RegistroParticipanteDto): Promise<Participante>;
    registrarManualInvitado(data: RegistroParticipanteDto): Promise<Participante>;
    confirmar(id: string): Promise<Participante>;
    convertirInvitadoAEmpleado(dto: ConvertirInvitadoDto): Promise<Participante>;
    editarParticipante(id: string, data: EditarParticipanteDto): Promise<Participante>;
    listarPorEvento(evento_id: string, filtros?: {
        soloConfirmados?: boolean;
        tipo?: string;
        soloInvitadosNoUnidos?: boolean;
    }): Promise<{
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
    consultarPorTelefono(telefon: string, evento_id: string): Promise<{
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
    } | null>;
    obtenerPorId(id: string): Promise<{
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
