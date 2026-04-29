import { WebSocketGateway, WebSocketServer, OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({ cors: true, namespace: 'events' })
export class EventsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  handleConnection(client: Socket) {
    console.log(`Cliente conectado a events: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    console.log(`Cliente desconectado de events: ${client.id}`);
  }

  emitStatsUpdate(eventoId: string, stats: any) {
    this.server.emit(`evento:${eventoId}:stats_update`, stats);
  }
}