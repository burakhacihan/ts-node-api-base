import { z } from 'zod';

/**
 * Common validation schemas for reuse across the application
 */
export const commonSchemas = {
  // Email validation
  email: z
    .string()
    .email('Invalid email format')
    .min(1, 'Email is required')
    .max(255, 'Email is too long'),

  // Password validation
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .max(128, 'Password is too long')
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/,
      'Password must contain at least one lowercase letter, one uppercase letter, one number, and one special character (@$!%*?&)',
    ),

  // UUID validation
  uuid: z.string().uuid('Invalid UUID format'),

  // Integer id validation
  integerId: z.number().int().positive(),

  // Name validation
  firstName: z.string().min(1, 'First name is required').max(50, 'First name is too long'),

  lastName: z.string().min(1, 'Last name is required').max(50, 'Last name is too long'),

  // Pagination validation
  pagination: z.object({
    page: z.number().int().positive().default(1),
    limit: z.number().int().min(1).max(100).default(10),
  }),

  // Token validation
  token: z.string().min(1, 'Token is required').max(1000, 'Token is too long'),

  // Optional fields
  optionalString: z.string().optional(),
  optionalEmail: z.string().email().optional(),
  optionalUuid: z.string().uuid().optional(),
} as const;

/**
 * Type exports for common schemas
 */
export type EmailSchema = z.infer<typeof commonSchemas.email>;
export type PasswordSchema = z.infer<typeof commonSchemas.password>;
export type UuidSchema = z.infer<typeof commonSchemas.uuid>;
export type FirstNameSchema = z.infer<typeof commonSchemas.firstName>;
export type LastNameSchema = z.infer<typeof commonSchemas.lastName>;
export type PaginationSchema = z.infer<typeof commonSchemas.pagination>;
export type TokenSchema = z.infer<typeof commonSchemas.token>;
