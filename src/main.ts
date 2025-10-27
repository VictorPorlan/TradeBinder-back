import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { AppModule } from './app.module';
import { GlobalExceptionFilter } from './filters/global-exception.filter';
import { LoggingInterceptor } from './interceptors/logging.interceptor';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  
  try {
    const app = await NestFactory.create(AppModule, {
      logger: ['error', 'warn', 'log', 'debug', 'verbose'],
    });
    
    // Global validation pipe
    app.useGlobalPipes(new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }));

    // CORS configuration
    app.enableCors({
      origin: process.env.CORS_ORIGIN || 'http://localhost:3001',
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
    });

    // API prefix
    const apiPrefix = process.env.API_PREFIX || 'api';
    app.setGlobalPrefix(apiPrefix);

    // Global exception filter
    app.useGlobalFilters(new GlobalExceptionFilter());

    // Global logging interceptor
    app.useGlobalInterceptors(new LoggingInterceptor());

    const port = process.env.PORT || 3000;
    await app.listen(port);
    
    logger.log(`🚀 Application is running on: http://localhost:${port}/${apiPrefix}`);
    logger.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
    logger.log(`🗄️ Database: ${process.env.DB_HOST || 'localhost'}:${process.env.DB_PORT || 5432}`);
    
  } catch (error) {
    logger.error('❌ Error starting the application:', error);
    process.exit(1);
  }
}

bootstrap();
