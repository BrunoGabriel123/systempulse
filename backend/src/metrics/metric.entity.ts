import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, Index } from 'typeorm';

@Entity('metrics')
@Index(['timestamp', 'metricType']) // Composite index
export class Metric {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  @Index() // Single index on timestamp
  timestamp: Date;

  @Column({ type: 'varchar', length: 50 })
  metricType: string; // 'cpu', 'memory', 'disk', 'network', 'system'

  // CPU Metrics
  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  cpuUsage: number;

  @Column({ type: 'integer', nullable: true })
  cpuCores: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  loadAvg1: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  loadAvg5: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  loadAvg15: number;

  // Memory Metrics (in bytes)
  @Column({ type: 'bigint', nullable: true })
  memoryTotal: number;

  @Column({ type: 'bigint', nullable: true })
  memoryUsed: number;

  @Column({ type: 'bigint', nullable: true })
  memoryFree: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  memoryUsage: number;

  // Disk Metrics (in bytes)
  @Column({ type: 'bigint', nullable: true })
  diskTotal: number;

  @Column({ type: 'bigint', nullable: true })
  diskUsed: number;

  @Column({ type: 'bigint', nullable: true })
  diskFree: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  diskUsage: number;

  // Network Metrics (in MB/s)
  @Column({ type: 'decimal', precision: 8, scale: 2, nullable: true })
  networkDownload: number;

  @Column({ type: 'decimal', precision: 8, scale: 2, nullable: true })
  networkUpload: number;

  // System Metrics
  @Column({ type: 'integer', nullable: true })
  uptime: number; // in seconds

  @Column({ type: 'integer', nullable: true })
  processCount: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  temperature: number; // in celsius

  @CreateDateColumn()
  createdAt: Date;
}