# TypeScript + NodeJS API Base

Customizable NodeJS & TypeScript API base.

**Production-ready, enterprise-grade backend nodejs & typescript api base with authentication, RBAC, testing, and modern best practices.**

[Features](#-features) • [Quick Start](#-quick-start) • [Architecture](#-architecture) • [API Docs](#-api-documentation) • [Testing](#-testing)

---

## Features

### Core Features

- **Complete Authentication System** - JWT-based auth with access & refresh tokens
- **Role-Based Access Control (RBAC)** - Flexible permission system with dynamic role assignment
- **Multi-Provider Email Service** - Support for SMTP, SendGrid, and AWS SES
- **Background Job Processing** - Redis/Memory queue system for async tasks
- **Scheduled Tasks** - Cron job management system
- **Password Reset Flow** - Secure token-based password recovery
- **Invitation System** - Token-based user invitations

### Architecture & Best Practices

- **Dependency Injection** - TSyringe for clean, testable architecture
- **Clean Architecture** - Separation of concerns with controllers, services, and repositories
- **TypeScript Strict Mode** - Full type safety throughout the codebase
- **Comprehensive Testing** - 54+ tests with Jest & Supertest (Unit & Integration)
- **API Documentation** - Swagger/OpenAPI documentation
- **Validation** - Request validation with Zod schemas
- **DTOs (Data Transfer Objects)** - Type-safe data transformation

### Security & Performance

- **Security Headers** - Helmet.js integration
- **Rate Limiting** - Configurable API rate limits
- **CORS Configuration** - Flexible cross-origin setup
- **Multi-level Caching** - Redis and in-memory cache providers
- **Structured Logging** - Winston logger with multiple transports
- **Graceful Shutdown** - Proper cleanup of resources

### DevOps & Deployment

- **Docker Support** - Production-ready containerization
- **Environment Validation** - Startup-time environment variable checking
- **Health Checks** - Database and cache connectivity monitoring
- **Database Migrations** - TypeORM migration system

---

## Table of Contents

- [Quick Start](#-quick-start)
- [Project Structure](#-project-structure)
- [Architecture](#-architecture)
- [API Documentation](#-api-documentation)
- [Authentication & Authorization](#-authentication--authorization)
- [Database Models](#-database-models)
- [Testing](#-testing)
- [Configuration](#-configuration)
- [Docker Deployment](#-docker-deployment)
- [Scripts](#-available-scripts)
- [Contributing](#-contributing)

---

## Quick Start

### Prerequisites

Ensure you have the following installed:

- **Node.js** 18+ or 20+
- **PostgreSQL** 15+
- **Redis** (optional, for caching and queues)
- **Docker** (optional, for containerized development)

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/burakhacihan/ts-node-api-base.git
cd ts-node-api-base

# 2. Install dependencies
npm install

# 3. Set up environment variables
cp .env.example .env
# Edit .env with your configuration

# 4. Run database migrations
npm run migration:run

# 5. Start development server
npm run dev
```

The server will start at `http://localhost:3000`

### First Steps

1. **Access Swagger Documentation**: `http://localhost:3000/api-docs`
2. **Health Check**: `http://localhost:3000/health`
3. **Login with default admin**:
   ```bash
   POST /api/v1/auth/login
   {
     "email": "admin@example.com",
     "password": "admin123"
   }
   ```

---

## Project Structure

```
tsnodebaseapi/
├── src/
│   ├── config/                 # Configuration files
│   │   ├── auth.ts             # JWT & registration config
│   │   ├── database.ts         # TypeORM configuration
│   │   ├── swagger.ts          # API documentation setup
│   │   ├── middlewares.ts      # Middleware configuration
│   │   ├── routes.ts           # Route registration
│   │   └── infrastructure.ts   # Infrastructure initialization
│   │
│   ├── controllers/            # Request handlers (HTTP layer)
│   │   ├── auth.controller.ts
│   │   ├── user.controller.ts
│   │   ├── role.controller.ts
│   │   └── permission.controller.ts
│   │
│   ├── services/               # Business logic layer
│   │   ├── auth.service.ts
│   │   ├── user.service.ts
│   │   ├── email.service.ts
│   │   └── invitation.service.ts
│   │
│   ├── models/                 # TypeORM entities (database models)
│   │   ├── User.ts
│   │   ├── Role.ts
│   │   ├── Permission.ts
│   │   ├── UserRole.ts
│   │   ├── RolePermission.ts
│   │   └── TokenBlacklist.ts
│   │
│   ├── routes/                 # API route definitions
│   │   ├── auth.routes.ts
│   │   ├── user.routes.ts
│   │   └── role.routes.ts
│   │
│   ├── middlewares/             # Express middlewares
│   │   ├── auth.middleware.ts   # JWT authentication
│   │   ├── error.middleware.ts  # Global error handler
│   │   ├── logging.middleware.ts
│   │   └── rateLimit.middleware.ts
│   │
│   ├── dtos/                   # Data Transfer Objects
│   │   ├── auth/
│   │   ├── user/
│   │   └── role/
│   │
│   ├── validations/            # Zod validation schemas
│   │   ├── entities/
│   │   │   ├── auth.schemas.ts
│   │   │   ├── user.schemas.ts
│   │   │   └── role.schemas.ts
│   │   └── utils/
│   │
│   ├── infrastructure/         # Core infrastructure components
│   │   ├── cache/              # Caching providers (Redis/Memory)
│   │   ├── email/              # Email providers (SMTP/SendGrid/SES)
│   │   ├── logging/            # Winston logger configuration
│   │   ├── queue/              # Background job queue system
│   │   ├── cron/               # Scheduled task management
│   │   └── shutdown/           # Graceful shutdown handlers
│   │
│   ├── interfaces/             # TypeScript interfaces
│   │   └── services/
│   │
│   ├── utils/                  # Utility functions
│   │   ├── apiResponse.ts      # Standard API response format
│   │   ├── exceptions.ts       # Custom exception classes
│   │   ├── asyncHandler.ts     # Async route handler wrapper
│   │   └── bootstrapAdmin.ts   # Admin user initialization
│   │
│   ├── container/              # Dependency injection setup
│   │   └── index.ts
│   │
│   ├── core/                   # Core constants and types
│   │   └── constants/
│   │
│   └── app.ts                  # Application entry point
│
├── tests/                      # Test suite
│   ├── unit/                   # Unit tests
│   │   ├── services/
│   │   ├── models/
│   │   ├── middlewares/
│   │   └── utils/
│   ├── integration/            # Integration tests
│   ├── helpers/                # Test utilities
│   │   ├── mock-data.ts
│   │   └── test-db.ts
│   └── setup.ts                # Test environment setup
│
├── .github/
│   └── workflows/
│       └── ci.yml              # GitHub Actions CI/CD
│
├── jest.config.js              # Jest configuration
├── tsconfig.json               # TypeScript configuration
├── docker-compose.yml          # Docker compose setup
├── Dockerfile                  # Production Docker image
└── .env.example                # Environment variables template
```

---

## Architecture

This project follows **Clean Architecture** principles with clear separation of concerns:

```
┌─────────────────────────────────────────────────────────────┐
│                     HTTP Layer (Express)                    │
├─────────────────────────────────────────────────────────────┤
│  Controllers (auth, user, role, permission)                 │
│  • Handle HTTP requests/responses                           │
│  • Input validation (Zod)                                   │
│  • Delegate to services                                     │
├─────────────────────────────────────────────────────────────┤
│  Services (Business Logic)                                  │
│  • Authentication & Authorization                           │
│  • User management                                          │
│  • Email sending                                            │
│  • Token management                                         │
├─────────────────────────────────────────────────────────────┤
│  Repositories (Data Access)                                 │
│  • TypeORM entities & repositories                          │
│  • Database operations                                      │
├─────────────────────────────────────────────────────────────┤
│  Infrastructure                                             │
│  • Cache (Redis/Memory)                                     │
│  • Email (SMTP/SendGrid/SES)                                │
│  • Queue (Redis/Memory)                                     │
│  • Logging (Winston)                                        │
│  • Cron Jobs                                                │
└─────────────────────────────────────────────────────────────┘
```

### Request Flow

```
1. Request → Middleware Chain
   ↓
2. Authentication Middleware (JWT validation)
   ↓
3. Authorization Middleware (Permission check)
   ↓
4. Validation Middleware (Zod schema)
   ↓
5. Controller (Route handler)
   ↓
6. Service (Business logic)
   ↓
7. Repository (Database operation)
   ↓
8. Response → Client
```

---

## API Documentation

### Swagger UI

Access interactive API documentation at: **`http://localhost:3000/api-docs`**

### Main API Endpoints

#### Authentication (`/api/v1/auth`)

| Method | Endpoint           | Description               | Auth Required |
| ------ | ------------------ | ------------------------- | ------------- |
| POST   | `/register`        | Register new user         | ❌            |
| POST   | `/login`           | Login user                | ❌            |
| POST   | `/refresh`         | Refresh access token      | ❌            |
| POST   | `/logout`          | Logout user               | ✅            |
| POST   | `/forgot-password` | Request password reset    | ❌            |
| POST   | `/reset-password`  | Reset password with token | ❌            |

#### Users (`/api/v1/users`)

| Method | Endpoint               | Description              | Auth Required |
| ------ | ---------------------- | ------------------------ | ------------- |
| GET    | `/`                    | List all users           | ✅            |
| GET    | `/:id`                 | Get user by ID           | ✅            |
| GET    | `/profile`             | Get current user profile | ✅            |
| PUT    | `/:id`                 | Update user              | ✅            |
| DELETE | `/:id`                 | Delete user              | ✅            |
| POST   | `/:id/assign-role`     | Assign role to user      | ✅            |
| POST   | `/:id/change-password` | Change user password     | ✅            |

#### Roles (`/api/v1/roles`)

| Method | Endpoint | Description     | Auth Required |
| ------ | -------- | --------------- | ------------- |
| GET    | `/`      | List all roles  | ✅            |
| POST   | `/`      | Create new role | ✅            |
| GET    | `/:id`   | Get role by ID  | ✅            |
| PUT    | `/:id`   | Update role     | ✅            |
| DELETE | `/:id`   | Delete role     | ✅            |

#### Permissions (`/api/v1/permissions`)

| Method | Endpoint | Description           | Auth Required |
| ------ | -------- | --------------------- | ------------- |
| GET    | `/`      | List all permissions  | ✅            |
| POST   | `/`      | Create new permission | ✅            |
| GET    | `/:id`   | Get permission by ID  | ✅            |
| PUT    | `/:id`   | Update permission     | ✅            |
| DELETE | `/:id`   | Delete permission     | ✅            |

#### Email (`/api/v1/email`)

| Method | Endpoint | Description                        | Auth Required |
| ------ | -------- | ---------------------------------- | ------------- |
| POST   | `/send`  | Send email immediately             | ✅            |
| POST   | `/queue` | Queue email for background sending | ✅            |

#### Invitations (`/api/v1/invitation-tokens`)

| Method | Endpoint    | Description               | Auth Required |
| ------ | ----------- | ------------------------- | ------------- |
| POST   | `/`         | Create invitation token   | ✅            |
| GET    | `/`         | List invitation tokens    | ✅            |
| POST   | `/validate` | Validate invitation token | ❌            |

---

## Authentication & Authorization

### JWT Token System

The project uses a **dual-token system**:

1. **Access Token** (short-lived, 15 minutes)

   - Used for API authentication
   - Contains user ID, email, and roles
   - Sent in `Authorization: Bearer <token>` header

2. **Refresh Token** (long-lived, 7 days)
   - Used to obtain new access tokens
   - Cannot be used for API calls directly
   - Should be stored securely on client

### Token Flow

```
┌─────────┐         ┌─────────┐         ┌─────────┐
│ Client  │         │   API   │         │Database │
└────┬────┘         └────┬────┘         └────┬────┘
     │                   │                   │
     │  POST /login      │                   │
     │──────────────────>│                   │
     │                   │  Validate User    │
     │                   │──────────────────>│
     │                   │<──────────────────│
     │  Access + Refresh │                   │
     │<──────────────────│                   │
     │                   │                   │
     │  API Call + Token │                   │
     │──────────────────>│                   │
     │                   │  Verify Token     │
     │                   │──────────────────>│
     │                   │<──────────────────│
     │  Response         │                   │
     │<──────────────────│                   │
     │                   │                   │
     │  Refresh Token    │                   │
     │──────────────────>│                   │
     │  New Access Token │                   │
     │<──────────────────│                   │
```

### Role-Based Access Control (RBAC)

The system implements a flexible RBAC model:

```
User ──┬──> UserRole ──> Role ──┬──> RolePermission ──> Permission
       │                        │
       └──> Multiple Roles      └──> Multiple Permissions
```

#### Example: Creating Roles & Permissions

```typescript
// 1. Create a permission
POST /api/v1/permissions
{
  "resource": "users",
  "action": "read",
  "method": "GET",
  "description": "Can read user data"
}

// 2. Create a role
POST /api/v1/roles
{
  "name": "moderator",
  "description": "Moderator role"
}

// 3. Assign permission to role
POST /api/v1/role-permissions
{
  "roleId": 2,
  "permissionId": 5
}

// 4. Assign role to user
POST /api/v1/user-roles
{
  "userId": 10,
  "roleId": 2
}
```

### Registration Modes

The system supports multiple registration modes:

1. **PUBLIC** - Anyone can register
2. **INVITATION** - Requires invitation token
3. **DOMAIN_WHITELIST** - Only specific email domains
4. **CLOSED** - Registration disabled

Configure via `REGISTRATION_MODE` in `.env`

---

## Database Models

### Entity Relationship Diagram

```
┌─────────────┐
│    User     │
├─────────────┤
│ id (PK)     │
│ pid (UUID)  │
│ email       │
│ password    │
│ firstName   │
│ lastName    │
│ isActive    │
└──────┬──────┘
       │
       │ 1:N
       ▼
┌─────────────┐      ┌─────────────┐
│  UserRole   │──N:1─│    Role     │
├─────────────┤      ├─────────────┤
│ userId (FK) │      │ id (PK)     │
│ roleId (FK) │      │ name        │
└─────────────┘      │ description │
                     └──────┬──────┘
                            │
                            │ 1:N
                            ▼
                     ┌────────────────┐      ┌──────────────┐
                     │ RolePermission │──N:1─│  Permission  │
                     ├────────────────┤      ├──────────────┤
                     │ roleId (FK)    │      │ id (PK)      │
                     │ permissionId   │      │ resource     │
                     └────────────────┘      │ action       │
                                             │ method       │
                                             └──────────────┘
```

### Key Models

- **User** - User accounts with authentication
- **Role** - User roles (admin, moderator, user)
- **Permission** - Granular permissions (users:read, users:write)
- **UserRole** - Many-to-many relationship
- **RolePermission** - Many-to-many relationship
- **TokenBlacklist** - Invalidated JWT tokens
- **PasswordResetToken** - Password reset tokens
- **InvitationToken** - User invitation tokens

---

## Testing

### Test

```
54 Tests Passing
5 Test Suites
Unit Tests: 44
Integration Tests: 10
```

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run only unit tests
npm run test:unit

# Run only integration tests
npm run test:integration

# Run tests for CI/CD
npm run test:ci
```

### Test Structure

```
tests/
├── unit/
│   ├── services/
│   │   └── auth.service.test.ts       (19 tests)
│   ├── models/
│   │   └── User.test.ts               (10 tests)
│   ├── middlewares/
│   │   └── auth.middleware.test.ts    (7 tests)
│   └── utils/
│       └── apiResponse.test.ts        (8 tests)
├── integration/
│   └── auth.routes.test.ts            (10 tests)
└── helpers/
    ├── mock-data.ts                   (Mock factories)
    └── test-db.ts                     (Test DB utilities)
```

---

## Configuration

### Environment Variables

Create a `.env` file based on `.env.example`:

```bash
# Server Configuration
NODE_ENV=development
PORT=3000

# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=your_password
DB_NAME=tsnodebaseapi
DB_NAME_TEST=tsnodebaseapi_test
DB_LOGGING=false

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this
JWT_ACCESS_TOKEN_EXPIRY=15m
JWT_REFRESH_TOKEN_EXPIRY=7d

# Registration Configuration
REGISTRATION_MODE=public              # public | invitation | domainwhitelist | closed
ALLOWED_DOMAINS=example.com,company.com

# Admin Bootstrap
DEFAULT_ADMIN_EMAIL=admin@example.com
DEFAULT_ADMIN_PASSWORD=Admin@123!

# Redis Configuration (optional)
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
CACHE_PROVIDER=memory                 # redis | memory

# Email Configuration
EMAIL_PROVIDER=smtp                   # smtp | sendgrid | ses
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
EMAIL_FROM=noreply@example.com

# SendGrid (if using sendgrid)
SENDGRID_API_KEY=your-sendgrid-api-key

# AWS SES (if using ses)
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key

# Queue Configuration
QUEUE_PROVIDER=memory                 # redis | memory

# Logging
LOG_LEVEL=info                        # error | warn | info | debug
LOG_FILE=logs/app.log

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000          # 15 minutes
RATE_LIMIT_MAX_REQUESTS=100

# CORS
CORS_ORIGIN=http://localhost:3000
CORS_CREDENTIALS=true

# Frontend URL (for password reset links)
FRONTEND_URL=http://localhost:3000
```

### Key Configuration Files

- `src/config/auth.ts` - Authentication & JWT setup
- `src/config/database.ts` - TypeORM configuration
- `src/config/swagger.ts` - API documentation
- `src/config/middlewares.ts` - Express middleware stack
- `src/config/routes.ts` - Route registration

---

## Docker Deployment

### Development with Docker Compose

```bash
# Start all services (app, postgres, redis)
npm run docker:dev

# Rebuild and start
npm run docker:dev:build

# Stop all services
docker-compose down

# View logs
docker-compose logs -f app
```

### Production Docker Build

```bash
# Build production image
npm run docker:build

# Run production container
npm run docker:run

# Or manually
docker build -t ts-node-api-base .
docker run -p 3000:3000 --env-file .env ts-node-api-base
```

### Docker Compose Services

```yaml
services:
  app: # Node.js application
  postgres: # PostgreSQL database
  redis: # Redis cache/queue
```

---

## Available Scripts

```bash
# Development
npm run dev              # Start development server with hot reload
npm run build            # Build TypeScript to JavaScript
npm start                # Start production server

# Testing
npm test                 # Run all tests
npm run test:watch       # Run tests in watch mode
npm run test:unit        # Run only unit tests
npm run test:integration # Run only integration tests
npm run test:ci          # Run tests for CI/CD

# Code Quality
npm run lint             # Run ESLint
npm run lint:fix         # Fix ESLint errors
npm run format           # Format code with Prettier

# Database
npm run typeorm          # Run TypeORM CLI
npm run migration:generate  # Generate migration from entities
npm run migration:run    # Run pending migrations
npm run migration:revert # Revert last migration

# Docker
npm run docker:build     # Build Docker image
npm run docker:run       # Run Docker container
npm run docker:dev       # Start Docker Compose (dev mode)
npm run docker:dev:build # Rebuild and start Docker Compose
```

---

### Workflow Matrix

Tests run on:

- Node.js 18.x
- Node.js 20.x

With services:

- PostgreSQL 15
- Redis 7

---

## Tech Stack

### Core

- **Runtime**: Node.js 18+/20+
- **Language**: TypeScript 5.8
- **Framework**: Express 5.1
- **Database**: PostgreSQL 15+
- **ORM**: TypeORM 0.3

### Authentication & Security

- **Authentication**: JWT
- **Password Hashing**: bcryptjs
- **Security Headers**: Helmet
- **Rate Limiting**: express-rate-limit
- **CORS**: cors

### Infrastructure

- **Cache**: Redis (ioredis) / In-Memory
- **Queue**: Redis / In-Memory
- **Email**: SMTP / SendGrid / AWS SES
- **Logging**: Winston
- **Cron**: node-cron
- **DI Container**: TSyringe

### Validation & Documentation

- **Validation**: Zod
- **API Docs**: Swagger (swagger-jsdoc, swagger-ui-express)

### Testing

- **Test Framework**: Jest
- **API Testing**: Supertest
- **TypeScript**: ts-jest

### Development

- **Hot Reload**: ts-node-dev
- **Linting**: ESLint
- **Formatting**: Prettier
- **Containerization**: Docker & Docker Compose

---

## Contributing

Contributions are welcome! Please follow these steps:

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/amazing-feature`)
3. **Commit** your changes (`git commit -m 'Add amazing feature'`)
4. **Push** to the branch (`git push origin feature/amazing-feature`)
5. **Open** a Pull Request

### Development Guidelines

- Follow existing code style (ESLint + Prettier)
- Write tests for new features
- Update documentation as needed
- Ensure all tests pass before submitting PR

---

## License

This project is licensed under the **Apache-2.0 License**.

---

## Acknowledgments

- Built with ❤️ using modern Node.js best practices
- Inspired by enterprise-grade backend architectures
- Thanks to all open-source contributors

---
