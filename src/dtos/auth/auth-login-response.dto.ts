import { User } from '../../models/User';

/**
 * Auth login response DTO with user data and tokens
 */
export class AuthLoginResponseDto {
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    isActive: boolean;
    roles: string[];
  };
  accessToken: string;
  refreshToken: string;
  expiresIn: number;

  constructor(data: Partial<AuthLoginResponseDto>) {
    Object.assign(this, data);
  }

  /**
   * Static method to create DTO from User entity and tokens
   */
  static fromUserAndTokens(
    user: User,
    accessToken: string,
    refreshToken: string,
  ): AuthLoginResponseDto {
    return new AuthLoginResponseDto({
      user: {
        id: user.pid,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        isActive: user.isActive,
        roles: user.roles.map((role) => role.name) || [],
      },
      accessToken,
      refreshToken,
      expiresIn: 900, // 15 minutes in seconds
    });
  }
}
