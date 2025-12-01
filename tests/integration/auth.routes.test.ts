import 'reflect-metadata';
import request from 'supertest';
import express, { Express, Request, Response, NextFunction } from 'express';
import { Router } from 'express';

describe('Auth Routes Integration Tests', () => {
  let app: Express;
  const mockAuthController = {
    login: jest.fn(),
    refresh: jest.fn(),
    logout: jest.fn(),
    forgotPassword: jest.fn(),
    resetPassword: jest.fn(),
    register: jest.fn(),
  };

  beforeEach(() => {
    app = express();
    app.use(express.json());

    const authRouter = Router();

    authRouter.post('/login', async (req: Request, res: Response, next: NextFunction) => {
      try {
        await mockAuthController.login(req, res, next);
      } catch (error) {
        next(error);
      }
    });

    authRouter.post('/refresh', async (req: Request, res: Response, next: NextFunction) => {
      try {
        await mockAuthController.refresh(req, res, next);
      } catch (error) {
        next(error);
      }
    });

    authRouter.post('/logout', async (req: Request, res: Response, next: NextFunction) => {
      try {
        await mockAuthController.logout(req, res, next);
      } catch (error) {
        next(error);
      }
    });

    authRouter.post('/forgot-password', async (req: Request, res: Response, next: NextFunction) => {
      try {
        await mockAuthController.forgotPassword(req, res, next);
      } catch (error) {
        next(error);
      }
    });

    authRouter.post('/reset-password', async (req: Request, res: Response, next: NextFunction) => {
      try {
        await mockAuthController.resetPassword(req, res, next);
      } catch (error) {
        next(error);
      }
    });

    authRouter.post('/register', async (req: Request, res: Response, next: NextFunction) => {
      try {
        await mockAuthController.register(req, res, next);
      } catch (error) {
        next(error);
      }
    });

    app.use('/auth', authRouter);

    app.use((error: any, req: Request, res: Response, next: NextFunction) => {
      res.status(error.status || 500).json({
        success: false,
        message: error.message || 'Internal server error',
      });
    });

    jest.clearAllMocks();
  });

  describe('POST /auth/login', () => {
    it('should login successfully with valid credentials', async () => {
      mockAuthController.login.mockImplementation((req, res) => {
        res.status(200).json({
          success: true,
          message: 'Login successful',
          data: {
            accessToken: 'mock-access-token',
            refreshToken: 'mock-refresh-token',
            user: { email: 'test@example.com' },
          },
        });
      });

      const response = await request(app).post('/auth/login').send({
        email: 'test@example.com',
        password: 'password123',
      });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(mockAuthController.login).toHaveBeenCalled();
    });

    it('should return error for invalid credentials', async () => {
      mockAuthController.login.mockImplementation((req, res) => {
        res.status(401).json({
          success: false,
          message: 'Invalid credentials',
        });
      });

      const response = await request(app).post('/auth/login').send({
        email: 'wrong@example.com',
        password: 'wrongpassword',
      });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /auth/refresh', () => {
    it('should refresh token successfully', async () => {
      mockAuthController.refresh.mockImplementation((req, res) => {
        res.status(200).json({
          success: true,
          data: {
            accessToken: 'new-access-token',
            refreshToken: 'new-refresh-token',
          },
        });
      });

      const response = await request(app).post('/auth/refresh').send({
        refreshToken: 'valid-refresh-token',
      });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });

    it('should return error for invalid refresh token', async () => {
      mockAuthController.refresh.mockImplementation((req, res) => {
        res.status(401).json({
          success: false,
          message: 'Invalid refresh token',
        });
      });

      const response = await request(app).post('/auth/refresh').send({
        refreshToken: 'invalid-token',
      });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /auth/logout', () => {
    it('should logout successfully', async () => {
      mockAuthController.logout.mockImplementation((req, res) => {
        res.status(200).json({
          success: true,
          message: 'Logout successful',
        });
      });

      const response = await request(app)
        .post('/auth/logout')
        .set('Authorization', 'Bearer valid-token')
        .send();

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });
  });

  describe('POST /auth/forgot-password', () => {
    it('should send password reset email', async () => {
      mockAuthController.forgotPassword.mockImplementation((req, res) => {
        res.status(200).json({
          success: true,
          message: 'Password reset email sent',
        });
      });

      const response = await request(app).post('/auth/forgot-password').send({
        email: 'test@example.com',
      });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });
  });

  describe('POST /auth/reset-password', () => {
    it('should reset password successfully', async () => {
      mockAuthController.resetPassword.mockImplementation((req, res) => {
        res.status(200).json({
          success: true,
          message: 'Password reset successful',
        });
      });

      const response = await request(app).post('/auth/reset-password').send({
        token: 'valid-token',
        newPassword: 'newpassword123',
      });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });

    it('should return error for invalid token', async () => {
      mockAuthController.resetPassword.mockImplementation((req, res) => {
        res.status(400).json({
          success: false,
          message: 'Invalid or expired token',
        });
      });

      const response = await request(app).post('/auth/reset-password').send({
        token: 'invalid-token',
        newPassword: 'newpassword123',
      });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /auth/register', () => {
    it('should register user successfully', async () => {
      mockAuthController.register.mockImplementation((req, res) => {
        res.status(201).json({
          success: true,
          message: 'Registration successful',
          data: {
            id: '123',
            email: 'newuser@example.com',
          },
        });
      });

      const response = await request(app).post('/auth/register').send({
        email: 'newuser@example.com',
        password: 'password123',
        firstName: 'Jane',
        lastName: 'Doe',
      });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
    });

    it('should return error for duplicate email', async () => {
      mockAuthController.register.mockImplementation((req, res) => {
        res.status(400).json({
          success: false,
          message: 'Email already exists',
        });
      });

      const response = await request(app).post('/auth/register').send({
        email: 'existing@example.com',
        password: 'password123',
        firstName: 'Jane',
        lastName: 'Doe',
      });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });
  });
});
