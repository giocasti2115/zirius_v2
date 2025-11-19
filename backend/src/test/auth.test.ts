import request from 'supertest';
import express from 'express';
import cors from 'cors';
import { authRouter } from '../routes/auth';

const app = express();
app.use(cors());
app.use(express.json());
app.use('/api/v1/auth', authRouter);

describe('Auth Controller', () => {
  describe('POST /api/v1/auth/login', () => {
    it('should return 400 for invalid credentials format', async () => {
      const response = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'invalid-email',
          password: '123'
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
    });

    it('should return 400 for missing credentials', async () => {
      const response = await request(app)
        .post('/api/v1/auth/login')
        .send({});

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
    });
  });

  describe('POST /api/v1/auth/verify-token', () => {
    it('should return 401 for missing token', async () => {
      const response = await request(app)
        .post('/api/v1/auth/verify-token')
        .send({});

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('error');
    });

    it('should return 401 for invalid token', async () => {
      const response = await request(app)
        .post('/api/v1/auth/verify-token')
        .send({
          token: 'invalid-token'
        });

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('error');
    });
  });
});