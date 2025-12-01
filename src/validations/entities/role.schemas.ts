import { z } from 'zod';
import { commonSchemas } from '../common/schemas';

/**
 * Role creation schema
 */
export const roleCreationSchema = z.object({
  name: z
    .string()
    .min(1, 'Role name is required')
    .max(50, 'Role name is too long')
    .regex(/^[A-Z_]+$/, 'Role name must contain only uppercase letters and underscores'),
  description: z.string().max(255, 'Role description is too long').optional(),
});

/**
 * Role update schema
 */
export const roleUpdateSchema = z.object({
  name: z
    .string()
    .min(1, 'Role name is required')
    .max(50, 'Role name is too long')
    .regex(/^[A-Z_]+$/, 'Role name must contain only uppercase letters and underscores'),
  description: z.string().max(255, 'Role description is too long').optional(),
});

/**
 * Role ID parameter schema
 */
export const roleIdParamSchema = z.object({
  id: commonSchemas.uuid,
});

/**
 * Role query parameters schema (for listing)
 */
export const roleQuerySchema = z.object({
  page: z
    .string()
    .transform((val) => parseInt(val, 10))
    .pipe(z.number().int().positive().default(1) as any)
    .optional(),
  limit: z
    .string()
    .transform((val) => parseInt(val, 10))
    .pipe(z.number().int().min(1).max(100).default(10) as any)
    .optional(),
  search: z.string().max(100, 'Search term is too long').optional(),
});

/**
 * Type exports for role schemas
 */
export type RoleCreationSchema = z.infer<typeof roleCreationSchema>;
export type RoleUpdateSchema = z.infer<typeof roleUpdateSchema>;
export type RoleIdParamSchema = z.infer<typeof roleIdParamSchema>;
export type RoleQuerySchema = z.infer<typeof roleQuerySchema>;
