import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';

describe('API Integration Tests (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('/health (GET)', () => {
    it('should return health status with database check', () => {
      return request(app.getHttpServer())
        .get('/health')
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('status');
          expect(res.body).toHaveProperty('info');
          expect(res.body.info).toHaveProperty('database');
        });
    });
  });

  describe('/auth/register (POST)', () => {
    it('should reject registration without required fields', () => {
      return request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: 'test@example.com',
          // Missing password and name
        })
        .expect(400);
    });

    it('should reject invalid email format', () => {
      return request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: 'invalid-email',
          contrasena: 'Test123!@#',
          nombre: 'Test User',
        })
        .expect(400);
    });
  });

  describe('/auth/login (POST)', () => {
    it('should reject login without credentials', () => {
      return request(app.getHttpServer())
        .post('/auth/login')
        .send({})
        .expect(400);
    });

    it('should reject invalid credentials', () => {
      return request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: 'nonexistent@example.com',
          contrasena: 'WrongPassword123',
        })
        .expect(401);
    });
  });

  describe('Rate Limiting', () => {
    it('should apply throttling on repeated requests', async () => {
      const requests = Array(15).fill(null).map(() => 
        request(app.getHttpServer()).get('/health')
      );

      const responses = await Promise.all(requests);
      const throttled = responses.filter(res => res.status === 429);
      
      // Should have at least one throttled request after exceeding limit
      expect(throttled.length).toBeGreaterThan(0);
    });
  });
});
