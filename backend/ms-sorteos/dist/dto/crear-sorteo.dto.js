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
exports.CrearSorteoDto = exports.ModoPremio = exports.NivelFilter = void 0;
const class_validator_1 = require("class-validator");
var NivelFilter;
(function (NivelFilter) {
    NivelFilter["C1"] = "C1";
    NivelFilter["C2"] = "C2";
    NivelFilter["C3"] = "C3";
    NivelFilter["TODOS"] = "TODOS";
})(NivelFilter || (exports.NivelFilter = NivelFilter = {}));
var ModoPremio;
(function (ModoPremio) {
    ModoPremio["PRE_CARGA"] = "PRE_CARGA";
    ModoPremio["MANUAL"] = "MANUAL";
})(ModoPremio || (exports.ModoPremio = ModoPremio = {}));
class CrearSorteoDto {
}
exports.CrearSorteoDto = CrearSorteoDto;
__decorate([
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], CrearSorteoDto.prototype, "evento_id", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CrearSorteoDto.prototype, "nombre", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(NivelFilter),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CrearSorteoDto.prototype, "nivel_filtro", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(ModoPremio),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CrearSorteoDto.prototype, "modo_premios", void 0);
//# sourceMappingURL=crear-sorteo.dto.js.map