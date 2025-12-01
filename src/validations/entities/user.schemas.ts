import { z } from 'zod';
import { commonSchemas } from '../common/schemas';

/**
 * User profile update schema (partial, excludes password)
 */
export const userProfileUpdateSchema = z.object({
  firstName: commonSchemas.firstName.optional(),
  lastName: commonSchemas.lastName.optional(),
});

/**
 * User password change schema
 */
export const userPasswordChangeSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: commonSchemas.password,
});

/**
 * User ID parameter schema
 */
export const userIdParamSchema = z.object({
  id: commonSchemas.uuid,
});

/**
 * User role assignment schema
 */
export const userRoleAssignmentSchema = z.object({
  userId: commonSchemas.uuid,
  roleId: commonSchemas.uuid,
});

/**
 * Type exports for user schemas
 */
export type UserProfileUpdateSchema = z.infer<typeof userProfileUpdateSchema>;
export type UserPasswordChangeSchema = z.infer<typeof userPasswordChangeSchema>;
export type UserIdParamSchema = z.infer<typeof userIdParamSchema>;
export type UserRoleAssignmentSchema = z.infer<typeof userRoleAssignmentSchema>;
