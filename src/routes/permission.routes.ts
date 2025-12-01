import { Router } from 'express';
import { getController } from '../middlewares/di.middleware';
import { PermissionController } from '../controllers/permission.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { validateBody, validateParams, validateQuery } from '../validations';
import {
  permissionIdParamSchema,
  permissionValidationSchema,
  permissionFilterSchema,
  permissionCreationSchema,
} from '../validations/entities/permission.schemas';
import { asyncHandler } from '../utils/asyncHandler';

const router = Router();

// Create a factory function to get controller instance
const getPermissionController = (): PermissionController => {
  return getController<PermissionController>('PermissionController');
};

// Apply auth middleware to all routes
router.use(authenticate);

/**
 * @swagger
 * /api/v1/permissions:
 *   get:
 *     tags:
 *       - Permissions
 *     summary: List all permissions with filtering and pagination
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Items per page
 *       - in: query
 *         name: method
 *         schema:
 *           type: string
 *           enum: [GET, POST, PUT, PATCH, DELETE, HEAD, OPTIONS]
 *         description: Filter by HTTP method
 *       - in: query
 *         name: action
 *         schema:
 *           type: string
 *         description: Filter by action string
 *       - in: query
 *         name: module
 *         schema:
 *           type: string
 *         description: Filter by module name
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [method, route, action, createdAt]
 *         description: Sort field
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *         description: Sort order
 *     responses:
 *       200:
 *         description: Permissions retrieved successfully
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
 *                         $ref: '#/components/schemas/PermissionResponse'
 *                     pagination:
 *                       type: object
 *                       properties:
 *                         page:
 *                           type: integer
 *                         limit:
 *                           type: integer
 *                         total:
 *                           type: integer
 *                         pages:
 *                           type: integer
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.get(
  '/',
  validateQuery(permissionFilterSchema),
  asyncHandler((req, res, next) => {
    const permissionController = getPermissionController();
    return permissionController.getAllPermissions.bind(permissionController)(req, res, next);
  }),
);

/**
 * @swagger
 * /api/v1/permissions/{id}:
 *   get:
 *     tags:
 *       - Permissions
 *     summary: Get specific permission details
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Permission ID
 *     responses:
 *       200:
 *         description: Permission details retrieved successfully
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
 *                   $ref: '#/components/schemas/PermissionResponse'
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Permission not found
 *       500:
 *         description: Internal server error
 */
router.get(
  '/:id',
  validateParams(permissionIdParamSchema),
  asyncHandler((req, res, next) => {
    const permissionController = getPermissionController();
    return permissionController.getPermissionById.bind(permissionController)(req, res, next);
  }),
);

/**
 * @swagger
 * /api/v1/permissions/grouped:
 *   get:
 *     tags:
 *       - Permissions
 *     summary: Get permissions grouped by module/feature
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Grouped permissions retrieved successfully
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
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/PermissionGroup'
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.get(
  '/grouped',
  asyncHandler((req, res, next) => {
    const permissionController = getPermissionController();
    return permissionController.getPermissionsGrouped.bind(permissionController)(req, res, next);
  }),
);

/**
 * @swagger
 * /api/v1/permissions/routes:
 *   get:
 *     tags:
 *       - Permissions
 *     summary: Get permissions organized by route structure
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Route permissions retrieved successfully
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
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/RoutePermission'
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.get(
  '/routes',
  asyncHandler((req, res, next) => {
    const permissionController = getPermissionController();
    return permissionController.getPermissionsByRoute.bind(permissionController)(req, res, next);
  }),
);

/**
 * @swagger
 * /api/v1/permissions/validate:
 *   post:
 *     tags:
 *       - Permissions
 *     summary: Validate if a user has specific permissions
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
 *               - method
 *               - action
 *             properties:
 *               userId:
 *                 type: string
 *                 format: uuid
 *                 description: User ID to validate
 *               method:
 *                 type: string
 *                 enum: [GET, POST, PUT, PATCH, DELETE, HEAD, OPTIONS]
 *                 description: HTTP method
 *               action:
 *                 type: string
 *                 description: Action string to validate
 *     responses:
 *       200:
 *         description: Permission validation completed
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
 *                   $ref: '#/components/schemas/PermissionValidationResponse'
 *       400:
 *         description: Bad request - invalid validation data
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.post(
  '/validate',
  validateBody(permissionValidationSchema),
  asyncHandler((req, res, next) => {
    const permissionController = getPermissionController();
    return permissionController.validatePermission.bind(permissionController)(req, res, next);
  }),
);

/**
 * @swagger
 * /api/v1/permissions/stats:
 *   get:
 *     tags:
 *       - Permissions
 *     summary: Get permission statistics and insights
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Permission statistics retrieved successfully
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
 *                   $ref: '#/components/schemas/PermissionStats'
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.get(
  '/stats',
  asyncHandler((req, res, next) => {
    const permissionController = getPermissionController();
    return permissionController.getPermissionStats.bind(permissionController)(req, res, next);
  }),
);

/**
 * @swagger
 * /api/v1/permissions/unused:
 *   get:
 *     tags:
 *       - Permissions
 *     summary: Get unused permissions
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Unused permissions retrieved successfully
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
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/PermissionResponse'
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.get(
  '/unused',
  asyncHandler((req, res, next) => {
    const permissionController = getPermissionController();
    return permissionController.getUnusedPermissions.bind(permissionController)(req, res, next);
  }),
);

/**
 * @swagger
 * /api/v1/permissions/usage:
 *   get:
 *     tags:
 *       - Permissions
 *     summary: Get permission usage statistics
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Permission usage statistics retrieved successfully
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
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       action:
 *                         type: string
 *                       count:
 *                         type: integer
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.get(
  '/usage',
  asyncHandler((req, res, next) => {
    const permissionController = getPermissionController();
    return permissionController.getPermissionUsageStats.bind(permissionController)(req, res, next);
  }),
);

/**
 * @swagger
 * /api/v1/permissions/analysis:
 *   get:
 *     tags:
 *       - Permissions
 *     summary: Get comprehensive permission analysis and recommendations
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Permission analysis completed successfully
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
 *                     overview:
 *                       $ref: '#/components/schemas/PermissionStats'
 *                     unusedPermissions:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/PermissionResponse'
 *                     usageStatistics:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           action:
 *                             type: string
 *                           count:
 *                             type: integer
 *                     moduleBreakdown:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/PermissionGroup'
 *                     recommendations:
 *                       type: array
 *                       items:
 *                         type: string
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.get(
  '/analysis',
  asyncHandler((req, res, next) => {
    const permissionController = getPermissionController();
    return permissionController.getPermissionAnalysis.bind(permissionController)(req, res, next);
  }),
);

/**
 * @swagger
 * /api/v1/permissions:
 *   post:
 *     tags:
 *       - Permissions
 *     summary: Create a new permission
 *     description: Creates a new permission with the specified method, route, and action
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - method
 *               - route
 *               - action
 *             properties:
 *               method:
 *                 type: string
 *                 enum: [GET, POST, PUT, PATCH, DELETE]
 *                 description: HTTP method for the permission
 *                 example: "POST"
 *               route:
 *                 type: string
 *                 description: Express route path (must start with /api/)
 *                 example: "/api/v1/users"
 *               action:
 *                 type: string
 *                 description: Action string following module:operation format
 *                 example: "user:create"
 *     responses:
 *       201:
 *         description: Permission created successfully
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
 *                   example: "Permission created successfully"
 *                 data:
 *                   $ref: '#/components/schemas/PermissionResponse'
 *       400:
 *         description: Bad request - validation failed
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Route must start with /api/"
 *       409:
 *         description: Conflict - permission already exists
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Permission already exists with the same method, route, and action"
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.post(
  '/',
  validateBody(permissionCreationSchema),
  asyncHandler((req, res, next) => {
    const permissionController = getPermissionController();
    return permissionController.createPermission.bind(permissionController)(req, res, next);
  }),
);

export default router;
