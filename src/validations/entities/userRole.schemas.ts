import { z } from 'zod';
import { commonSchemas } from '../common/schemas';

/**
 * User role assignment schema
 */
export const userRoleAssignmentSchema = z.object({
  userId: commonSchemas.uuid,
  roleId: commonSchemas.integerId,
});

/**
 * User role ID parameter schema
 */
export const userRoleIdParamSchema = z.object({
  id: commonSchemas.integerId,
});

/**
 * User ID parameter schema for user role operations
 */
export const userRoleUserIdParamSchema = z.object({
  userId: commonSchemas.uuid,
});

/**
 * Role ID parameter schema for user role operations
 */
export const userRoleRoleIdParamSchema = z.object({
  roleId: commonSchemas.integerId,
});

/**
 * User role query schema for pagination
 */
export const userRoleQuerySchema = z.object({
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().max(100).optional().default(10),
});

/**
 * Type exports for user role schemas
 */
export type UserRoleAssignmentSchema = z.infer<typeof userRoleAssignmentSchema>;
export type UserRoleIdParamSchema = z.infer<typeof userRoleIdParamSchema>;
export type UserRoleUserIdParamSchema = z.infer<typeof userRoleUserIdParamSchema>;
export type UserRoleRoleIdParamSchema = z.infer<typeof userRoleRoleIdParamSchema>;
export type UserRoleQuerySchema = z.infer<typeof userRoleQuerySchema>;
