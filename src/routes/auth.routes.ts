import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { asyncHandler } from '../utils/asyncHandler';
import { getController } from '../middlewares/di.middleware';
import { validateBody } from '../validations';
import {
  userLoginSchema,
  tokenRefreshSchema,
  logoutSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  userRegistrationSchema,
} from '../validations/entities/auth.schemas';

const router = Router();

// Create a factory function to get controller instance
const getAuthController = (): AuthController => {
  return getController<AuthController>('AuthController');
};

/**
 * @swagger
 * /api/v1/auth/login:
 *   post:
 *     tags:
 *       - Authentication
 *     summary: Login to the application
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *                 format: password
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 accessToken:
 *                   type: string
 *                 refreshToken:
 *                   type: string
 *       401:
 *         description: Invalid credentials
 */
router.post(
  '/login',
  validateBody(userLoginSchema),
  asyncHandler((req, res, next) => {
    const authController = getAuthController();
    return authController.login.bind(authController)(req, res, next);
  }),
);

/**
 * @swagger
 * /api/v1/auth/refresh:
 *   post:
 *     tags:
 *       - Authentication
 *     summary: Refresh access token
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - refreshToken
 *             properties:
 *               refreshToken:
 *                 type: string
 *     responses:
 *       200:
 *         description: Token refresh successful
 *       401:
 *         description: Invalid refresh token
 */
router.post(
  '/refresh',
  validateBody(tokenRefreshSchema),
  asyncHandler((req, res, next) => {
    const authController = getAuthController();
    return authController.refresh.bind(authController)(req, res, next);
  }),
);

/**
 * @swagger
 * /api/v1/auth/logout:
 *   post:
 *     tags:
 *       - Authentication
 *     summary: Logout from the application
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               refreshToken:
 *                 type: string
 *                 description: Optional refresh token to invalidate
 *     responses:
 *       200:
 *         description: Logout successful
 *       400:
 *         description: Access token is required
 *       401:
 *         description: Unauthorized
 */
router.post(
  '/logout',
  validateBody(logoutSchema),
  asyncHandler((req, res, next) => {
    const authController = getAuthController();
    return authController.logout.bind(authController)(req, res, next);
  }),
);

/**
 * @swagger
 * /api/v1/auth/forgot-password:
 *   post:
 *     tags:
 *       - Authentication
 *     summary: Request password reset
 *     description: Sends a password reset email if the account exists
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 description: User's email address
 *     responses:
 *       200:
 *         description: Password reset email sent (if account exists)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: If an account with that email exists, a password reset link has been sent
 *                 data:
 *                   type: null
 *       400:
 *         description: Email is required
 */
router.post(
  '/forgot-password',
  validateBody(forgotPasswordSchema),
  asyncHandler((req, res, next) => {
    const authController = getAuthController();
    return authController.forgotPassword.bind(authController)(req, res, next);
  }),
);

/**
 * @swagger
 * /api/v1/auth/reset-password:
 *   post:
 *     tags:
 *       - Authentication
 *     summary: Reset password using token
 *     description: Resets user password using a valid reset token
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - token
 *               - newPassword
 *             properties:
 *               token:
 *                 type: string
 *                 description: Password reset token from email
 *               newPassword:
 *                 type: string
 *                 minLength: 6
 *                 description: New password (minimum 6 characters)
 *     responses:
 *       200:
 *         description: Password reset successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Password reset successful
 *                 data:
 *                   type: null
 *       400:
 *         description: Invalid token, expired token, or password too short
 */
router.post(
  '/reset-password',
  validateBody(resetPasswordSchema),
  asyncHandler((req, res, next) => {
    const authController = getAuthController();
    return authController.resetPassword.bind(authController)(req, res, next);
  }),
);

/**
 * @swagger
 * /api/v1/auth/register:
 *   post:
 *     tags:
 *       - Authentication
 *     summary: Register a new user
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *               - firstName
 *               - lastName
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *                 minLength: 6
 *               firstName:
 *                 type: string
 *               lastName:
 *                 type: string
 *     responses:
 *       201:
 *         description: Registration successful
 *       400:
 *         description: Validation error
 *       500:
 *         description: Internal server error
 */
router.post(
  '/register',
  validateBody(userRegistrationSchema),
  asyncHandler((req, res, next) => {
    const authController = getAuthController();
    return authController.register.bind(authController)(req, res, next);
  }),
);

export default router;
