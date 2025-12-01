import 'reflect-metadata';
import { AuthService } from '@/services/auth.service';
import { User } from '@/models/User';
import { Repository } from 'typeorm';
import { UnauthorizedException, BadRequestException, ForbiddenException } from '@/utils/exceptions';
import * as bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

jest.mock('@/config/database', () => ({
  AppDataSource: {
    getRepository: jest.fn(),
  },
}));

jest.mock('@/config/auth', () => ({
  registrationMode: 'OPEN',
  allowedDomains: ['example.com'],
  RegistrationMode: {
    OPEN: 'OPEN',
    CLOSED: 'CLOSED',
    INVITATION: 'INVITATION',
    DOMAIN_WHITELIST: 'DOMAIN_WHITELIST',
  },
  jwtConfig: {
    secret: 'test-secret-key',
    accessTokenExpiry: '15m',
    refreshTokenExpiry: '7d',
  },
}));

describe('AuthService', () => {
  let authService: AuthService;
  let mockUserRepository: jest.Mocked<Repository<User>>;
  let mockRolePermissionRepository: jest.Mocked<any>;
  let mockPasswordResetTokenRepository: jest.Mocked<any>;
  let mockTokenBlacklistRepository: jest.Mocked<any>;
  let mockEmailService: any;
  let mockInvitationTokenService: any;

  beforeEach(() => {
    mockUserRepository = {
      findOne: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
    } as any;

    mockRolePermissionRepository = {
      createQueryBuilder: jest.fn(),
    };

    mockPasswordResetTokenRepository = {
      findOne: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
    };

    mockTokenBlacklistRepository = {
      findOne: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
    };

    mockEmailService = {
      sendEmail: jest.fn(),
    };

    mockInvitationTokenService = {
      validateToken: jest.fn(),
      useToken: jest.fn(),
    };

    const { AppDataSource } = require('@/config/database');
    AppDataSource.getRepository.mockImplementation((entity: any) => {
      if (entity === User) return mockUserRepository;
      if (entity.name === 'RolePermission') return mockRolePermissionRepository;
      if (entity.name === 'PasswordResetToken') return mockPasswordResetTokenRepository;
      if (entity.name === 'TokenBlacklist') return mockTokenBlacklistRepository;
      return mockUserRepository;
    });

    authService = new AuthService(mockEmailService, mockInvitationTokenService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('validateUser', () => {
    it('should validate user with correct credentials', async () => {
      const mockUser = {
        id: 1,
        pid: '123e4567-e89b-12d3-a456-426614174000',
        email: 'test@example.com',
        password: await bcrypt.hash('password123', 12),
        isActive: true,
        userRoles: [],
        validatePassword: jest.fn().mockResolvedValue(true),
      } as any;

      mockUserRepository.findOne.mockResolvedValue(mockUser);

      const result = await authService.validateUser('test@example.com', 'password123');

      expect(result).toBe(mockUser);
      expect(mockUserRepository.findOne).toHaveBeenCalledWith({
        where: { email: 'test@example.com' },
        relations: ['userRoles', 'userRoles.role'],
      });
    });

    it('should throw UnauthorizedException for non-existent user', async () => {
      mockUserRepository.findOne.mockResolvedValue(null);

      await expect(authService.validateUser('invalid@example.com', 'password123')).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw UnauthorizedException for inactive user', async () => {
      const mockUser = {
        id: 1,
        email: 'test@example.com',
        isActive: false,
      } as any;

      mockUserRepository.findOne.mockResolvedValue(mockUser);

      await expect(authService.validateUser('test@example.com', 'password123')).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw UnauthorizedException for wrong password', async () => {
      const mockUser = {
        id: 1,
        email: 'test@example.com',
        isActive: true,
        validatePassword: jest.fn().mockResolvedValue(false),
      } as any;

      mockUserRepository.findOne.mockResolvedValue(mockUser);

      await expect(authService.validateUser('test@example.com', 'wrongpassword')).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  describe('login', () => {
    it('should return tokens on successful login', async () => {
      const mockUser = {
        id: 1,
        pid: '123e4567-e89b-12d3-a456-426614174000',
        email: 'test@example.com',
        firstName: 'John',
        lastName: 'Doe',
        isActive: true,
        userRoles: [],
        roles: [],
        validatePassword: jest.fn().mockResolvedValue(true),
      } as any;

      mockUserRepository.findOne.mockResolvedValue(mockUser);

      const result = await authService.login('test@example.com', 'password123');

      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('refreshToken');
      expect(result).toHaveProperty('user');
      expect(result.user.email).toBe('test@example.com');
    });
  });

  describe('generateAccessToken', () => {
    it('should generate valid access token', () => {
      const mockUser = {
        pid: '123e4567-e89b-12d3-a456-426614174000',
        email: 'test@example.com',
        roles: [],
      } as any;

      const token = authService.generateAccessToken(mockUser);

      expect(token).toBeDefined();
      expect(typeof token).toBe('string');

      const decoded = jwt.verify(token, 'test-secret-key') as any;
      expect(decoded.sub).toBe(mockUser.pid);
      expect(decoded.email).toBe(mockUser.email);
      expect(decoded.type).toBe('access');
    });
  });

  describe('generateRefreshToken', () => {
    it('should generate valid refresh token', () => {
      const mockUser = {
        pid: '123e4567-e89b-12d3-a456-426614174000',
      } as any;

      const token = authService.generateRefreshToken(mockUser);

      expect(token).toBeDefined();
      expect(typeof token).toBe('string');

      const decoded = jwt.verify(token, 'test-secret-key') as any;
      expect(decoded.sub).toBe(mockUser.pid);
      expect(decoded.type).toBe('refresh');
    });
  });

  describe('validateToken', () => {
    it('should validate valid access token', async () => {
      const mockUser = {
        pid: '123e4567-e89b-12d3-a456-426614174000',
        email: 'test@example.com',
        isActive: true,
        roles: [],
        userRoles: [],
      } as any;

      const token = authService.generateAccessToken(mockUser);
      mockTokenBlacklistRepository.findOne.mockResolvedValue(null);
      mockUserRepository.findOne.mockResolvedValue(mockUser);

      const decoded = await authService.validateToken(token, 'access');

      expect(decoded).toBeDefined();
      expect(decoded.sub).toBe(mockUser.pid);
      expect(decoded.type).toBe('access');
    });

    it('should throw error for blacklisted token', async () => {
      const mockUser = {
        pid: '123e4567-e89b-12d3-a456-426614174000',
        email: 'test@example.com',
        roles: [],
      } as any;

      const token = authService.generateAccessToken(mockUser);
      mockTokenBlacklistRepository.findOne.mockResolvedValue({ token });

      await expect(authService.validateToken(token, 'access')).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw error for invalid token type', async () => {
      const mockUser = {
        pid: '123e4567-e89b-12d3-a456-426614174000',
      } as any;

      const refreshToken = authService.generateRefreshToken(mockUser);
      mockTokenBlacklistRepository.findOne.mockResolvedValue(null);

      await expect(authService.validateToken(refreshToken, 'access')).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  describe('refreshAccessToken', () => {
    it('should return new token pair for valid refresh token', async () => {
      const mockUser = {
        pid: '123e4567-e89b-12d3-a456-426614174000',
        email: 'test@example.com',
        isActive: true,
        roles: [],
        userRoles: [],
      } as any;

      const refreshToken = authService.generateRefreshToken(mockUser);
      mockTokenBlacklistRepository.findOne.mockResolvedValue(null);
      mockUserRepository.findOne.mockResolvedValue(mockUser);

      const result = await authService.refreshAccessToken(refreshToken);

      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('refreshToken');
    });

    it('should return null for inactive user', async () => {
      const mockUser = {
        pid: '123e4567-e89b-12d3-a456-426614174000',
        isActive: false,
      } as any;

      const refreshToken = authService.generateRefreshToken(mockUser);
      mockTokenBlacklistRepository.findOne.mockResolvedValue(null);
      mockUserRepository.findOne.mockResolvedValue(mockUser);

      const result = await authService.refreshAccessToken(refreshToken);

      expect(result).toBeNull();
    });
  });

  describe('logout', () => {
    it('should blacklist access and refresh tokens', async () => {
      const mockUser = {
        pid: '123e4567-e89b-12d3-a456-426614174000',
        email: 'test@example.com',
        roles: [],
      } as any;

      const accessToken = authService.generateAccessToken(mockUser);
      const refreshToken = authService.generateRefreshToken(mockUser);

      mockTokenBlacklistRepository.create.mockImplementation((data: any) => data);
      mockTokenBlacklistRepository.save.mockResolvedValue({});

      await authService.logout(accessToken, refreshToken, mockUser.pid);

      expect(mockTokenBlacklistRepository.create).toHaveBeenCalledTimes(2);
      expect(mockTokenBlacklistRepository.save).toHaveBeenCalledTimes(2);
    });

    it('should throw error for invalid access token', async () => {
      await expect(authService.logout('invalid-token', undefined, '123')).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('isTokenBlacklisted', () => {
    it('should return true for blacklisted token', async () => {
      mockTokenBlacklistRepository.findOne.mockResolvedValue({ token: 'test-token' });

      const result = await authService.isTokenBlacklisted('test-token');

      expect(result).toBe(true);
    });

    it('should return false for non-blacklisted token', async () => {
      mockTokenBlacklistRepository.findOne.mockResolvedValue(null);

      const result = await authService.isTokenBlacklisted('test-token');

      expect(result).toBe(false);
    });
  });

  describe('isAuthorized', () => {
    it('should return true when user has permission', async () => {
      const mockQueryBuilder = {
        innerJoin: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getExists: jest.fn().mockResolvedValue(true),
      };

      mockRolePermissionRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);

      const result = await authService.isAuthorized(['admin'], 'GET', 'users:list');

      expect(result).toBe(true);
    });

    it('should return false when user has no roles', async () => {
      const result = await authService.isAuthorized([], 'GET', 'users:list');

      expect(result).toBe(false);
    });

    it('should return false when user lacks permission', async () => {
      const mockQueryBuilder = {
        innerJoin: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getExists: jest.fn().mockResolvedValue(false),
      };

      mockRolePermissionRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);

      const result = await authService.isAuthorized(['user'], 'DELETE', 'users:delete');

      expect(result).toBe(false);
    });
  });
});
