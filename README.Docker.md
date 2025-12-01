# Docker Setup Guide

This guide will help you run the application using Docker and Docker Compose.

## Prerequisites

- [Docker](https://docs.docker.com/get-docker/) (version 20.10 or higher)
- [Docker Compose](https://docs.docker.com/compose/install/) (version 2.0 or higher)

## Quick Start

### 1. Clone the Repository

```bash
git clone https://github.com/burakhacihan/ts-node-api-base.git
cd tsnodebaseapi
```

### 2. Setup Environment Variables

Copy the example environment file and configure it:

```bash
cp .env.example .env
```

Edit `.env` and set your configuration. **Important**: Change these values in production:

- `JWT_SECRET` - Use a secure random string (minimum 32 characters)
- `DB_PASSWORD` - Use a strong database password
- `REDIS_PASSWORD` - Use a strong Redis password
- `ADMIN_PASSWORD` - Set a secure admin password

### 3. Start the Application

#### Development Mode

```bash
docker-compose up -d
```

This will start:

- PostgreSQL database on port 5432
- Redis cache on port 6379
- Application with hot-reload on port 3000

#### Production Mode

```bash
docker-compose -f docker-compose.prod.yml up -d
```

### 4. Verify Installation

Check if all services are running:

```bash
docker-compose ps
```

Check application health:

```bash
curl http://localhost:3000/health
```

Expected response:

```json
{
  "status": "ok",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

## Available Commands

### Using Docker Compose

```bash
# Start services
docker-compose up -d

# Start with rebuild
docker-compose up -d --build

# Stop services
docker-compose down

# Stop and remove volumes (⚠️ This deletes all data)
docker-compose down -v

# View logs
docker-compose logs -f

# View logs for specific service
docker-compose logs -f app

# Restart a service
docker-compose restart app

# Execute command in running container
docker-compose exec app sh
```

### Using Makefile (Recommended)

We provide a Makefile for convenience:

```bash
# Development
make up              # Start development environment
make down            # Stop development environment
make restart         # Restart development environment
make logs            # View all logs
make logs-app        # View app logs only
make build           # Rebuild containers

# Production
make up-prod         # Start production environment
make down-prod       # Stop production environment
make logs-prod       # View production logs

# Database
make db-migrate      # Run database migrations
make db-shell        # Access PostgreSQL shell

# Maintenance
make clean           # Remove containers and volumes
make shell           # Access app container shell
```

## Database Migrations

### Run Migrations in Docker

```bash
# Using docker-compose
docker-compose exec app npm run migration:run

# Using Makefile
make db-migrate
```

### Generate New Migration

```bash
docker-compose exec app npm run migration:generate -- src/migrations/MigrationName
```

## Accessing Services

### Application

- **URL**: http://localhost:3000
- **Health Check**: http://localhost:3000/health
- **API Docs**: http://localhost:3000/api-docs (if Swagger is enabled)

### PostgreSQL

- **Host**: localhost
- **Port**: 5432
- **Database**: tsnodebaseapi (default)
- **Username**: postgres (default)
- **Password**: Check your `.env` file

Connect using psql:

```bash
docker-compose exec postgres psql -U postgres -d tsnodebaseapi
```

### Redis

- **Host**: localhost
- **Port**: 6379
- **Password**: Check your `.env` file

Connect using redis-cli:

```bash
docker-compose exec redis redis-cli
```

## Development Workflow

### 1. Code Changes

The development setup uses volume mounting, so code changes are automatically reflected:

```bash
# Start in development mode
docker-compose up -d

# Watch logs
docker-compose logs -f app

# Your changes will trigger auto-reload
```

### 2. Install New Dependencies

```bash
# Install dependency in running container
docker-compose exec app npm install <package-name>

# Or rebuild container
docker-compose up -d --build
```

### 3. Debugging

Access the container shell:

```bash
docker-compose exec app sh
```

## Production Deployment

### 1. Prepare Environment

```bash
# Copy production environment template
cp .env.example .env.production

# Edit and configure for production
nano .env.production
```

### 2. Deploy

```bash
# Build production image
docker-compose -f docker-compose.prod.yml build

# Start production stack
docker-compose -f docker-compose.prod.yml up -d

# Verify
docker-compose -f docker-compose.prod.yml ps
```

### 3. Monitor

```bash
# View logs
docker-compose -f docker-compose.prod.yml logs -f

# Check health
curl http://localhost:3000/health
```

## Troubleshooting

### Container Won't Start

```bash
# Check logs
docker-compose logs app

# Common issues:
# 1. Port already in use - change PORT in .env
# 2. Database not ready - wait for postgres health check
# 3. Missing .env file - copy from .env.example
```

### Database Connection Issues

```bash
# Check if postgres is running
docker-compose ps postgres

# Check postgres logs
docker-compose logs postgres

# Test connection
docker-compose exec app sh
nc -zv postgres 5432
```

### Reset Everything

```bash
# Stop and remove all containers, networks, and volumes
docker-compose down -v

# Start fresh
docker-compose up -d --build
```

### Performance Issues

```bash
# Check resource usage
docker stats

# Increase Docker resources in Docker Desktop settings
# Recommended: 4GB RAM, 2 CPUs minimum
```

## Best Practices

### Development

- Use `docker-compose.yml` for local development
- Keep `.env` in `.gitignore`
- Use volume mounts for hot-reload
- Monitor logs with `docker-compose logs -f`

### Production

- Use `docker-compose.prod.yml` for production
- Use multi-stage builds (already configured)
- Run containers as non-root user (already configured)
- Use health checks (already configured)
- Set resource limits
- Use secrets management (e.g., Docker secrets, Vault)
- Enable SSL/TLS with reverse proxy (nginx, traefik)
- Implement proper backup strategy

## Support

If you encounter any issues, please: Open an issue on GitHub
