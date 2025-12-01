import z from 'zod';

// Re-export all schema types for easy access
export * from '../entities/auth.schemas';
export * from '../entities/user.schemas';
export * from '../entities/role.schemas';
export * from '../entities/permission.schemas';
export * from '../common/schemas';
export * from '../middleware/validation.middleware';
export * from '../utils/validation.utils';

/**
 * Generic validation result type
 */
export type ValidationSchema<T> = z.ZodSchema<T>;

/**
 * Custom validation result type that matches the actual return structure
 */
export type ValidationResult<T> =
  | { success: true; data: T }
  | { success: false; errors: Record<string, string> };

export type ValidationError = z.ZodError;

/**
 * Request validation context
 */
export interface ValidationContext {
  user?: {
    id: string;
    roles: string[];
  };
  isAdmin: boolean;
}

/**
 * Conditional validation function type
 */
export type ConditionalValidator<T> = (data: T, context: ValidationContext) => ValidationResult<T>;
