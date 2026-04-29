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
exports.EventsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const client_1 = require("@prisma/client");
let EventsService = class EventsService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async crear(data) {
        return this.prisma.evento.create({
            data: {
                nombre: data.nombre,
                descripcion: data.descripcion,
                fecha: new Date(data.fecha),
                estado: data.estado || client_1.EstadoEvento.ACTIVO,
                whatsapp_link: data.whatsapp_link,
            },
        });
    }
    async listar(estado) {
        const where = estado ? { estado } : {};
        return this.prisma.evento.findMany({
            where,
            orderBy: { fecha: 'desc' },
        });
    }
    async obtenerPorId(id) {
        const evento = await this.prisma.evento.findUnique({ where: { id } });
        if (!evento)
            throw new common_1.NotFoundException('Evento no encontrado');
        return evento;
    }
    async editar(id, data) {
        await this.obtenerPorId(id);
        return this.prisma.evento.update({
            where: { id },
            data: {
                nombre: data.nombre,
                descripcion: data.descripcion,
                fecha: data.fecha ? new Date(data.fecha) : undefined,
                estado: data.estado,
                whatsapp_link: data.whatsapp_link,
            },
        });
    }
    async cambiarEstado(id, estado) {
        await this.obtenerPorId(id);
        return this.prisma.evento.update({
            where: { id },
            data: { estado },
        });
    }
    async obtenerEstadisticas(eventoId) {
        const participantes = await this.prisma.participante.findMany({
            where: { evento_id: eventoId },
        });
        const total = participantes.length;
        const confirmados = participantes.filter(p => p.confirmado).length;
        const porNivel = {
            C1: participantes.filter(p => p.nivel === 'C1').length,
            C2: participantes.filter(p => p.nivel === 'C2').length,
            C3: participantes.filter(p => p.nivel === 'C3').length,
        };
        return { total, confirmados, porNivel };
    }
};
exports.EventsService = EventsService;
exports.EventsService = EventsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], EventsService);
//# sourceMappingURL=events.service.js.map