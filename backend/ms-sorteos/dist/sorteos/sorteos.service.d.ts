import { PrismaService } from '../prisma/prisma.service';
import { CrearSorteoDto } from '../dto/crear-sorteo.dto';
import { AgregarPremioDto } from '../dto/agregar-premio.dto';
import { ConfirmarGanadorDto } from '../dto/confirmar-ganador.dto';
export declare class SorteosService {
    private prisma;
    private exclusionesTemporales;
    constructor(prisma: PrismaService);
    crear(data: CrearSorteoDto): Promise<{
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
    obtenerNumerosElegibles(sorteoId: string): Promise<{
        numero: number;
        nombre: string;
        telefono: string;
        participante_id: string;
    }[]>;
    girar(sorteoId: string): Promise<{
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
    repetir(sorteoId: string, numero: number): Promise<{
        message: string;
    }>;
    finalizar(sorteoId: string): Promise<{
        message: string;
    }>;
    listarPorEvento(evento_id: string): Promise<({
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
    obtenerPorId(id: string): Promise<{
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
    resumen(sorteoId: string): Promise<{
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
