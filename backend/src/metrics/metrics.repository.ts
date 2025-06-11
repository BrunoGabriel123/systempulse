import { Injectable } from '@nestjs/common';
import { Repository, DataSource, Between, MoreThan, LessThan } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm'; 
import { QueryMetricsDto } from './dto/query-metrics.dto';
import { Metric } from './metric.entity';

@Injectable()
export class MetricsRepository {
  constructor(
    @InjectRepository(Metric)
    private readonly repository: Repository<Metric>,
    private readonly dataSource: DataSource,
  ) {}

  async save(metric: Partial<Metric>): Promise<Metric> {
    return this.repository.save(metric);
  }

  async findById(id: number): Promise<Metric> {
    return this.repository.findOne({ where: { id } });
  }

  async findWithFilters(query: QueryMetricsDto): Promise<Metric[]> {
    const queryBuilder = this.repository.createQueryBuilder('metric');

    // Filter by metric type
    if (query.metricType && query.metricType !== 'all') {
      queryBuilder.andWhere('metric.metricType = :metricType', {
        metricType: query.metricType,
      });
    }

    // Filter by date range
    if (query.startDate && query.endDate) {
      queryBuilder.andWhere('metric.timestamp BETWEEN :startDate AND :endDate', {
        startDate: query.startDate,
        endDate: query.endDate,
      });
    } else if (query.startDate) {
      queryBuilder.andWhere('metric.timestamp >= :startDate', {
        startDate: query.startDate,
      });
    } else if (query.endDate) {
      queryBuilder.andWhere('metric.timestamp <= :endDate', {
        endDate: query.endDate,
      });
    }

    // Order and pagination
    queryBuilder
      .orderBy('metric.timestamp', query.order)
      .limit(query.limit)
      .offset(query.offset);

    return queryBuilder.getMany();
  }

  async getLatestMetrics(): Promise<Metric[]> {
    return this.repository
      .createQueryBuilder('metric')
      .distinctOn(['metric.metricType'])
      .orderBy('metric.metricType')
      .addOrderBy('metric.timestamp', 'DESC')
      .getMany();
  }

  async getMetricsInRange(
    metricType: string,
    startDate: Date,
    endDate: Date,
  ): Promise<Metric[]> {
    const where: any = {
      timestamp: Between(startDate, endDate),
    };

    if (metricType !== 'all') {
      where.metricType = metricType;
    }

    return this.repository.find({
      where,
      order: { timestamp: 'ASC' },
    });
  }

  async getAggregatedMetrics(
    metricType: string,
    interval: string,
    startDate: Date,
    endDate: Date,
  ) {
    let timeGroup: string;

    switch (interval) {
      case '1m':
        timeGroup = "date_trunc('minute', timestamp)";
        break;
      case '5m':
        timeGroup = "date_trunc('hour', timestamp) + INTERVAL '5 min' * (EXTRACT(minute FROM timestamp)::int / 5)";
        break;
      case '15m':
        timeGroup = "date_trunc('hour', timestamp) + INTERVAL '15 min' * (EXTRACT(minute FROM timestamp)::int / 15)";
        break;
      case '1h':
        timeGroup = "date_trunc('hour', timestamp)";
        break;
      case '6h':
        timeGroup = "date_trunc('day', timestamp) + INTERVAL '6 hour' * (EXTRACT(hour FROM timestamp)::int / 6)";
        break;
      case '1d':
        timeGroup = "date_trunc('day', timestamp)";
        break;
      default:
        timeGroup = "date_trunc('minute', timestamp)";
    }

    const queryBuilder = this.repository
      .createQueryBuilder('metric')
      .select(`${timeGroup} as time_bucket`)
      .addSelect('AVG(cpu_usage)', 'avgCpuUsage')
      .addSelect('AVG(memory_usage)', 'avgMemoryUsage')
      .addSelect('AVG(disk_usage)', 'avgDiskUsage')
      .addSelect('AVG(network_download)', 'avgNetworkDownload')
      .addSelect('AVG(network_upload)', 'avgNetworkUpload')
      .addSelect('MAX(cpu_usage)', 'maxCpuUsage')
      .addSelect('MAX(memory_usage)', 'maxMemoryUsage')
      .addSelect('MAX(disk_usage)', 'maxDiskUsage')
      .addSelect('COUNT(*)', 'count')
      .where('timestamp BETWEEN :startDate AND :endDate', { startDate, endDate })
      .groupBy(`${timeGroup}`)
      .orderBy(`${timeGroup}`, 'ASC');

    if (metricType !== 'all') {
      queryBuilder.andWhere('metric_type = :metricType', { metricType });
    }

    return queryBuilder.getRawMany();
  }

  async deleteOldMetrics(olderThanDays: number): Promise<number> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - olderThanDays);

    const result = await this.repository.delete({
      timestamp: LessThan(cutoffDate),
    });

    return result.affected || 0;
  }

  async getMetricsCount(): Promise<number> {
    return this.repository.count();
  }

  async getMetricsStats() {
    const [total, oldestMetric, newestMetric] = await Promise.all([
      this.repository.count(),
      this.repository.findOne({
        order: { timestamp: 'ASC' },
        select: ['timestamp'],
      }),
      this.repository.findOne({
        order: { timestamp: 'DESC' },
        select: ['timestamp'],
      }),
    ]);

    return {
      total,
      oldestTimestamp: oldestMetric?.timestamp,
      newestTimestamp: newestMetric?.timestamp,
    };
  }
}