import { injectable } from 'tsyringe';
import { Repository, Not } from 'typeorm';
import { AppDataSource } from '../config/database';
import { Role } from '../models/Role';
import { User } from '../models/User';
import { IRoleService } from '../interfaces/services/IRoleService';

@injectable()
export class RoleService implements IRoleService {
  private readonly roleRepo: Repository<Role>;
  private readonly userRepo: Repository<User>;

  constructor() {
    this.roleRepo = AppDataSource.getRepository(Role);
    this.userRepo = AppDataSource.getRepository(User);
  }

  async findByName(name: string): Promise<Role | null> {
    const role = await this.roleRepo.findOne({ where: { name } });

    return role;
  }

  async findById(id: number): Promise<Role | null> {
    const role = await this.roleRepo.findOne({
      where: { id },
      relations: ['users'],
    });

    return role;
  }

  async getAllRoles(
    page: number = 1,
    limit: number = 10,
    search?: string,
  ): Promise<{
    roles: Role[];
    total: number;
    page: number;
    limit: number;
  }> {
    const queryBuilder = this.roleRepo.createQueryBuilder('role');

    if (search) {
      queryBuilder.where('(role.name LIKE :search OR role.description LIKE :search)', {
        search: `%${search}%`,
      });
    }

    const [roles, total] = await queryBuilder
      .skip((page - 1) * limit)
      .take(limit)
      .orderBy('role.name', 'ASC')
      .getManyAndCount();

    return {
      roles,
      total,
      page,
      limit,
    };
  }

  async createRole(name: string, description?: string): Promise<Role> {
    // Check if role with same name already exists
    const existingRole = await this.findByName(name);
    if (existingRole) {
      throw new Error(`Role with name '${name}' already exists`);
    }

    const role = this.roleRepo.create({ name, description });
    const savedRole = await this.roleRepo.save(role);

    return savedRole;
  }

  async updateRole(id: number, name: string, description?: string): Promise<Role> {
    const role = await this.findById(id);
    if (!role) {
      throw new Error(`Role with ID '${id}' not found`);
    }

    // Check if new name conflicts with existing role (excluding current role)
    const existingRole = await this.roleRepo.findOne({
      where: { name, id: Not(id) },
    });
    if (existingRole) {
      throw new Error(`Role with name '${name}' already exists`);
    }

    role.name = name;
    if (description !== undefined) {
      role.description = description;
    }

    const updatedRole = await this.roleRepo.save(role);

    return updatedRole;
  }

  async deleteRole(id: number): Promise<boolean> {
    const role = await this.findById(id);
    if (!role) {
      throw new Error(`Role with ID '${id}' not found`);
    }

    // Check if role is assigned to any users
    const isAssigned = await this.isRoleAssignedToUsers(id);
    if (isAssigned) {
      throw new Error('Cannot delete role that is assigned to users');
    }

    await this.roleRepo.remove(role);

    return true;
  }

  async isRoleAssignedToUsers(id: number): Promise<boolean> {
    const userCount = await this.userRepo.count({
      where: {
        roles: { id },
      },
    });

    const isAssigned = userCount > 0;

    return isAssigned;
  }
}
