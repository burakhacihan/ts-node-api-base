import 'reflect-metadata';
import { User } from '@/models/User';
import * as bcrypt from 'bcryptjs';

describe('User Model', () => {
  describe('hashPassword', () => {
    it('should hash password before insert', async () => {
      const user = new User();
      user.email = 'test@example.com';
      user.firstName = 'John';
      user.lastName = 'Doe';
      user.password = 'plainPassword123';

      await user.hashPassword();

      expect(user.password).not.toBe('plainPassword123');
      expect(user.password.length).toBeGreaterThan(20);
    });

    it('should create valid bcrypt hash', async () => {
      const user = new User();
      user.password = 'myPassword123';

      await user.hashPassword();

      const isValid = await bcrypt.compare('myPassword123', user.password);
      expect(isValid).toBe(true);
    });
  });

  describe('generatePid', () => {
    it('should generate UUID pid before insert', async () => {
      const user = new User();
      user.email = 'test@example.com';

      await user.generatePid();

      expect(user.pid).toBeDefined();
      expect(user.pid).toMatch(
        /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
      );
    });

    it('should generate unique pids', async () => {
      const user1 = new User();
      const user2 = new User();

      await user1.generatePid();
      await user2.generatePid();

      expect(user1.pid).not.toBe(user2.pid);
    });
  });

  describe('validatePassword', () => {
    it('should validate correct password', async () => {
      const user = new User();
      user.password = 'testPassword123';
      await user.hashPassword();

      const isValid = await user.validatePassword('testPassword123');

      expect(isValid).toBe(true);
    });

    it('should reject incorrect password', async () => {
      const user = new User();
      user.password = 'correctPassword123';
      await user.hashPassword();

      const isValid = await user.validatePassword('wrongPassword123');

      expect(isValid).toBe(false);
    });

    it('should be case sensitive', async () => {
      const user = new User();
      user.password = 'Password123';
      await user.hashPassword();

      const isValid = await user.validatePassword('password123');

      expect(isValid).toBe(false);
    });
  });

  describe('roles getter', () => {
    it('should return empty array when userRoles is undefined', () => {
      const user = new User();

      const roles = user.roles;

      expect(roles).toEqual([]);
    });

    it('should return roles from userRoles', () => {
      const user = new User();
      user.userRoles = [
        {
          role: { id: 1, name: 'admin', description: 'Admin role' } as any,
        } as any,
        {
          role: { id: 2, name: 'user', description: 'User role' } as any,
        } as any,
      ];

      const roles = user.roles;

      expect(roles).toHaveLength(2);
      expect(roles[0].name).toBe('admin');
      expect(roles[1].name).toBe('user');
    });

    it('should filter out null or undefined roles', () => {
      const user = new User();
      user.userRoles = [
        {
          role: { id: 1, name: 'admin', description: 'Admin role' } as any,
        } as any,
        {
          role: null,
        } as any,
      ];

      const roles = user.roles;

      expect(roles).toHaveLength(1);
      expect(roles[0].name).toBe('admin');
    });
  });
});
