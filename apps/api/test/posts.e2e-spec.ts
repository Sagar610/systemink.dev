import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';
import * as bcrypt from 'bcryptjs';

describe('Posts (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let accessToken: string;
  let userId: string;
  let postId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
    await app.init();

    prisma = app.get<PrismaService>(PrismaService);

    // Create test user
    const passwordHash = await bcrypt.hash('password123', 12);
    const user = await prisma.user.create({
      data: {
        name: 'Test Author',
        username: 'testauthor',
        email: 'author@test.com',
        passwordHash,
      },
    });

    userId = user.id;

    // Login to get token
    const loginResponse = await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({
        email: 'author@test.com',
        password: 'password123',
      });

    accessToken = loginResponse.body.accessToken;
  });

  afterAll(async () => {
    // Clean up
    if (postId) {
      await prisma.post.delete({ where: { id: postId } }).catch(() => {});
    }
    if (userId) {
      await prisma.user.delete({ where: { id: userId } }).catch(() => {});
    }
    await app.close();
  });

  it('/api/posts (POST) - should create a post', async () => {
    const response = await request(app.getHttpServer())
      .post('/api/posts')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        title: 'Test Post',
        slug: 'test-post',
        excerpt: 'This is a test post',
        contentMd: '# Test Post\n\nThis is the content.',
      })
      .expect(201);

    expect(response.body).toHaveProperty('id');
    expect(response.body).toHaveProperty('slug', 'test-post');
    expect(response.body).toHaveProperty('contentHtml');
    expect(response.body.contentMd).toBeUndefined(); // Should not be in response

    postId = response.body.id;
  });

  it('/api/posts (POST) - should fail without auth', async () => {
    await request(app.getHttpServer())
      .post('/api/posts')
      .send({
        title: 'Test Post',
        slug: 'test-post-2',
        contentMd: '# Test',
      })
      .expect(401);
  });

  it('/api/posts/my (GET) - should get user posts', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/posts/my')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);

    expect(response.body).toHaveProperty('data');
    expect(response.body).toHaveProperty('meta');
    expect(Array.isArray(response.body.data)).toBe(true);
    expect(response.body.data.length).toBeGreaterThan(0);
  });

  it('/api/posts/:id (PUT) - should update post', async () => {
    const response = await request(app.getHttpServer())
      .put(`/api/posts/${postId}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        title: 'Updated Test Post',
        contentMd: '# Updated Content',
      })
      .expect(200);

    expect(response.body.title).toBe('Updated Test Post');
    expect(response.body).toHaveProperty('contentHtml');
  });

  it('/api/posts/:id/publish (POST) - should publish post', async () => {
    const response = await request(app.getHttpServer())
      .post(`/api/posts/${postId}/publish`)
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(201);

    expect(response.body.status).toBe('PUBLISHED');
    expect(response.body).toHaveProperty('publishedAt');
  });

  it('/api/posts/slug/:slug (GET) - should get published post', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/posts/slug/test-post')
      .expect(200);

    expect(response.body.slug).toBe('test-post');
    expect(response.body.status).toBe('PUBLISHED');
    expect(response.body).toHaveProperty('author');
    expect(response.body).toHaveProperty('tags');
  });

  it('/api/posts (GET) - should list published posts', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/posts')
      .expect(200);

    expect(response.body).toHaveProperty('data');
    expect(response.body).toHaveProperty('meta');
    expect(Array.isArray(response.body.data)).toBe(true);
  });

  it('/api/posts/:id (DELETE) - should delete post', async () => {
    await request(app.getHttpServer())
      .delete(`/api/posts/${postId}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);

    // Verify deletion
    await request(app.getHttpServer())
      .get('/api/posts/slug/test-post')
      .expect(404);
  });
});
