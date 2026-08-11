.PHONY: all help install dev build start lint lint-fix lint-biome type-check test test-watch test-coverage \
        clean clean-all format format-check biome-check biome-fix analyze deps-update deps-audit deps-outdated \
        docker-build docker-run docker-stop docker-push docker-compose-up docker-compose-down \
        export static-serve release version-patch version-minor version-major \
        check ci pre-commit info routes \
        security security-lint security-audit security-trivy security-all \
        i18n-check i18n-sync routes-manifest sitemap i18n-routes

# Project configuration
PROJECT_NAME := converty
DOCKER_IMAGE := $(PROJECT_NAME)
DOCKER_TAG := latest
PORT := 3000
DOCKER_PORT := 3000

# Colors for output
CYAN := \033[0;36m
GREEN := \033[0;32m
YELLOW := \033[0;33m
RED := \033[0;31m
NC := \033[0m # No Color

# Default target
all: install lint type-check build

# ============================================================================
# HELP
# ============================================================================
help:
	@echo "$(CYAN)╔════════════════════════════════════════════════════════════════════╗$(NC)"
	@echo "$(CYAN)║          Converty - Web Calculator & Converter Collection          ║$(NC)"
	@echo "$(CYAN)╚════════════════════════════════════════════════════════════════════╝$(NC)"
	@echo ""
	@echo "$(GREEN)Development:$(NC)"
	@echo "  make install        Install dependencies"
	@echo "  make dev            Start development server (port $(PORT))"
	@echo "  make build          Build for production"
	@echo "  make start          Start production server"
	@echo "  make export         Export static site to ./out"
	@echo "  make static-serve   Serve static export locally"
	@echo ""
	@echo "$(GREEN)Code Quality:$(NC)"
	@echo "  make lint           Run ESLint"
	@echo "  make lint-fix       Run ESLint with auto-fix"
	@echo "  make lint-biome     Run Biome linter"
	@echo "  make type-check     Run TypeScript type checking"
	@echo "  make format         Format code with Biome"
	@echo "  make format-check   Check formatting without writing"
	@echo "  make biome-check    Run Biome check (lint + format)"
	@echo "  make biome-fix      Fix issues with Biome"
	@echo "  make check          Run all quality checks (lint + biome + types)"
	@echo "  make pre-commit     Run pre-commit checks"
	@echo ""
	@echo "$(GREEN)Testing:$(NC)"
	@echo "  make test           Run tests"
	@echo "  make test-watch     Run tests in watch mode"
	@echo "  make test-coverage  Run tests with coverage report"
	@echo ""
	@echo "$(GREEN)Docker:$(NC)"
	@echo "  make docker-build   Build Docker image"
	@echo "  make docker-run     Run Docker container (port $(DOCKER_PORT))"
	@echo "  make docker-stop    Stop Docker container"
	@echo "  make docker-push    Push Docker image to registry"
	@echo "  make docker-compose-up    Start with docker-compose"
	@echo "  make docker-compose-down  Stop docker-compose services"
	@echo ""
	@echo "$(GREEN)Security:$(NC)"
	@echo "  make security       Run all security checks"
	@echo "  make security-lint  Run Biome security linting"
	@echo "  make security-audit Run npm audit"
	@echo "  make security-trivy Run Trivy filesystem scan (requires trivy)"
	@echo ""
	@echo "$(GREEN)Dependencies:$(NC)"
	@echo "  make deps-update    Update all dependencies"
	@echo "  make deps-audit     Security audit of dependencies"
	@echo "  make deps-outdated  Check for outdated packages"
	@echo ""
	@echo "$(GREEN)Release:$(NC)"
	@echo "  make version-patch  Bump patch version (1.0.x)"
	@echo "  make version-minor  Bump minor version (1.x.0)"
	@echo "  make version-major  Bump major version (x.0.0)"
	@echo "  make release        Create release (build + tag)"
	@echo ""
	@echo "$(GREEN)I18N & Routes:$(NC)"
	@echo "  make i18n-check     Check for missing translation keys"
	@echo "  make i18n-sync      Verify translations match across locales"
	@echo "  make routes         List all application routes"
	@echo "  make routes-manifest Generate routes.json manifest"
	@echo "  make sitemap        Generate sitemap.xml"
	@echo "  make i18n-routes    Run full i18n and routes check"
	@echo ""
	@echo "$(GREEN)Utilities:$(NC)"
	@echo "  make clean          Remove build artifacts"
	@echo "  make clean-all      Remove all generated files + node_modules"
	@echo "  make analyze        Analyze bundle size"
	@echo "  make info           Show project information"
	@echo "  make ci             Run full CI pipeline"
	@echo ""

# ============================================================================
# DEVELOPMENT
# ============================================================================

# Install dependencies
install:
	@echo "$(CYAN)Installing dependencies...$(NC)"
	npm install
	@echo "$(GREEN)✓ Dependencies installed$(NC)"

# Install dependencies (CI mode - frozen lockfile)
install-ci:
	@echo "$(CYAN)Installing dependencies (CI mode)...$(NC)"
	npm ci
	@echo "$(GREEN)✓ Dependencies installed$(NC)"

# Start development server
dev:
	@echo "$(CYAN)Starting development server on port $(PORT)...$(NC)"
	npm run dev

# Start development server with turbopack
dev-turbo:
	@echo "$(CYAN)Starting development server with Turbopack...$(NC)"
	npm run dev -- --turbopack

# Build for production
build:
	@echo "$(CYAN)Building for production...$(NC)"
	npm run build
	@echo "$(GREEN)✓ Build complete$(NC)"

# Start production server
start:
	@echo "$(CYAN)Starting production server on port $(PORT)...$(NC)"
	npm run start

# Export static site
export: build
	@echo "$(CYAN)Exporting static site...$(NC)"
	@if [ -d "out" ]; then \
		echo "$(GREEN)✓ Static export available in ./out$(NC)"; \
	else \
		echo "$(YELLOW)Note: Add 'output: export' to next.config.ts for static export$(NC)"; \
	fi

# Serve static export
static-serve:
	@echo "$(CYAN)Serving static export on http://localhost:8080...$(NC)"
	@if [ -d "out" ]; then \
		npx serve out -p 8080; \
	else \
		echo "$(RED)Error: No static export found. Run 'make export' first$(NC)"; \
	fi

# ============================================================================
# CODE QUALITY
# ============================================================================

# Run linter
lint:
	@echo "$(CYAN)Running ESLint...$(NC)"
	npm run lint
	@echo "$(GREEN)✓ Lint passed$(NC)"

# Run linter with auto-fix
lint-fix:
	@echo "$(CYAN)Running ESLint with auto-fix...$(NC)"
	npm run lint -- --fix
	@echo "$(GREEN)✓ Lint fix complete$(NC)"

# Run TypeScript type checking
type-check:
	@echo "$(CYAN)Running TypeScript type check...$(NC)"
	npx tsc --noEmit
	@echo "$(GREEN)✓ Type check passed$(NC)"

# Format code with Biome
format:
	@echo "$(CYAN)Formatting code with Biome...$(NC)"
	npm run format
	@echo "$(GREEN)✓ Formatting complete$(NC)"

# Check formatting without writing
format-check:
	@echo "$(CYAN)Checking code formatting...$(NC)"
	npm run format:check
	@echo "$(GREEN)✓ Format check complete$(NC)"

# Run Biome lint
lint-biome:
	@echo "$(CYAN)Running Biome lint...$(NC)"
	npm run lint:biome
	@echo "$(GREEN)✓ Biome lint passed$(NC)"

# Run Biome check (lint + format)
biome-check:
	@echo "$(CYAN)Running Biome check...$(NC)"
	npm run check
	@echo "$(GREEN)✓ Biome check passed$(NC)"

# Fix issues with Biome
biome-fix:
	@echo "$(CYAN)Fixing issues with Biome...$(NC)"
	npm run check:fix
	@echo "$(GREEN)✓ Biome fix complete$(NC)"

# Run all quality checks
check: lint lint-biome type-check
	@echo "$(GREEN)✓ All quality checks passed$(NC)"

# Pre-commit checks
pre-commit: lint type-check
	@echo "$(GREEN)✓ Pre-commit checks passed$(NC)"

# ============================================================================
# TESTING
# ============================================================================

# Run tests
test:
	@echo "$(CYAN)Running tests...$(NC)"
	@if [ -f "jest.config.js" ] || [ -f "jest.config.ts" ] || grep -q '"test"' package.json; then \
		npm test; \
	else \
		echo "$(YELLOW)No test configuration found. Add Jest or Vitest to enable testing.$(NC)"; \
	fi

# Run tests in watch mode
test-watch:
	@echo "$(CYAN)Running tests in watch mode...$(NC)"
	npm test -- --watch

# Run tests with coverage
test-coverage:
	@echo "$(CYAN)Running tests with coverage...$(NC)"
	npm test -- --coverage
	@echo "$(GREEN)✓ Coverage report generated$(NC)"

# ============================================================================
# DOCKER
# ============================================================================

# Build Docker image
docker-build:
	@echo "$(CYAN)Building Docker image $(DOCKER_IMAGE):$(DOCKER_TAG)...$(NC)"
	docker build -t $(DOCKER_IMAGE):$(DOCKER_TAG) .
	@echo "$(GREEN)✓ Docker image built$(NC)"

# Run Docker container
docker-run:
	@echo "$(CYAN)Running Docker container on port $(DOCKER_PORT)...$(NC)"
	docker run -d --name $(PROJECT_NAME) -p $(DOCKER_PORT):8080 $(DOCKER_IMAGE):$(DOCKER_TAG)
	@echo "$(GREEN)✓ Container running at http://localhost:$(DOCKER_PORT)$(NC)"

# Stop Docker container
docker-stop:
	@echo "$(CYAN)Stopping Docker container...$(NC)"
	docker stop $(PROJECT_NAME) || true
	docker rm $(PROJECT_NAME) || true
	@echo "$(GREEN)✓ Container stopped$(NC)"

# Push Docker image to registry
docker-push:
	@echo "$(CYAN)Pushing Docker image to registry...$(NC)"
	docker push $(DOCKER_IMAGE):$(DOCKER_TAG)
	@echo "$(GREEN)✓ Image pushed$(NC)"

# Build and run Docker
docker-up: docker-build docker-run

# Stop and remove Docker
docker-down: docker-stop

# Docker compose up
docker-compose-up:
	@echo "$(CYAN)Starting docker-compose services...$(NC)"
	docker-compose up -d
	@echo "$(GREEN)✓ Services started$(NC)"

# Docker compose down
docker-compose-down:
	@echo "$(CYAN)Stopping docker-compose services...$(NC)"
	docker-compose down
	@echo "$(GREEN)✓ Services stopped$(NC)"

# ============================================================================
# DEPENDENCIES
# ============================================================================

# Update all dependencies
deps-update:
	@echo "$(CYAN)Updating dependencies...$(NC)"
	npm update
	@echo "$(GREEN)✓ Dependencies updated$(NC)"

# Update all dependencies to latest (including major versions)
deps-upgrade:
	@echo "$(CYAN)Upgrading all dependencies to latest...$(NC)"
	npx npm-check-updates -u
	npm install
	@echo "$(GREEN)✓ Dependencies upgraded$(NC)"

# Security audit
deps-audit:
	@echo "$(CYAN)Running security audit...$(NC)"
	npm audit
	@echo "$(GREEN)✓ Audit complete$(NC)"

# Fix security vulnerabilities
deps-audit-fix:
	@echo "$(CYAN)Fixing security vulnerabilities...$(NC)"
	npm audit fix
	@echo "$(GREEN)✓ Audit fix complete$(NC)"

# Check for outdated packages
deps-outdated:
	@echo "$(CYAN)Checking for outdated packages...$(NC)"
	npm outdated || true

# ============================================================================
# SECURITY
# ============================================================================

# Run Biome security linting
security-lint:
	@echo "$(CYAN)Running Biome security lint...$(NC)"
	npx biome lint src/
	@echo "$(GREEN)✓ Security lint complete$(NC)"

# Run npm security audit
security-audit:
	@echo "$(CYAN)Running npm security audit...$(NC)"
	npm audit --audit-level=moderate
	@echo "$(GREEN)✓ Security audit complete$(NC)"

# Run Trivy filesystem scan (requires trivy installed)
security-trivy:
	@echo "$(CYAN)Running Trivy filesystem scan...$(NC)"
	@if command -v trivy >/dev/null 2>&1; then \
		trivy fs --severity HIGH,CRITICAL --scanners vuln,secret,misconfig .; \
		echo "$(GREEN)✓ Trivy scan complete$(NC)"; \
	else \
		echo "$(YELLOW)Trivy not installed. Install with: brew install trivy$(NC)"; \
		echo "$(YELLOW)Or run: docker run --rm -v $(PWD):/src aquasec/trivy fs /src$(NC)"; \
	fi

# Run Trivy on Docker image
security-docker:
	@echo "$(CYAN)Running Trivy Docker image scan...$(NC)"
	@if command -v trivy >/dev/null 2>&1; then \
		docker build -t $(DOCKER_IMAGE):scan . && \
		trivy image --severity HIGH,CRITICAL $(DOCKER_IMAGE):scan; \
		echo "$(GREEN)✓ Docker security scan complete$(NC)"; \
	else \
		echo "$(YELLOW)Trivy not installed. Install with: brew install trivy$(NC)"; \
	fi

# Run all security checks
security: security-lint security-audit
	@echo "$(GREEN)✓ All security checks complete$(NC)"

# Run comprehensive security scan (including Trivy)
security-all: security-lint security-audit security-trivy
	@echo "$(GREEN)✓ Comprehensive security scan complete$(NC)"

# Clean install (remove node_modules and reinstall)
deps-clean:
	@echo "$(CYAN)Performing clean install...$(NC)"
	rm -rf node_modules package-lock.json
	npm install
	@echo "$(GREEN)✓ Clean install complete$(NC)"

# ============================================================================
# RELEASE & VERSIONING
# ============================================================================

# Bump patch version (1.0.x)
version-patch:
	@echo "$(CYAN)Bumping patch version...$(NC)"
	npm version patch --no-git-tag-version
	@echo "$(GREEN)✓ Version bumped$(NC)"

# Bump minor version (1.x.0)
version-minor:
	@echo "$(CYAN)Bumping minor version...$(NC)"
	npm version minor --no-git-tag-version
	@echo "$(GREEN)✓ Version bumped$(NC)"

# Bump major version (x.0.0)
version-major:
	@echo "$(CYAN)Bumping major version...$(NC)"
	npm version major --no-git-tag-version
	@echo "$(GREEN)✓ Version bumped$(NC)"

# Create release
release: check build
	@echo "$(CYAN)Creating release...$(NC)"
	@VERSION=$$(node -p "require('./package.json').version"); \
	git add -A; \
	git commit -m "Release v$$VERSION" || true; \
	git tag -a "v$$VERSION" -m "Release v$$VERSION"; \
	echo "$(GREEN)✓ Release v$$VERSION created$(NC)"; \
	echo "$(YELLOW)Run 'git push && git push --tags' to publish$(NC)"

# ============================================================================
# UTILITIES
# ============================================================================

# Clean build artifacts
clean:
	@echo "$(CYAN)Cleaning build artifacts...$(NC)"
	rm -rf .next
	rm -rf out
	rm -rf node_modules/.cache
	rm -rf coverage
	rm -rf .turbo
	rm -rf tsconfig.tsbuildinfo
	@echo "$(GREEN)✓ Cleaned build artifacts$(NC)"

# Clean everything including node_modules
clean-all: clean
	@echo "$(CYAN)Removing node_modules...$(NC)"
	rm -rf node_modules
	@echo "$(GREEN)✓ Full clean complete$(NC)"

# Full rebuild
rebuild: clean install build

# Analyze bundle size
analyze:
	@echo "$(CYAN)Analyzing bundle size...$(NC)"
	@if grep -q "@next/bundle-analyzer" package.json; then \
		ANALYZE=true npm run build; \
	else \
		echo "$(YELLOW)Install @next/bundle-analyzer for bundle analysis:$(NC)"; \
		echo "  npm install -D @next/bundle-analyzer"; \
	fi

# Show project information
info:
	@echo "$(CYAN)╔════════════════════════════════════════════════════════════════════╗$(NC)"
	@echo "$(CYAN)║                      Project Information                           ║$(NC)"
	@echo "$(CYAN)╚════════════════════════════════════════════════════════════════════╝$(NC)"
	@echo ""
	@echo "$(GREEN)Project:$(NC) $(PROJECT_NAME)"
	@echo "$(GREEN)Version:$(NC) $$(node -p "require('./package.json').version")"
	@echo "$(GREEN)Node:$(NC) $$(node --version)"
	@echo "$(GREEN)NPM:$(NC) $$(npm --version)"
	@echo "$(GREEN)Next.js:$(NC) $$(node -p "require('./package.json').dependencies.next")"
	@echo "$(GREEN)React:$(NC) $$(node -p "require('./package.json').dependencies.react")"
	@echo ""
	@echo "$(GREEN)Directory:$(NC) $$(pwd)"
	@echo "$(GREEN)Size:$(NC) $$(du -sh . 2>/dev/null | cut -f1)"
	@echo ""

# List all routes
routes:
	@echo "$(CYAN)Available Routes:$(NC)"
	@echo ""
	@find src/app -name "page.tsx" | sed 's|src/app||g' | sed 's|/page.tsx||g' | sed 's|^$$|/|' | sort

# Count lines of code
loc:
	@echo "$(CYAN)Lines of Code:$(NC)"
	@find src -name "*.ts" -o -name "*.tsx" | xargs wc -l | tail -1

# ============================================================================
# CI/CD
# ============================================================================

# Run full CI pipeline
ci: install-ci lint type-check build
	@echo "$(GREEN)✓ CI pipeline complete$(NC)"

# GitHub Actions local test (requires act)
ci-local:
	@echo "$(CYAN)Running CI locally with act...$(NC)"
	@if command -v act > /dev/null 2>&1; then \
		act; \
	else \
		echo "$(YELLOW)Install 'act' to run GitHub Actions locally:$(NC)"; \
		echo "  brew install act"; \
	fi

# ============================================================================
# DEPLOYMENT
# ============================================================================

# Deploy to Vercel (if configured)
deploy-vercel:
	@echo "$(CYAN)Deploying to Vercel...$(NC)"
	@if command -v vercel > /dev/null 2>&1; then \
		vercel --prod; \
	else \
		echo "$(YELLOW)Install Vercel CLI: npm i -g vercel$(NC)"; \
	fi

# Deploy preview to Vercel
deploy-preview:
	@echo "$(CYAN)Deploying preview to Vercel...$(NC)"
	@if command -v vercel > /dev/null 2>&1; then \
		vercel; \
	else \
		echo "$(YELLOW)Install Vercel CLI: npm i -g vercel$(NC)"; \
	fi

# Deploy to Netlify (if configured)
deploy-netlify:
	@echo "$(CYAN)Deploying to Netlify...$(NC)"
	@if command -v netlify > /dev/null 2>&1; then \
		netlify deploy --prod; \
	else \
		echo "$(YELLOW)Install Netlify CLI: npm i -g netlify-cli$(NC)"; \
	fi

# ============================================================================
# I18N & ROUTES
# ============================================================================

# Check for missing translation keys (fast - no build required)
i18n-check:
	@echo "$(CYAN)Checking for missing translation keys...$(NC)"
	@node scripts/check-i18n.js
	@echo "$(GREEN)✓ Translation check complete$(NC)"

# Verify translations match across all locales
i18n-sync:
	@echo "$(CYAN)Checking translation sync across locales...$(NC)"
	@node scripts/check-i18n.js --sync
	@echo "$(GREEN)✓ Translation sync check complete$(NC)"

# Generate routes manifest (JSON file with all routes)
routes-manifest:
	@echo "$(CYAN)Generating routes manifest...$(NC)"
	@node scripts/generate-routes.js
	@echo "$(GREEN)✓ Routes manifest generated at routes.json$(NC)"

# Generate sitemap.xml for all routes and locales
sitemap:
	@echo "$(CYAN)Generating sitemap...$(NC)"
	@node scripts/generate-sitemap.js
	@echo "$(GREEN)✓ Sitemap generated at public/sitemap.xml$(NC)"

# Full i18n and routes check
i18n-routes: i18n-check routes-manifest
	@echo "$(GREEN)✓ i18n and routes check complete$(NC)"

# ============================================================================
# SHORTCUTS
# ============================================================================

# Quick development start
d: dev
b: build
s: start
l: lint
t: test
c: check
i: install
h: help
