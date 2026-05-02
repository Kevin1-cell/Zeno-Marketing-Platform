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
exports.ParticipantsGateway = void 0;
const websockets_1 = require("@nestjs/websockets");
const socket_io_1 = require("socket.io");
let ParticipantsGateway = class ParticipantsGateway {
    handleConnection(client) {
        console.log(`🟢 Cliente conectado a WebSocket: ${client.id}`);
    }
    handleDisconnect(client) {
        console.log(`🔴 Cliente desconectado de WebSocket: ${client.id}`);
    }
    emitNuevoParticipante(participante) {
        console.log('📢 Emitiendo participante:nuevo:', participante);
        this.server.emit('participante:nuevo', participante);
    }
    emitConfirmado(participante) {
        console.log('✅ Emitiendo participante:confirmado:', participante);
        this.server.emit('participante:confirmado', participante);
    }
};
exports.ParticipantsGateway = ParticipantsGateway;
__decorate([
    (0, websockets_1.WebSocketServer)(),
    __metadata("design:type", socket_io_1.Server)
], ParticipantsGateway.prototype, "server", void 0);
exports.ParticipantsGateway = ParticipantsGateway = __decorate([
    (0, websockets_1.WebSocketGateway)({ cors: true, namespace: 'participants' })
], ParticipantsGateway);
//# sourceMappingURL=participants.gateway.js.map