import { Repository, DataSource } from 'typeorm';
import { QueryMetricsDto } from './dto/query-metrics.dto';
import { Metric } from './metric.entity';
export declare class MetricsRepository {
    private readonly repository;
    private readonly dataSource;
    constructor(repository: Repository<Metric>, dataSource: DataSource);
    save(metric: Partial<Metric>): Promise<Metric>;
    findById(id: number): Promise<Metric>;
    findWithFilters(query: QueryMetricsDto): Promise<Metric[]>;
    getLatestMetrics(): Promise<Metric[]>;
    getMetricsInRange(metricType: string, startDate: Date, endDate: Date): Promise<Metric[]>;
    getAggregatedMetrics(metricType: string, interval: string, startDate: Date, endDate: Date): Promise<any[]>;
    deleteOldMetrics(olderThanDays: number): Promise<number>;
    getMetricsCount(): Promise<number>;
    getMetricsStats(): Promise<{
        total: number;
        oldestTimestamp: Date;
        newestTimestamp: Date;
    }>;
}
