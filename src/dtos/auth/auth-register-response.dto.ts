import { User } from '../../models/User';

/**
 * Auth registration response DTO
 */
export class AuthRegisterResponseDto {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  isActive: boolean;
  roles: string[];
  createdAt: Date;

  constructor(data: Partial<AuthRegisterResponseDto>) {
    Object.assign(this, data);
  }

  /**
   * Static method to create DTO from User entity
   */
  static fromEntity(user: User): AuthRegisterResponseDto {
    return new AuthRegisterResponseDto({
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
