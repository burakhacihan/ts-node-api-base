import { IUserService } from '../interfaces/services/IUserService';
import { IRoleService } from '../interfaces/services/IRoleService';
import { IPermissionService } from '../interfaces/services/IPermissionService';
import { IRolePermissionService } from '../interfaces/services/IRolePermissionService';
import { IUserRoleService } from '../interfaces/services/IUserRoleService';
import { getContainer } from '../container';
import { createLogger, ILogger } from '../infrastructure/logging';
import { adminConfig } from '../config/auth';
import { Role } from '@/models/Role';

export async function bootstrapAdminUser() {
  const logger = createLogger('BootstrapAdmin');
  const container = getContainer();

  const userService = container.resolve<IUserService>('UserService');
  const roleService = container.resolve<IRoleService>('RoleService');
  const permissionService = container.resolve<IPermissionService>('PermissionService');
  const rolePermissionService = container.resolve<IRolePermissionService>('RolePermissionService');
  const userRoleService = container.resolve<IUserRoleService>('UserRoleService');

  logger.info('Starting admin user bootstrap process');

  try {
    // Step 1: Ensure ADMIN role exists
    let adminRole = await roleService.findByName('ADMIN');
    if (!adminRole) {
      logger.info('Creating ADMIN role');
      adminRole = await roleService.createRole('ADMIN', 'Administrator');
      logger.info('ADMIN role created successfully', { roleId: adminRole.id });
    } else {
      logger.info('ADMIN role already exists', { roleId: adminRole.id });
    }

    // Step 2: Check if admin user exists by email
    const adminUserExists = await checkAdminUserByEmail(userService, adminConfig.email as string);

    if (!adminUserExists) {
      logger.info('Creating default admin user');

      // Step 3: Create admin user (without roles first)
      const defaultAdmin = await userService.createUserWithRoles(
        {
          email: adminConfig.email,
          firstName: 'Admin',
          lastName: 'User',
          password: adminConfig.password,
          isActive: true,
        },
        [], // Don't pass roles here, we'll assign them manually
      );

      const defaultAdminInt = await userService.findUserIdByPid(defaultAdmin.id);

      // Step 4: Assign admin role using UserRoleService
      await userRoleService.assignRole(defaultAdmin.id, adminRole.id, defaultAdminInt ?? undefined);

      // Step 5: Verify role assignment
      let createdUser = await userService.getUserById(defaultAdmin.id);
      if (createdUser && createdUser.roles.includes('ADMIN')) {
        logger.info('Default admin user created and role assigned successfully', {
          userId: defaultAdmin.id,
          email: defaultAdmin.email,
          roles: createdUser.roles,
        });
      } else {
        logger.error('Failed to create admin user with proper role assignment', {
          userId: defaultAdmin.id,
          email: defaultAdmin.email,
          roles: createdUser?.roles || [],
        });
      }
    } else {
      logger.info('Admin user already exists, skipping user creation');
    }

    // Step 6: Check if admin role has permissions (using a simpler approach)
    const hasPermissions = await checkRoleHasPermissions(rolePermissionService, adminRole.id);

    if (hasPermissions) {
      logger.info('Admin role already has permissions, skipping permission grant');
    } else {
      // Step 7: Grant comprehensive permissions to ADMIN role
      await grantAdminPermissions(permissionService, rolePermissionService, adminRole, logger);
    }

    logger.info('Admin bootstrap process completed successfully');
  } catch (error) {
    logger.error('Admin bootstrap process failed', {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });
    throw error;
  }
}

/**
 * Check if an admin user exists by email
 */
async function checkAdminUserByEmail(userService: IUserService, email: string): Promise<boolean> {
  try {
    const allUsers = await userService.getAllUsers();
    return allUsers.some((user) => user.email === email);
  } catch (error) {
    return false;
  }
}

/**
 * Check if a role has any permissions (simpler approach)
 */
async function checkRoleHasPermissions(
  rolePermissionService: IRolePermissionService,
  roleId: number,
): Promise<boolean> {
  try {
    const result = await rolePermissionService.getRolePermissions(roleId, 1, 1);
    return result.total > 0;
  } catch (error) {
    return false;
  }
}

/**
 * Grant all necessary permissions to the admin role
 */
async function grantAdminPermissions(
  permissionService: IPermissionService,
  rolePermissionService: IRolePermissionService,
  adminRole: Role,
  logger: ILogger,
) {
  // Define all permissions that an admin should have access to
  const permissionsToGrant = [
    // User Management Endpoints
    { method: 'GET', route: '/users', action: 'user:list' },
    { method: 'GET', route: '/users/profile', action: 'user:profile' },
    { method: 'GET', route: '/users/:id', action: 'user:detail' },
    { method: 'PUT', route: '/users/profile', action: 'user:updateProfile' },
    { method: 'POST', route: '/users/change-password', action: 'user:changePassword' },
    { method: 'POST', route: '/users/deactivate', action: 'user:deactivate' },
    { method: 'POST', route: '/users/assign-role', action: 'user:assignRole' },
    { method: 'GET', route: '/users/roles', action: 'user:listRoles' },

    // Role Management Endpoints
    { method: 'GET', route: '/roles', action: 'role:list' },
    { method: 'GET', route: '/roles/:id', action: 'role:detail' },
    { method: 'POST', route: '/roles', action: 'role:create' },
    { method: 'PUT', route: '/roles/:id', action: 'role:update' },
    { method: 'DELETE', route: '/roles/:id', action: 'role:delete' },

    // User Role Management Endpoints (NEW)
    { method: 'POST', route: '/user-roles/assign', action: 'userRole:assign' },
    { method: 'DELETE', route: '/user-roles/:userId/:roleId', action: 'userRole:remove' },
    { method: 'GET', route: '/user-roles/user/:userId', action: 'userRole:getUserRoles' },
    { method: 'GET', route: '/user-roles/role/:roleId/users', action: 'userRole:getRoleUsers' },
    { method: 'GET', route: '/user-roles/check/:userId/:roleId', action: 'userRole:checkUserRole' },
    { method: 'GET', route: '/user-roles/role/:roleId/stats', action: 'userRole:getRoleStats' },

    // Permission Management Endpoints
    { method: 'GET', route: '/permissions', action: 'permission:list' },
    { method: 'GET', route: '/permissions/:id', action: 'permission:detail' },
    { method: 'GET', route: '/permissions/grouped', action: 'permission:grouped' },
    { method: 'GET', route: '/permissions/routes', action: 'permission:routes' },
    { method: 'POST', route: '/permissions/validate', action: 'permission:validate' },
    { method: 'GET', route: '/permissions/stats', action: 'permission:stats' },
    { method: 'GET', route: '/permissions/unused', action: 'permission:unused' },
    { method: 'GET', route: '/permissions/usage', action: 'permission:usage' },
    { method: 'GET', route: '/permissions/analysis', action: 'permission:analysis' },
    { method: 'POST', route: '/permissions', action: 'permission:create' },

    // Role-Permission Management Endpoints
    {
      method: 'GET',
      route: '/role-permissions/:roleId/permissions',
      action: 'rolePermission:getRolePermissions',
    },
    {
      method: 'GET',
      route: '/role-permissions/:roleId/permissions/effective',
      action: 'rolePermission:getEffectivePermissions',
    },
    {
      method: 'POST',
      route: '/role-permissions/:roleId/permissions',
      action: 'rolePermission:assignPermissions',
    },
    {
      method: 'DELETE',
      route: '/role-permissions/:roleId/permissions',
      action: 'rolePermission:removePermissions',
    },
    {
      method: 'PUT',
      route: '/role-permissions/:roleId/permissions',
      action: 'rolePermission:replacePermissions',
    },
    {
      method: 'POST',
      route: '/role-permissions/:roleId/permissions/bulk',
      action: 'rolePermission:bulkAssign',
    },
    {
      method: 'DELETE',
      route: '/role-permissions/:roleId/permissions/bulk',
      action: 'rolePermission:bulkRemove',
    },
    {
      method: 'GET',
      route: '/role-permissions/permissions/:permissionId/roles',
      action: 'rolePermission:getPermissionRoles',
    },
    {
      method: 'GET',
      route: '/role-permissions/roles/permissions/matrix',
      action: 'rolePermission:getMatrix',
    },
    {
      method: 'POST',
      route: '/role-permissions/roles/permissions/copy',
      action: 'rolePermission:copyPermissions',
    },
    {
      method: 'GET',
      route: '/role-permissions/roles/permissions/conflicts',
      action: 'rolePermission:getConflicts',
    },
    { method: 'POST', route: '/role-permissions/sync', action: 'rolePermission:sync' },
    {
      method: 'GET',
      route: '/role-permissions/:roleId/permissions/:permissionId/check',
      action: 'rolePermission:checkPermission',
    },
    {
      method: 'GET',
      route: '/role-permissions/:assignmentId',
      action: 'rolePermission:getAssignment',
    },
    {
      method: 'DELETE',
      route: '/role-permissions/:assignmentId',
      action: 'rolePermission:removeAssignment',
    },

    // Email Management Endpoints
    { method: 'POST', route: '/email/send', action: 'email:send' },
    { method: 'POST', route: '/email/send-with-retry', action: 'email:sendWithRetry' },
    { method: 'POST', route: '/email/queue', action: 'email:queue' },
    { method: 'GET', route: '/email/status/:emailId', action: 'email:getStatus' },
    { method: 'GET', route: '/email/logs', action: 'email:getLogs' },

    // Invitation Token Endpoints
    { method: 'POST', route: '/invitation-tokens', action: 'invitationToken:create' },
    { method: 'GET', route: '/invitation-tokens', action: 'invitationToken:list' },
  ];

  logger.info('Granting comprehensive permissions to ADMIN role', {
    permissionCount: permissionsToGrant.length,
  });

  let grantedCount = 0;
  let errorCount = 0;

  for (const perm of permissionsToGrant) {
    try {
      logger.debug('Processing permission', {
        method: perm.method,
        route: perm.route,
        action: perm.action,
      });

      // Use the internal method that bypasses validation
      const permission = await (
        permissionService as IPermissionService
      ).findOrCreatePermissionInternal(perm.method, perm.route, perm.action);

      await rolePermissionService.grantPermissionToRole(adminRole, permission);

      grantedCount++;
      logger.debug('Permission granted successfully', {
        method: perm.method,
        route: perm.route,
        action: perm.action,
        permissionId: permission.id,
      });
    } catch (error) {
      errorCount++;
      logger.error('Failed to grant permission', {
        method: perm.method,
        route: perm.route,
        action: perm.action,
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }

  logger.info('Permission grant process completed', {
    totalPermissions: permissionsToGrant.length,
    grantedCount,
    errorCount,
  });

  if (errorCount > 0) {
    logger.warn('Some permissions failed to be granted', { errorCount });
  }
}
