import { IsOptional, IsString, IsDateString, IsNumber, Min, Max, IsIn } from 'class-validator';
import { Transform } from 'class-transformer';

export class QueryMetricsDto {
  @IsOptional()
  @IsString()
  @IsIn(['cpu', 'memory', 'disk', 'network', 'system', 'all'])
  metricType?: string = 'all';

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsNumber()
  @Min(1)
  @Max(1000)
  limit?: number = 100;

  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsNumber()
  @Min(0)
  offset?: number = 0;

  @IsOptional()
  @IsString()
  @IsIn(['ASC', 'DESC'])
  order?: 'ASC' | 'DESC' = 'DESC';

  @IsOptional()
  @IsString()
  @IsIn(['1m', '5m', '15m', '1h', '6h', '1d'])
  interval?: string; // for aggregated data
}