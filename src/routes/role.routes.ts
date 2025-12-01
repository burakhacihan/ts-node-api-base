import { Router } from 'express';
import { getController } from '../middlewares/di.middleware';
import { RoleController } from '../controllers/role.controller';
import { authenticate, authorize } from '../middlewares/auth.middleware';
import { validateBody, validateParams, validateQuery } from '../validations';
import {
  roleCreationSchema,
  roleUpdateSchema,
  roleIdParamSchema,
  roleQuerySchema,
} from '../validations/entities/role.schemas';
import { asyncHandler } from '../utils/asyncHandler';

const router = Router();

// Create a factory function to get controller instance
const getRoleController = (): RoleController => {
  return getController<RoleController>('RoleController');
};

/**
 * @swagger
 * /api/v1/roles:
 *   get:
 *     tags:
 *       - Roles
 *     summary: List all roles
 *     description: Retrieves all roles with pagination and filtering support
 *     security:
 *       - bearerAuth: []
 *     parameters:
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
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *           maxLength: 100
 *         description: Search term for role name or description
 *     responses:
 *       200:
 *         description: Roles retrieved successfully
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
 *                         $ref: '#/components/schemas/RoleResponse'
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
 *       500:
 *         description: Internal server error
 */
router.get(
  '/',
  authenticate,
  authorize,
  validateQuery(roleQuerySchema),
  asyncHandler((req, res, next) => {
    const roleController = getRoleController();
    return roleController.getAllRoles(req, res, next);
  }),
);

/**
 * @swagger
 * /api/v1/roles/{id}:
 *   get:
 *     tags:
 *       - Roles
 *     summary: Get role by ID
 *     description: Retrieves a specific role by its ID
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Role ID
 *     responses:
 *       200:
 *         description: Role retrieved successfully
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
 *                   $ref: '#/components/schemas/RoleResponse'
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
  '/:id',
  authenticate,
  authorize,
  validateParams(roleIdParamSchema),
  asyncHandler((req, res, next) => {
    const roleController = getRoleController();
    return roleController.getRoleById(req, res, next);
  }),
);

/**
 * @swagger
 * /api/v1/roles:
 *   post:
 *     tags:
 *       - Roles
 *     summary: Create a new role
 *     description: Creates a new role with the provided details
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *                 minLength: 1
 *                 maxLength: 50
 *                 pattern: '^[A-Z_]+$'
 *                 description: Role name (uppercase letters and underscores only)
 *               description:
 *                 type: string
 *                 maxLength: 255
 *                 description: Role description (optional)
 *     responses:
 *       201:
 *         description: Role created successfully
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
 *                   $ref: '#/components/schemas/RoleResponse'
 *       400:
 *         description: Bad request - validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       409:
 *         description: Conflict - role name already exists
 *       500:
 *         description: Internal server error
 */
router.post(
  '/',
  authenticate,
  authorize,
  validateBody(roleCreationSchema),
  asyncHandler((req, res, next) => {
    const roleController = getRoleController();
    return roleController.createRole(req, res, next);
  }),
);

/**
 * @swagger
 * /api/v1/roles/{id}:
 *   put:
 *     tags:
 *       - Roles
 *     summary: Update a role
 *     description: Updates an existing role with the provided details
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
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
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *                 minLength: 1
 *                 maxLength: 50
 *                 pattern: '^[A-Z_]+$'
 *                 description: Role name (uppercase letters and underscores only)
 *               description:
 *                 type: string
 *                 maxLength: 255
 *                 description: Role description (optional)
 *     responses:
 *       200:
 *         description: Role updated successfully
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
 *                   $ref: '#/components/schemas/RoleResponse'
 *       400:
 *         description: Bad request - validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Role not found
 *       409:
 *         description: Conflict - role name already exists
 *       500:
 *         description: Internal server error
 */
router.put(
  '/:id',
  authenticate,
  authorize,
  validateParams(roleIdParamSchema),
  validateBody(roleUpdateSchema),
  asyncHandler((req, res, next) => {
    const roleController = getRoleController();
    return roleController.updateRole(req, res, next);
  }),
);

/**
 * @swagger
 * /api/v1/roles/{id}:
 *   delete:
 *     tags:
 *       - Roles
 *     summary: Delete a role
 *     description: Deletes a role if it's not assigned to any users
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Role ID
 *     responses:
 *       204:
 *         description: Role deleted successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Role not found
 *       409:
 *         description: Conflict - role is assigned to users
 *       500:
 *         description: Internal server error
 */
router.delete(
  '/:id',
  authenticate,
  authorize,
  validateParams(roleIdParamSchema),
  asyncHandler((req, res, next) => {
    const roleController = getRoleController();
    return roleController.deleteRole(req, res, next);
  }),
);

export default router;
