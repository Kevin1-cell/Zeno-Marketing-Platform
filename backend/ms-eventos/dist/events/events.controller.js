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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EventsController = void 0;
const common_1 = require("@nestjs/common");
const events_service_1 = require("./events.service");
const crear_evento_dto_1 = require("../dto/crear-evento.dto");
const editar_evento_dto_1 = require("../dto/editar-evento.dto");
const jwt_auth_guard_1 = require("../guards/jwt-auth.guard");
const events_gateway_1 = require("../gateway/events.gateway");
const client_1 = require("@prisma/client");
let EventsController = class EventsController {
    constructor(eventsService, eventsGateway) {
        this.eventsService = eventsService;
        this.eventsGateway = eventsGateway;
    }
    async crear(data) {
        return this.eventsService.crear(data);
    }
    async listar(estado) {
        return this.eventsService.listar(estado);
    }
    async obtener(id) {
        return this.eventsService.obtenerPorId(id);
    }
    async editar(id, data) {
        return this.eventsService.editar(id, data);
    }
    async cambiarEstado(id, estado) {
        const evento = await this.eventsService.cambiarEstado(id, estado);
        const stats = await this.eventsService.obtenerEstadisticas(id);
        this.eventsGateway.emitStatsUpdate(id, stats);
        return evento;
    }
    async obtenerEstadisticas(id) {
        return this.eventsService.obtenerEstadisticas(id);
    }
};
exports.EventsController = EventsController;
__decorate([
    (0, common_1.Post)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [crear_evento_dto_1.CrearEventoDto]),
    __metadata("design:returntype", Promise)
], EventsController.prototype, "crear", null);
__decorate([
    (0, common_1.Get)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Query)('estado')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], EventsController.prototype, "listar", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], EventsController.prototype, "obtener", null);
__decorate([
    (0, common_1.Put)(':id'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, editar_evento_dto_1.EditarEventoDto]),
    __metadata("design:returntype", Promise)
], EventsController.prototype, "editar", null);
__decorate([
    (0, common_1.Patch)(':id/estado'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)('estado')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], EventsController.prototype, "cambiarEstado", null);
__decorate([
    (0, common_1.Get)(':id/estadisticas'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], EventsController.prototype, "obtenerEstadisticas", null);
exports.EventsController = EventsController = __decorate([
    (0, common_1.Controller)('eventos'),
    __metadata("design:paramtypes", [events_service_1.EventsService,
        events_gateway_1.EventsGateway])
], EventsController);
//# sourceMappingURL=events.controller.js.map