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
  console.log('🔄 Setting up database schema...');
  console.log(`🔗 Database URL: ${process.env.DATABASE_URL ? 'SET' : 'NOT SET'}`);
  
  // Run from apps/api directory where prisma schema is located
  // __dirname in compiled code is dist/, so we go up one level to apps/api
  const apiDir = join(__dirname, '..');
  const projectRoot = join(__dirname, '../../..'); // Go up from dist/ to project root
  
  console.log(`📁 API directory: ${apiDir}`);
  console.log(`📁 Current working directory: ${process.cwd()}`);
  
  // Always use db push for initial setup (simpler and works without migration files)
  try {
    console.log('📦 Pushing database schema to database...');
    
    // Try from apiDir first (apps/api)
    try {
      execSync('pnpm exec prisma db push --accept-data-loss --skip-generate', {
        stdio: 'inherit',
        cwd: apiDir,
        env: { ...process.env, NODE_ENV: process.env.NODE_ENV || 'production' },
      });
      console.log('✅ Database schema synced successfully');
      return;
    } catch (apiDirError) {
      console.log('⚠️  Failed from apps/api directory, trying from project root...');
      // Fallback: try from project root
      execSync('cd apps/api && pnpm exec prisma db push --accept-data-loss --skip-generate', {
        stdio: 'inherit',
        cwd: projectRoot,
        env: { ...process.env, NODE_ENV: process.env.NODE_ENV || 'production' },
      });
      console.log('✅ Database schema synced successfully (from project root)');
    }
  } catch (error: any) {
    console.error('❌ Database setup failed:', error.message || error);
    if (error.stdout) console.error('STDOUT:', error.stdout.toString());
    if (error.stderr) console.error('STDERR:', error.stderr.toString());
    // Don't throw - let server start anyway, but log the error clearly
    console.error('⚠️  WARNING: Database tables may not exist. The scheduler will fail until tables are created.');
  }
}

async function bootstrap() {
  // Run migrations on startup (for Render free tier without Shell access)
  // Always run if DATABASE_URL is set (don't require NODE_ENV=production)
  if (process.env.DATABASE_URL) {
    console.log('🔧 Running database setup...');
    await runMigrations();
  } else {
    console.warn('⚠️  DATABASE_URL not set, skipping database setup');
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

  // Root route handler (before API prefix) - use Express instance
  app.getHttpAdapter().get('/', (req: express.Request, res: express.Response) => {
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
