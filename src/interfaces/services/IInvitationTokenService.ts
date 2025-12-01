import { User } from '../../models/User';
import {
  InvitationCreateResponseDto,
  InvitationDetailsResponseDto,
  InvitationAcceptResponseDto,
  InvitationListResponseDto,
} from '../../dtos/invitation';

/**
 * InvitationToken service interface defining all invitation token-related operations
 */
export interface IInvitationTokenService {
  /**
   * Create an invitation token for a user
   * @param userId - The user ID creating the token
   * @param roles - Array of user roles
   * @param expiresInHours - Token expiration time in hours
   * @returns Promise<InvitationCreateResponseDto> - The created invitation token response
   */
  createTokenForUser(
    userId: string,
    roles: string[],
    expiresInHours: number,
  ): Promise<InvitationCreateResponseDto>;

  /**
   * Validate an invitation token
   * @param token - The token to validate
   * @returns Promise<InvitationDetailsResponseDto | null> - Valid token details or null if invalid
   */
  validateToken(token: string): Promise<InvitationDetailsResponseDto | null>;

  /**
   * Mark a token as used by a specific user
   * @param token - The token to mark as used
   * @param usedBy - The user who used the token
   * @returns Promise<InvitationAcceptResponseDto | null> - Acceptance response or null if failed
   */
  useToken(token: string, usedBy: User): Promise<InvitationAcceptResponseDto | null>;

  /**
   * List all invitation tokens for admin users
   * @param roles - Array of user roles
   * @returns Promise<InvitationListResponseDto[]> - Array of invitation token responses
   */
  listTokensForAdmin(roles: string[]): Promise<InvitationListResponseDto[]>;

  /**
   * Clean up expired invitation tokens from the database
   */
  cleanupExpiredTokens(): Promise<void>;
}
