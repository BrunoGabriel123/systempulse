"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MetricsRepository = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("typeorm");
const typeorm_2 = require("@nestjs/typeorm");
const metric_entity_1 = require("./metric.entity");
let MetricsRepository = class MetricsRepository {
    constructor(repository, dataSource) {
        this.repository = repository;
        this.dataSource = dataSource;
    }
    async save(metric) {
        return this.repository.save(metric);
    }
    async findById(id) {
        return this.repository.findOne({ where: { id } });
    }
    async findWithFilters(query) {
        const queryBuilder = this.repository.createQueryBuilder('metric');
        if (query.metricType && query.metricType !== 'all') {
            queryBuilder.andWhere('metric.metricType = :metricType', {
                metricType: query.metricType,
            });
        }
        if (query.startDate && query.endDate) {
            queryBuilder.andWhere('metric.timestamp BETWEEN :startDate AND :endDate', {
                startDate: query.startDate,
                endDate: query.endDate,
            });
        }
        else if (query.startDate) {
            queryBuilder.andWhere('metric.timestamp >= :startDate', {
                startDate: query.startDate,
            });
        }
        else if (query.endDate) {
            queryBuilder.andWhere('metric.timestamp <= :endDate', {
                endDate: query.endDate,
            });
        }
        queryBuilder
            .orderBy('metric.timestamp', query.order)
            .limit(query.limit)
            .offset(query.offset);
        return queryBuilder.getMany();
    }
    async getLatestMetrics() {
        return this.repository
            .createQueryBuilder('metric')
            .distinctOn(['metric.metricType'])
            .orderBy('metric.metricType')
            .addOrderBy('metric.timestamp', 'DESC')
            .getMany();
    }
    async getMetricsInRange(metricType, startDate, endDate) {
        const where = {
            timestamp: (0, typeorm_1.Between)(startDate, endDate),
        };
        if (metricType !== 'all') {
            where.metricType = metricType;
        }
        return this.repository.find({
            where,
            order: { timestamp: 'ASC' },
        });
    }
    async getAggregatedMetrics(metricType, interval, startDate, endDate) {
        let timeGroup;
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
    async deleteOldMetrics(olderThanDays) {
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - olderThanDays);
        const result = await this.repository.delete({
            timestamp: (0, typeorm_1.LessThan)(cutoffDate),
        });
        return result.affected || 0;
    }
    async getMetricsCount() {
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
};
exports.MetricsRepository = MetricsRepository;
exports.MetricsRepository = MetricsRepository = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_2.InjectRepository)(metric_entity_1.Metric)),
    __metadata("design:paramtypes", [typeorm_1.Repository,
        typeorm_1.DataSource])
], MetricsRepository);
//# sourceMappingURL=metrics.repository.js.map