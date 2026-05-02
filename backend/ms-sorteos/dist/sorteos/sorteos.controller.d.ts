import { SorteosService } from './sorteos.service';
import { CrearSorteoDto } from '../dto/crear-sorteo.dto';
import { AgregarPremioDto } from '../dto/agregar-premio.dto';
import { ConfirmarGanadorDto } from '../dto/confirmar-ganador.dto';
import { RepetirDto } from '../dto/repetir.dto';
import { GirarRuletaDto } from '../dto/girar-ruleta.dto';
import { SorteosGateway } from '../gateway/sorteos.gateway';
export declare class SorteosController {
    private sorteosService;
    private sorteosGateway;
    constructor(sorteosService: SorteosService, sorteosGateway: SorteosGateway);
    crear(data: CrearSorteoDto): Promise<{
        id: string;
        nombre: string;
        estado: import("@prisma/client").$Enums.EstadoSorteo;
        created_at: Date;
        nivel_filtro: import("@prisma/client").$Enums.NivelFilter;
        modo_premios: import("@prisma/client").$Enums.ModoPremio;
        evento_id: string;
    }>;
    listar(evento_id: string): Promise<({
        premios: {
            id: string;
            descripcion: string;
            orden: number;
            asignado: boolean;
            sorteo_id: string;
        }[];
        ganadores: ({
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
        } & {
            id: string;
            sorteo_id: string;
            participante_id: string;
            premio_id: string | null;
            premio_descripcion: string | null;
            numero_ganador: number;
            confirmado_en: Date;
        })[];
    } & {
        id: string;
        nombre: string;
        estado: import("@prisma/client").$Enums.EstadoSorteo;
        created_at: Date;
        nivel_filtro: import("@prisma/client").$Enums.NivelFilter;
        modo_premios: import("@prisma/client").$Enums.ModoPremio;
        evento_id: string;
    })[]>;
    obtener(id: string): Promise<{
        evento: {
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
        };
        premios: {
            id: string;
            descripcion: string;
            orden: number;
            asignado: boolean;
            sorteo_id: string;
        }[];
        ganadores: ({
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
            premio: {
                id: string;
                descripcion: string;
                orden: number;
                asignado: boolean;
                sorteo_id: string;
            } | null;
        } & {
            id: string;
            sorteo_id: string;
            participante_id: string;
            premio_id: string | null;
            premio_descripcion: string | null;
            numero_ganador: number;
            confirmado_en: Date;
        })[];
    } & {
        id: string;
        nombre: string;
        estado: import("@prisma/client").$Enums.EstadoSorteo;
        created_at: Date;
        nivel_filtro: import("@prisma/client").$Enums.NivelFilter;
        modo_premios: import("@prisma/client").$Enums.ModoPremio;
        evento_id: string;
    }>;
    agregarPremio(data: AgregarPremioDto): Promise<{
        id: string;
        descripcion: string;
        orden: number;
        asignado: boolean;
        sorteo_id: string;
    }>;
    numerosElegibles(id: string): Promise<{
        numero: number;
        nombre: string;
        telefono: string;
        participante_id: string;
    }[]>;
    girar({ sorteo_id }: GirarRuletaDto): Promise<{
        numero: number;
        nombre: string;
        telefono: string;
        participante_id: string;
    }>;
    confirmarGanador(data: ConfirmarGanadorDto): Promise<{
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
        premio: {
            id: string;
            descripcion: string;
            orden: number;
            asignado: boolean;
            sorteo_id: string;
        } | null;
    } & {
        id: string;
        sorteo_id: string;
        participante_id: string;
        premio_id: string | null;
        premio_descripcion: string | null;
        numero_ganador: number;
        confirmado_en: Date;
    }>;
    repetir({ sorteo_id, numero }: RepetirDto): Promise<{
        message: string;
    }>;
    finalizar(id: string): Promise<{
        message: string;
    }>;
    resumen(id: string): Promise<{
        evento: {
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
        };
        premios: {
            id: string;
            descripcion: string;
            orden: number;
            asignado: boolean;
            sorteo_id: string;
        }[];
        ganadores: ({
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
            premio: {
                id: string;
                descripcion: string;
                orden: number;
                asignado: boolean;
                sorteo_id: string;
            } | null;
        } & {
            id: string;
            sorteo_id: string;
            participante_id: string;
            premio_id: string | null;
            premio_descripcion: string | null;
            numero_ganador: number;
            confirmado_en: Date;
        })[];
    } & {
        id: string;
        nombre: string;
        estado: import("@prisma/client").$Enums.EstadoSorteo;
        created_at: Date;
        nivel_filtro: import("@prisma/client").$Enums.NivelFilter;
        modo_premios: import("@prisma/client").$Enums.ModoPremio;
        evento_id: string;
    }>;
}
