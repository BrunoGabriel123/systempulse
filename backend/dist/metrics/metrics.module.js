"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MetricsModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const metrics_service_1 = require("./metrics.service");
const metrics_controller_1 = require("./metrics.controller");
const metrics_repository_1 = require("./metrics.repository");
const websocket_module_1 = require("../websocket/websocket.module");
const metric_entity_1 = require("./metric.entity");
let MetricsModule = class MetricsModule {
};
exports.MetricsModule = MetricsModule;
exports.MetricsModule = MetricsModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([metric_entity_1.Metric]),
            websocket_module_1.WebSocketModule,
        ],
        controllers: [metrics_controller_1.MetricsController],
        providers: [metrics_service_1.MetricsService, metrics_repository_1.MetricsRepository],
        exports: [metrics_service_1.MetricsService, metrics_repository_1.MetricsRepository],
    })
], MetricsModule);
//# sourceMappingURL=metrics.module.js.map