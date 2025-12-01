/**
 * Auth token refresh response DTO
 */
export class AuthRefreshResponseDto {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;

  constructor(data: Partial<AuthRefreshResponseDto>) {
    Object.assign(this, data);
  }

  /**
   * Static method to create DTO from token data
   */
  static fromTokens(accessToken: string, refreshToken: string): AuthRefreshResponseDto {
    return new AuthRefreshResponseDto({
      accessToken,
      refreshToken,
      expiresIn: 900, // 15 minutes in seconds
    });
  }
}
