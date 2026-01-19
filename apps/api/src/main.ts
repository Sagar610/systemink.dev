import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import helmet from 'helmet';
import { AppModule } from './app.module';
import { join } from 'path';
import { NestExpressApplication } from '@nestjs/platform-express';
import * as express from 'express';
import { execSync } from 'child_process';

async function runMigrations() {
  try {
    console.log('🔄 Running database migrations...');
    // Run from apps/api directory where prisma schema is located
    const apiDir = join(__dirname, '..');
    execSync('npx prisma migrate deploy', {
      stdio: 'inherit',
      cwd: apiDir,
      env: { ...process.env, NODE_PATH: join(apiDir, '../../node_modules') },
    });
    console.log('✅ Migrations completed successfully');
  } catch (error) {
    console.error('❌ Migration failed:', error);
    console.warn('⚠️  Continuing with server startup...');
  }
}

async function bootstrap() {
  // Run migrations on startup (for Render free tier without Shell access)
  if (process.env.DATABASE_URL && process.env.NODE_ENV === 'production') {
    await runMigrations();
  }

  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const configService = app.get(ConfigService);

  // Increase body parser limits for large blog posts with images
  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ limit: '50mb', extended: true }));

  // Security
  app.use(helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  }));

  // CORS
  app.enableCors({
    origin: configService.get('CORS_ORIGIN', 'http://localhost:5173'),
    credentials: true,
  });

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // Serve uploaded files
  const uploadDir = configService.get('UPLOAD_DIR', './uploads');
  app.use('/uploads', express.static(join(process.cwd(), uploadDir)));

  // API prefix
  app.setGlobalPrefix('api');

  const port = configService.get('PORT', 3000);
  await app.listen(port);
  console.log(`🚀 API running on http://localhost:${port}`);
}

bootstrap();
