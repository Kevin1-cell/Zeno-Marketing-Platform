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
        const fechaEvento = new Date(data.fecha);
        if (fechaEvento <= new Date()) {
            throw new common_1.BadRequestException('La fecha del evento debe ser futura');
        }
        return this.prisma.evento.create({
            data: {
                nombre: data.nombre,
                descripcion: data.descripcion,
                lugar: data.lugar,
                hora: data.hora,
                fecha: fechaEvento,
                estado: data.estado || client_1.EstadoEvento.ACTIVO,
                whatsapp_link: data.whatsapp_link,
                aforo_maximo: data.aforo_maximo,
                eliminado: false,
            },
        });
    }
    async listar(estado, incluirEliminados = false) {
        const where = {};
        if (estado !== undefined)
            where.estado = estado;
        if (!incluirEliminados)
            where.eliminado = false;
        return this.prisma.evento.findMany({
            where,
            orderBy: { fecha: 'desc' },
        });
    }
    async obtenerPorId(id, incluirEliminados = false) {
        const evento = await this.prisma.evento.findFirst({
            where: {
                id,
                ...(incluirEliminados ? {} : { eliminado: false }),
            },
        });
        if (!evento)
            throw new common_1.NotFoundException('Evento no encontrado');
        return evento;
    }
    async editar(id, data) {
        await this.obtenerPorId(id);
        if (data.fecha) {
            const fechaEvento = new Date(data.fecha);
            if (fechaEvento <= new Date()) {
                throw new common_1.BadRequestException('La fecha del evento debe ser futura');
            }
        }
        return this.prisma.evento.update({
            where: { id },
            data: {
                nombre: data.nombre,
                descripcion: data.descripcion,
                lugar: data.lugar,
                hora: data.hora,
                fecha: data.fecha ? new Date(data.fecha) : undefined,
                estado: data.estado,
                whatsapp_link: data.whatsapp_link,
                aforo_maximo: data.aforo_maximo,
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
    async eliminarLogico(id) {
        await this.obtenerPorId(id);
        return this.prisma.evento.update({
            where: { id },
            data: { eliminado: true },
        });
    }
    async restaurar(id) {
        const evento = await this.prisma.evento.findFirst({ where: { id, eliminado: true } });
        if (!evento)
            throw new common_1.NotFoundException('Evento no encontrado o no está eliminado');
        return this.prisma.evento.update({
            where: { id },
            data: { eliminado: false },
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