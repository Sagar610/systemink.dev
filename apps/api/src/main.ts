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
    console.log('🔄 Setting up database schema...');
    // Run from apps/api directory where prisma schema is located
    const apiDir = join(__dirname, '..');
    
    // Try migrate deploy first (if migrations exist)
    try {
      execSync('npx prisma migrate deploy', {
        stdio: 'inherit',
        cwd: apiDir,
        env: process.env,
      });
      console.log('✅ Migrations applied successfully');
    } catch (migrateError) {
      // If migrations don't exist or fail, use db push to sync schema
      console.log('⚠️  Migrations not found, using db push to sync schema...');
      execSync('npx prisma db push --accept-data-loss', {
        stdio: 'inherit',
        cwd: apiDir,
        env: process.env,
      });
      console.log('✅ Database schema synced successfully');
    }
  } catch (error) {
    console.error('❌ Database setup failed:', error);
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

  // Root route handler (before API prefix)
  app.get('/', (req, res) => {
    res.json({
      message: 'SystemInk API',
      version: '1.0.0',
      status: 'running',
      endpoints: {
        api: '/api',
        health: '/api/health',
        auth: '/api/auth',
        posts: '/api/posts',
        tags: '/api/tags',
        users: '/api/users',
        comments: '/api/posts/:postId/comments',
        uploads: '/api/uploads',
        feed: {
          rss: '/api/rss.xml',
          sitemap: '/api/sitemap.xml',
          robots: '/api/robots.txt',
        },
      },
      documentation: 'All API endpoints are prefixed with /api',
    });
  });

  // API prefix
  app.setGlobalPrefix('api');

  const port = configService.get('PORT', 3000);
  await app.listen(port);
  console.log(`🚀 API running on http://localhost:${port}`);
}

bootstrap();
