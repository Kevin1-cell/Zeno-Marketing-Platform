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
exports.ParticipantsController = void 0;
const common_1 = require("@nestjs/common");
const participants_service_1 = require("./participants.service");
const registro_participante_dto_1 = require("../dto/registro-participante.dto");
const confirmar_participante_dto_1 = require("../dto/confirmar-participante.dto");
const editar_participante_dto_1 = require("../dto/editar-participante.dto");
const convertir_invitado_dto_1 = require("../dto/convertir-invitado.dto");
const jwt_auth_guard_1 = require("../guards/jwt-auth.guard");
const participants_gateway_1 = require("../gateway/participants.gateway");
let ParticipantsController = class ParticipantsController {
    constructor(participantsService, participantsGateway) {
        this.participantsService = participantsService;
        this.participantsGateway = participantsGateway;
    }
    async registrar(data) {
        const participante = await this.participantsService.registrar(data);
        this.participantsGateway.emitNuevoParticipante(participante);
        return {
            message: participante.tipo === 'INVITADO'
                ? 'Registro de invitado exitoso.'
                : 'Registro exitoso. Espera confirmación del administrador.',
            participante,
        };
    }
    async confirmar({ id }) {
        const participante = await this.participantsService.confirmar(id);
        this.participantsGateway.emitConfirmado(participante);
        return participante;
    }
    async convertirInvitado(dto) {
        const participante = await this.participantsService.convertirInvitadoAEmpleado(dto);
        this.participantsGateway.emitConfirmado(participante);
        return participante;
    }
    async editar(id, data) {
        const participante = await this.participantsService.editarParticipante(id, data);
        this.participantsGateway.emitConfirmado(participante);
        return participante;
    }
    async listar(evento_id, soloConfirmados, tipo, soloInvitadosNoUnidos) {
        return this.participantsService.listarPorEvento(evento_id, {
            soloConfirmados: soloConfirmados === 'true',
            tipo,
            soloInvitadosNoUnidos: soloInvitadosNoUnidos === 'true',
        });
    }
    async consultar(telefon, evento_id) {
        const participante = await this.participantsService.consultarPorTelefono(telefon, evento_id);
        if (!participante)
            throw new common_1.NotFoundException('No estás registrado');
        return participante;
    }
    async registrarManual(data) {
        const participante = await this.participantsService.registrarManual(data);
        this.participantsGateway.emitConfirmado(participante);
        return participante;
    }
    async obtener(id) {
        return this.participantsService.obtenerPorId(id);
    }
};
exports.ParticipantsController = ParticipantsController;
__decorate([
    (0, common_1.Post)('registro'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [registro_participante_dto_1.RegistroParticipanteDto]),
    __metadata("design:returntype", Promise)
], ParticipantsController.prototype, "registrar", null);
__decorate([
    (0, common_1.Patch)('confirmar'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [confirmar_participante_dto_1.ConfirmarParticipanteDto]),
    __metadata("design:returntype", Promise)
], ParticipantsController.prototype, "confirmar", null);
__decorate([
    (0, common_1.Post)('convertir'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [convertir_invitado_dto_1.ConvertirInvitadoDto]),
    __metadata("design:returntype", Promise)
], ParticipantsController.prototype, "convertirInvitado", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, editar_participante_dto_1.EditarParticipanteDto]),
    __metadata("design:returntype", Promise)
], ParticipantsController.prototype, "editar", null);
__decorate([
    (0, common_1.Get)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Query)('evento_id')),
    __param(1, (0, common_1.Query)('solo_confirmados')),
    __param(2, (0, common_1.Query)('tipo')),
    __param(3, (0, common_1.Query)('solo_invitados_no_unidos')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String]),
    __metadata("design:returntype", Promise)
], ParticipantsController.prototype, "listar", null);
__decorate([
    (0, common_1.Get)('consulta'),
    __param(0, (0, common_1.Query)('telefon')),
    __param(1, (0, common_1.Query)('evento_id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], ParticipantsController.prototype, "consultar", null);
__decorate([
    (0, common_1.Post)('manual'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [registro_participante_dto_1.RegistroParticipanteDto]),
    __metadata("design:returntype", Promise)
], ParticipantsController.prototype, "registrarManual", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ParticipantsController.prototype, "obtener", null);
exports.ParticipantsController = ParticipantsController = __decorate([
    (0, common_1.Controller)('participantes'),
    __metadata("design:paramtypes", [participants_service_1.ParticipantsService,
        participants_gateway_1.ParticipantsGateway])
], ParticipantsController);
//# sourceMappingURL=participants.controller.js.map