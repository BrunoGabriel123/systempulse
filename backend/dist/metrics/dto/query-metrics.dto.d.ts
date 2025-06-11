export declare class QueryMetricsDto {
    metricType?: string;
    startDate?: string;
    endDate?: string;
    limit?: number;
    offset?: number;
    order?: 'ASC' | 'DESC';
    interval?: string;
}
