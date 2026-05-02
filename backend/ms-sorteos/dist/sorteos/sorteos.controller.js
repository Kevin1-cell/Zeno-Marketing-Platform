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
exports.SorteosController = void 0;
const common_1 = require("@nestjs/common");
const sorteos_service_1 = require("./sorteos.service");
const crear_sorteo_dto_1 = require("../dto/crear-sorteo.dto");
const agregar_premio_dto_1 = require("../dto/agregar-premio.dto");
const confirmar_ganador_dto_1 = require("../dto/confirmar-ganador.dto");
const repetir_dto_1 = require("../dto/repetir.dto");
const girar_ruleta_dto_1 = require("../dto/girar-ruleta.dto");
const jwt_auth_guard_1 = require("../guards/jwt-auth.guard");
const sorteos_gateway_1 = require("../gateway/sorteos.gateway");
let SorteosController = class SorteosController {
    constructor(sorteosService, sorteosGateway) {
        this.sorteosService = sorteosService;
        this.sorteosGateway = sorteosGateway;
    }
    async crear(data) {
        return this.sorteosService.crear(data);
    }
    async listar(evento_id) {
        return this.sorteosService.listarPorEvento(evento_id);
    }
    async obtener(id) {
        return this.sorteosService.obtenerPorId(id);
    }
    async agregarPremio(data) {
        return this.sorteosService.agregarPremio(data);
    }
    async numerosElegibles(id) {
        return this.sorteosService.obtenerNumerosElegibles(id);
    }
    async girar({ sorteo_id }) {
        this.sorteosGateway.emitRuletaGirando(sorteo_id);
        const ganador = await this.sorteosService.girar(sorteo_id);
        this.sorteosGateway.emitGanadorSeleccionado(sorteo_id, ganador);
        return ganador;
    }
    async confirmarGanador(data) {
        const ganador = await this.sorteosService.confirmarGanador(data);
        this.sorteosGateway.emitGanadorConfirmado(data.sorteo_id, ganador);
        return ganador;
    }
    async repetir({ sorteo_id, numero }) {
        return this.sorteosService.repetir(sorteo_id, numero);
    }
    async finalizar(id) {
        return this.sorteosService.finalizar(id);
    }
    async resumen(id) {
        return this.sorteosService.resumen(id);
    }
};
exports.SorteosController = SorteosController;
__decorate([
    (0, common_1.Post)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [crear_sorteo_dto_1.CrearSorteoDto]),
    __metadata("design:returntype", Promise)
], SorteosController.prototype, "crear", null);
__decorate([
    (0, common_1.Get)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Query)('evento_id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], SorteosController.prototype, "listar", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], SorteosController.prototype, "obtener", null);
__decorate([
    (0, common_1.Post)('premios'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [agregar_premio_dto_1.AgregarPremioDto]),
    __metadata("design:returntype", Promise)
], SorteosController.prototype, "agregarPremio", null);
__decorate([
    (0, common_1.Get)(':id/numeros-elegibles'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], SorteosController.prototype, "numerosElegibles", null);
__decorate([
    (0, common_1.Post)('girar'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [girar_ruleta_dto_1.GirarRuletaDto]),
    __metadata("design:returntype", Promise)
], SorteosController.prototype, "girar", null);
__decorate([
    (0, common_1.Post)('confirmar-ganador'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [confirmar_ganador_dto_1.ConfirmarGanadorDto]),
    __metadata("design:returntype", Promise)
], SorteosController.prototype, "confirmarGanador", null);
__decorate([
    (0, common_1.Post)('repetir'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [repetir_dto_1.RepetirDto]),
    __metadata("design:returntype", Promise)
], SorteosController.prototype, "repetir", null);
__decorate([
    (0, common_1.Post)(':id/finalizar'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], SorteosController.prototype, "finalizar", null);
__decorate([
    (0, common_1.Get)(':id/resumen'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], SorteosController.prototype, "resumen", null);
exports.SorteosController = SorteosController = __decorate([
    (0, common_1.Controller)('sorteos'),
    __metadata("design:paramtypes", [sorteos_service_1.SorteosService,
        sorteos_gateway_1.SorteosGateway])
], SorteosController);
//# sourceMappingURL=sorteos.controller.js.map