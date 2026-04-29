import { WebSocketGateway, WebSocketServer, OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({ cors: true, namespace: 'sorteos' })
export class SorteosGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  handleConnection(client: Socket) {
    console.log(`Cliente conectado a sorteos: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    console.log(`Cliente desconectado de sorteos: ${client.id}`);
  }

  emitRuletaGirando(sorteoId: string) {
    this.server.emit(`sorteo:${sorteoId}:ruleta_girando`, { girando: true });
  }

  emitGanadorSeleccionado(sorteoId: string, ganador: any) {
    this.server.emit(`sorteo:${sorteoId}:ganador_seleccionado`, ganador);
  }

  emitGanadorConfirmado(sorteoId: string, ganador: any) {
    this.server.emit(`sorteo:${sorteoId}:ganador_confirmado`, ganador);
  }
}