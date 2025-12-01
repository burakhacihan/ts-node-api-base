import { z } from 'zod';
import { commonSchemas } from '../common/schemas';

/**
 * Permission ID parameter schema
 */
export const permissionIdParamSchema = z.object({
  id: commonSchemas.integerId,
});

/**
 * Permission creation schema
 */
export const permissionCreationSchema = z.object({
  method: z.enum(['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS']),
  route: z
    .string()
    .min(1, 'Route is required')
    .regex(/^\/api\/v\d+/, 'Route must start with /api/v1')
    .max(255, 'Route is too long'),
  action: z
    .string()
    .min(1, 'Action is required')
    .regex(
      /^[a-z]+:[a-z]+$/,
      'Action must follow the format "module:operation" (lowercase letters only)',
    )
    .max(100, 'Action is too long'),
});

/**
 * Permission validation request schema
 */
export const permissionValidationSchema = z.object({
  userId: commonSchemas.uuid,
  method: z.enum(['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS']),
  action: z.string().min(1, 'Action is required'),
});

/**
 * Permission filter schema
 */
export const permissionFilterSchema = z.object({
  method: z.enum(['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS']).optional(),
  module: z.string().optional(),
  action: z.string().optional(),
  hasRoles: z.boolean().optional(),
});

/**
 * Permission query schema
 */
export const permissionQuerySchema = z.object({
  ...commonSchemas.pagination.shape,
  ...permissionFilterSchema.shape,
  groupBy: z.enum(['method', 'module', 'action']).optional(),
  sortBy: z.enum(['method', 'route', 'action', 'createdAt']).optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
});

/**
 * Type exports for permission schemas
 */
export type PermissionIdParamSchema = z.infer<typeof permissionIdParamSchema>;
export type PermissionCreationSchema = z.infer<typeof permissionCreationSchema>;
export type PermissionValidationSchema = z.infer<typeof permissionValidationSchema>;
export type PermissionFilterSchema = z.infer<typeof permissionFilterSchema>;
export type PermissionQuerySchema = z.infer<typeof permissionQuerySchema>;
