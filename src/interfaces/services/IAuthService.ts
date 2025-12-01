import { User } from '../../models/User';
import {
  AuthLoginResponseDto,
  AuthRegisterResponseDto,
  AuthRefreshResponseDto,
} from '../../dtos/auth';

/**
 * Auth service interface defining all authentication-related operations
 */
export interface IAuthService {
  /**
   * Login user with email and password
   * @param email - User email
   * @param password - User password
   * @returns Promise<AuthLoginResponseDto> - Login response with user data and tokens
   */
  login(email: string, password: string): Promise<AuthLoginResponseDto>;

  /**
   * Validate user credentials (internal method)
   * @param email - User email
   * @param password - User password
   * @returns Promise<User> - Validated user entity
   */
  validateUser(email: string, password: string): Promise<User>;

  /**
   * Generate access token for user
   * @param user - User object
   * @returns string - JWT access token
   */
  generateAccessToken(user: User): string;

  /**
   * Generate refresh token for user
   * @param user - User object
   * @returns string - JWT refresh token
   */
  generateRefreshToken(user: User): string;

  /**
   * Validate JWT token
   * @param token - JWT token to validate
   * @param type - Token type ('access' or 'refresh')
   * @returns Promise<any> - Decoded token payload
   */
  validateToken(token: string, type?: 'access' | 'refresh'): Promise<any>;

  /**
   * Refresh access token using refresh token
   * @param refreshToken - Refresh token
   * @returns Promise<AuthRefreshResponseDto | null> - New token pair or null
   */
  refreshAccessToken(refreshToken: string): Promise<AuthRefreshResponseDto | null>;

  /**
   * Register new user
   * @param userData - User registration data
   * @returns Promise<AuthRegisterResponseDto> - Created user DTO
   */
  registerUser(userData: any): Promise<AuthRegisterResponseDto>;

  /**
   * Check if user is authorized for specific action
   * @param userRoles - Array of user role names
   * @param method - HTTP method
   * @param action - Action string
   * @returns Promise<boolean> - True if authorized, false otherwise
   */
  isAuthorized(userRoles: string[], method: string, action: string): Promise<boolean>;

  /**
   * Logout user by blacklisting tokens
   * @param accessToken - Access token to blacklist
   * @param refreshToken - Refresh token to blacklist (optional)
   * @param userId - User ID
   * @returns Promise<void>
   */
  logout(accessToken: string, refreshToken?: string, userId?: string): Promise<void>;

  /**
   * Check if token is blacklisted
   * @param token - Token to check
   * @returns Promise<boolean> - True if blacklisted
   */
  isTokenBlacklisted(token: string): Promise<boolean>;

  /**
   * Initiate password reset process
   * @param email - User email
   * @returns Promise<boolean> - True if email sent (regardless of user existence)
   */
  forgotPassword(email: string): Promise<boolean>;

  /**
   * Reset password using reset token
   * @param token - Password reset token
   * @param newPassword - New password
   * @returns Promise<boolean> - True if password reset successful
   */
  resetPassword(token: string, newPassword: string): Promise<boolean>;
}
