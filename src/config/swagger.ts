import { SwaggerConfig } from '@/types/swagger';
import { Options } from 'swagger-jsdoc';

export const swaggerConfig: SwaggerConfig = {
  enabled: process.env.SWAGGER_ENABLED === 'true',
  title: process.env.SWAGGER_TITLE || 'API Documentation',
  version: process.env.SWAGGER_VERSION || '1.0.0',
  description: process.env.SWAGGER_DESCRIPTION || 'API Documentation',
  path: process.env.SWAGGER_PATH || '/api-docs',
};

export const swaggerOptions: Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: swaggerConfig.title,
      version: swaggerConfig.version,
      description: swaggerConfig.description,
    },
    servers: [
      {
        url: process.env.API_BASE_URL || 'http://localhost:3000',
        description: 'Development server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
      schemas: {
        PermissionResponse: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              format: 'uuid',
              example: '123e4567-e89b-12d3-a456-426614174000',
            },
            method: {
              type: 'string',
              enum: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS'],
              example: 'GET',
            },
            route: {
              type: 'string',
              example: '/api/v1/users',
            },
            action: {
              type: 'string',
              example: 'user:list',
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              example: '2023-01-01T00:00:00.000Z',
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
              example: '2023-01-01T00:00:00.000Z',
            },
          },
        },
        PermissionStats: {
          type: 'object',
          properties: {
            totalPermissions: {
              type: 'integer',
              example: 150,
            },
            permissionsByMethod: {
              type: 'object',
              additionalProperties: {
                type: 'integer',
              },
              example: {
                GET: 45,
                POST: 30,
                PUT: 25,
                DELETE: 20,
                PATCH: 15,
                HEAD: 10,
                OPTIONS: 5,
              },
            },
            permissionsByModule: {
              type: 'object',
              additionalProperties: {
                type: 'integer',
              },
              example: {
                user: 40,
                role: 25,
                auth: 20,
                email: 15,
                invitation: 10,
                permission: 40,
              },
            },
            unusedPermissions: {
              type: 'integer',
              example: 15,
            },
            mostUsedPermissions: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  action: {
                    type: 'string',
                    example: 'user:list',
                  },
                  count: {
                    type: 'integer',
                    example: 25,
                  },
                },
              },
            },
            leastUsedPermissions: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  action: {
                    type: 'string',
                    example: 'admin:system',
                  },
                  count: {
                    type: 'integer',
                    example: 1,
                  },
                },
              },
            },
          },
        },
        PermissionGroup: {
          type: 'object',
          properties: {
            module: {
              type: 'string',
              example: 'user',
            },
            permissions: {
              type: 'array',
              items: {
                $ref: '#/components/schemas/PermissionResponse',
              },
            },
            count: {
              type: 'integer',
              example: 40,
            },
          },
        },
        RoutePermission: {
          type: 'object',
          properties: {
            route: {
              type: 'string',
              example: '/api/v1/users',
            },
            method: {
              type: 'string',
              enum: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS'],
              example: 'GET',
            },
            action: {
              type: 'string',
              example: 'user:list',
            },
            description: {
              type: 'string',
              example: 'Retrieve user data',
            },
            roles: {
              type: 'array',
              items: {
                type: 'string',
              },
              example: ['ADMIN', 'USER'],
            },
          },
        },
        PermissionValidationRequest: {
          type: 'object',
          required: ['userId', 'method', 'action'],
          properties: {
            userId: {
              type: 'string',
              format: 'uuid',
              example: '123e4567-e89b-12d3-a456-426614174000',
            },
            method: {
              type: 'string',
              enum: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS'],
              example: 'GET',
            },
            action: {
              type: 'string',
              example: 'user:list',
            },
          },
        },
        PermissionValidationResponse: {
          type: 'object',
          properties: {
            hasPermission: {
              type: 'boolean',
              example: true,
            },
            userRoles: {
              type: 'array',
              items: {
                type: 'string',
              },
              example: ['ADMIN', 'USER'],
            },
            requiredPermission: {
              type: 'string',
              example: 'GET:user:list',
            },
            grantedPermissions: {
              type: 'array',
              items: {
                type: 'string',
              },
              example: ['user:list', 'user:create', 'user:update'],
            },
          },
        },
        PermissionAnalysis: {
          type: 'object',
          properties: {
            overview: {
              $ref: '#/components/schemas/PermissionStats',
            },
            unusedPermissions: {
              type: 'array',
              items: {
                $ref: '#/components/schemas/PermissionResponse',
              },
            },
            usageStatistics: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  action: {
                    type: 'string',
                    example: 'user:list',
                  },
                  count: {
                    type: 'integer',
                    example: 25,
                  },
                },
              },
            },
            moduleBreakdown: {
              type: 'array',
              items: {
                $ref: '#/components/schemas/PermissionGroup',
              },
            },
            recommendations: {
              type: 'array',
              items: {
                type: 'string',
              },
              example: [
                'Consider removing 15 unused permissions to clean up the system.',
                'Found 5 permissions with minimal usage. Review if they are necessary.',
              ],
            },
          },
        },
        PaginationInfo: {
          type: 'object',
          properties: {
            page: {
              type: 'integer',
              example: 1,
            },
            limit: {
              type: 'integer',
              example: 10,
            },
            total: {
              type: 'integer',
              example: 150,
            },
            pages: {
              type: 'integer',
              example: 15,
            },
          },
        },
        ApiResponse: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: true,
            },
            message: {
              type: 'string',
              example: 'Operation completed successfully',
            },
            data: {
              type: 'object',
            },
          },
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: ['./src/routes/*.ts', './src/controllers/*.ts', './src/models/*.ts'], // Path to the API docs
};
