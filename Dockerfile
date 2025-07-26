# Use official Node.js runtime as base image
FROM node:18-alpine AS base

# Set working directory
WORKDIR /app

# Install system dependencies for better performance and security
RUN apk add --no-cache \
    tini \
    curl \
    && rm -rf /var/cache/apk/*

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production && npm cache clean --force

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S taskmanager -u 1001

# Copy application files
COPY --chown=taskmanager:nodejs . .

# Remove unnecessary files
RUN rm -rf \
    .git \
    .gitignore \
    README.md \
    Dockerfile \
    docker-compose.yml \
    .env.example \
    node_modules/.cache \
    *.md

# Create directories for logs and data
RUN mkdir -p /app/logs /app/data && \
    chown -R taskmanager:nodejs /app/logs /app/data

# Set file permissions
RUN chmod -R 755 /app && \
    chmod -R 644 /app/*.js /app/*.html /app/*.css /app/*.json

# Switch to non-root user
USER taskmanager

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:3000/api/health || exit 1

# Use tini as init system for proper signal handling
ENTRYPOINT ["/sbin/tini", "--"]

# Start the application
CMD ["node", "server.js"]

# Multi-stage build for development
FROM base AS development

# Switch back to root to install dev dependencies
USER root

# Install development dependencies
RUN npm install

# Install development tools
RUN apk add --no-cache \
    git \
    bash \
    vim \
    && rm -rf /var/cache/apk/*

# Switch back to taskmanager user
USER taskmanager

# Override default command for development
CMD ["npm", "run", "dev"]

# Production stage
FROM base AS production

# Production is already set up in base stage
# Just ensure we're using the right user and command
USER taskmanager

# Labels for better container management
LABEL maintainer="your-email@example.com"
LABEL version="1.0.0"
LABEL description="Telegram Task Manager Mini App with Push Notifications"
LABEL org.opencontainers.image.title="Telegram Task Manager"
LABEL org.opencontainers.image.description="A beautiful Telegram mini app for team task management"
LABEL org.opencontainers.image.version="1.0.0"
LABEL org.opencontainers.image.vendor="Task Manager Team"
LABEL org.opencontainers.image.source="https://github.com/yourusername/telegram-task-manager"

# Set environment variables
ENV NODE_ENV=production
ENV PORT=3000
ENV LOG_LEVEL=info

# Final command
CMD ["node", "server.js"]