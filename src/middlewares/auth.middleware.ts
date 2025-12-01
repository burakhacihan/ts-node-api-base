import { Request, Response, NextFunction } from 'express';
import { IAuthService } from '../interfaces/services/IAuthService';
import { IPermissionService } from '../interfaces/services/IPermissionService';
import { UnauthorizedException, ForbiddenException } from '../utils/exceptions';
import { getContainer } from '../container';

/**
 * Lazy-initialized singleton instances
 * These are created only when first accessed, ensuring container is initialized
 */
let authServiceInstance: IAuthService | null = null;
let permissionServiceInstance: IPermissionService | null = null;

/**
 * Gets or creates the AuthService instance from DI container
 */
const getAuthService = (): IAuthService => {
  if (!authServiceInstance) {
    const container = getContainer();
    authServiceInstance = container.resolve<IAuthService>('AuthService');
  }
  return authServiceInstance;
};

/**
 * Gets or creates the PermissionService instance from DI container
 */
const getPermissionService = (): IPermissionService => {
  if (!permissionServiceInstance) {
    const container = getContainer();
    permissionServiceInstance = container.resolve<IPermissionService>('PermissionService');
  }
  return permissionServiceInstance;
};

/**
 * Authenticate middleware - Validates JWT token
 */
export const authenticate = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('No token provided');
    }

    const token = authHeader.split(' ')[1];
    const authService = getAuthService(); // Lazy load
    const decoded = await authService.validateToken(token, 'access');

    req.user = decoded;
    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Strips API version prefix from route path
 * Converts '/api/v1/users' to '/users'
 */
const stripApiVersion = (route: string): string => {
  // Remove API version prefix if present
  const apiVersionMatch = route.match(/^\/api\/v\d+\//);
  if (apiVersionMatch) {
    return route.replace(apiVersionMatch[0], '/');
  }
  return route;
};

/**
 * Gets the full route path by combining base path and relative path
 */
const getFullRoutePath = (req: Request): string => {
  // Method 1: Use originalUrl if available (most reliable)
  if (req.originalUrl) {
    // Extract path from originalUrl (remove query string)
    const url = new URL(req.originalUrl, `http://${req.headers.host || 'localhost'}`);
    return url.pathname;
  }

  // Method 2: Combine baseUrl and path
  const basePath = req.baseUrl || '';
  const currentPath = req.path || '';

  // Combine base path and current path, avoiding double slashes
  let fullPath = basePath + currentPath;

  // Ensure it starts with a slash
  if (!fullPath.startsWith('/')) {
    fullPath = '/' + fullPath;
  }

  // Remove trailing slash if it's not the root
  if (fullPath.length > 1 && fullPath.endsWith('/')) {
    fullPath = fullPath.slice(0, -1);
  }

  return fullPath;
};

/**
 * Gets multiple possible route representations for better matching
 */
const getPossibleRoutes = (req: Request, normalizedRoute: string): string[] => {
  const routes: string[] = [];

  // Add the normalized route path (most important)
  routes.push(normalizedRoute);

  // Add the original path (without API version)
  if (req.path) {
    routes.push(stripApiVersion(req.path));
  }

  // Add the route path if different (without API version)
  if (req.route?.path && req.route.path !== req.path) {
    routes.push(stripApiVersion(req.route.path));
  }

  // Add path without leading slash
  if (normalizedRoute && normalizedRoute.startsWith('/')) {
    routes.push(normalizedRoute.substring(1));
  }

  // Add path with leading slash
  if (normalizedRoute && !normalizedRoute.startsWith('/')) {
    routes.push(`/${normalizedRoute}`);
  }

  // Remove duplicates and empty strings
  return [...new Set(routes.filter(Boolean))];
};

/**
 * Infers action from convention when no database match is found
 */
const inferActionFromConvention = (method: string, route: string): string => {
  const segments = route.split('/').filter(Boolean);
  const resource = segments[0] || 'unknown';

  let operation = '';
  switch (method) {
    case 'GET':
      // Check if it's a detail route (has ID or specific resource)
      if (segments.length > 1 && (segments[1] === 'profile' || segments[1] === 'roles')) {
        operation = segments[1]; // e.g., 'profile', 'roles'
      } else if (route.includes(':') || segments.length > 1) {
        operation = 'detail';
      } else {
        operation = 'list';
      }
      break;
    case 'POST':
      // Check for specific operations
      if (segments.length > 1) {
        operation = segments[1]; // e.g., 'assign-role', 'change-password'
      } else {
        operation = 'create';
      }
      break;
    case 'PUT':
    case 'PATCH':
      operation = 'update';
      break;
    case 'DELETE':
      operation = 'delete';
      break;
    default:
      operation = method.toLowerCase();
  }

  return `${resource}:${operation}`;
};

/**
 * Infers the action string from the request.
 * Enhanced to handle route matching issues and provide better fallback logic.
 */
const inferAction = async (req: Request): Promise<string> => {
  const method = req.method;

  // Get the full route path by combining base path and relative path
  const fullRoute = getFullRoutePath(req);

  // Strip API version prefix from the route
  const normalizedRoute = stripApiVersion(fullRoute);

  // Get multiple possible route representations
  const possibleRoutes = getPossibleRoutes(req, normalizedRoute);

  const permissionService = getPermissionService(); // Lazy load

  // 1. Try DB mapping with multiple route variations
  for (const route of possibleRoutes) {
    const dbAction = await permissionService.getAction(method, route);
    if (dbAction) {
      return dbAction;
    }
  }

  // 2. Fallback: convention-based inference
  const inferredAction = inferActionFromConvention(method, normalizedRoute);
  return inferredAction;
};

/**
 * Authorize middleware - Checks user permissions
 */
export const authorize = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userRoles: string[] = req.user?.roles || [];
    const method = req.method;
    const action = await inferAction(req);

    const authService = getAuthService(); // Lazy load
    if (await authService.isAuthorized(userRoles, method, action)) {
      return next();
    }

    return next(new ForbiddenException('You do not have permission to access this resource.'));
  } catch (error) {
    next(error);
  }
};
