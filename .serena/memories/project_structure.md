# Project Structure

## Root Directory Layout
```
task-management-bot/
├── .serena/                  # Serena configuration
├── monitoring/               # Grafana/Prometheus configs
├── nginx/                    # Nginx configuration
├── node_modules/             # Node.js dependencies
├── scripts/                  # Setup and deployment scripts
├── .dockerignore            # Docker ignore file
├── .env                     # Environment variables (local)
├── .env.docker              # Docker environment template
├── .env.example             # Environment variables template
├── app.js                   # Main task management frontend logic
├── auth.js                  # Authentication management
├── config.js                # Configuration management
├── docker-compose.yml       # Docker services definition
├── Dockerfile               # Docker image definition
├── index.html               # Main HTML file
├── manifest.json            # PWA manifest
├── package.json             # Node.js project configuration
├── phone-verification.js    # Phone verification logic
├── push-notifications.js    # Notification services
├── realtime-sync.js         # Real-time synchronization
├── server.js                # Express server and webhook handler
├── styles.css               # CSS styling
├── telegram-bot.js          # Telegram Bot API wrapper
└── webhook-handler.js       # Webhook processing logic
```

## Key Frontend Files
- **index.html**: Main application entry point with Telegram Web App SDK
- **app.js**: Core task management functionality (TaskManager class)
- **auth.js**: User authentication and admin dashboard
- **styles.css**: Complete styling for mobile-first design

## Key Backend Files
- **server.js**: Express server with security middleware and API endpoints
- **telegram-bot.js**: Telegram Bot API integration
- **webhook-handler.js**: Processes incoming Telegram webhooks

## Configuration Files
- **config.js**: Centralized configuration management
- **docker-compose.yml**: Multi-service Docker setup with profiles
- **.env files**: Environment-specific configuration templates

## Documentation
- **README.md**: User-facing setup and usage guide
- **BOT_SETUP_GUIDE.md**: Telegram bot configuration steps
- **DEPLOYMENT.md**: Docker deployment instructions
- **SETUP_ADMIN.md**: Admin configuration guide