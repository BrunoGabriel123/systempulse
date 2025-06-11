import { Module } from '@nestjs/common'; 
import { WebSocketModule } from '../websocket/websocket.module';
import { MetricsController } from './metrics.controller';
import { MetricsService } from './metrics.service';

@Module({
  imports: [WebSocketModule],
  controllers: [MetricsController],
  providers: [MetricsService],
  exports: [MetricsService],
})
export class MetricsModule {}