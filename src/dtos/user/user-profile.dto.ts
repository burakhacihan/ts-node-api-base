import { User } from '../../models/User';

/**
 * User profile DTO for profile-specific data
 */
export class UserProfileDto {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  isActive: boolean;
  roles: string[];
  createdAt: Date;
  updatedAt: Date;

  constructor(data: Partial<UserProfileDto>) {
    Object.assign(this, data);
  }

  /**
   * Static method to create DTO from User entity
   */
  static fromEntity(user: User): UserProfileDto {
    return new UserProfileDto({
      id: user.pid,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      isActive: user.isActive,
      roles: user.roles,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    });
  }
}
