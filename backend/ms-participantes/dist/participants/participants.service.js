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
let ParticipantsService = class ParticipantsService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async registrar(data) {
        const existente = await this.prisma.participante.findUnique({
            where: {
                telefon_evento_id: {
                    telefon: data.telefon,
                    evento_id: data.evento_id,
                },
            },
        });
        if (existente)
            throw new common_1.ConflictException('Ya existe un registro con este teléfono para este evento');
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
                },
            });
        });
    }
    async confirmar(id) {
        const participante = await this.prisma.participante.findUnique({ where: { id } });
        if (!participante)
            throw new common_1.NotFoundException('Participante no encontrado');
        return await this.prisma.participante.update({
            where: { id },
            data: { confirmado: true },
        });
    }
    async listarPorEvento(evento_id, soloConfirmados) {
        const where = { evento_id };
        if (soloConfirmados)
            where.confirmado = true;
        return await this.prisma.participante.findMany({
            where,
            orderBy: { numero_asignado: 'asc' },
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