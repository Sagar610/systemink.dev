import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';

describe('Auth (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let accessToken: string;
  let userId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
    await app.init();

    prisma = app.get<PrismaService>(PrismaService);
  });

  afterAll(async () => {
    // Clean up test user
    if (userId) {
      await prisma.user.delete({ where: { id: userId } }).catch(() => {});
    }
    await app.close();
  });

  it('/api/auth/signup (POST) - should create a new user', async () => {
    const response = await request(app.getHttpServer())
      .post('/api/auth/signup')
      .send({
        name: 'Test User',
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123',
      })
      .expect(201);

    expect(response.body).toHaveProperty('user');
    expect(response.body).toHaveProperty('accessToken');
    expect(response.body).toHaveProperty('refreshToken');
    expect(response.body.user.email).toBe('test@example.com');
    expect(response.body.user.passwordHash).toBeUndefined();

    accessToken = response.body.accessToken;
    userId = response.body.user.id;
  });

  it('/api/auth/signup (POST) - should fail with duplicate email', async () => {
    await request(app.getHttpServer())
      .post('/api/auth/signup')
      .send({
        name: 'Another User',
        username: 'anotheruser',
        email: 'test@example.com',
        password: 'password123',
      })
      .expect(409);
  });

  it('/api/auth/login (POST) - should login with correct credentials', async () => {
    const response = await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({
        email: 'test@example.com',
        password: 'password123',
      })
      .expect(200);

    expect(response.body).toHaveProperty('accessToken');
    expect(response.body).toHaveProperty('refreshToken');
    accessToken = response.body.accessToken;
  });

  it('/api/auth/login (POST) - should fail with incorrect password', async () => {
    await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({
        email: 'test@example.com',
        password: 'wrongpassword',
      })
      .expect(401);
  });

  it('/api/auth/me (GET) - should return current user', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);

    expect(response.body).toHaveProperty('id');
    expect(response.body).toHaveProperty('email');
    expect(response.body.email).toBe('test@example.com');
    expect(response.body.passwordHash).toBeUndefined();
  });

  it('/api/auth/me (GET) - should fail without token', async () => {
    await request(app.getHttpServer()).get('/api/auth/me').expect(401);
  });

  it('/api/auth/refresh (POST) - should refresh tokens', async () => {
    const loginResponse = await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({
        email: 'test@example.com',
        password: 'password123',
      });

    const refreshToken = loginResponse.body.refreshToken;

    const response = await request(app.getHttpServer())
      .post('/api/auth/refresh')
      .send({ refreshToken })
      .expect(200);

    expect(response.body).toHaveProperty('accessToken');
    expect(response.body).toHaveProperty('refreshToken');
    expect(response.body.accessToken).not.toBe(refreshToken);
  });

  it('/api/auth/logout (POST) - should logout', async () => {
    await request(app.getHttpServer())
      .post('/api/auth/logout')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);

    // Token should be invalid after logout (depends on implementation)
    // This test may need adjustment based on your auth strategy
  });
});
