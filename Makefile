# ============================================
# Makefile for Docker Operations
# ============================================

.PHONY: help up down restart build logs logs-app logs-postgres logs-redis shell db-shell db-migrate clean up-prod down-prod logs-prod

# Default target
.DEFAULT_GOAL := help

# Colors for output
BLUE := \033[0;34m
GREEN := \033[0;32m
YELLOW := \033[0;33m
RED := \033[0;31m
NC := \033[0m # No Color

## help: Display this help message
help:
	@echo "$(BLUE)Available commands:$(NC)"
	@echo ""
	@echo "$(GREEN)Development:$(NC)"
	@echo "  $(YELLOW)make up$(NC)              - Start development environment"
	@echo "  $(YELLOW)make down$(NC)            - Stop development environment"
	@echo "  $(YELLOW)make restart$(NC)         - Restart development environment"
	@echo "  $(YELLOW)make build$(NC)           - Rebuild development containers"
	@echo "  $(YELLOW)make logs$(NC)            - View all logs (follow mode)"
	@echo "  $(YELLOW)make logs-app$(NC)        - View app logs only"
	@echo "  $(YELLOW)make logs-postgres$(NC)   - View PostgreSQL logs"
	@echo "  $(YELLOW)make logs-redis$(NC)      - View Redis logs"
	@echo ""
	@echo "$(GREEN)Production:$(NC)"
	@echo "  $(YELLOW)make up-prod$(NC)         - Start production environment"
	@echo "  $(YELLOW)make down-prod$(NC)       - Stop production environment"
	@echo "  $(YELLOW)make logs-prod$(NC)       - View production logs"
	@echo "  $(YELLOW)make build-prod$(NC)      - Build production containers"
	@echo ""
	@echo "$(GREEN)Database:$(NC)"
	@echo "  $(YELLOW)make db-migrate$(NC)      - Run database migrations"
	@echo "  $(YELLOW)make db-shell$(NC)        - Access PostgreSQL shell"
	@echo "  $(YELLOW)make db-backup$(NC)       - Backup database"
	@echo ""
	@echo "$(GREEN)Utilities:$(NC)"
	@echo "  $(YELLOW)make shell$(NC)           - Access app container shell"
	@echo "  $(YELLOW)make clean$(NC)           - Remove all containers and volumes"
	@echo "  $(YELLOW)make ps$(NC)              - Show running containers"
	@echo "  $(YELLOW)make health$(NC)          - Check application health"
	@echo ""

## up: Start development environment
up:
	@echo "$(GREEN)Starting development environment...$(NC)"
	docker-compose up -d
	@echo "$(GREEN)Development environment started!$(NC)"
	@echo "$(BLUE)App: http://localhost:3000$(NC)"
	@echo "$(BLUE)Health: http://localhost:3000/health$(NC)"

## down: Stop development environment
down:
	@echo "$(YELLOW)Stopping development environment...$(NC)"
	docker-compose down
	@echo "$(GREEN)Development environment stopped!$(NC)"

## restart: Restart development environment
restart:
	@echo "$(YELLOW)Restarting development environment...$(NC)"
	docker-compose restart
	@echo "$(GREEN)Development environment restarted!$(NC)"

## build: Rebuild development containers
build:
	@echo "$(GREEN)Building development containers...$(NC)"
	docker-compose up -d --build
	@echo "$(GREEN)Containers rebuilt!$(NC)"

## logs: View all logs
logs:
	docker-compose logs -f

## logs-app: View app logs only
logs-app:
	docker-compose logs -f app

## logs-postgres: View PostgreSQL logs
logs-postgres:
	docker-compose logs -f postgres

## logs-redis: View Redis logs
logs-redis:
	docker-compose logs -f redis

## up-prod: Start production environment
up-prod:
	@echo "$(GREEN)Starting production environment...$(NC)"
	docker-compose -f docker-compose.prod.yml up -d
	@echo "$(GREEN)Production environment started!$(NC)"

## down-prod: Stop production environment
down-prod:
	@echo "$(YELLOW)Stopping production environment...$(NC)"
	docker-compose -f docker-compose.prod.yml down
	@echo "$(GREEN)Production environment stopped!$(NC)"

## logs-prod: View production logs
logs-prod:
	docker-compose -f docker-compose.prod.yml logs -f

## build-prod: Build production containers
build-prod:
	@echo "$(GREEN)Building production containers...$(NC)"
	docker-compose -f docker-compose.prod.yml build
	@echo "$(GREEN)Production containers built!$(NC)"

## shell: Access app container shell
shell:
	@echo "$(BLUE)Accessing app container shell...$(NC)"
	docker-compose exec app sh

## db-shell: Access PostgreSQL shell
db-shell:
	@echo "$(BLUE)Accessing PostgreSQL shell...$(NC)"
	docker-compose exec postgres psql -U postgres -d tsnodebaseapi

## db-migrate: Run database migrations
db-migrate:
	@echo "$(GREEN)Running database migrations...$(NC)"
	docker-compose exec app npm run migration:run
	@echo "$(GREEN)Migrations completed!$(NC)"

## db-backup: Backup database
db-backup:
	@echo "$(GREEN)Backing up database...$(NC)"
	@mkdir -p backups
	docker-compose exec -T postgres pg_dump -U postgres tsnodebaseapi > backups/backup_$$(date +%Y%m%d_%H%M%S).sql
	@echo "$(GREEN)Database backed up to backups/backup_$$(date +%Y%m%d_%H%M%S).sql$(NC)"

## clean: Remove all containers and volumes (⚠️  Deletes all data)
clean:
	@echo "$(RED)⚠️  WARNING: This will delete all containers and volumes!$(NC)"
	@read -p "Are you sure? [y/N] " -n 1 -r; \
	echo; \
	if [[ $$REPLY =~ ^[Yy]$$ ]]; then \
		docker-compose down -v; \
		echo "$(GREEN)Cleaned up!$(NC)"; \
	else \
		echo "$(YELLOW)Cancelled.$(NC)"; \
	fi

## ps: Show running containers
ps:
	docker-compose ps

## health: Check application health
health:
	@echo "$(BLUE)Checking application health...$(NC)"
	@curl -s http://localhost:3000/health | jq '.' || echo "$(RED)Health check failed!$(NC)"

## install: Install a new npm package
install:
	@read -p "Enter package name: " package; \
	docker-compose exec app npm install $$package

## test: Run tests in container
test:
	@echo "$(GREEN)Running tests...$(NC)"
	docker-compose exec app npm test

## lint: Run linter
lint:
	@echo "$(GREEN)Running linter...$(NC)"
	docker-compose exec app npm run lint

## format: Format code
format:
	@echo "$(GREEN)Formatting code...$(NC)"
	docker-compose exec app npm run format
