import { OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
export declare class SorteosGateway implements OnGatewayConnection, OnGatewayDisconnect {
    server: Server;
    handleConnection(client: Socket): void;
    handleDisconnect(client: Socket): void;
    emitRuletaGirando(sorteoId: string): void;
    emitGanadorSeleccionado(sorteoId: string, ganador: any): void;
    emitGanadorConfirmado(sorteoId: string, ganador: any): void;
}
