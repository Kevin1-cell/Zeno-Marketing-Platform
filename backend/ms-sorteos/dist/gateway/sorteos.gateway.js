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
exports.SorteosGateway = void 0;
const websockets_1 = require("@nestjs/websockets");
const socket_io_1 = require("socket.io");
let SorteosGateway = class SorteosGateway {
    handleConnection(client) {
        console.log(`Cliente conectado a sorteos: ${client.id}`);
    }
    handleDisconnect(client) {
        console.log(`Cliente desconectado de sorteos: ${client.id}`);
    }
    emitRuletaGirando(sorteoId) {
        this.server.emit(`sorteo:${sorteoId}:ruleta_girando`, { girando: true });
    }
    emitGanadorSeleccionado(sorteoId, ganador) {
        this.server.emit(`sorteo:${sorteoId}:ganador_seleccionado`, ganador);
    }
    emitGanadorConfirmado(sorteoId, ganador) {
        this.server.emit(`sorteo:${sorteoId}:ganador_confirmado`, ganador);
    }
};
exports.SorteosGateway = SorteosGateway;
__decorate([
    (0, websockets_1.WebSocketServer)(),
    __metadata("design:type", socket_io_1.Server)
], SorteosGateway.prototype, "server", void 0);
exports.SorteosGateway = SorteosGateway = __decorate([
    (0, websockets_1.WebSocketGateway)({ cors: true, namespace: 'sorteos' })
], SorteosGateway);
//# sourceMappingURL=sorteos.gateway.js.map