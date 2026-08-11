# Converty - Multi-stage Dockerfile for Next.js Static Export
# Optimized for production with minimal image size

# ============================================================================
# Stage 1: Dependencies
# ============================================================================
FROM docker.io/library/node:24-alpine AS deps
WORKDIR /app

# Install dependencies needed for node-gyp (if any native modules)
RUN apk add --no-cache libc6-compat

# Copy package files
COPY package.json package-lock.json* ./

# Install all dependencies (including devDependencies for build)
RUN npm ci && npm cache clean --force

# ============================================================================
# Stage 2: Builder
# ============================================================================
FROM docker.io/library/node:24-alpine AS builder
WORKDIR /app

# Copy dependencies from deps stage
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Disable telemetry during build
ENV NEXT_TELEMETRY_DISABLED=1

# Build the static export
RUN npm run build

# ============================================================================
# Stage 3: Runner (Production) - Using nginx for static files
# ============================================================================
FROM docker.io/library/nginx:alpine AS runner

# Copy custom nginx configuration
COPY nginx.conf /etc/nginx/nginx.conf

# Copy static files from builder
COPY --from=builder /app/out /usr/share/nginx/html

# Create cache and run directories for non-root nginx
RUN mkdir -p /var/cache/nginx /var/run && \
    chown -R nginx:nginx /var/cache/nginx /var/run /usr/share/nginx/html && \
    chmod -R 755 /var/cache/nginx /var/run

# Switch to non-root user
USER nginx

# Add healthcheck (using port 8080 for non-root)
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:8080/ || exit 1

# Expose non-privileged port
EXPOSE 8080

# Run nginx as non-root user
CMD ["nginx", "-g", "daemon off;"]
