import { Router } from 'express';
import { getController } from '../middlewares/di.middleware';
import { UserRoleController } from '../controllers/userRole.controller';
import { authenticate, authorize } from '../middlewares/auth.middleware';
import { validateBody, validateParams, validateQuery } from '../validations';
import {
  userRoleAssignmentSchema,
  userRoleUserIdParamSchema,
  userRoleRoleIdParamSchema,
  userRoleQuerySchema,
} from '../validations/entities/userRole.schemas';
import { asyncHandler } from '../utils/asyncHandler';

const router = Router();

// Create a factory function to get controller instance
const getUserRoleController = (): UserRoleController => {
  return getController<UserRoleController>('UserRoleController');
};

/**
 * @swagger
 * /api/v1/user-roles/assign:
 *   post:
 *     tags:
 *       - User Roles
 *     summary: Assign a role to a user
 *     description: Assigns a specific role to a user with audit trail
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
 *                 description: The ID of the user to assign the role to
 *               roleId:
 *                 type: string
 *                 format: uuid
 *                 description: The ID of the role to assign
 *           example:
 *             userId: 123e4567-e89b-12d3-a456-426614174000
 *             roleId: 456e7890-e89b-12d3-a456-426614174001
 *     responses:
 *       200:
 *         description: Role assigned successfully
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
 *                   example: Role assigned successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       format: uuid
 *                     userId:
 *                       type: string
 *                       format: uuid
 *                     roleId:
 *                       type: string
 *                       format: uuid
 *                     assignedAt:
 *                       type: string
 *                       format: date-time
 *                     assignedBy:
 *                       type: string
 *                       format: uuid
 *                     roleName:
 *                       type: string
 *                     userName:
 *                       type: string
 *       400:
 *         description: Bad request - validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: User or role not found
 *       409:
 *         description: Conflict - role already assigned
 *       500:
 *         description: Internal server error
 */
router.post(
  '/assign',
  authenticate,
  authorize,
  validateBody(userRoleAssignmentSchema),
  asyncHandler((req, res, next) => {
    const userRoleController = getUserRoleController();
    return userRoleController.assignRole.bind(userRoleController)(req, res, next);
  }),
);

/**
 * @swagger
 * /api/v1/user-roles/{userId}/{roleId}:
 *   delete:
 *     tags:
 *       - User Roles
 *     summary: Remove a role from a user
 *     description: Removes a specific role assignment from a user
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: User ID
 *       - in: path
 *         name: roleId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Role ID
 *     responses:
 *       200:
 *         description: Role removed successfully
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
 *                   example: Role removed successfully
 *                 data:
 *                   type: null
 *       400:
 *         description: Bad request - validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Role assignment not found
 *       500:
 *         description: Internal server error
 */
router.delete(
  '/:userId/:roleId',
  authenticate,
  authorize,
  validateParams(userRoleUserIdParamSchema.merge(userRoleRoleIdParamSchema)),
  asyncHandler((req, res, next) => {
    const userRoleController = getUserRoleController();
    return userRoleController.removeRole.bind(userRoleController)(req, res, next);
  }),
);

/**
 * @swagger
 * /api/v1/user-roles/user/{userId}:
 *   get:
 *     tags:
 *       - User Roles
 *     summary: Get all roles assigned to a user
 *     description: Retrieves all role assignments for a specific user
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: User ID
 *     responses:
 *       200:
 *         description: User roles retrieved successfully
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
 *                   example: User roles retrieved successfully
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                         format: uuid
 *                       userId:
 *                         type: string
 *                         format: uuid
 *                       roleId:
 *                         type: string
 *                         format: uuid
 *                       assignedAt:
 *                         type: string
 *                         format: date-time
 *                       assignedBy:
 *                         type: string
 *                         format: uuid
 *                       roleName:
 *                         type: string
 *                       userName:
 *                         type: string
 *       400:
 *         description: Bad request - validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: User not found
 *       500:
 *         description: Internal server error
 */
router.get(
  '/user/:userId',
  authenticate,
  authorize,
  validateParams(userRoleUserIdParamSchema),
  asyncHandler((req, res, next) => {
    const userRoleController = getUserRoleController();
    return userRoleController.getUserRoles.bind(userRoleController)(req, res, next);
  }),
);

/**
 * @swagger
 * /api/v1/user-roles/role/{roleId}/users:
 *   get:
 *     tags:
 *       - User Roles
 *     summary: Get all users assigned to a role
 *     description: Retrieves all users assigned to a specific role with pagination
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: roleId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Role ID
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Page number for pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *         description: Number of items per page
 *     responses:
 *       200:
 *         description: Role users retrieved successfully
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
 *                   example: Role users retrieved successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     users:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                             format: uuid
 *                           email:
 *                             type: string
 *                             format: email
 *                           firstName:
 *                             type: string
 *                           lastName:
 *                             type: string
 *                           isActive:
 *                             type: boolean
 *                           roles:
 *                             type: array
 *                             items:
 *                               type: string
 *                     total:
 *                       type: integer
 *                       description: Total number of users with this role
 *       400:
 *         description: Bad request - validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Role not found
 *       500:
 *         description: Internal server error
 */
router.get(
  '/role/:roleId/users',
  authenticate,
  authorize,
  validateParams(userRoleRoleIdParamSchema),
  validateQuery(userRoleQuerySchema),
  asyncHandler((req, res, next) => {
    const userRoleController = getUserRoleController();
    return userRoleController.getRoleUsers.bind(userRoleController)(req, res, next);
  }),
);

/**
 * @swagger
 * /api/v1/user-roles/check/{userId}/{roleId}:
 *   get:
 *     tags:
 *       - User Roles
 *     summary: Check if a user has a specific role
 *     description: Checks whether a specific user has been assigned a specific role
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: User ID
 *       - in: path
 *         name: roleId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Role ID
 *     responses:
 *       200:
 *         description: Role check completed successfully
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
 *                   example: Role check completed
 *                 data:
 *                   type: object
 *                   properties:
 *                     hasRole:
 *                       type: boolean
 *                       description: Whether the user has the specified role
 *       400:
 *         description: Bad request - validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       500:
 *         description: Internal server error
 */
router.get(
  '/check/:userId/:roleId',
  authenticate,
  authorize,
  validateParams(userRoleUserIdParamSchema.merge(userRoleRoleIdParamSchema)),
  asyncHandler((req, res, next) => {
    const userRoleController = getUserRoleController();
    return userRoleController.checkUserRole.bind(userRoleController)(req, res, next);
  }),
);

/**
 * @swagger
 * /api/v1/user-roles/role/{roleId}/stats:
 *   get:
 *     tags:
 *       - User Roles
 *     summary: Get role statistics
 *     description: Retrieves statistics about users assigned to a specific role
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: roleId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Role ID
 *     responses:
 *       200:
 *         description: Role statistics retrieved successfully
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
 *                   example: Role statistics retrieved successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     totalUsers:
 *                       type: integer
 *                       description: Total number of users assigned to this role
 *                     activeUsers:
 *                       type: integer
 *                       description: Number of active users assigned to this role
 *       400:
 *         description: Bad request - validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Role not found
 *       500:
 *         description: Internal server error
 */
router.get(
  '/role/:roleId/stats',
  authenticate,
  authorize,
  validateParams(userRoleRoleIdParamSchema),
  asyncHandler((req, res, next) => {
    const userRoleController = getUserRoleController();
    return userRoleController.getRoleStats.bind(userRoleController)(req, res, next);
  }),
);

export default router;
