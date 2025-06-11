import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MetricsService } from './metrics.service';
import { MetricsController } from './metrics.controller';
import { MetricsRepository } from './metrics.repository'; 
import { WebSocketModule } from '../websocket/websocket.module';
import { Metric } from './metric.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Metric]),
    WebSocketModule,
  ],
  controllers: [MetricsController],
  providers: [MetricsService, MetricsRepository],
  exports: [MetricsService, MetricsRepository],
})
export class MetricsModule {}