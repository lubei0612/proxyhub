import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

describe('Authentication Rate Limiting (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('/auth/login (POST)', () => {
    it('should allow first 5 login attempts', async () => {
      for (let i = 0; i < 5; i++) {
        const response = await request(app.getHttpServer())
          .post('/api/v1/auth/login')
          .send({
            email: 'test@example.com',
            password: 'WrongPassword123',
          });
        
        // Should fail authentication but not rate limit
        expect(response.status).toBe(401);
      }
    });

    it('should block 6th login attempt with 429', async () => {
      // Make 5 requests first
      for (let i = 0; i < 5; i++) {
        await request(app.getHttpServer())
          .post('/api/v1/auth/login')
          .send({
            email: 'test2@example.com',
            password: 'WrongPassword123',
          });
      }

      // 6th request should be rate limited
      const response = await request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({
          email: 'test2@example.com',
          password: 'WrongPassword123',
        });
      
      expect(response.status).toBe(429);
    });
  });

  describe('/auth/register (POST)', () => {
    it('should enforce strong password policy', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/auth/register')
        .send({
          email: 'newuser@example.com',
          password: 'weak',
          nickname: 'Test User',
        });
      
      expect(response.status).toBe(400);
      expect(response.body.message).toEqual(
        expect.arrayContaining([
          expect.stringContaining('密码'),
        ]),
      );
    });

    it('should accept strong password', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/auth/register')
        .send({
          email: 'strongpass@example.com',
          password: 'StrongPassword123',
          nickname: 'Strong User',
        });
      
      // Should either succeed or fail for duplicate email, not password validation
      expect([201, 409]).toContain(response.status);
    });
  });
});

