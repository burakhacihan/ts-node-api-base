import { injectable } from 'tsyringe';
import { Repository, DataSource, In } from 'typeorm';
import { AppDataSource } from '../config/database';
import { RolePermission } from '../models/RolePermission';
import { Role } from '../models/Role';
import { Permission } from '../models/Permission';
import { IRolePermissionService } from '../interfaces/services/IRolePermissionService';

@injectable()
export class RolePermissionService implements IRolePermissionService {
  private readonly rolePermissionRepo: Repository<RolePermission>;
  private readonly roleRepo: Repository<Role>;
  private readonly permissionRepo: Repository<Permission>;
  private readonly dataSource: DataSource;

  constructor() {
    this.rolePermissionRepo = AppDataSource.getRepository(RolePermission);
    this.roleRepo = AppDataSource.getRepository(Role);
    this.permissionRepo = AppDataSource.getRepository(Permission);
    this.dataSource = AppDataSource;
  }

  async grantPermissionToRole(role: Role, permission: Permission): Promise<void> {
    const exists = await this.rolePermissionRepo.findOne({
      where: { role: { id: role.id }, permission: { id: permission.id } },
    });

    if (!exists) {
      const rolePermission = this.rolePermissionRepo.create({ role, permission });
      await this.rolePermissionRepo.save(rolePermission);
    }
  }

  async getRolePermissions(
    roleId: number,
    page: number = 1,
    limit: number = 10,
  ): Promise<{ permissions: Permission[]; total: number }> {
    const [permissions, total] = await this.permissionRepo
      .createQueryBuilder('permission')
      .innerJoin('permission.rolePermissions', 'rp')
      .innerJoin('rp.role', 'role')
      .where('role.id = :roleId', { roleId })
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return { permissions, total };
  }

  async assignPermissionsToRole(
    roleId: number,
    permissionIds: number[],
    replace: boolean = false,
  ): Promise<void> {
    const role = await this.roleRepo.findOne({ where: { id: roleId } });
    if (!role) {
      throw new Error(`Role with ID ${roleId} not found`);
    }

    const permissions = await this.permissionRepo.find({ where: { id: In(permissionIds) } });
    if (permissions.length !== permissionIds.length) {
      throw new Error('Some permissions not found');
    }

    await this.dataSource.transaction(async (manager) => {
      if (replace) {
        await manager.delete(RolePermission, { role: { id: roleId } });
      }

      for (const permission of permissions) {
        const exists = await manager.findOne(RolePermission, {
          where: { role: { id: roleId }, permission: { id: permission.id } },
        });

        if (!exists) {
          const rolePermission = manager.create(RolePermission, { role, permission });
          await manager.save(rolePermission);
        }
      }
    });
  }

  async removePermissionsFromRole(roleId: number, permissionIds: number[]): Promise<void> {
    await this.rolePermissionRepo
      .createQueryBuilder()
      .delete()
      .where('role.id = :roleId', { roleId })
      .andWhere('permission.id IN (:...permissionIds)', { permissionIds })
      .execute();
  }

  async getPermissionRoles(
    permissionId: number,
    page: number = 1,
    limit: number = 10,
  ): Promise<{ roles: Role[]; total: number }> {
    const [roles, total] = await this.roleRepo
      .createQueryBuilder('role')
      .innerJoin('role.rolePermissions', 'rp')
      .where('rp.permission.id = :permissionId', { permissionId })
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return { roles, total };
  }

  async hasPermission(roleId: number, permissionId: number): Promise<boolean> {
    const exists = await this.rolePermissionRepo.findOne({
      where: { role: { id: roleId }, permission: { id: permissionId } },
    });

    return !!exists;
  }

  async getAssignmentById(assignmentId: number): Promise<RolePermission | null> {
    return await this.rolePermissionRepo.findOne({
      where: { id: assignmentId },
      relations: ['role', 'permission'],
    });
  }

  async removeAssignment(assignmentId: number): Promise<void> {
    await this.rolePermissionRepo.delete(assignmentId);
  }
}
