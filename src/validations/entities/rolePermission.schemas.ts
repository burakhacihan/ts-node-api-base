import { z } from 'zod';
import { commonSchemas } from '../common/schemas';

/**
 * Role ID parameter schema
 */
export const roleIdParamSchema = z.object({
  roleId: commonSchemas.integerId,
});

/**
 * Permission ID parameter schema
 */
export const permissionIdParamSchema = z.object({
  permissionId: commonSchemas.integerId,
});

/**
 * Assignment ID parameter schema
 */
export const assignmentIdParamSchema = z.object({
  assignmentId: commonSchemas.uuid,
});

/**
 * Permission assignment schema
 */
export const permissionAssignmentSchema = z.object({
  permissionIds: z.array(commonSchemas.integerId).min(1, 'At least one permission ID is required'),
  replace: z.boolean().optional().default(false),
});

/**
 * Permission removal schema
 */
export const permissionRemovalSchema = z.object({
  permissionIds: z.array(commonSchemas.integerId).min(1, 'At least one permission ID is required'),
});

/**
 * Pagination query schema
 */
export const paginationQuerySchema = z.object({
  page: z.number().int().positive().optional().default(1),
  limit: z.number().int().min(1).max(100).optional().default(10),
});
