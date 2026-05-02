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
exports.EditarParticipanteDto = void 0;
const class_validator_1 = require("class-validator");
const registro_participante_dto_1 = require("./registro-participante.dto");
class EditarParticipanteDto {
}
exports.EditarParticipanteDto = EditarParticipanteDto;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], EditarParticipanteDto.prototype, "nombre_completo", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], EditarParticipanteDto.prototype, "telefon", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(registro_participante_dto_1.Nivel),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], EditarParticipanteDto.prototype, "nivel", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(registro_participante_dto_1.TipoParticipante),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], EditarParticipanteDto.prototype, "tipo", void 0);
__decorate([
    (0, class_validator_1.IsBoolean)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Boolean)
], EditarParticipanteDto.prototype, "se_unio", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], EditarParticipanteDto.prototype, "recompensa", void 0);
__decorate([
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", void 0)
], EditarParticipanteDto.prototype, "numero_asignado", void 0);
//# sourceMappingURL=editar-participante.dto.js.map