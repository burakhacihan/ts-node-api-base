import { User } from '../../models/User';
import { Role } from '../../models/Role';
import { UserResponseDto, UserProfileDto, UserCreationDto } from '../../dtos/user';
import { RoleResponseDto } from '../../dtos/role';

/**
 * User service interface defining all user-related operations
 */
export interface IUserService {
  /**
   * Check if an admin user exists in the system
   * @returns Promise<boolean> - True if admin exists, false otherwise
   */
  adminExists(): Promise<boolean>;

  /**
   * Create a new user with specified roles
   * @param userData - Partial user data
   * @param roles - Array of roles to assign to the user
   * @returns Promise<UserCreationDto> - The created user DTO
   */
  createUserWithRoles(userData: Partial<User>, roles: Role[]): Promise<UserCreationDto>;

  /**
   * Get user profile by user ID
   * @param userId - The user ID
   * @returns Promise<UserProfileDto | null> - User profile DTO or null if not found
   */
  getProfile(userId: string): Promise<UserProfileDto | null>;

  /**
   * Get user details by user ID (for admin or self-access)
   * @param userId - The user ID
   * @returns Promise<UserResponseDto | null> - User details DTO or null if not found
   */
  getUserById(userId: string): Promise<UserResponseDto | null>;

  /**
   * Update user profile information
   * @param userId - The user ID
   * @param updateData - Profile data to update
   * @returns Promise<UserProfileDto | null> - Updated user profile DTO or null if not found
   */
  updateProfile(userId: string, updateData: Partial<User>): Promise<UserProfileDto | null>;

  /**
   * Change user password
   * @param userId - The user ID
   * @param currentPassword - Current password for verification
   * @param newPassword - New password to set
   * @returns Promise<boolean> - True if password changed successfully
   */
  changePassword(userId: string, currentPassword: string, newPassword: string): Promise<boolean>;

  /**
   * Deactivate user account
   * @param userId - The user ID to deactivate
   * @returns Promise<boolean> - True if deactivation successful
   */
  deactivateUser(userId: string): Promise<boolean>;

  /**
   * Get all users in the system
   * @returns Promise<UserResponseDto[]> - Array of user response DTOs
   */
  getAllUsers(): Promise<UserResponseDto[]>;

  /**
   * Assign a role to a user by their IDs
   * @param userId - The user ID
   * @param roleId - The role ID
   * @returns Promise<UserResponseDto | null> - Updated user DTO or null if not found
   */
  assignRoleById(userId: string, roleId: number): Promise<UserResponseDto | null>;

  /**
   * Get all available roles
   * @returns Promise<RoleResponseDto[]> - Array of role response DTOs
   */
  getAllRoles(): Promise<RoleResponseDto[]>;

  /**
   * Find user ID by GUID (pid)
   * @param pid - The user GUID
   * @returns Promise<number | null> - Internal user ID or null if not found
   */
  findUserIdByPid(pid: string): Promise<number | null>;

  /**
   * Find user GUID (pid) by internal ID
   * @param id - The internal user ID
   * @returns Promise<string | null> - User GUID or null if not found
   */
  findUserPidById(id: number): Promise<string | null>;
}
