import { inject, injectable } from 'tsyringe';
import { Repository } from 'typeorm';
import { AppDataSource } from '../config/database';
import { User } from '../models/User';
import { Role } from '../models/Role';
import { IUserService } from '../interfaces/services/IUserService';
import { IUserRoleService } from '../interfaces/services/IUserRoleService';
import { UserCreationDto, UserProfileDto, UserResponseDto } from '../dtos/user';
import { RoleResponseDto } from '../dtos/role';
import { compare, hash } from 'bcryptjs';

@injectable()
export class UserService implements IUserService {
  private readonly userRepo: Repository<User>;
  private readonly roleRepo: Repository<Role>;
  private readonly userRoleService: IUserRoleService;

  constructor(@inject('UserRoleService') userRoleService: IUserRoleService) {
    this.userRepo = AppDataSource.getRepository(User);
    this.roleRepo = AppDataSource.getRepository(Role);
    this.userRoleService = userRoleService;
  }

  async adminExists(): Promise<boolean> {
    const adminRole = await this.roleRepo.findOne({ where: { name: 'ADMIN' } });
    if (!adminRole) return false;

    const adminUsers = await this.userRoleService.getRoleUsers(adminRole.id, 1, 1);
    return adminUsers.total > 0;
  }

  async createUserWithRoles(userData: Partial<User>, roles: Role[]): Promise<UserCreationDto> {
    // Use a transaction to ensure both user creation and role assignment work
    const result = await AppDataSource.transaction(async (manager) => {
      // Create the user
      const user = manager.create(User, userData);
      const savedUser = await manager.save(User, user);

      // Assign roles if provided
      if (roles && roles.length > 0) {
        for (const role of roles) {
          await this.userRoleService.assignRole(savedUser.pid, role.id);
        }
      }

      return savedUser;
    });

    return UserCreationDto.fromEntity(result);
  }

  async getProfile(userId: string): Promise<UserProfileDto | null> {
    const user = await this.userRepo.findOne({
      where: { pid: userId },
      relations: ['userRoles', 'userRoles.role'],
    });
    return user ? UserProfileDto.fromEntity(user) : null;
  }

  async getUserById(userId: string): Promise<UserResponseDto | null> {
    const user = await this.userRepo.findOne({
      where: { pid: userId },
      relations: ['userRoles', 'userRoles.role'],
    });
    return user ? UserResponseDto.fromEntity(user) : null;
  }

  async updateProfile(userId: string, updateData: Partial<User>): Promise<UserProfileDto | null> {
    const user = await this.userRepo.findOne({
      where: { pid: userId },
      relations: ['userRoles', 'userRoles.role'],
    });
    if (!user) {
      return null;
    }

    // Update allowed fields only
    Object.assign(user, updateData);

    const savedUser = await this.userRepo.save(user);
    return UserProfileDto.fromEntity(savedUser);
  }

  async changePassword(
    userId: string,
    currentPassword: string,
    newPassword: string,
  ): Promise<boolean> {
    const user = await this.userRepo.findOne({
      where: { pid: userId },
      relations: ['userRoles', 'userRoles.role'],
    });
    if (!user) {
      return false;
    }

    const isCurrentPasswordValid = await compare(currentPassword, user.password);
    if (!isCurrentPasswordValid) {
      return false;
    }

    const hashedNewPassword = await hash(newPassword, 12);
    user.password = hashedNewPassword;
    await this.userRepo.save(user);

    return true;
  }

  async deactivateUser(userId: string): Promise<boolean> {
    const user = await this.userRepo.findOne({
      where: { pid: userId },
      relations: ['userRoles', 'userRoles.role'],
    });
    if (!user) {
      return false;
    }

    if (!user.isActive) {
      return false;
    }

    // Prevent deactivating admin users
    const adminRole = await this.roleRepo.findOne({ where: { name: 'ADMIN' } });
    const isAdmin = user.roles?.some((role) => role.id === adminRole?.id);
    if (isAdmin) {
      return false;
    }

    user.isActive = false;
    await this.userRepo.save(user);

    return true;
  }

  async getAllUsers(): Promise<UserResponseDto[]> {
    const users = await this.userRepo.find({ relations: ['userRoles', 'userRoles.role'] });
    return UserResponseDto.fromEntities(users);
  }

  async assignRoleById(userId: string, roleId: number): Promise<UserResponseDto | null> {
    try {
      await this.userRoleService.assignRole(userId, roleId);
      return await this.getUserById(userId);
    } catch (error) {
      return null;
    }
  }

  async getAllRoles(): Promise<RoleResponseDto[]> {
    const roles = await this.roleRepo.find();
    return RoleResponseDto.fromEntities(roles);
  }

  /**
   * Find user ID by GUID (pid)
   * @param pid - The user GUID
   * @returns Promise<number | null> - Internal user ID or null if not found
   */
  async findUserIdByPid(pid: string): Promise<number | null> {
    const user = await this.userRepo.findOne({ where: { pid } });
    return user?.id || null;
  }

  /**
   * Find user GUID (pid) by internal ID
   * @param id - The internal user ID
   * @returns Promise<string | null> - User GUID or null if not found
   */
  async findUserPidById(id: number): Promise<string | null> {
    const user = await this.userRepo.findOne({ where: { id } });
    return user?.pid || null;
  }
}
