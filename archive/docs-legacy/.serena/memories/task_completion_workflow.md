# Task Completion Workflow

## When a Task is Completed

### 1. Code Quality Checks
```bash
# Run linting to ensure code style compliance
npm run lint

# Fix any linting issues automatically if possible
npm run lint -- --fix
```

### 2. Testing
```bash
# Run all tests
npm test

# For integration testing (if implemented)
npm run test:integration
```

### 3. Local Development Testing
```bash
# Test static version
npm run dev:static

# Test with full server
npm run dev

# Test Docker build locally
npm run docker:build
npm run docker:run
```

### 4. Environment Configuration
- Ensure `.env` file is properly configured for target environment
- Verify all required environment variables are set
- Test with both development and production configurations

### 5. Docker Deployment Testing
```bash
# Full docker-compose testing
npm run docker:compose

# Check service health
npm run docker:logs

# Test webhook functionality if Telegram bot is configured
./scripts/setup.sh setup-webhook
```

### 6. Documentation Updates
- Update README.md if new features were added
- Update setup guides if configuration changed
- Update Docker compose files if services were modified

### 7. Backup and Cleanup
```bash
# Create backup if working with production data
./scripts/setup.sh backup

# Clean up unused Docker resources
./scripts/setup.sh clean
```

## Pre-Deployment Checklist
- [ ] Environment variables properly set
- [ ] Telegram bot token configured
- [ ] Webhook URL accessible
- [ ] SSL certificates in place (for production)
- [ ] Docker services start without errors
- [ ] Admin user configured
- [ ] Database migrations applied (if applicable)