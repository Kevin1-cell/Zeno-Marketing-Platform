"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ParticipantsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const registro_participante_dto_1 = require("../dto/registro-participante.dto");
let ParticipantsService = class ParticipantsService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    validarTelefono(telefon) {
        if (!/^\d{10}$/.test(telefon)) {
            throw new common_1.BadRequestException('El número de teléfono debe tener exactamente 10 dígitos');
        }
    }
    async verificarAforo(eventoId) {
        const evento = await this.prisma.evento.findUnique({
            where: { id: eventoId },
            select: { aforo_maximo: true }
        });
        if (evento?.aforo_maximo) {
            const totalParticipantes = await this.prisma.participante.count({
                where: { evento_id: eventoId }
            });
            if (totalParticipantes >= evento.aforo_maximo) {
                throw new common_1.BadRequestException('El aforo máximo para este evento se ha llenado. Por favor, contacta al administrador.');
            }
        }
    }
    async registrar(data) {
        if (data.tipo === registro_participante_dto_1.TipoParticipante.INVITADO) {
            return this.registrarInvitado(data);
        }
        this.validarTelefono(data.telefon);
        if (!data.nivel) {
            throw new common_1.BadRequestException('Para empleados el nivel es obligatorio');
        }
        const evento = await this.prisma.evento.findFirst({
            where: { id: data.evento_id, estado: 'ACTIVO', eliminado: false },
        });
        if (!evento)
            throw new common_1.BadRequestException('Evento no válido');
        const existente = await this.prisma.participante.findUnique({
            where: { telefon_evento_id: { telefon: data.telefon, evento_id: data.evento_id } },
        });
        if (existente)
            throw new common_1.ConflictException('Ya existe un registro con este teléfono');
        await this.verificarAforo(data.evento_id);
        return await this.prisma.$transaction(async (tx) => {
            const maxNumero = await tx.participante.aggregate({
                where: { evento_id: data.evento_id },
                _max: { numero_asignado: true },
            });
            const nextNumero = (maxNumero._max.numero_asignado || 0) + 1;
            return await tx.participante.create({
                data: {
                    nombre_completo: data.nombre_completo,
                    telefon: data.telefon,
                    nivel: data.nivel,
                    evento_id: data.evento_id,
                    numero_asignado: nextNumero,
                    confirmado: false,
                    tipo: registro_participante_dto_1.TipoParticipante.EMPLEADO,
                },
            });
        });
    }
    async registrarInvitado(data) {
        this.validarTelefono(data.telefon);
        const evento = await this.prisma.evento.findFirst({
            where: { id: data.evento_id, estado: 'ACTIVO', eliminado: false },
        });
        if (!evento)
            throw new common_1.BadRequestException('Evento no válido');
        const existente = await this.prisma.participante.findUnique({
            where: { telefon_evento_id: { telefon: data.telefon, evento_id: data.evento_id } },
        });
        if (existente)
            throw new common_1.ConflictException('Ya existe un registro con este teléfono');
        await this.verificarAforo(data.evento_id);
        return await this.prisma.participante.create({
            data: {
                nombre_completo: data.nombre_completo,
                telefon: data.telefon,
                nivel: null,
                evento_id: data.evento_id,
                numero_asignado: null,
                confirmado: false,
                tipo: registro_participante_dto_1.TipoParticipante.INVITADO,
                se_unio: data.se_unio ?? false,
                recompensa: data.recompensa ?? null,
            },
        });
    }
    async registrarManual(data) {
        if (data.tipo === registro_participante_dto_1.TipoParticipante.INVITADO) {
            return this.registrarManualInvitado(data);
        }
        this.validarTelefono(data.telefon);
        if (!data.nivel) {
            throw new common_1.BadRequestException('Para empleados el nivel es obligatorio');
        }
        const existente = await this.prisma.participante.findUnique({
            where: { telefon_evento_id: { telefon: data.telefon, evento_id: data.evento_id } },
        });
        if (existente)
            throw new common_1.ConflictException('Ya existe un registro con este teléfono');
        return await this.prisma.$transaction(async (tx) => {
            const maxNumero = await tx.participante.aggregate({
                where: { evento_id: data.evento_id },
                _max: { numero_asignado: true },
            });
            const nextNumero = (maxNumero._max.numero_asignado || 0) + 1;
            return await tx.participante.create({
                data: {
                    nombre_completo: data.nombre_completo,
                    telefon: data.telefon,
                    nivel: data.nivel,
                    evento_id: data.evento_id,
                    numero_asignado: nextNumero,
                    confirmado: true,
                    tipo: registro_participante_dto_1.TipoParticipante.EMPLEADO,
                },
            });
        });
    }
    async registrarManualInvitado(data) {
        this.validarTelefono(data.telefon);
        const existente = await this.prisma.participante.findUnique({
            where: { telefon_evento_id: { telefon: data.telefon, evento_id: data.evento_id } },
        });
        if (existente)
            throw new common_1.ConflictException('Ya existe un registro con este teléfono');
        return await this.prisma.participante.create({
            data: {
                nombre_completo: data.nombre_completo,
                telefon: data.telefon,
                nivel: null,
                evento_id: data.evento_id,
                numero_asignado: null,
                confirmado: false,
                tipo: registro_participante_dto_1.TipoParticipante.INVITADO,
                se_unio: data.se_unio ?? false,
                recompensa: data.recompensa ?? null,
            },
        });
    }
    async confirmar(id) {
        const participante = await this.prisma.participante.findUnique({ where: { id } });
        if (!participante)
            throw new common_1.NotFoundException('Participante no encontrado');
        if (participante.tipo === 'INVITADO') {
            throw new common_1.BadRequestException('Los invitados no se confirman directamente. Use "Convertir a empleado".');
        }
        return await this.prisma.participante.update({
            where: { id },
            data: { confirmado: true },
        });
    }
    async convertirInvitadoAEmpleado(dto) {
        const participante = await this.prisma.participante.findUnique({ where: { id: dto.id } });
        if (!participante)
            throw new common_1.NotFoundException('Participante no encontrado');
        if (participante.tipo !== 'INVITADO') {
            throw new common_1.BadRequestException('Solo se puede convertir un participante de tipo invitado');
        }
        return await this.prisma.$transaction(async (tx) => {
            const maxNumero = await tx.participante.aggregate({
                where: { evento_id: participante.evento_id },
                _max: { numero_asignado: true },
            });
            const nextNumero = (maxNumero._max.numero_asignado || 0) + 1;
            return await tx.participante.update({
                where: { id: dto.id },
                data: {
                    nivel: dto.nivel,
                    numero_asignado: nextNumero,
                    confirmado: true,
                    se_unio: true,
                },
            });
        });
    }
    async editarParticipante(id, data) {
        const participante = await this.prisma.participante.findUnique({ where: { id } });
        if (!participante)
            throw new common_1.NotFoundException('Participante no encontrado');
        if (data.telefon && data.telefon !== participante.telefon) {
            this.validarTelefono(data.telefon);
            const existente = await this.prisma.participante.findUnique({
                where: {
                    telefon_evento_id: {
                        telefon: data.telefon,
                        evento_id: participante.evento_id,
                    },
                },
            });
            if (existente && existente.id !== id) {
                throw new common_1.ConflictException('Ya existe otro participante con ese teléfono en este evento');
            }
        }
        if (data.tipo === 'EMPLEADO' && participante.tipo === 'INVITADO') {
            throw new common_1.BadRequestException('Para convertir un invitado a empleado use el endpoint específico');
        }
        return await this.prisma.participante.update({
            where: { id },
            data: {
                nombre_completo: data.nombre_completo,
                telefon: data.telefon,
                nivel: data.nivel,
                tipo: data.tipo,
                se_unio: data.se_unio,
                recompensa: data.recompensa,
            },
        });
    }
    async listarPorEvento(evento_id, filtros) {
        const where = { evento_id };
        if (filtros?.soloConfirmados)
            where.confirmado = true;
        if (filtros?.tipo)
            where.tipo = filtros.tipo;
        if (filtros?.soloInvitadosNoUnidos) {
            where.tipo = 'INVITADO';
            where.se_unio = false;
        }
        return await this.prisma.participante.findMany({
            where,
            orderBy: { numero_asignado: 'asc' },
        });
    }
    async consultarPorTelefono(telefon, evento_id) {
        return this.prisma.participante.findUnique({
            where: { telefon_evento_id: { telefon, evento_id } },
        });
    }
    async obtenerPorId(id) {
        const participante = await this.prisma.participante.findUnique({ where: { id } });
        if (!participante)
            throw new common_1.NotFoundException('Participante no encontrado');
        return participante;
    }
};
exports.ParticipantsService = ParticipantsService;
exports.ParticipantsService = ParticipantsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ParticipantsService);
//# sourceMappingURL=participants.service.js.map