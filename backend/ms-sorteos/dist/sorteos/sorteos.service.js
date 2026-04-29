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
exports.SorteosService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const crear_sorteo_dto_1 = require("../dto/crear-sorteo.dto");
const crypto_1 = require("crypto");
let SorteosService = class SorteosService {
    constructor(prisma) {
        this.prisma = prisma;
        this.exclusionesTemporales = new Map();
    }
    async crear(data) {
        const evento = await this.prisma.evento.findUnique({ where: { id: data.evento_id } });
        if (!evento)
            throw new common_1.NotFoundException('Evento no encontrado');
        return this.prisma.sorteo.create({
            data: {
                nombre: data.nombre,
                evento_id: data.evento_id,
                nivel_filtro: data.nivel_filtro || crear_sorteo_dto_1.NivelFilter.TODOS,
                modo_premios: data.modo_premios || crear_sorteo_dto_1.ModoPremio.MANUAL,
                estado: 'PENDIENTE',
            },
        });
    }
    async agregarPremio(data) {
        const sorteo = await this.prisma.sorteo.findUnique({ where: { id: data.sorteo_id } });
        if (!sorteo)
            throw new common_1.NotFoundException('Sorteo no encontrado');
        if (sorteo.modo_premios !== 'PRE_CARGA') {
            throw new common_1.BadRequestException('Este sorteo no usa modo PRE_CARGA');
        }
        return this.prisma.premio.create({
            data: {
                sorteo_id: data.sorteo_id,
                descripcion: data.descripcion,
                orden: data.orden,
                asignado: false,
            },
        });
    }
    async obtenerNumerosElegibles(sorteoId) {
        const sorteo = await this.prisma.sorteo.findUnique({
            where: { id: sorteoId },
            include: { evento: true },
        });
        if (!sorteo)
            throw new common_1.NotFoundException('Sorteo no encontrado');
        const where = {
            evento_id: sorteo.evento_id,
            confirmado: true,
        };
        if (sorteo.nivel_filtro !== 'TODOS') {
            where.nivel = sorteo.nivel_filtro;
        }
        const participantes = await this.prisma.participante.findMany({
            where,
            select: { id: true, numero_asignado: true, nombre_completo: true, telefon: true },
        });
        const ganadoresPrevios = await this.prisma.ganador.findMany({
            where: { sorteo_id: sorteoId },
            select: { numero_ganador: true },
        });
        const numerosGanados = new Set(ganadoresPrevios.map(g => g.numero_ganador));
        const tempExclusions = this.exclusionesTemporales.get(sorteoId) || new Set();
        const elegibles = participantes
            .filter(p => p.numero_asignado !== null && !numerosGanados.has(p.numero_asignado) && !tempExclusions.has(p.numero_asignado))
            .map(p => ({
            numero: p.numero_asignado,
            nombre: p.nombre_completo,
            telefono: p.telefon,
            participante_id: p.id,
        }));
        return elegibles;
    }
    async girar(sorteoId) {
        const elegibles = await this.obtenerNumerosElegibles(sorteoId);
        if (elegibles.length === 0) {
            throw new common_1.BadRequestException('No hay números elegibles para este sorteo');
        }
        const randomIndex = (0, crypto_1.randomInt)(0, elegibles.length);
        return elegibles[randomIndex];
    }
    async confirmarGanador(data) {
        const { sorteo_id, numero_ganador, participante_id, premio_descripcion } = data;
        const sorteo = await this.prisma.sorteo.findUnique({ where: { id: sorteo_id } });
        if (!sorteo)
            throw new common_1.NotFoundException('Sorteo no encontrado');
        const participante = await this.prisma.participante.findUnique({ where: { id: participante_id } });
        if (!participante || !participante.confirmado) {
            throw new common_1.BadRequestException('Participante no válido o no confirmado');
        }
        const yaGanador = await this.prisma.ganador.findFirst({
            where: { sorteo_id, numero_ganador },
        });
        if (yaGanador) {
            throw new common_1.ConflictException('Este número ya tiene un ganador asignado');
        }
        let premioAsignado = null;
        if (sorteo.modo_premios === 'PRE_CARGA') {
            const siguientePremio = await this.prisma.premio.findFirst({
                where: { sorteo_id, asignado: false },
                orderBy: { orden: 'asc' },
            });
            if (!siguientePremio) {
                throw new common_1.BadRequestException('No hay más premios disponibles en modo PRE_CARGA');
            }
            await this.prisma.premio.update({
                where: { id: siguientePremio.id },
                data: { asignado: true },
            });
            premioAsignado = { id: siguientePremio.id };
        }
        const ganador = await this.prisma.ganador.create({
            data: {
                sorteo_id,
                participante_id,
                numero_ganador,
                premio_id: (sorteo.modo_premios === 'PRE_CARGA' && premioAsignado) ? premioAsignado.id : null,
                premio_descripcion: (sorteo.modo_premios === 'MANUAL') ? premio_descripcion : null,
                confirmado_en: new Date(),
            },
            include: { participante: true, premio: true },
        });
        const tempEx = this.exclusionesTemporales.get(sorteo_id);
        if (tempEx) {
            tempEx.delete(numero_ganador);
        }
        if (sorteo.estado === 'PENDIENTE') {
            await this.prisma.sorteo.update({
                where: { id: sorteo_id },
                data: { estado: 'EN_CURSO' },
            });
        }
        return ganador;
    }
    async repetir(sorteoId, numero) {
        let tempSet = this.exclusionesTemporales.get(sorteoId);
        if (!tempSet) {
            tempSet = new Set();
            this.exclusionesTemporales.set(sorteoId, tempSet);
        }
        tempSet.add(numero);
        return { message: `Número ${numero} excluido temporalmente` };
    }
    async finalizar(sorteoId) {
        const sorteo = await this.prisma.sorteo.findUnique({ where: { id: sorteoId } });
        if (!sorteo)
            throw new common_1.NotFoundException('Sorteo no encontrado');
        await this.prisma.sorteo.update({
            where: { id: sorteoId },
            data: { estado: 'FINALIZADO' },
        });
        this.exclusionesTemporales.delete(sorteoId);
        return { message: 'Sorteo finalizado' };
    }
    async listarPorEvento(evento_id) {
        return this.prisma.sorteo.findMany({
            where: { evento_id },
            include: { premios: true, ganadores: { include: { participante: true } } },
        });
    }
    async resumen(sorteoId) {
        const sorteo = await this.prisma.sorteo.findUnique({
            where: { id: sorteoId },
            include: {
                evento: true,
                premios: true,
                ganadores: {
                    include: { participante: true, premio: true },
                    orderBy: { confirmado_en: 'asc' },
                },
            },
        });
        if (!sorteo)
            throw new common_1.NotFoundException('Sorteo no encontrado');
        return sorteo;
    }
};
exports.SorteosService = SorteosService;
exports.SorteosService = SorteosService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], SorteosService);
//# sourceMappingURL=sorteos.service.js.map