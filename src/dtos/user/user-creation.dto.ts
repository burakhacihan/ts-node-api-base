import { User } from '../../models/User';

/**
 * User creation DTO for newly created users
 */
export class UserCreationDto {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  isActive: boolean;
  roles: string[];
  createdAt: Date;

  constructor(data: Partial<UserCreationDto>) {
    Object.assign(this, data);
  }

  /**
   * Static method to create DTO from User entity
   */
  static fromEntity(user: User): UserCreationDto {
    return new UserCreationDto({
      id: user.pid,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      isActive: user.isActive,
      roles: user.roles.map((role) => role.name) || [],
      createdAt: user.createdAt,
    });
  }
}
