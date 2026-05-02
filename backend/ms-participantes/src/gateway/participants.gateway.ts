import { WebSocketGateway, WebSocketServer, OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({ cors: true, namespace: 'participants' })
export class ParticipantsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  handleConnection(client: Socket) {
    console.log(`🟢 Cliente conectado a WebSocket: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    console.log(`🔴 Cliente desconectado de WebSocket: ${client.id}`);
  }

  emitNuevoParticipante(participante: any) {
    console.log('📢 Emitiendo participante:nuevo:', participante);
    this.server.emit('participante:nuevo', participante);
  }

  emitConfirmado(participante: any) {
    console.log('✅ Emitiendo participante:confirmado:', participante);
    this.server.emit('participante:confirmado', participante);
  }
}