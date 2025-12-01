import { Express } from 'express';
import { apiRateLimiter, authRateLimiter } from '../middlewares/rateLimit.middleware';
import authRoutes from '../routes/auth.routes';
import userRoutes from '../routes/user.routes';
import invitationTokenRoutes from '../routes/invitationToken.routes';
import emailRoutes from '../routes/email.routes';
import roleRoutes from '../routes/role.routes';
import permissionRoutes from '../routes/permission.routes';
import rolePermissionRoutes from '../routes/rolePermission.routes';
import userRoleRoutes from '../routes/userRole.routes';

export function setupRoutes(app: Express): void {
  // Auth routes with specific rate limiter
  app.use('/api/v1/auth', authRateLimiter, authRoutes);

  // API routes with general rate limiter
  const apiRoutes = [
    { path: '/api/v1/users', router: userRoutes },
    { path: '/api/v1/invitation-tokens', router: invitationTokenRoutes },
    { path: '/api/v1/email', router: emailRoutes },
    { path: '/api/v1/roles', router: roleRoutes },
    { path: '/api/v1/permissions', router: permissionRoutes },
    { path: '/api/v1/role-permissions', router: rolePermissionRoutes },
    { path: '/api/v1/user-roles', router: userRoleRoutes },
  ];

  apiRoutes.forEach(({ path, router }) => {
    app.use(path, apiRateLimiter, router);
  });
}
