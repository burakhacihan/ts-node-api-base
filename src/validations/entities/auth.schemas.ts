import { z } from 'zod';
import { commonSchemas } from '../common/schemas';

/**
 * User registration schema
 */
export const userRegistrationSchema = z.object({
  email: commonSchemas.email,
  password: commonSchemas.password,
  firstName: commonSchemas.firstName,
  lastName: commonSchemas.lastName,
});

/**
 * User login schema
 */
export const userLoginSchema = z.object({
  email: commonSchemas.email,
  password: z.string().min(1, 'Password is required'),
});

/**
 * Token refresh schema
 */
export const tokenRefreshSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token is required'),
});

/**
 * Logout schema
 */
export const logoutSchema = z.object({
  refreshToken: z.string().optional(),
});

/**
 * Forgot password schema
 */
export const forgotPasswordSchema = z.object({
  email: commonSchemas.email,
});

/**
 * Reset password schema
 */
export const resetPasswordSchema = z.object({
  token: commonSchemas.token,
  newPassword: commonSchemas.password,
});

/**
 * Type exports for auth schemas
 */
export type UserRegistrationSchema = z.infer<typeof userRegistrationSchema>;
export type UserLoginSchema = z.infer<typeof userLoginSchema>;
export type TokenRefreshSchema = z.infer<typeof tokenRefreshSchema>;
export type LogoutSchema = z.infer<typeof logoutSchema>;
export type ForgotPasswordSchema = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordSchema = z.infer<typeof resetPasswordSchema>;
