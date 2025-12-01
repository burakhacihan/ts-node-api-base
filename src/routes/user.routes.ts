import { Router } from 'express';
import { getController } from '../middlewares/di.middleware';
import { UserController } from '../controllers/user.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { validateBody, validateParams } from '../validations';
import {
  userProfileUpdateSchema,
  userPasswordChangeSchema,
  userIdParamSchema,
  userRoleAssignmentSchema,
} from '../validations/entities/user.schemas';
import { asyncHandler } from '../utils/asyncHandler';

const router = Router();

// Create a factory function to get controller instance
const getUserController = (): UserController => {
  return getController<UserController>('UserController');
};

// Apply auth middleware to all routes
router.use(authenticate);

/**
 * @swagger
 * /api/v1/users:
 *   get:
 *     tags:
 *       - Users
 *     summary: List all users
 *     description: "Retrieves all users. Note: This route is public in current configuration."
 *     responses:
 *       200:
 *         description: Users fetched successfully
 *       500:
 *         description: Internal server error
 */
router.get(
  '/',
  asyncHandler((req, res, next) => {
    const userController = getUserController();
    return userController.getAllUsers.bind(userController)(req, res, next);
  }),
);

/**
 * @swagger
 * /api/v1/users/profile:
 *   get:
 *     tags:
 *       - Users
 *     summary: Get current user profile
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User profile fetched successfully
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
 *                   example: User profile fetched
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       format: uuid
 *                     email:
 *                       type: string
 *                       format: email
 *                     firstName:
 *                       type: string
 *                     lastName:
 *                       type: string
 *                     isActive:
 *                       type: boolean
 *                     roles:
 *                       type: array
 *                       items:
 *                         type: string
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: User not found
 *       500:
 *         description: Internal server error
 */
router.get(
  '/profile',
  asyncHandler((req, res, next) => {
    const userController = getUserController();
    return userController.getProfile.bind(userController)(req, res, next);
  }),
);

/**
 * @swagger
 * /api/v1/users/{id}:
 *   get:
 *     tags:
 *       - Users
 *     summary: Get user details by ID
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: User ID
 *         example: 123e4567-e89b-12d3-a456-426614174000
 *     responses:
 *       200:
 *         description: User details fetched successfully
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
 *                   example: User details fetched
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       format: uuid
 *                     email:
 *                       type: string
 *                       format: email
 *                     firstName:
 *                       type: string
 *                     lastName:
 *                       type: string
 *                     isActive:
 *                       type: boolean
 *                     roles:
 *                       type: array
 *                       items:
 *                         type: string
 *       400:
 *         description: Bad request - invalid user ID format
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - access denied
 *       404:
 *         description: User not found
 *       500:
 *         description: Internal server error
 */
router.get(
  '/:id',
  validateParams(userIdParamSchema),
  asyncHandler((req, res, next) => {
    const userController = getUserController();
    return userController.getUserById.bind(userController)(req, res, next);
  }),
);

/**
 * @swagger
 * /api/v1/users/profile:
 *   put:
 *     tags:
 *       - Users
 *     summary: Update current user profile
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               firstName:
 *                 type: string
 *                 minLength: 1
 *                 example: John
 *               lastName:
 *                 type: string
 *                 minLength: 1
 *                 example: Doe
 *           example:
 *             firstName: John
 *             lastName: Doe
 *     responses:
 *       200:
 *         description: Profile updated successfully
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
 *                   example: Profile updated successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       format: uuid
 *                     email:
 *                       type: string
 *                       format: email
 *                     firstName:
 *                       type: string
 *                     lastName:
 *                       type: string
 *                     isActive:
 *                       type: boolean
 *                     roles:
 *                       type: array
 *                       items:
 *                         type: string
 *       400:
 *         description: Bad request - invalid data
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: User not found
 *       500:
 *         description: Internal server error
 */
router.put(
  '/profile',
  validateBody(userProfileUpdateSchema),
  asyncHandler((req, res, next) => {
    const userController = getUserController();
    return userController.updateProfile.bind(userController)(req, res, next);
  }),
);

/**
 * @swagger
 * /api/v1/users/change-password:
 *   post:
 *     tags:
 *       - Users
 *     summary: Change user password
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - currentPassword
 *               - newPassword
 *             properties:
 *               currentPassword:
 *                 type: string
 *                 minLength: 1
 *                 description: Current password for verification
 *                 example: currentPassword123
 *               newPassword:
 *                 type: string
 *                 minLength: 6
 *                 description: New password to set
 *                 example: newPassword123
 *           example:
 *             currentPassword: currentPassword123
 *             newPassword: newPassword123
 *     responses:
 *       200:
 *         description: Password changed successfully
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
 *                   example: Password changed successfully
 *                 data:
 *                   type: null
 *       400:
 *         description: Bad request - invalid current password or missing fields
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.post(
  '/change-password',
  validateBody(userPasswordChangeSchema),
  asyncHandler((req, res, next) => {
    const userController = getUserController();
    return userController.changePassword.bind(userController)(req, res, next);
  }),
);

/**
 * @swagger
 * /api/v1/users/deactivate:
 *   post:
 *     tags:
 *       - Users
 *     summary: Deactivate current user account
 *     security:
 *       - bearerAuth: []
 *     description: Deactivates the current user's account. This action is irreversible and will prevent the user from logging in.
 *     responses:
 *       200:
 *         description: Account deactivated successfully
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
 *                   example: Account deactivated successfully
 *                 data:
 *                   type: null
 *       400:
 *         description: Bad request - user not found, already deactivated, or is admin
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.post(
  '/deactivate',
  asyncHandler((req, res, next) => {
    const userController = getUserController();
    return userController.deactivateAccount.bind(userController)(req, res, next);
  }),
);

/**
 * @swagger
 * /api/v1/users/assign-role:
 *   post:
 *     tags:
 *       - Users
 *     summary: Assign a role to a user
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userId
 *               - roleId
 *             properties:
 *               userId:
 *                 type: string
 *                 format: uuid
 *               roleId:
 *                 type: string
 *                 format: uuid
 *     responses:
 *       200:
 *         description: Role assigned
 *       404:
 *         description: User or role not found
 *       500:
 *         description: Internal server error
 */
router.post(
  '/assign-role',
  validateBody(userRoleAssignmentSchema),
  asyncHandler((req, res, next) => {
    const userController = getUserController();
    return userController.assignRole.bind(userController)(req, res, next);
  }),
);

/**
 * @swagger
 * /api/v1/users/roles:
 *   get:
 *     tags:
 *       - Users
 *     summary: List all roles
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Roles fetched
 *       500:
 *         description: Internal server error
 */
router.get(
  '/roles',
  asyncHandler((req, res, next) => {
    const userController = getUserController();
    return userController.getAllRoles.bind(userController)(req, res, next);
  }),
);

export default router;
