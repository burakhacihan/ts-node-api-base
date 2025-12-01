import { Router } from 'express';
import { getController } from '../middlewares/di.middleware';
import { RolePermissionController } from '../controllers/rolePermission.controller';
import { authenticate, authorize } from '../middlewares/auth.middleware';
import { validateBody, validateParams, validateQuery } from '../validations';
import {
  roleIdParamSchema,
  permissionIdParamSchema,
  assignmentIdParamSchema,
  permissionAssignmentSchema,
  permissionRemovalSchema,
  paginationQuerySchema,
} from '../validations/entities/rolePermission.schemas';
import { asyncHandler } from '../utils/asyncHandler';

const router = Router();

// Create a factory function to get controller instance
const getRolePermissionController = (): RolePermissionController => {
  return getController<RolePermissionController>('RolePermissionController');
};

/**
 * @swagger
 * /api/v1/role-permissions/{roleId}/permissions:
 *   get:
 *     tags:
 *       - Role Permissions
 *     summary: Get all permissions for a specific role
 *     description: Retrieves all permissions assigned to a specific role with pagination
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
 *         description: Role permissions retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     permissions:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/PermissionDto'
 *                     pagination:
 *                       type: object
 *                       properties:
 *                         page:
 *                           type: integer
 *                         limit:
 *                           type: integer
 *                         total:
 *                           type: integer
 *                         totalPages:
 *                           type: integer
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
  '/:roleId/permissions',
  authenticate,
  authorize,
  validateParams(roleIdParamSchema),
  validateQuery(paginationQuerySchema),
  asyncHandler((req, res, next) => {
    const rolePermissionController = getRolePermissionController();
    return rolePermissionController.getRolePermissions.bind(rolePermissionController)(
      req,
      res,
      next,
    );
  }),
);

/**
 * @swagger
 * /api/v1/role-permissions/{roleId}/permissions:
 *   post:
 *     tags:
 *       - Role Permissions
 *     summary: Assign permissions to a role
 *     description: Assigns permissions to a role with optional replacement of existing permissions
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
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - permissionIds
 *             properties:
 *               permissionIds:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: uuid
 *                 minItems: 1
 *                 description: Array of permission IDs to assign
 *               replace:
 *                 type: boolean
 *                 default: false
 *                 description: Whether to replace existing permissions
 *     responses:
 *       200:
 *         description: Permissions assigned successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *       400:
 *         description: Bad request - validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Role or permission not found
 *       500:
 *         description: Internal server error
 */
router.post(
  '/:roleId/permissions',
  authenticate,
  authorize,
  validateParams(roleIdParamSchema),
  validateBody(permissionAssignmentSchema),
  asyncHandler((req, res, next) => {
    const rolePermissionController = getRolePermissionController();
    return rolePermissionController.assignPermissionsToRole.bind(rolePermissionController)(
      req,
      res,
      next,
    );
  }),
);

/**
 * @swagger
 * /api/v1/role-permissions/{roleId}/permissions:
 *   delete:
 *     tags:
 *       - Role Permissions
 *     summary: Remove permissions from a role
 *     description: Removes specific permissions from a role
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
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - permissionIds
 *             properties:
 *               permissionIds:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: uuid
 *                 minItems: 1
 *                 description: Array of permission IDs to remove
 *     responses:
 *       200:
 *         description: Permissions removed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
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
router.delete(
  '/:roleId/permissions',
  authenticate,
  authorize,
  validateParams(roleIdParamSchema),
  validateBody(permissionRemovalSchema),
  asyncHandler((req, res, next) => {
    const rolePermissionController = getRolePermissionController();
    return rolePermissionController.removePermissionsFromRole.bind(rolePermissionController)(
      req,
      res,
      next,
    );
  }),
);

/**
 * @swagger
 * /api/v1/role-permissions/permissions/{permissionId}/roles:
 *   get:
 *     tags:
 *       - Role Permissions
 *     summary: Get all roles that have a specific permission
 *     description: Retrieves all roles that have been assigned a specific permission
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: permissionId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Permission ID
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
 *         description: Permission roles retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     roles:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/RoleDto'
 *                     pagination:
 *                       type: object
 *                       properties:
 *                         page:
 *                           type: integer
 *                         limit:
 *                           type: integer
 *                         total:
 *                           type: integer
 *                         totalPages:
 *                           type: integer
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Permission not found
 *       500:
 *         description: Internal server error
 */
router.get(
  '/permissions/:permissionId/roles',
  authenticate,
  authorize,
  validateParams(permissionIdParamSchema),
  validateQuery(paginationQuerySchema),
  asyncHandler((req, res, next) => {
    const rolePermissionController = getRolePermissionController();
    return rolePermissionController.getPermissionRoles.bind(rolePermissionController)(
      req,
      res,
      next,
    );
  }),
);

/**
 * @swagger
 * /api/v1/role-permissions/{roleId}/permissions/{permissionId}/check:
 *   get:
 *     tags:
 *       - Role Permissions
 *     summary: Check if a role has a specific permission
 *     description: Checks whether a specific role has been assigned a specific permission
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
 *       - in: path
 *         name: permissionId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Permission ID
 *     responses:
 *       200:
 *         description: Permission check completed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     hasPermission:
 *                       type: boolean
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Role or permission not found
 *       500:
 *         description: Internal server error
 */
router.get(
  '/:roleId/permissions/:permissionId/check',
  authenticate,
  authorize,
  validateParams(roleIdParamSchema),
  validateParams(permissionIdParamSchema),
  asyncHandler((req, res, next) => {
    const rolePermissionController = getRolePermissionController();
    return rolePermissionController.hasPermission.bind(rolePermissionController)(req, res, next);
  }),
);

/**
 * @swagger
 * /api/v1/role-permissions/{assignmentId}:
 *   get:
 *     tags:
 *       - Role Permissions
 *     summary: Get role-permission assignment by ID
 *     description: Retrieves a specific role-permission assignment by its ID
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: assignmentId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Assignment ID
 *     responses:
 *       200:
 *         description: Assignment retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   $ref: '#/components/schemas/RolePermissionResponseDto'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Assignment not found
 *       500:
 *         description: Internal server error
 */
router.get(
  '/role-permissions/:assignmentId',
  authenticate,
  authorize,
  validateParams(assignmentIdParamSchema),
  asyncHandler((req, res, next) => {
    const rolePermissionController = getRolePermissionController();
    return rolePermissionController.getAssignmentById.bind(rolePermissionController)(
      req,
      res,
      next,
    );
  }),
);

/**
 * @swagger
 * /api/v1/role-permissions/{assignmentId}:
 *   delete:
 *     tags:
 *       - Role Permissions
 *     summary: Remove a specific role-permission assignment
 *     description: Removes a specific role-permission assignment by its ID
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: assignmentId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Assignment ID
 *     responses:
 *       204:
 *         description: Assignment removed successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Assignment not found
 *       500:
 *         description: Internal server error
 */
router.delete(
  '/role-permissions/:assignmentId',
  authenticate,
  authorize,
  validateParams(assignmentIdParamSchema),
  asyncHandler((req, res, next) => {
    const rolePermissionController = getRolePermissionController();
    return rolePermissionController.removeAssignment.bind(rolePermissionController)(req, res, next);
  }),
);

export default router;
