import 'reflect-metadata';
import { DependencyContainer, container as globalContainer, Lifecycle } from 'tsyringe';
import { createLogger } from '../infrastructure/logging';

// Type-only imports (won't execute at runtime)
import type { IUserService } from '@/interfaces/services/IUserService';
import type { IAuthService } from '@/interfaces/services/IAuthService';
import type { IInvitationTokenService } from '@/interfaces/services/IInvitationTokenService';
import type { IPermissionService } from '@/interfaces/services/IPermissionService';
import type { IRoleService } from '@/interfaces/services/IRoleService';
import type { IRolePermissionService } from '@/interfaces/services/IRolePermissionService';
import type { IUserRoleService } from '@/interfaces/services/IUserRoleService';
import type { IEmailService } from '../infrastructure/email/interfaces/IEmailService';
import type { IEmailProvider } from '../infrastructure/email/interfaces/IEmailProvider';

let isInitialized = false;

/**
 * Initializes the dependency injection container
 * Uses dynamic imports to avoid circular dependencies and initialization order issues
 */
export const initializeContainer = async (): Promise<void> => {
  if (isInitialized) {
    createLogger('Container').warn('Container already initialized, skipping...');
    return;
  }

  // Lazy load and register services
  await registerServices();

  isInitialized = true;
  createLogger('Container').info('DI Container initialized successfully');
};

export const getContainer = (): DependencyContainer => {
  return globalContainer;
};

export const resolve = <T>(token: string | symbol): T => {
  if (!isInitialized) {
    throw new Error(
      'Container not initialized. Call initializeContainer() before resolving dependencies.',
    );
  }
  return getContainer().resolve<T>(token);
};

/**
 * Registers all services, controllers, and infrastructure components
 * Uses dynamic imports to ensure proper initialization order
 */
const registerServices = async (): Promise<void> => {
  // Dynamically import services (lazy loading)
  const [
    { UserRoleService },
    { UserService },
    { AuthService },
    { InvitationTokenService },
    { PermissionService },
    { RoleService },
    { RolePermissionService },
    { EmailService },
    { SendGridProvider },
    { SesProvider },
    { SmtpProvider },
    { QueueFactory },
    { QueueManager },
    { EmailConsumer },
    { DefaultConsumer },
    { ConsumerManager },
  ] = await Promise.all([
    import('../services/userRole.service'),
    import('../services/user.service'),
    import('../services/auth.service'),
    import('../services/invitationToken.service'),
    import('../services/permission.service'),
    import('../services/role.service'),
    import('../services/rolePermission.service'),
    import('../services/email.service'),
    import('../infrastructure/email/providers/SendGridProvider'),
    import('../infrastructure/email/providers/SesProvider'),
    import('../infrastructure/email/providers/SmtpProvider'),
    import('../infrastructure/queue/QueueFactory'),
    import('../infrastructure/queue/QueueManager'),
    import('../infrastructure/queue/consumers/EmailConsumer'),
    import('../infrastructure/queue/consumers/DefaultConsumer'),
    import('../infrastructure/queue/consumers/ConsumerManager'),
  ]);

  // Dynamically import controllers
  const [
    { UserController },
    { AuthController },
    { InvitationTokenController },
    { EmailController },
    { RoleController },
    { PermissionController },
    { RolePermissionController },
    { UserRoleController },
  ] = await Promise.all([
    import('../controllers/user.controller'),
    import('../controllers/auth.controller'),
    import('../controllers/invitationToken.controller'),
    import('../controllers/email.controller'),
    import('../controllers/role.controller'),
    import('../controllers/permission.controller'),
    import('../controllers/rolePermission.controller'),
    import('../controllers/userRole.controller'),
  ]);

  // Register services as singletons
  globalContainer.register<IUserRoleService>('UserRoleService', UserRoleService);
  globalContainer.register<IUserService>('UserService', UserService);
  globalContainer.register<IAuthService>('AuthService', AuthService);
  globalContainer.register<IInvitationTokenService>(
    'InvitationTokenService',
    InvitationTokenService,
  );
  globalContainer.register<IPermissionService>('PermissionService', PermissionService);
  globalContainer.register<IRoleService>('RoleService', RoleService);
  globalContainer.register<IRolePermissionService>('RolePermissionService', RolePermissionService);

  // Register email services
  globalContainer.register<IEmailService>('EmailService', EmailService);
  globalContainer.register<IEmailProvider>('SendGridProvider', SendGridProvider);
  globalContainer.register<IEmailProvider>('SesProvider', SesProvider);
  globalContainer.register<IEmailProvider>('SmtpProvider', SmtpProvider);

  // Register queue services
  globalContainer.register('QueueFactory', QueueFactory, {
    lifecycle: Lifecycle.Singleton,
  });
  globalContainer.register('QueueManager', QueueManager, {
    lifecycle: Lifecycle.Singleton,
  });

  // Register queue consumers
  globalContainer.register('EmailConsumer', EmailConsumer, {
    lifecycle: Lifecycle.Singleton,
  });
  globalContainer.register('DefaultConsumer', DefaultConsumer, {
    lifecycle: Lifecycle.Singleton,
  });
  globalContainer.register('ConsumerManager', ConsumerManager, {
    lifecycle: Lifecycle.Singleton,
  });

  // Register controllers as transient (new instance per request)
  globalContainer.register(
    'UserController',
    { useClass: UserController },
    { lifecycle: Lifecycle.Transient },
  );
  globalContainer.register(
    'AuthController',
    { useClass: AuthController },
    { lifecycle: Lifecycle.Transient },
  );
  globalContainer.register(
    'InvitationTokenController',
    { useClass: InvitationTokenController },
    { lifecycle: Lifecycle.Transient },
  );
  globalContainer.register(
    'EmailController',
    { useClass: EmailController },
    { lifecycle: Lifecycle.Transient },
  );
  globalContainer.register(
    'RoleController',
    { useClass: RoleController },
    { lifecycle: Lifecycle.Transient },
  );
  globalContainer.register(
    'PermissionController',
    { useClass: PermissionController },
    { lifecycle: Lifecycle.Transient },
  );
  globalContainer.register(
    'RolePermissionController',
    { useClass: RolePermissionController },
    { lifecycle: Lifecycle.Transient },
  );
  globalContainer.register(
    'UserRoleController',
    { useClass: UserRoleController },
    { lifecycle: Lifecycle.Transient },
  );

  createLogger('Container').info('Services registered successfully');
};
