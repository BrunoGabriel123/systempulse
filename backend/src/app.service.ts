import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    return 'SystemPulse Backend API is running! 📊';
  }
}