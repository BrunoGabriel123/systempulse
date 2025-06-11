import { NestFactory } from '@nestjs/core'; 
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Enable CORS for frontend
  app.enableCors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
  });

  const port = process.env.BACKEND_PORT || 3001;
  await app.listen(port);
  
  console.log(`🚀 SystemPulse Backend running on port ${port}`);
}
bootstrap();