import { Module } from '@nestjs/common';
import { WebSocketGateway } from './websocket.gateway';
import { AlertsService } from './alerts.service';

@Module({
  providers: [WebSocketGateway, AlertsService],
  exports: [WebSocketGateway, AlertsService],
})
export class WebSocketModule {}