import { IsOptional, IsNumber, IsString, IsDateString, Min, Max } from 'class-validator';

export class CreateMetricDto {
  @IsOptional()
  @IsDateString()
  timestamp?: string;

  @IsString()
  metricType: string;

  // CPU
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  cpuUsage?: number;

  @IsOptional()
  @IsNumber()
  @Min(1)
  cpuCores?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  loadAvg1?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  loadAvg5?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  loadAvg15?: number;

  // Memory
  @IsOptional()
  @IsNumber()
  @Min(0)
  memoryTotal?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  memoryUsed?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  memoryFree?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  memoryUsage?: number;

  // Disk
  @IsOptional()
  @IsNumber()
  @Min(0)
  diskTotal?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  diskUsed?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  diskFree?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  diskUsage?: number;

  // Network
  @IsOptional()
  @IsNumber()
  @Min(0)
  networkDownload?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  networkUpload?: number;

  // System
  @IsOptional()
  @IsNumber()
  @Min(0)
  uptime?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  processCount?: number;

  @IsOptional()
  @IsNumber()
  temperature?: number;
}