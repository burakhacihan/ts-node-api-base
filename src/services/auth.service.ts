import { injectable, inject } from 'tsyringe';
import { Repository } from 'typeorm';
import { AppDataSource } from '../config/database';
import { User } from '../models/User';
import { PasswordResetToken } from '../models/PasswordResetToken';
import { TokenBlacklist } from '../models/TokenBlacklist';
import jwt, { SignOptions } from 'jsonwebtoken';
import * as crypto from 'crypto';
import * as bcrypt from 'bcryptjs';
import {
  BadRequestException,
  ForbiddenException,
  UnauthorizedException,
} from '../utils/exceptions';
import { registrationMode, allowedDomains, RegistrationMode, jwtConfig } from '../config/auth';
import { RolePermission } from '../models/RolePermission';
import { IAuthService } from '../interfaces/services/IAuthService';
import { IEmailService } from '../infrastructure/email/interfaces/IEmailService';
import {
  AuthLoginResponseDto,
  AuthRegisterResponseDto,
  AuthRefreshResponseDto,
} from '../dtos/auth';
import { IInvitationTokenService } from '../interfaces/services/IInvitationTokenService';

@injectable()
export class AuthService implements IAuthService {
  private readonly userRepository: Repository<User>;
  private readonly rolePermissionRepository: Repository<RolePermission>;
  private readonly passwordResetTokenRepository: Repository<PasswordResetToken>;
  private readonly tokenBlacklistRepository: Repository<TokenBlacklist>;
  private readonly invitationTokenService: IInvitationTokenService;
  private readonly emailService: IEmailService;

  constructor(
    @inject('EmailService') emailService: IEmailService,
    @inject('InvitationTokenService') invitationTokenService: IInvitationTokenService,
  ) {
    this.userRepository = AppDataSource.getRepository(User);
    this.rolePermissionRepository = AppDataSource.getRepository(RolePermission);
    this.passwordResetTokenRepository = AppDataSource.getRepository(PasswordResetToken);
    this.tokenBlacklistRepository = AppDataSource.getRepository(TokenBlacklist);
    this.invitationTokenService = invitationTokenService;
    this.emailService = emailService;
  }

  async login(email: string, password: string): Promise<AuthLoginResponseDto> {
    const user = await this.validateUser(email, password);
    const accessToken = this.generateAccessToken(user);
    const refreshToken = this.generateRefreshToken(user);

    return AuthLoginResponseDto.fromUserAndTokens(user, accessToken, refreshToken);
  }

  async validateUser(email: string, password: string): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { email },
      relations: ['userRoles', 'userRoles.role'],
    });

    if (!user || !user.isActive) throw new UnauthorizedException('Invalid credentials');

    if (!(await user.validatePassword(password)))
      throw new UnauthorizedException('Invalid credentials');

    return user;
  }

  generateAccessToken(user: User): string {
    const payload = {
      sub: user.pid,
      email: user.email,
      roles: user.roles, // This uses the getter method we defined in User entity
      type: 'access',
    };

    const options: SignOptions = {
      expiresIn: jwtConfig.accessTokenExpiry as number,
    };

    return jwt.sign(payload, jwtConfig.secret as jwt.Secret, options);
  }

  generateRefreshToken(user: User): string {
    const payload = {
      sub: user.pid,
      type: 'refresh',
    };

    const options: SignOptions = {
      expiresIn: jwtConfig.refreshTokenExpiry as number,
    };

    return jwt.sign(payload, jwtConfig.secret as jwt.Secret, options);
  }

  async validateToken(token: string, type: 'access' | 'refresh' = 'access'): Promise<any> {
    try {
      // Check if token is blacklisted
      if (await this.isTokenBlacklisted(token)) {
        throw new UnauthorizedException('Token has been invalidated');
      }

      const decoded = jwt.verify(token, jwtConfig.secret as jwt.Secret) as any;

      if (decoded.type !== type) {
        throw new UnauthorizedException('Invalid token type');
      }

      if (type === 'access') {
        // For access tokens, we need to verify the user still exists and has the same roles
        const user = await this.userRepository.findOne({
          where: { pid: decoded.sub },
          relations: ['userRoles', 'userRoles.role'],
        });

        if (!user || !user.isActive) {
          throw new UnauthorizedException('User no longer exists or is inactive');
        }

        // Verify roles haven't changed
        const currentRoles = user.roles; // This uses the getter method
        if (
          !this.areArraysEqual(
            currentRoles.map((role) => role.name),
            decoded.roles.map((decodedRole: any) => decodedRole.name),
          )
        ) {
          throw new UnauthorizedException('User roles have changed');
        }
      }

      return decoded;
    } catch (error) {
      throw new UnauthorizedException(`Invalid token: ${error}`);
    }
  }

  private areArraysEqual(arr1: string[], arr2: string[]): boolean {
    if (arr1.length !== arr2.length) return false;
    return arr1.every((item) => arr2.includes(item));
  }

  async refreshAccessToken(refreshToken: string): Promise<AuthRefreshResponseDto | null> {
    try {
      const decoded = await this.validateToken(refreshToken, 'refresh');
      const user = await this.userRepository.findOne({
        where: { pid: decoded.sub },
        relations: ['userRoles', 'userRoles.role'],
      });

      if (!user || !user.isActive) {
        return null;
      }

      // Generate new token pair
      const newAccessToken = this.generateAccessToken(user);
      const newRefreshToken = this.generateRefreshToken(user);

      return AuthRefreshResponseDto.fromTokens(newAccessToken, newRefreshToken);
    } catch (error) {
      return null;
    }
  }

  async registerUser(userData: any): Promise<AuthRegisterResponseDto> {
    if (registrationMode === RegistrationMode.CLOSED) {
      throw new ForbiddenException('Registration is closed.');
    }

    if (registrationMode === RegistrationMode.INVITATION) {
      const { invitationToken } = userData;
      if (!invitationToken) throw new BadRequestException('Invitation token required.');
      const valid = await this.invitationTokenService.validateToken(invitationToken);
      if (!valid) throw new BadRequestException('Invalid or expired invitation token.');
    }

    if (registrationMode === RegistrationMode.DOMAIN_WHITELIST) {
      const email = userData.email;
      const domain = email?.split('@')[1]?.toLowerCase();
      if (!domain || !allowedDomains.includes(domain)) {
        throw new BadRequestException('Email domain not allowed.');
      }
    }

    const user = this.userRepository.create(userData as User);

    await this.userRepository.save(user);

    if (registrationMode === RegistrationMode.INVITATION) {
      const acceptResult = await this.invitationTokenService.useToken(
        userData.invitationToken,
        user,
      );
      if (!acceptResult) {
        throw new BadRequestException('Failed to use invitation token.');
      }
    }

    return AuthRegisterResponseDto.fromEntity(user);
  }

  async logout(accessToken: string, refreshToken?: string, userId?: string): Promise<void> {
    const accessDecoded = jwt.decode(accessToken) as any;

    if (!accessDecoded || !accessDecoded.exp || !accessDecoded.sub) {
      throw new BadRequestException('Invalid access token');
    }

    const accessBlacklist = this.tokenBlacklistRepository.create({
      token: accessToken,
      expiresAt: new Date(accessDecoded.exp * 1000),
      userId: userId || accessDecoded.sub.toString(),
      reason: 'logout',
    });
    await this.tokenBlacklistRepository.save(accessBlacklist);

    if (refreshToken) {
      const refreshDecoded = jwt.decode(refreshToken) as any;
      if (refreshDecoded?.exp && refreshDecoded?.sub) {
        const refreshBlacklist = this.tokenBlacklistRepository.create({
          token: refreshToken,
          expiresAt: new Date(refreshDecoded.exp * 1000),
          userId: userId || refreshDecoded.sub.toString(),
          reason: 'logout',
        });
        await this.tokenBlacklistRepository.save(refreshBlacklist);
      }
    }
  }

  async isTokenBlacklisted(token: string): Promise<boolean> {
    const blacklisted = await this.tokenBlacklistRepository.findOne({
      where: { token },
    });
    return !!blacklisted;
  }

  async forgotPassword(email: string): Promise<boolean> {
    try {
      const user = await this.userRepository.findOne({
        where: { email },
      });

      if (!user || !user.isActive) return true;

      const resetToken = crypto.randomBytes(32).toString('hex');
      const expiresAt = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes

      const passwordResetToken = this.passwordResetTokenRepository.create({
        userId: user.id,
        token: resetToken,
        expiresAt,
        used: false,
      });
      await this.passwordResetTokenRepository.save(passwordResetToken);

      const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}`;

      await this.emailService.sendEmail({
        to: user.email,
        from: process.env.EMAIL_FROM || 'noreply@example.com',
        subject: 'Password Reset Request',
        htmlContent: `
          <h2>Password Reset Request</h2>
          <p>Hello ${user.firstName},</p>
          <p>You have requested to reset your password. Click the link below to proceed:</p>
          <p><a href="${resetUrl}" style="background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Reset Password</a></p>
          <p>This link will expire in 30 minutes.</p>
          <p>If you didn't request this password reset, please ignore this email.</p>
          <p>Best regards,<br>Your Application Team</p>
        `,
        textContent: `
          Password Reset Request
          
          Hello ${user.firstName},
          
          You have requested to reset your password. Click the link below to proceed:
          
          ${resetUrl}
          
          This link will expire in 30 minutes.
          
          If you didn't request this password reset, please ignore this email.
          
          Best regards,
          Your Application Team
        `,
      });

      return true;
    } catch (error) {
      return true;
    }
  }

  async resetPassword(token: string, newPassword: string): Promise<boolean> {
    try {
      const resetToken = await this.passwordResetTokenRepository.findOne({
        where: { token, used: false },
        relations: ['user'],
      });

      if (!resetToken) {
        return false;
      }

      if (resetToken.expiresAt < new Date()) {
        return false;
      }

      const user = await this.userRepository.findOne({
        where: { id: resetToken.user?.id },
      });

      if (!user) {
        return false;
      }

      user.password = await bcrypt.hash(newPassword, 12);
      await this.userRepository.save(user);

      resetToken.used = true;
      resetToken.usedAt = new Date();
      await this.passwordResetTokenRepository.save(resetToken);

      return true;
    } catch {
      return false;
    }
  }

  /**
   * Checks if any of the user's roles have permission for the given method and action.
   * @param userRoles Array of role names (e.g., ['ADMIN', 'USER'])
   * @param method HTTP method (e.g., 'GET', 'POST')
   * @param action Action string (e.g., 'user:list')
   */
  async isAuthorized(userRoles: string[], method: string, action: string): Promise<boolean> {
    if (!userRoles.length) return false;

    const hasPermission = await this.rolePermissionRepository
      .createQueryBuilder('rolePermission')
      .innerJoin('rolePermission.role', 'role')
      .innerJoin('rolePermission.permission', 'permission')
      .where('role.name IN (:...userRoles)', { userRoles })
      .andWhere('permission.method = :method', { method })
      .andWhere('permission.action = :action', { action })
      .getExists();

    return hasPermission;
  }
}
