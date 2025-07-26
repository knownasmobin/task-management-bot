# Telegram Task Manager - Docker Deployment Guide

This guide will help you deploy the Task Manager Mini App using Docker.

## Prerequisites

- Docker (version 20.10+)
- Docker Compose (version 2.0+)
- A Telegram Bot Token from [@BotFather](https://t.me/botfather)
- A domain name (for production deployment with HTTPS)

## Quick Start

1. **Clone and setup the project:**
   ```bash
   git clone <your-repo-url>
   cd task-management-bot
   ```

2. **Configure environment:**
   ```bash
   cp .env.docker .env
   # Edit .env file with your configuration
   ```

3. **Start the application:**
   ```bash
   ./scripts/setup.sh start
   ```

## Configuration

### Environment Variables

Edit the `.env` file with your specific configuration:

#### Required Variables
- `TELEGRAM_BOT_TOKEN` - Your bot token from BotFather
- `ADMIN_TELEGRAM_ID` - Your Telegram user ID (admin)
- `JWT_SECRET` - A secure random string for JWT tokens
- `ENCRYPTION_KEY` - A 32-character encryption key
- `APP_URL` - Your app's public URL
- `WEBHOOK_URL` - Webhook endpoint URL

#### Optional Variables
- `DB_PASSWORD` - PostgreSQL password (if using database)
- `REDIS_PASSWORD` - Redis password (if using Redis)
- `GRAFANA_PASSWORD` - Grafana admin password

### SSL Certificates

For production, place your SSL certificates in the `nginx/ssl/` directory:
- `cert.pem` - SSL certificate
- `key.pem` - Private key

For development, self-signed certificates will be generated automatically.

## Deployment Options

### 1. Basic Deployment (Main App Only)
```bash
./scripts/setup.sh start task-manager
```

### 2. Full Production Stack
```bash
./scripts/setup.sh start
```
Includes: Main app, Nginx reverse proxy, Redis, PostgreSQL

### 3. Development Environment
```bash
./scripts/setup.sh start-dev
```
Features hot reload and debugging support

### 4. With Monitoring
```bash
./scripts/setup.sh start-monitoring
```
Includes Prometheus and Grafana for monitoring

## Service Management

### Start Services
```bash
# Start all services
./scripts/setup.sh start

# Start specific service
./scripts/setup.sh start task-manager
```

### Stop Services
```bash
# Stop all services
./scripts/setup.sh stop

# Stop specific service
./scripts/setup.sh stop postgres
```

### View Logs
```bash
# View all logs
./scripts/setup.sh logs

# View specific service logs
./scripts/setup.sh logs task-manager
```

### Check Status
```bash
./scripts/setup.sh status
```

## Telegram Bot Setup

1. **Create a bot with BotFather:**
   - Message [@BotFather](https://t.me/botfather)
   - Use `/newbot` command
   - Follow the instructions and get your bot token

2. **Configure the bot:**
   - Set your bot token in `.env` file
   - Set webhook URL pointing to your domain

3. **Setup webhook:**
   ```bash
   ./scripts/setup.sh setup-webhook
   ```

## Monitoring and Maintenance

### Health Checks
All services include health checks:
- Main app: `http://your-domain.com/api/health`
- Database: Automatic connection checks
- Redis: Ping checks
- Nginx: Status endpoint

### Monitoring Dashboard
If using monitoring profile:
- Grafana: `http://your-domain.com:3001`
- Prometheus: `http://your-domain.com:9090`

### Logs
Logs are stored in the `logs/` directory:
- Application logs: `logs/app.log`
- Nginx logs: `logs/nginx/`

### Backups
```bash
# Create backup
./scripts/setup.sh backup
```
Backups are stored in the `backups/` directory.

## Scaling and Performance

### Resource Limits
The Docker setup includes resource limits:
- Main app: 512MB RAM limit
- Database: 1GB RAM limit
- Redis: 256MB RAM limit

### Horizontal Scaling
To scale the main application:
```bash
docker-compose up -d --scale task-manager=3
```

## Security Considerations

1. **Environment Variables:**
   - Never commit `.env` file to version control
   - Use strong, unique passwords and secrets
   - Rotate keys periodically

2. **Network Security:**
   - Services communicate through internal Docker network
   - Only necessary ports are exposed
   - Nginx handles SSL termination

3. **Database Security:**
   - Database credentials are environment-specific
   - Connection encryption enabled
   - Regular backups recommended

## Troubleshooting

### Common Issues

1. **Bot not responding:**
   - Check webhook setup: `./scripts/setup.sh setup-webhook`
   - Verify bot token and webhook URL
   - Check application logs: `./scripts/setup.sh logs task-manager`

2. **SSL Certificate errors:**
   - Ensure certificates are in `nginx/ssl/` directory
   - Check certificate validity
   - For development, self-signed certs are auto-generated

3. **Database connection issues:**
   - Verify database service is running: `docker-compose ps postgres`
   - Check database credentials in `.env`
   - Review database logs: `./scripts/setup.sh logs postgres`

4. **Memory issues:**
   - Monitor resource usage: `docker stats`
   - Adjust resource limits in `docker-compose.yml`
   - Consider scaling services

### Debug Mode
For detailed debugging:
```bash
# Set debug log level
echo "LOG_LEVEL=debug" >> .env

# Restart services
./scripts/setup.sh restart task-manager
```

### Clean Installation
To start fresh:
```bash
./scripts/setup.sh clean
./scripts/setup.sh start
```

## Production Deployment Checklist

- [ ] Domain name configured and pointing to your server
- [ ] SSL certificates installed
- [ ] Environment variables properly configured
- [ ] Telegram bot created and webhook configured
- [ ] Admin user configured in `.env`
- [ ] Database password set (if using PostgreSQL)
- [ ] Firewall rules configured (ports 80, 443)
- [ ] Monitoring enabled (optional)
- [ ] Backup strategy implemented
- [ ] Log rotation configured

## Support

For issues and support:
1. Check the logs: `./scripts/setup.sh logs`
2. Review this documentation
3. Check Docker service status: `./scripts/setup.sh status`
4. Create an issue in the project repository

## File Structure

```
task-management-bot/
├── docker-compose.yml          # Main Docker Compose configuration
├── Dockerfile                  # Application Docker image
├── .env.docker                # Environment template
├── scripts/
│   ├── setup.sh               # Deployment script
│   └── init-db.sql            # Database initialization
├── nginx/
│   ├── nginx.conf             # Nginx configuration
│   └── ssl/                   # SSL certificates directory
├── monitoring/
│   ├── prometheus.yml         # Prometheus configuration
│   └── grafana/               # Grafana dashboards and datasources
├── logs/                      # Application logs
├── data/                      # Persistent data
└── backups/                   # Backup files
```