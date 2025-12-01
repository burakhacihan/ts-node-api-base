import { User } from '../../models/User';

/**
 * User response DTO for general user data
 */
export class UserResponseDto {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  isActive: boolean;
  roles: string[];
  createdAt: Date;
  updatedAt: Date;

  constructor(data: Partial<UserResponseDto>) {
    Object.assign(this, data);
  }

  /**
   * Static method to create DTO from User entity
   */
  static fromEntity(user: User): UserResponseDto {
    return new UserResponseDto({
      id: user.pid,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      isActive: user.isActive,
      roles: user.roles.map((role) => role.name) || [],
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    });
  }

  /**
   * Static method to create DTO array from User entities
   */
  static fromEntities(users: User[]): UserResponseDto[] {
    return users.map((user) => UserResponseDto.fromEntity(user));
  }
}
