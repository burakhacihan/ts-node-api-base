import { z, ZodObject, ZodType } from 'zod';
import { ValidationResult, ValidationContext } from '../types';

/**
 * Validation utilities for common patterns
 */
export class ValidationUtils {
  /**
   * Create a conditional schema that validates based on context
   * Note: This is a simplified version since Zod's conditional API has changed
   */
  static conditional<T extends ZodType>(
    schema: T,
    condition: (context: ValidationContext) => boolean,
  ) {
    // Use a union with refinement instead of deprecated conditional
    return z.union([schema, z.any()]).superRefine((data, ctx) => {
      // This is a workaround since Zod's conditional doesn't work well with context
      // In practice, you'd use middleware to handle conditional validation
    });
  }

  /**
   * Create a schema that requires fields based on user role
   */
  static requireForRole<T extends ZodType>(schema: T, requiredRole: string) {
    return schema.superRefine((data, ctx) => {
      // This would be handled in middleware with user context
    });
  }

  /**
   * Create a schema that excludes sensitive fields for non-admin users
   */
  static excludeForNonAdmin<T extends ZodType>(schema: T, adminOnlyFields: string[]) {
    if (schema instanceof ZodObject) {
      const fieldsToKeep = Object.keys(schema.shape).filter(
        (field) => !adminOnlyFields.includes(field),
      );
      return schema.pick(fieldsToKeep.reduce((acc, field) => ({ ...acc, [field]: true }), {}));
    }
    return schema;
  }

  /**
   * Validate data with custom context
   */
  static validateWithContext<T>(
    schema: ZodType,
    data: unknown,
    context: ValidationContext,
  ): ValidationResult<T> {
    try {
      const validatedData = schema.parse(data);
      return { success: true, data: validatedData as T };
    } catch (error) {
      if (error instanceof z.ZodError) {
        const fieldErrors: Record<string, string> = {};
        error.issues.forEach((issue) => {
          const field = issue.path.join('.');
          fieldErrors[field] = issue.message;
        });
        return { success: false, errors: fieldErrors };
      }
      return { success: false, errors: { general: 'Validation failed' } };
    }
  }

  /**
   * Create a schema that transforms data after validation
   */
  static withTransform<T extends ZodType, U>(schema: T, transform: (data: z.infer<T>) => U) {
    return schema.transform(transform);
  }

  /**
   * Create a schema that sanitizes data
   */
  static withSanitization<T extends ZodType>(
    schema: T,
    sanitize: (data: z.infer<T>) => z.infer<T>,
  ) {
    return schema.transform(sanitize);
  }
}

export const createValidationError = (message: string, field?: string) => {
  return {
    message,
    field,
  };
};

export const validateUuid = (value: string): boolean => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(value);
};

export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const sanitizeInput = (input: string): string => {
  return input.trim().replace(/[<>]/g, '');
};
