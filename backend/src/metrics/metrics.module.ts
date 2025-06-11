import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MetricsService } from './metrics.service';
import { MetricsController } from './metrics.controller';
import { MetricsRepository } from './metrics.repository';
import { MetricsCollectorService } from './metrics-collector.service';
// import { Metric } from './entities/metric.entity';
import { WebSocketModule } from '../websocket/websocket.module';
import { Metric } from './metric.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Metric]),
    WebSocketModule,
  ],
  controllers: [MetricsController],
  providers: [MetricsService, MetricsRepository, MetricsCollectorService],
  exports: [MetricsService, MetricsRepository, MetricsCollectorService],
})
export class MetricsModule {}