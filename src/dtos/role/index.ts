import { Role } from '../../models/Role';

/**
 * Role response DTO
 */
export class RoleResponseDto {
  id: number;
  name: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;

  constructor(data: Partial<RoleResponseDto>) {
    Object.assign(this, data);
  }

  /**
   * Static method to create DTO from Role entity
   */
  static fromEntity(role: Role): RoleResponseDto {
    return new RoleResponseDto({
      id: role.id,
      name: role.name,
      description: role.description,
      createdAt: role.createdAt,
      updatedAt: role.updatedAt,
    });
  }

  /**
   * Static method to create DTO array from Role entities
   */
  static fromEntities(roles: Role[]): RoleResponseDto[] {
    return roles.map((role) => RoleResponseDto.fromEntity(role));
  }
}
