import { User } from '@/models/User';
import { Role } from '@/models/Role';
import { Permission } from '@/models/Permission';

export const mockUser = {
  id: '123e4567-e89b-12d3-a456-426614174000',
  email: 'test@example.com',
  password: '$2a$10$abcdefghijklmnopqrstuvwxyz',
  firstName: 'John',
  lastName: 'Doe',
  isActive: true,
  createdAt: new Date(),
  updatedAt: new Date(),
};

export const mockRole = {
  id: '223e4567-e89b-12d3-a456-426614174000',
  name: 'admin',
  description: 'Administrator role',
  createdAt: new Date(),
  updatedAt: new Date(),
};

export const mockPermission = {
  id: '323e4567-e89b-12d3-a456-426614174000',
  resource: 'users',
  action: 'read',
  description: 'Read users permission',
  createdAt: new Date(),
  updatedAt: new Date(),
};

export const createMockUser = (overrides: Partial<User> = {}): User => {
  return {
    ...mockUser,
    ...overrides,
  } as User;
};

export const createMockRole = (overrides: Partial<Role> = {}): Role => {
  return {
    ...mockRole,
    ...overrides,
  } as Role;
};

export const createMockPermission = (overrides: Partial<Permission> = {}): Permission => {
  return {
    ...mockPermission,
    ...overrides,
  } as Permission;
};
