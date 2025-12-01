import { injectable } from 'tsyringe';
import { Repository } from 'typeorm';
import { AppDataSource } from '../config/database';
import { UserRole } from '../models/UserRole';
import { User } from '../models/User';
import { Role } from '../models/Role';
import { IUserRoleService } from '../interfaces/services/IUserRoleService';
import { UserRoleResponseDto, UserWithRolesDto } from '../dtos/userRole';

@injectable()
export class UserRoleService implements IUserRoleService {
  private readonly userRoleRepo: Repository<UserRole>;
  private readonly userRepo: Repository<User>;
  private readonly roleRepo: Repository<Role>;

  constructor() {
    this.userRoleRepo = AppDataSource.getRepository(UserRole);
    this.userRepo = AppDataSource.getRepository(User);
    this.roleRepo = AppDataSource.getRepository(Role);
  }

  async assignRole(
    userPid: string,
    roleId: number,
    assignedBy?: number,
  ): Promise<UserRoleResponseDto> {
    const [user, role] = await Promise.all([
      this.userRepo.findOne({ where: { pid: userPid } }),
      this.roleRepo.findOne({ where: { id: roleId } }),
    ]);

    if (!user || !role) {
      throw new Error(`User or role not found: userPid=${userPid}, roleId=${roleId}`);
    }

    const existingAssignment = await this.userRoleRepo.findOne({
      where: { userId: user.id, roleId },
      relations: ['user', 'role', 'assignedByUser'],
    });

    if (existingAssignment) {
      return UserRoleResponseDto.fromEntity(existingAssignment);
    }

    const userRole = this.userRoleRepo.create({
      userId: user.id,
      roleId,
      assignedAt: new Date(),
      assignedBy,
    });

    const savedUserRole = await this.userRoleRepo.save(userRole);

    const userRoleWithRelations = await this.userRoleRepo.findOne({
      where: { id: savedUserRole.id },
      relations: ['user', 'role', 'assignedByUser'],
    });

    return UserRoleResponseDto.fromEntity(userRoleWithRelations!);
  }

  async removeRole(userPid: string, roleId: number): Promise<boolean> {
    const user = await this.userRepo.findOne({ where: { pid: userPid } });
    if (!user) return false;

    const assignment = await this.userRoleRepo.findOne({
      where: { userId: user.id, roleId },
    });

    if (!assignment) {
      return false;
    }

    await this.userRoleRepo.remove(assignment);
    return true;
  }

  async getUserRoles(userPid: string): Promise<UserRoleResponseDto[]> {
    const user = await this.userRepo.findOne({ where: { pid: userPid } });
    if (!user) return [];

    const userRoles = await this.userRoleRepo.find({
      where: { userId: user.id },
      relations: ['user', 'role', 'assignedByUser'],
      order: { assignedAt: 'DESC' },
    });

    return UserRoleResponseDto.fromEntities(userRoles);
  }

  async getRoleUsers(
    roleId: number,
    page: number = 1,
    limit: number = 10,
  ): Promise<{ users: UserWithRolesDto[]; total: number }> {
    const skip = (page - 1) * limit;

    const [userRoles, total] = await this.userRoleRepo.findAndCount({
      where: { roleId },
      relations: ['user', 'role', 'assignedByUser'],
      skip,
      take: limit,
      order: { assignedAt: 'DESC' },
    });

    const users = userRoles.map((userRole) => UserWithRolesDto.fromEntity(userRole.user));
    return { users, total };
  }

  async userHasRole(userPid: string, roleId: number): Promise<boolean> {
    const user = await this.userRepo.findOne({ where: { pid: userPid } });
    if (!user) return false;

    const assignment = await this.userRoleRepo.findOne({
      where: { userId: user.id, roleId },
    });

    return !!assignment;
  }

  async getUserRoleById(id: number): Promise<UserRoleResponseDto | null> {
    const userRole = await this.userRoleRepo.findOne({
      where: { id },
      relations: ['user', 'role', 'assignedByUser'],
    });
    return userRole ? UserRoleResponseDto.fromEntity(userRole) : null;
  }

  async getRoleStats(roleId: number): Promise<{ totalUsers: number; activeUsers: number }> {
    const [totalUsers, activeUsers] = await Promise.all([
      this.userRoleRepo.count({ where: { roleId } }),
      this.userRoleRepo
        .createQueryBuilder('userRole')
        .innerJoin('userRole.user', 'user')
        .where('userRole.roleId = :roleId', { roleId })
        .andWhere('user.isActive = :isActive', { isActive: true })
        .getCount(),
    ]);

    return { totalUsers, activeUsers };
  }
}
