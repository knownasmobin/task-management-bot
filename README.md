# Task Management Bot (All-in-One)

[![CI](https://github.com/knownasmobin/task-management-bot/actions/workflows/ci.yml/badge.svg)](https://github.com/knownasmobin/task-management-bot/actions/workflows/ci.yml) [![Coverage](https://img.shields.io/badge/coverage-39%25-orange.svg)](https://github.com/knownasmobin/task-management-bot/actions/workflows/ci.yml) [![GHCR](https://img.shields.io/badge/ghcr.io-image-blue)](https://ghcr.io/knownasmobin/task-management-bot)

This file replaces all separate docs. Everything you need is here.

# Task Management Bot – One README for Everyone

This single page is all you need. It explains what the app is, how to run it, how to set up the Telegram bot, how to deploy with Docker, and how to get help.

## What this is (plain English)
- A Telegram Mini App to manage team tasks.
- Works in Telegram’s in-app browser with a simple Node.js server.
- Sends native Telegram notifications when users aren’t in the app.

## Quick start (Windows)
1) Install: Node.js 18+ and Git. Optional: Docker Desktop.
2) Clone and open the repo.
3) Copy environment file if present, then fill required values.
4) Install and run the server.

Commands:
```powershell
# From repo root
if (Test-Path .env.example) { copy .env.example .env }
npm install
npm run dev
# Open http://localhost:3000 (server) or http://localhost:8080 (static dev)
```

To use the built-in checker:
```powershell
pwsh .\scripts\check-code.ps1
```

## Configure Telegram bot (simple)
1) Message @BotFather → /newbot → save the token.
2) Optional mini-app: /newapp and set your web app URL.
3) Put these in .env:
```
TELEGRAM_BOT_TOKEN=123:abc
APP_URL=https://your-domain-or-local-tunnel
TELEGRAM_WEBHOOK_SECRET=your-random-secret
```
4) Start the app and set webhook (see TELEGRAM_BOT_SETUP section below if needed).

## Use the app
- Open the URL printed in the terminal.
- Add tasks, assign to members, mark done.
- If the Telegram bot is configured, users will receive native push messages.

## Common commands
```powershell
npm run dev       # start server with nodemon
npm run dev:static# serve static files at :8080
npm test          # run tests (if/when added)
npm run lint      # lint code
```

## Configuration (env)
- TELEGRAM_BOT_TOKEN: Bot token from @BotFather (required for notifications/webhook)
- APP_URL: Public base URL (required in production; used in inline buttons)
- TELEGRAM_WEBHOOK_SECRET: Any random string to verify Telegram webhook
- PORT: Server port (default 3000)
- ALLOWED_ORIGINS: Comma-separated CORS origins (default *)

## Deploy with Docker (optional)
```powershell
./scripts/setup.sh start        # full stack (if you use Docker scripts)
./scripts/setup.sh start-dev    # local dev with Docker
./scripts/setup.sh setup-webhook# sets Telegram webhook
```
See docker tips previously in DEPLOYMENT; the merge script has archived originals.

You can also pull the prebuilt image from GitHub Container Registry after the first CI run:
```powershell
docker pull ghcr.io/knownasmobin/task-management-bot:latest
docker run -p 3000:3000 --env-file .env ghcr.io/knownasmobin/task-management-bot:latest
```

## Telegram webhook basics
- Exposes POST /webhook in server.js.
- Verifies x-telegram-bot-api-secret-token when TELEGRAM_WEBHOOK_SECRET is set.
- To set webhook (example call):
```
curl -X POST "https://api.telegram.org/bot{TOKEN}/setWebhook" \
   -H "Content-Type: application/json" \
   -d '{"url":"https://your-domain.com/webhook","secret_token":"YOURSECRET","allowed_updates":["message","callback_query","web_app_data"]}'
```

## Project structure (short)
- index.html, styles.css, app.js: mini app UI.
- server.js: Express server + webhook endpoint + health routes.
- telegram-bot.js: Sends messages and handles callbacks.
- push-notifications.js: Client-side notifications using the bot.
- auth.js: Login + contact sharing flow.
- services/* and models/*: app logic.
- scripts/: helpers (check-code, merge-docs, validate-docs).

## Keep docs in one file
- All docs are now here (README.md).
- Legacy markdown files were merged. To re-merge or archive again:
```powershell
pwsh .\scripts\merge-docs.ps1 -Output README.md -Archive
pwsh .\scripts\validate-docs.ps1
```

## Troubleshooting
- Port busy → set PORT in .env to another number.
- Webhook 401 → secret mismatch; check TELEGRAM_WEBHOOK_SECRET.
- No Telegram messages → ensure user started the bot and you use the right chat_id.
- Windows scripts blocked →
```powershell
Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned
```

## License
MIT. Keep a LICENSE file if you already have one.

---

Built for Telegram teams. If anything is unclear, it’s a bug—open an issue.

---
## Source: .serena\memories\code_style_conventions.md

# Code Style and Conventions

## JavaScript Style
- **ES6+ Features**: Use modern JavaScript (classes, arrow functions, async/await)
- **Class-based Architecture**: Main functionality organized in classes (e.g., `TaskManager`, `AuthManager`)
- **Naming Conventions**:
  - Classes: PascalCase (`TaskManager`, `AuthManager`)
  - Variables/Functions: camelCase (`currentUser`, `showTaskModal`)
  - Constants: UPPER_SNAKE_CASE (`TELEGRAM_BOT_TOKEN`)
  - DOM IDs: camelCase (`taskModal`, `addTaskBtn`)

## Code Organization
- **Modular Structure**: Separate files for different concerns
  - `app.js` - Main task management logic
  - `auth.js` - Authentication handling
  - `config.js` - Configuration management
  - `realtime-sync.js` - Real-time synchronization
  - `push-notifications.js` - Notification services
- **Global Variables**: Minimal use, mainly for service instances
- **Event Handling**: Event delegation and clean separation of concerns

## HTML/CSS Conventions
- **Semantic HTML**: Proper use of semantic elements
- **BEM-like CSS**: Component-based class naming
- **Mobile-first**: Responsive design for Telegram mobile clients
- **CSS Custom Properties**: Used for theming and consistent styling

## Documentation Style
- **Inline Comments**: Explain complex logic and business rules
- **Function Documentation**: Brief descriptions for public methods
- **Configuration Comments**: Clear explanations in config files

## Error Handling
- **Graceful Degradation**: Fallbacks for missing Telegram features
- **User Feedback**: Toast notifications for user actions
- **Defensive Programming**: Check for null/undefined values

---
## Source: .serena\memories\development_guidelines.md

# Development Guidelines and Design Patterns

## Design Patterns Used

### 1. Class-based Architecture
- **TaskManager**: Main application controller
- **AuthManager**: Handles authentication and user management
- **RealTimeSync**: Manages real-time data synchronization
- **PushNotificationService**: Handles Telegram notifications
- **Config**: Centralized configuration management

### 2. Event-Driven Architecture
- DOM event listeners for user interactions
- Custom event system for component communication
- Webhook-based external integration with Telegram

### 3. Service Layer Pattern
- Separate services for different concerns (auth, notifications, sync)
- Loose coupling between UI components and business logic
- Dependency injection for service instances

## Development Guidelines

### Frontend Development
- **Progressive Enhancement**: Works without Telegram SDK (graceful fallback)
- **Mobile-First**: Designed primarily for Telegram mobile clients
- **State Management**: Use class properties for component state
- **Local Storage**: Primary data persistence mechanism
- **Error Boundaries**: Comprehensive error handling with user feedback

### Backend Development
- **Security First**: Helmet middleware, rate limiting, CORS configuration
- **Webhook Validation**: Proper Telegram webhook signature verification
- **Environment-based Configuration**: All sensitive data in environment variables
- **Health Checks**: Proper health check endpoints for monitoring

### Integration Patterns
- **Telegram Web App SDK**: Primary integration point
- **Contact Sharing**: Authentication via Telegram contact sharing
- **Admin Approval**: Two-step user verification process
- **Real-time Updates**: WebSocket-based live synchronization

### Error Handling Patterns
- **Toast Notifications**: User-friendly error messages
- **Graceful Degradation**: Fallbacks for missing features
- **Logging**: Comprehensive logging for debugging
- **Validation**: Input validation on both client and server

### Security Considerations
- **Authentication**: Telegram-based authentication only
- **Authorization**: Role-based access control (admin vs user)
- **Data Encryption**: Sensitive data encryption for storage
- **Rate Limiting**: Protection against abuse
- **CORS**: Proper cross-origin resource sharing configuration

---
## Source: .serena\memories\project_overview.md

# Task Management Bot - Project Overview

## Purpose
A **Telegram Mini App** for team task management that integrates directly with Telegram's ecosystem. Users can create, assign, and track tasks while collaborating with team members through Telegram's native interface.

## Key Features
- **Task Management**: Create, edit, delete, and track tasks with priorities and due dates
- **Team Collaboration**: Add team members, assign tasks, track progress
- **Telegram Integration**: Uses Telegram Web App SDK, contact sharing for authentication
- **Real-time Sync**: Live updates across team members using WebSocket connections
- **Push Notifications**: Native Telegram notifications for task updates
- **Admin Dashboard**: User approval system and administrative controls
- **Statistics**: Progress tracking and team analytics

## Architecture
- **Frontend**: Telegram Mini App (vanilla HTML/CSS/JavaScript)
- **Backend**: Node.js/Express server with webhook handling
- **Authentication**: Telegram contact sharing + admin approval
- **Data Storage**: localStorage (client-side) + optional PostgreSQL
- **Deployment**: Docker containerization with Nginx reverse proxy
- **Monitoring**: Optional Grafana/Prometheus stack

## Target Users
Teams using Telegram for communication who want integrated task management without leaving the Telegram ecosystem.

---
## Source: .serena\memories\project_structure.md

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

---
## Source: .serena\memories\suggested_commands.md

# Suggested Shell Commands for Windows

## Essential Windows Commands

### File Operations
- `dir` - List directory contents (equivalent to `ls`)
- `cd <path>` - Change directory
- `mkdir <name>` - Create directory
- `rmdir <name>` - Remove empty directory
- `del <file>` - Delete file
- `copy <source> <dest>` - Copy file
- `move <source> <dest>` - Move/rename file
- `type <file>` - Display file contents (equivalent to `cat`)

### Search and Find
- `findstr <pattern> <files>` - Search text in files (equivalent to `grep`)
- `where <command>` - Find command location (equivalent to `which`)
- `dir /s <pattern>` - Recursive search for files

### Process Management
- `tasklist` - List running processes (equivalent to `ps`)
- `taskkill /PID <pid>` - Kill process by PID
- `taskkill /IM <name>` - Kill process by name

## Project-Specific Commands

### Development
```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Start static development server
npm run dev:static

# Run tests
npm test

# Lint code
npm run lint
```

### Docker Operations
```bash
# Build and start services
npm run docker:compose
# or
./scripts/setup.sh start

# View logs
npm run docker:logs
# or
docker-compose logs -f

# Stop services
npm run docker:stop
# or
docker-compose down
```

### Git Operations
```bash
git status
git add .
git commit -m "message"
git push origin main
git pull origin main
```

### Environment Setup
```bash
# Copy environment template
copy .env.docker .env

# Edit environment file
notepad .env
```

---
## Source: .serena\memories\task_completion_workflow.md

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

---
## Source: .serena\memories\tech_stack.md

# Tech Stack and Dependencies

## Frontend Technologies
- **Core**: Vanilla HTML5, CSS3, JavaScript (ES6+)
- **Framework**: Telegram Web App SDK
- **Storage**: localStorage for client-side data persistence
- **PWA**: Web App Manifest for mobile app-like experience

## Backend Technologies
- **Runtime**: Node.js (>=16.0.0)
- **Framework**: Express.js
- **Middleware**: 
  - `cors` - Cross-origin resource sharing
  - `helmet` - Security headers
  - `compression` - Response compression
  - `express-rate-limit` - Rate limiting
- **Environment**: `dotenv` for configuration
- **HTTP Client**: `node-fetch` for API calls

## Database & Storage
- **Primary**: localStorage (client-side)
- **Optional**: PostgreSQL (for production deployments)
- **Caching**: Redis (optional, for session management)

## Deployment & Infrastructure
- **Containerization**: Docker + Docker Compose
- **Web Server**: Nginx (reverse proxy, SSL termination)
- **Monitoring**: Grafana + Prometheus (optional profiles)
- **SSL**: Self-signed certificates (development) or Let's Encrypt (production)

## Development Tools
- **Process Manager**: nodemon (development)
- **Testing**: Jest
- **Linting**: ESLint
- **HTTP Server**: http-server (static development)

## External APIs
- **Telegram Bot API**: For webhook handling and notifications
- **Telegram Web App API**: For mini app integration

---
## Source: BOT_SETUP_GUIDE.md

# Telegram Bot Setup Guide - Contact Sharing Version

This guide explains how to set up your Telegram bot to work with the Task Manager mini app that uses Telegram's native contact sharing feature.

## 🚀 Quick Overview

Your Task Manager now works with Telegram's built-in contact sharing feature:

1. **User opens mini app** → Telegram automatically authenticates
2. **App requests contact** → User clicks "Share My Contact" 
3. **Contact shared** → App gets verified phone number
4. **Admin approval** → You approve new users in admin dashboard
5. **User gets access** → Approved users can use the task manager

## 📋 Prerequisites

- Telegram account
- Your Telegram User ID (get from @userinfobot)
- Your phone number
- Web hosting service (GitHub Pages, Vercel, Netlify, etc.)

## 🤖 Step 1: Create Your Telegram Bot

### 1.1 Talk to BotFather

1. Open Telegram and message [@BotFather](https://t.me/BotFather)
2. Send `/newbot`
3. Choose a name: **Task Manager Bot**
4. Choose a username: **YourTaskManagerBot** (must end with 'bot')
5. **Save your bot token** - you'll need it later

### 1.2 Configure Bot Settings

```
/setdescription
Task management mini app for teams. Share your contact to get started and collaborate on tasks with your team members.

/setabouttext
A secure task management system for Telegram teams. Features include task assignment, progress tracking, and team collaboration. Contact sharing required for security and verification.

/setuserpic
(Upload a nice 512x512 icon - optional)

/setcommands
start - Start the Task Manager
help - Get help with using the app
admin - Admin dashboard (admin only)
```

## 🌐 Step 2: Deploy Your Mini App

### Option A: GitHub Pages (Free & Easy)

1. **Create GitHub repository**
   ```bash
   # Upload your files to GitHub
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/yourusername/task-manager.git
   git push -u origin main
   ```

2. **Enable GitHub Pages**
   - Go to repository Settings → Pages
   - Source: Deploy from branch → main
   - Your app URL: `https://yourusername.github.io/task-manager`

### Option B: Vercel (Recommended)

1. **Connect to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Import your GitHub repository
   - Automatic deployment
   - Get custom URL: `https://your-app-name.vercel.app`

### Option C: Netlify

1. **Deploy to Netlify**
   - Go to [netlify.com](https://netlify.com)
   - Drag and drop your project folder
   - Get instant URL: `https://random-name.netlify.app`

## ⚙️ Step 3: Configure Mini App

### 3.1 Set Up Web App with BotFather

```
Message @BotFather:

/newapp
-> Select your bot
-> App name: Task Manager
-> Description: Team task management with contact verification
-> Photo: Upload 512x512 icon (optional)
-> Web App URL: https://your-deployed-url.com

/setmenubutton
-> Select your bot
-> Button text: Open Task Manager
-> Web App URL: https://your-deployed-url.com
```

### 3.2 Configure Environment

Edit your `.env` file:

```env
# Telegram Bot Configuration
TELEGRAM_BOT_TOKEN=1234567890:ABCdefGhIJKlmNOPqrsTUVwxyZ1234567890
TELEGRAM_BOT_USERNAME=YourTaskManagerBot

# Admin Configuration (YOUR INFO)
ADMIN_TELEGRAM_ID=123456789
ADMIN_PHONE_NUMBER=+1234567890
ADMIN_USERNAME=your_telegram_username

# App Configuration
APP_NAME=Task Manager
APP_URL=https://your-deployed-url.com
```

### 3.3 Get Your Telegram ID

**Method 1: Use @userinfobot**
1. Message [@userinfobot](https://t.me/userinfobot)
2. Send any message
3. Copy your ID number

**Method 2: Use @get_id_bot**
1. Message [@get_id_bot](https://t.me/get_id_bot)
2. Send `/start`
3. Copy your ID

## 👤 Step 4: Set Up Admin Account

### 4.1 Configure Admin in Code

Open your browser developer tools and run:

```javascript
// Set your admin ID (replace with your actual ID)
localStorage.setItem('admin_telegram_id', '123456789');

// Test the configuration
const config = new Config();
console.log('Admin ID:', config.get('ADMIN_TELEGRAM_ID'));
console.log('Is admin:', config.isAdmin('123456789'));
```

### 4.2 First Admin Login

1. **Open your mini app** in Telegram
2. **You should see admin interface** automatically
3. **If not authorized**: The app will request contact sharing first
4. **Share your contact** when prompted
5. **Admin dashboard** will appear in the ⚙️ tab

## 📱 Step 5: User Flow Configuration

### 5.1 How Contact Sharing Works

When a new user opens your mini app:

1. **Welcome screen** explains why contact is needed
2. **"Share My Contact" button** appears
3. **Telegram handles the sharing** securely
4. **App receives verified phone number**
5. **Request sent for admin approval**
6. **User sees "Awaiting Approval" message**

### 5.2 Admin Approval Process

As admin, you'll see:

1. **Pending Approvals section** with red badge count
2. **User details**: Name, phone, Telegram ID, request date
3. **Approve/Reject buttons** for each request
4. **Automatic user activation** after approval

## 🔧 Step 6: Testing Your Setup

### 6.1 Test Admin Functions

1. **Open mini app** as admin
2. **Check ⚙️ Admin tab** appears
3. **Add a test user** manually
4. **Export data** to verify functionality

### 6.2 Test User Flow

1. **Ask a friend** to test the app
2. **They should see contact request**
3. **After sharing contact**: "Awaiting Approval" message
4. **Approve them** in admin dashboard
5. **They get access** to task management

### 6.3 Test Contact Sharing

In development (browser):
```javascript
// Simulate contact sharing
auth.handleContactRequest({
  first_name: 'Test',
  last_name: 'User',
  telegram_id: 987654321
});
```

## 🛡️ Security Features

### What Contact Sharing Provides

- ✅ **Verified phone numbers** from Telegram
- ✅ **Authentic user identity** verification  
- ✅ **No fake accounts** or bots
- ✅ **Admin control** over who can access
- ✅ **Privacy protection** - data stays local

### Data Storage

- **Local Storage**: All data stored in browser
- **No External Servers**: Complete privacy
- **Admin Export**: Backup capabilities
- **Secure Authentication**: Telegram's security

## 📋 Bot Commands Setup

Add these commands to your bot via @BotFather:

```
/setcommands

start - Start the Task Manager and share contact
help - Get help with using the app
status - Check your access status
admin - Access admin dashboard (admin only)
export - Export your task data
support - Contact administrator
```

## 🎯 Advanced Configuration

### 6.1 Customize Welcome Message

Edit `auth.js` line 152:
```javascript
<h4>Welcome ${userInfo.first_name}! 👋</h4>
<p>To use this task management app, please share your contact information.</p>
```

### 6.2 Modify Contact Benefits

Edit the benefits list in `auth.js` line 158:
```javascript
<li>✅ Verify your identity</li>
<li>✅ Enable team collaboration</li>
<li>✅ Send important notifications</li>
<li>✅ Secure your account</li>
```

### 6.3 Change Admin Contact Info

Update your `.env` file:
```env
ADMIN_USERNAME=your_new_username
ADMIN_PHONE_NUMBER=+1234567890
```

## 🚨 Troubleshooting

### Common Issues

**❌ "Contact sharing failed"**
- Check if Telegram Web App API is available
- Test in Telegram app (not browser)
- Verify bot permissions

**❌ "Not authorized" message**
- Check ADMIN_TELEGRAM_ID in .env
- Verify your Telegram ID is correct
- Clear browser cache and retry

**❌ Admin dashboard not showing**
- Confirm you're set as admin
- Check browser console for errors
- Verify authentication flow

**❌ Users not getting approved**
- Check admin dashboard for pending requests
- Verify approval process is working
- Check localStorage data

### Debug Commands

```javascript
// Check current user
console.log(JSON.parse(localStorage.getItem('current_user')));

// Check pending approvals
console.log(JSON.parse(localStorage.getItem('pending_approvals')));

// Check shared contacts
console.log(JSON.parse(localStorage.getItem('shared_contacts')));

// Reset everything
localStorage.clear();
location.reload();
```

## ✅ Final Checklist

Before going live:

- [ ] Bot created and configured with @BotFather
- [ ] Mini app deployed to hosting service
- [ ] Web app URL set in @BotFather
- [ ] Admin ID configured correctly
- [ ] Environment variables set
- [ ] Contact sharing tested
- [ ] Admin approval process tested
- [ ] Bot commands configured
- [ ] Menu button set up

## 🎉 You're Ready!

Your Telegram Task Manager with contact sharing is now ready! 

**Share your bot** with team members:
1. They'll see contact request
2. After sharing contact → awaiting approval
3. You approve → they get access
4. Team collaboration begins!

**Admin URL**: `https://t.me/YourTaskManagerBot`

---

## 📞 Support

Need help? Check the troubleshooting section or:
- Review the authentication flow
- Test with a clean browser session
- Verify all configuration steps
- Check browser developer console for errors

---
## Source: DEPLOYMENT.md

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

---
## Source: node_modules\async\CHANGELOG.md

# v3.2.5
- Ensure `Error` objects such as `AggregateError` are propagated without modification (#1920)

# v3.2.4
- Fix a bug in `priorityQueue` where it didn't wait for the result. (#1725)
- Fix a bug where `unshiftAsync` was included in `priorityQueue`. (#1790)

# v3.2.3
- Fix bugs in comment parsing in `autoInject`. (#1767, #1780)

# v3.2.2
- Fix potential prototype pollution exploit

# v3.2.1
- Use `queueMicrotask` if available to the environment (#1761)
- Minor perf improvement in `priorityQueue` (#1727)
- More examples in documentation (#1726)
- Various doc fixes (#1708, #1712, #1717, #1740, #1739, #1749, #1756)
- Improved test coverage (#1754)

# v3.2.0
- Fix a bug in Safari related to overwriting `func.name`
- Remove built-in browserify configuration (#1653)
- Varios doc fixes (#1688, #1703, #1704)

# v3.1.1
- Allow redefining `name` property on wrapped functions.

# v3.1.0

- Added `q.pushAsync` and `q.unshiftAsync`, analagous to `q.push` and `q.unshift`, except they always do not accept a callback, and reject if processing the task errors. (#1659)
- Promises returned from `q.push` and `q.unshift` when a callback is not passed now resolve even if an error ocurred. (#1659)
- Fixed a parsing bug in `autoInject` with complicated function bodies (#1663)
- Added ES6+ configuration for Browserify bundlers (#1653)
- Various doc fixes (#1664, #1658, #1665, #1652)

# v3.0.1

## Bug fixes
- Fixed a regression where arrays passed to `queue` and `cargo` would be completely flattened. (#1645)
- Clarified Async's browser support (#1643)


# v3.0.0

The `async`/`await` release!

There are a lot of new features and subtle breaking changes in this major version, but the biggest feature is that most Async methods return a Promise if you omit the callback, meaning you can `await` them from within an `async` function.

```js
const results = await async.mapLimit(urls, 5, async url => {
    const resp = await fetch(url)
    return resp.body
})
```

## Breaking Changes
- Most Async methods return a Promise when the final callback is omitted, making them `await`-able! (#1572)
- We are now making heavy use of ES2015 features, this means we have dropped out-of-the-box support for Node 4 and earlier, and many old versions of browsers. (#1541, #1553)
- In `queue`, `priorityQueue`, `cargo` and `cargoQueue`, the "event"-style methods, like `q.drain` and `q.saturated` are now methods that register a callback, rather than properties you assign a callback to.  They are now of the form `q.drain(callback)`.  If you do not pass a callback a Promise will be returned for the next occurrence of the event, making them `await`-able, e.g. `await q.drain()`.  (#1586, #1641)
- Calling `callback(false)` will cancel an async method, preventing further iteration and callback calls.  This is useful for preventing memory leaks when you break out of an async flow by calling an outer callback. (#1064, #1542)
- `during` and `doDuring` have been removed, and instead `whilst`, `doWhilst`, `until` and `doUntil` now have asynchronous `test` functions. (#850, #1557)
- `limits` of less than 1 now cause an error to be thrown in queues and collection methods. (#1249, #1552)
- `memoize` no longer memoizes errors (#1465, #1466)
- `applyEach`/`applyEachSeries` have a simpler interface, to make them more easily type-able.  It always returns a function that takes in a single callback argument.  If that callback is omitted, a promise is returned, making it awaitable. (#1228, #1640)

## New Features
- Async generators are now supported in all the Collection methods. (#1560)
- Added `cargoQueue`, a queue with both `concurrency` and `payload` size parameters. (#1567)
- Queue objects returned from `queue` now have a `Symbol.iterator` method, meaning they can be iterated over to inspect the current list of items in the queue. (#1459, #1556)
- A ESM-flavored `async.mjs` is included in the `async` package.  This is described in the `package.json` `"module"` field, meaning it should be automatically used by Webpack and other compatible bundlers.

## Bug fixes
- Better handle arbitrary error objects in `asyncify` (#1568, #1569)

## Other
- Removed Lodash as a dependency (#1283, #1528)
- Miscellaneous docs fixes (#1393, #1501, #1540, #1543, #1558, #1563, #1564, #1579, #1581)
- Miscellaneous test fixes (#1538)

-------

# v2.6.1
- Updated lodash to prevent `npm audit` warnings. (#1532, #1533)
- Made `async-es` more optimized for webpack users (#1517)
- Fixed a stack overflow with large collections and a synchronous iterator (#1514)
- Various small fixes/chores (#1505, #1511, #1527, #1530)

# v2.6.0
- Added missing aliases for many methods.  Previously, you could not (e.g.) `require('async/find')` or use `async.anyLimit`. (#1483)
- Improved `queue` performance. (#1448, #1454)
- Add missing sourcemap (#1452, #1453)
- Various doc updates (#1448, #1471, #1483)

# v2.5.0
- Added `concatLimit`, the `Limit` equivalent of [`concat`](https://caolan.github.io/async/docs.html#concat) ([#1426](https://github.com/caolan/async/issues/1426), [#1430](https://github.com/caolan/async/pull/1430))
- `concat` improvements: it now preserves order, handles falsy values and the `iteratee` callback takes a variable number of arguments ([#1437](https://github.com/caolan/async/issues/1437), [#1436](https://github.com/caolan/async/pull/1436))
- Fixed an issue in `queue`  where there was a size discrepancy between `workersList().length` and `running()` ([#1428](https://github.com/caolan/async/issues/1428), [#1429](https://github.com/caolan/async/pull/1429))
- Various doc fixes ([#1422](https://github.com/caolan/async/issues/1422), [#1424](https://github.com/caolan/async/pull/1424))

# v2.4.1
- Fixed a bug preventing functions wrapped  with `timeout()` from being re-used. ([#1418](https://github.com/caolan/async/issues/1418), [#1419](https://github.com/caolan/async/issues/1419))

# v2.4.0
- Added `tryEach`, for running async functions in parallel, where you only expect one to succeed. ([#1365](https://github.com/caolan/async/issues/1365), [#687](https://github.com/caolan/async/issues/687))
- Improved performance, most notably in `parallel` and `waterfall` ([#1395](https://github.com/caolan/async/issues/1395))
- Added `queue.remove()`, for removing items in a `queue` ([#1397](https://github.com/caolan/async/issues/1397), [#1391](https://github.com/caolan/async/issues/1391))
- Fixed using `eval`, preventing Async from running in pages with Content Security Policy ([#1404](https://github.com/caolan/async/issues/1404), [#1403](https://github.com/caolan/async/issues/1403))
- Fixed errors thrown in an `asyncify`ed function's callback being caught by the underlying Promise ([#1408](https://github.com/caolan/async/issues/1408))
- Fixed timing of `queue.empty()` ([#1367](https://github.com/caolan/async/issues/1367))
- Various doc fixes ([#1314](https://github.com/caolan/async/issues/1314), [#1394](https://github.com/caolan/async/issues/1394), [#1412](https://github.com/caolan/async/issues/1412))

# v2.3.0
- Added support for ES2017 `async` functions.  Wherever you can pass a Node-style/CPS function that uses a callback, you can also pass an `async` function.  Previously, you had to wrap `async` functions with `asyncify`.  The caveat is that it will only work if `async` functions are supported natively in your environment, transpiled implementations can't be detected.  ([#1386](https://github.com/caolan/async/issues/1386), [#1390](https://github.com/caolan/async/issues/1390))
- Small doc fix ([#1392](https://github.com/caolan/async/issues/1392))

# v2.2.0
- Added `groupBy`, and the `Series`/`Limit` equivalents, analogous to [`_.groupBy`](http://lodash.com/docs#groupBy) ([#1364](https://github.com/caolan/async/issues/1364))
- Fixed `transform` bug when `callback` was not passed ([#1381](https://github.com/caolan/async/issues/1381))
- Added note about `reflect` to `parallel` docs ([#1385](https://github.com/caolan/async/issues/1385))

# v2.1.5
- Fix `auto` bug when function names collided with Array.prototype ([#1358](https://github.com/caolan/async/issues/1358))
- Improve some error messages ([#1349](https://github.com/caolan/async/issues/1349))
- Avoid stack overflow case in queue
- Fixed an issue in `some`, `every` and `find` where processing would continue after the result was determined.
- Cleanup implementations of `some`, `every` and `find`

# v2.1.3
- Make bundle size smaller
- Create optimized hotpath for `filter` in array case.

# v2.1.2
- Fixed a stackoverflow bug with `detect`, `some`, `every` on large inputs ([#1293](https://github.com/caolan/async/issues/1293)).

# v2.1.0

- `retry` and `retryable` now support an optional `errorFilter` function that determines if the `task` should retry on the error ([#1256](https://github.com/caolan/async/issues/1256), [#1261](https://github.com/caolan/async/issues/1261))
- Optimized array iteration in `race`, `cargo`, `queue`, and `priorityQueue` ([#1253](https://github.com/caolan/async/issues/1253))
- Added alias documentation to doc site ([#1251](https://github.com/caolan/async/issues/1251), [#1254](https://github.com/caolan/async/issues/1254))
- Added [BootStrap scrollspy](http://getbootstrap.com/javascript/#scrollspy) to docs to highlight in the sidebar the current method being viewed  ([#1289](https://github.com/caolan/async/issues/1289), [#1300](https://github.com/caolan/async/issues/1300))
- Various minor doc fixes ([#1263](https://github.com/caolan/async/issues/1263), [#1264](https://github.com/caolan/async/issues/1264), [#1271](https://github.com/caolan/async/issues/1271), [#1278](https://github.com/caolan/async/issues/1278), [#1280](https://github.com/caolan/async/issues/1280), [#1282](https://github.com/caolan/async/issues/1282), [#1302](https://github.com/caolan/async/issues/1302))

# v2.0.1

- Significantly optimized all iteration based collection methods such as `each`, `map`, `filter`, etc ([#1245](https://github.com/caolan/async/issues/1245), [#1246](https://github.com/caolan/async/issues/1246), [#1247](https://github.com/caolan/async/issues/1247)).

# v2.0.0

Lots of changes here!

First and foremost, we have a slick new [site for docs](https://caolan.github.io/async/). Special thanks to [**@hargasinski**](https://github.com/hargasinski) for his work converting our old docs to `jsdoc` format and implementing the new website. Also huge ups to [**@ivanseidel**](https://github.com/ivanseidel) for designing our new logo. It was a long process for both of these tasks, but I think these changes turned out extraordinary well.

The biggest feature is modularization. You can now `require("async/series")` to only require the `series` function. Every Async library function is available this way. You still can `require("async")` to require the entire library, like you could do before.

We also provide Async as a collection of ES2015 modules. You can now `import {each} from 'async-es'` or `import waterfall from 'async-es/waterfall'`. If you are using only a few Async functions, and are using a ES bundler such as Rollup, this can significantly lower your build size.

Major thanks to [**@Kikobeats**](github.com/Kikobeats), [**@aearly**](github.com/aearly) and [**@megawac**](github.com/megawac) for doing the majority of the modularization work, as well as [**@jdalton**](github.com/jdalton) and [**@Rich-Harris**](github.com/Rich-Harris) for advisory work on the general modularization strategy.

Another one of the general themes of the 2.0 release is standardization of what an "async" function is. We are now more strictly following the node-style continuation passing style. That is, an async function is a function that:

1. Takes a variable number of arguments
2. The last argument is always a callback
3. The callback can accept any number of arguments
4. The first argument passed to the callback will be treated as an error result, if the argument is truthy
5. Any number of result arguments can be passed after the "error" argument
6. The callback is called once and exactly once, either on the same tick or later tick of the JavaScript event loop.

There were several cases where Async accepted some functions that did not strictly have these properties, most notably `auto`, `every`, `some`, `filter`, `reject` and `detect`.

Another theme is performance. We have eliminated internal deferrals in all cases where they make sense. For example, in `waterfall` and `auto`, there was a `setImmediate` between each task -- these deferrals have been removed. A `setImmediate` call can add up to 1ms of delay. This might not seem like a lot, but it can add up if you are using many Async functions in the course of processing a HTTP request, for example. Nearly all asynchronous functions that do I/O already have some sort of deferral built in, so the extra deferral is unnecessary. The trade-off of this change is removing our built-in stack-overflow defense. Many synchronous callback calls in series can quickly overflow the JS call stack. If you do have a function that is sometimes synchronous (calling its callback on the same tick), and are running into stack overflows, wrap it with `async.ensureAsync()`.

Another big performance win has been re-implementing `queue`, `cargo`, and `priorityQueue` with [doubly linked lists](https://en.wikipedia.org/wiki/Doubly_linked_list) instead of arrays. This has lead to queues being an order of [magnitude faster on large sets of tasks](https://github.com/caolan/async/pull/1205).

## New Features

- Async is now modularized. Individual functions can be `require()`d from the main package. (`require('async/auto')`) ([#984](https://github.com/caolan/async/issues/984), [#996](https://github.com/caolan/async/issues/996))
- Async is also available as a collection of ES2015 modules in the new `async-es` package. (`import {forEachSeries} from 'async-es'`) ([#984](https://github.com/caolan/async/issues/984), [#996](https://github.com/caolan/async/issues/996))
- Added `race`, analogous to `Promise.race()`. It will run an array of async tasks in parallel and will call its callback with the result of the first task to respond. ([#568](https://github.com/caolan/async/issues/568), [#1038](https://github.com/caolan/async/issues/1038))
- Collection methods now accept ES2015 iterators.  Maps, Sets, and anything that implements the iterator spec can now be passed directly to `each`, `map`, `parallel`, etc.. ([#579](https://github.com/caolan/async/issues/579), [#839](https://github.com/caolan/async/issues/839), [#1074](https://github.com/caolan/async/issues/1074))
- Added `mapValues`, for mapping over the properties of an object and returning an object with the same keys. ([#1157](https://github.com/caolan/async/issues/1157), [#1177](https://github.com/caolan/async/issues/1177))
- Added `timeout`, a wrapper for an async function that will make the task time-out after the specified time. ([#1007](https://github.com/caolan/async/issues/1007), [#1027](https://github.com/caolan/async/issues/1027))
- Added `reflect` and `reflectAll`, analagous to [`Promise.reflect()`](http://bluebirdjs.com/docs/api/reflect.html), a wrapper for async tasks that always succeeds, by gathering results and errors into an object.  ([#942](https://github.com/caolan/async/issues/942), [#1012](https://github.com/caolan/async/issues/1012), [#1095](https://github.com/caolan/async/issues/1095))
- `constant` supports dynamic arguments -- it will now always use its last argument as the callback. ([#1016](https://github.com/caolan/async/issues/1016), [#1052](https://github.com/caolan/async/issues/1052))
- `setImmediate` and `nextTick` now support arguments to partially apply to the deferred function, like the node-native versions do. ([#940](https://github.com/caolan/async/issues/940), [#1053](https://github.com/caolan/async/issues/1053))
- `auto` now supports resolving cyclic dependencies using [Kahn's algorithm](https://en.wikipedia.org/wiki/Topological_sorting#Kahn.27s_algorithm) ([#1140](https://github.com/caolan/async/issues/1140)).
- Added `autoInject`, a relative of `auto` that automatically spreads a task's dependencies as arguments to the task function. ([#608](https://github.com/caolan/async/issues/608), [#1055](https://github.com/caolan/async/issues/1055), [#1099](https://github.com/caolan/async/issues/1099), [#1100](https://github.com/caolan/async/issues/1100))
- You can now limit the concurrency of `auto` tasks. ([#635](https://github.com/caolan/async/issues/635), [#637](https://github.com/caolan/async/issues/637))
- Added `retryable`, a relative of `retry` that wraps an async function, making it retry when called. ([#1058](https://github.com/caolan/async/issues/1058))
- `retry` now supports specifying a function that determines the next time interval, useful for exponential backoff, logging and other retry strategies. ([#1161](https://github.com/caolan/async/issues/1161))
- `retry` will now pass all of the arguments the task function was resolved with to the callback ([#1231](https://github.com/caolan/async/issues/1231)).
- Added `q.unsaturated` -- callback called when a `queue`'s number of running workers falls below a threshold. ([#868](https://github.com/caolan/async/issues/868), [#1030](https://github.com/caolan/async/issues/1030), [#1033](https://github.com/caolan/async/issues/1033), [#1034](https://github.com/caolan/async/issues/1034))
- Added `q.error` -- a callback called whenever a `queue` task calls its callback with an error. ([#1170](https://github.com/caolan/async/issues/1170))
- `applyEach` and `applyEachSeries` now pass results to the final callback. ([#1088](https://github.com/caolan/async/issues/1088))

## Breaking changes

- Calling a callback more than once is considered an error, and an error will be thrown. This had an explicit breaking change in `waterfall`. If you were relying on this behavior, you should more accurately represent your control flow as an event emitter or stream. ([#814](https://github.com/caolan/async/issues/814), [#815](https://github.com/caolan/async/issues/815), [#1048](https://github.com/caolan/async/issues/1048), [#1050](https://github.com/caolan/async/issues/1050))
- `auto` task functions now always take the callback as the last argument. If a task has dependencies, the `results` object will be passed as the first argument. To migrate old task functions, wrap them with [`_.flip`](https://lodash.com/docs#flip) ([#1036](https://github.com/caolan/async/issues/1036), [#1042](https://github.com/caolan/async/issues/1042))
- Internal `setImmediate` calls have been refactored away. This may make existing flows vulnerable to stack overflows if you use many synchronous functions in series. Use `ensureAsync` to work around this. ([#696](https://github.com/caolan/async/issues/696), [#704](https://github.com/caolan/async/issues/704), [#1049](https://github.com/caolan/async/issues/1049), [#1050](https://github.com/caolan/async/issues/1050))
- `map` used to return an object when iterating over an object.  `map` now always returns an array, like in other libraries.  The previous object behavior has been split out into `mapValues`. ([#1157](https://github.com/caolan/async/issues/1157), [#1177](https://github.com/caolan/async/issues/1177))
- `filter`, `reject`, `some`, `every`, `detect` and their families like `{METHOD}Series` and `{METHOD}Limit` now expect an error as the first callback argument, rather than just a simple boolean. Pass `null` as the first argument, or use `fs.access` instead of `fs.exists`. ([#118](https://github.com/caolan/async/issues/118), [#774](https://github.com/caolan/async/issues/774), [#1028](https://github.com/caolan/async/issues/1028), [#1041](https://github.com/caolan/async/issues/1041))
- `{METHOD}` and `{METHOD}Series` are now implemented in terms of `{METHOD}Limit`. This is a major internal simplification, and is not expected to cause many problems, but it does subtly affect how functions execute internally. ([#778](https://github.com/caolan/async/issues/778), [#847](https://github.com/caolan/async/issues/847))
- `retry`'s callback is now optional. Previously, omitting the callback would partially apply the function, meaning it could be passed directly as a task to `series` or `auto`. The partially applied "control-flow" behavior has been separated out into `retryable`. ([#1054](https://github.com/caolan/async/issues/1054), [#1058](https://github.com/caolan/async/issues/1058))
- The test function for `whilst`, `until`, and `during` used to be passed non-error args from the iteratee function's callback, but this led to weirdness where the first call of the test function would be passed no args. We have made it so the test function is never passed extra arguments, and only the `doWhilst`, `doUntil`, and `doDuring` functions pass iteratee callback arguments to the test function ([#1217](https://github.com/caolan/async/issues/1217), [#1224](https://github.com/caolan/async/issues/1224))
- The `q.tasks` array has been renamed `q._tasks` and is now implemented as a doubly linked list (DLL). Any code that used to interact with this array will need to be updated to either use the provided helpers or support DLLs ([#1205](https://github.com/caolan/async/issues/1205)).
- The timing of the `q.saturated()` callback in a `queue` has been modified to better reflect when tasks pushed to the queue will start queueing. ([#724](https://github.com/caolan/async/issues/724), [#1078](https://github.com/caolan/async/issues/1078))
- Removed `iterator` method in favour of [ES2015 iterator protocol](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Iterators_and_Generators ) which natively supports arrays ([#1237](https://github.com/caolan/async/issues/1237))
- Dropped support for Component, Jam, SPM, and Volo ([#1175](https://github.com/caolan/async/issues/1175), #[#176](https://github.com/caolan/async/issues/176))

## Bug Fixes

- Improved handling of no dependency cases in `auto` & `autoInject` ([#1147](https://github.com/caolan/async/issues/1147)).
- Fixed a bug where the callback generated by `asyncify` with  `Promises` could resolve twice ([#1197](https://github.com/caolan/async/issues/1197)).
- Fixed several documented optional callbacks not actually being optional ([#1223](https://github.com/caolan/async/issues/1223)).

## Other

- Added `someSeries` and `everySeries` for symmetry, as well as a complete set of `any`/`anyLimit`/`anySeries` and `all`/`/allLmit`/`allSeries` aliases.
- Added `find` as an alias for `detect. (as well as `findLimit` and `findSeries`).
- Various doc fixes ([#1005](https://github.com/caolan/async/issues/1005), [#1008](https://github.com/caolan/async/issues/1008), [#1010](https://github.com/caolan/async/issues/1010), [#1015](https://github.com/caolan/async/issues/1015), [#1021](https://github.com/caolan/async/issues/1021), [#1037](https://github.com/caolan/async/issues/1037), [#1039](https://github.com/caolan/async/issues/1039), [#1051](https://github.com/caolan/async/issues/1051), [#1102](https://github.com/caolan/async/issues/1102), [#1107](https://github.com/caolan/async/issues/1107), [#1121](https://github.com/caolan/async/issues/1121), [#1123](https://github.com/caolan/async/issues/1123), [#1129](https://github.com/caolan/async/issues/1129), [#1135](https://github.com/caolan/async/issues/1135), [#1138](https://github.com/caolan/async/issues/1138), [#1141](https://github.com/caolan/async/issues/1141), [#1153](https://github.com/caolan/async/issues/1153), [#1216](https://github.com/caolan/async/issues/1216), [#1217](https://github.com/caolan/async/issues/1217), [#1232](https://github.com/caolan/async/issues/1232), [#1233](https://github.com/caolan/async/issues/1233), [#1236](https://github.com/caolan/async/issues/1236), [#1238](https://github.com/caolan/async/issues/1238))

Thank you [**@aearly**](github.com/aearly) and [**@megawac**](github.com/megawac) for taking the lead on version 2 of async.

------------------------------------------

# v1.5.2
- Allow using `"constructor"` as an argument in `memoize` ([#998](https://github.com/caolan/async/issues/998))
- Give a better error messsage when `auto` dependency checking fails ([#994](https://github.com/caolan/async/issues/994))
- Various doc updates ([#936](https://github.com/caolan/async/issues/936), [#956](https://github.com/caolan/async/issues/956), [#979](https://github.com/caolan/async/issues/979), [#1002](https://github.com/caolan/async/issues/1002))

# v1.5.1
- Fix issue with `pause` in `queue` with concurrency enabled ([#946](https://github.com/caolan/async/issues/946))
- `while` and `until` now pass the final result to callback ([#963](https://github.com/caolan/async/issues/963))
- `auto` will properly handle concurrency when there is no callback ([#966](https://github.com/caolan/async/issues/966))
- `auto` will no. properly stop execution when an error occurs ([#988](https://github.com/caolan/async/issues/988), [#993](https://github.com/caolan/async/issues/993))
- Various doc fixes ([#971](https://github.com/caolan/async/issues/971), [#980](https://github.com/caolan/async/issues/980))

# v1.5.0

- Added `transform`, analogous to [`_.transform`](http://lodash.com/docs#transform) ([#892](https://github.com/caolan/async/issues/892))
- `map` now returns an object when an object is passed in, rather than array with non-numeric keys. `map` will begin always returning an array with numeric indexes in the next major release. ([#873](https://github.com/caolan/async/issues/873))
- `auto` now accepts an optional `concurrency` argument to limit the number o. running tasks ([#637](https://github.com/caolan/async/issues/637))
- Added `queue#workersList()`, to retrieve the lis. of currently running tasks. ([#891](https://github.com/caolan/async/issues/891))
- Various code simplifications ([#896](https://github.com/caolan/async/issues/896), [#904](https://github.com/caolan/async/issues/904))
- Various doc fixes :scroll: ([#890](https://github.com/caolan/async/issues/890), [#894](https://github.com/caolan/async/issues/894), [#903](https://github.com/caolan/async/issues/903), [#905](https://github.com/caolan/async/issues/905), [#912](https://github.com/caolan/async/issues/912))

# v1.4.2

- Ensure coverage files don't get published on npm ([#879](https://github.com/caolan/async/issues/879))

# v1.4.1

- Add in overlooked `detectLimit` method ([#866](https://github.com/caolan/async/issues/866))
- Removed unnecessary files from npm releases ([#861](https://github.com/caolan/async/issues/861))
- Removed usage of a reserved word to prevent :boom: in older environments ([#870](https://github.com/caolan/async/issues/870))

# v1.4.0

- `asyncify` now supports promises ([#840](https://github.com/caolan/async/issues/840))
- Added `Limit` versions of `filter` and `reject` ([#836](https://github.com/caolan/async/issues/836))
- Add `Limit` versions of `detect`, `some` and `every` ([#828](https://github.com/caolan/async/issues/828), [#829](https://github.com/caolan/async/issues/829))
- `some`, `every` and `detect` now short circuit early ([#828](https://github.com/caolan/async/issues/828), [#829](https://github.com/caolan/async/issues/829))
- Improve detection of the global object ([#804](https://github.com/caolan/async/issues/804)), enabling use in WebWorkers
- `whilst` now called with arguments from iterator ([#823](https://github.com/caolan/async/issues/823))
- `during` now gets called with arguments from iterator ([#824](https://github.com/caolan/async/issues/824))
- Code simplifications and optimizations aplenty ([diff](https://github.com/caolan/async/compare/v1.3.0...v1.4.0))


# v1.3.0

New Features:
- Added `constant`
- Added `asyncify`/`wrapSync` for making sync functions work with callbacks. ([#671](https://github.com/caolan/async/issues/671), [#806](https://github.com/caolan/async/issues/806))
- Added `during` and `doDuring`, which are like `whilst` with an async truth test. ([#800](https://github.com/caolan/async/issues/800))
- `retry` now accepts an `interval` parameter to specify a delay between retries. ([#793](https://github.com/caolan/async/issues/793))
- `async` should work better in Web Workers due to better `root` detection ([#804](https://github.com/caolan/async/issues/804))
- Callbacks are now optional in `whilst`, `doWhilst`, `until`, and `doUntil` ([#642](https://github.com/caolan/async/issues/642))
- Various internal updates ([#786](https://github.com/caolan/async/issues/786), [#801](https://github.com/caolan/async/issues/801), [#802](https://github.com/caolan/async/issues/802), [#803](https://github.com/caolan/async/issues/803))
- Various doc fixes ([#790](https://github.com/caolan/async/issues/790), [#794](https://github.com/caolan/async/issues/794))

Bug Fixes:
- `cargo` now exposes the `payload` size, and `cargo.payload` can be changed on the fly after the `cargo` is created. ([#740](https://github.com/caolan/async/issues/740), [#744](https://github.com/caolan/async/issues/744), [#783](https://github.com/caolan/async/issues/783))


# v1.2.1

Bug Fix:

- Small regression with synchronous iterator behavior in `eachSeries` with a 1-element array. Before 1.1.0, `eachSeries`'s callback was called on the same tick, which this patch restores. In 2.0.0, it will be called on the next tick. ([#782](https://github.com/caolan/async/issues/782))


# v1.2.0

New Features:

- Added `timesLimit` ([#743](https://github.com/caolan/async/issues/743))
- `concurrency` can be changed after initialization in `queue` by setting `q.concurrency`. The new concurrency will be reflected the next time a task is processed. ([#747](https://github.com/caolan/async/issues/747), [#772](https://github.com/caolan/async/issues/772))

Bug Fixes:

- Fixed a regression in `each` and family with empty arrays that have additional properties. ([#775](https://github.com/caolan/async/issues/775), [#777](https://github.com/caolan/async/issues/777))


# v1.1.1

Bug Fix:

- Small regression with synchronous iterator behavior in `eachSeries` with a 1-element array. Before 1.1.0, `eachSeries`'s callback was called on the same tick, which this patch restores. In 2.0.0, it will be called on the next tick. ([#782](https://github.com/caolan/async/issues/782))


# v1.1.0

New Features:

- `cargo` now supports all of the same methods and event callbacks as `queue`.
- Added `ensureAsync` - A wrapper that ensures an async function calls its callback on a later tick. ([#769](https://github.com/caolan/async/issues/769))
- Optimized `map`, `eachOf`, and `waterfall` families of functions
- Passing a `null` or `undefined` array to `map`, `each`, `parallel` and families will be treated as an empty array ([#667](https://github.com/caolan/async/issues/667)).
- The callback is now optional for the composed results of `compose` and `seq`. ([#618](https://github.com/caolan/async/issues/618))
- Reduced file size by 4kb, (minified version by 1kb)
- Added code coverage through `nyc` and `coveralls` ([#768](https://github.com/caolan/async/issues/768))

Bug Fixes:

- `forever` will no longer stack overflow with a synchronous iterator ([#622](https://github.com/caolan/async/issues/622))
- `eachLimit` and other limit functions will stop iterating once an error occurs ([#754](https://github.com/caolan/async/issues/754))
- Always pass `null` in callbacks when there is no error ([#439](https://github.com/caolan/async/issues/439))
- Ensure proper conditions when calling `drain()` after pushing an empty data set to a queue ([#668](https://github.com/caolan/async/issues/668))
- `each` and family will properly handle an empty array ([#578](https://github.com/caolan/async/issues/578))
- `eachSeries` and family will finish if the underlying array is modified during execution ([#557](https://github.com/caolan/async/issues/557))
- `queue` will throw if a non-function is passed to `q.push()` ([#593](https://github.com/caolan/async/issues/593))
- Doc fixes ([#629](https://github.com/caolan/async/issues/629), [#766](https://github.com/caolan/async/issues/766))


# v1.0.0

No known breaking changes, we are simply complying with semver from here on out.

Changes:

- Start using a changelog!
- Add `forEachOf` for iterating over Objects (or to iterate Arrays with indexes available) ([#168](https://github.com/caolan/async/issues/168) [#704](https://github.com/caolan/async/issues/704) [#321](https://github.com/caolan/async/issues/321))
- Detect deadlocks in `auto` ([#663](https://github.com/caolan/async/issues/663))
- Better support for require.js ([#527](https://github.com/caolan/async/issues/527))
- Throw if queue created with concurrency `0` ([#714](https://github.com/caolan/async/issues/714))
- Fix unneeded iteration in `queue.resume()` ([#758](https://github.com/caolan/async/issues/758))
- Guard against timer mocking overriding `setImmediate` ([#609](https://github.com/caolan/async/issues/609) [#611](https://github.com/caolan/async/issues/611))
- Miscellaneous doc fixes ([#542](https://github.com/caolan/async/issues/542) [#596](https://github.com/caolan/async/issues/596) [#615](https://github.com/caolan/async/issues/615) [#628](https://github.com/caolan/async/issues/628) [#631](https://github.com/caolan/async/issues/631) [#690](https://github.com/caolan/async/issues/690) [#729](https://github.com/caolan/async/issues/729))
- Use single noop function internally ([#546](https://github.com/caolan/async/issues/546))
- Optimize internal `_each`, `_map` and `_keys` functions.


---
## Source: node_modules\basic-auth\HISTORY.md

2.0.1 / 2018-09-19
==================

  * deps: safe-buffer@5.1.2

2.0.0 / 2017-09-12
==================

  * Drop support for Node.js below 0.8
  * Remove `auth(ctx)` signature -- pass in header or `auth(ctx.req)`
  * Use `safe-buffer` for improved Buffer API

1.1.0 / 2016-11-18
==================

  * Add `auth.parse` for low-level string parsing

1.0.4 / 2016-05-10
==================

  * Improve error message when `req` argument is not an object
  * Improve error message when `req` missing `headers` property

1.0.3 / 2015-07-01
==================

  * Fix regression accepting a Koa context

1.0.2 / 2015-06-12
==================

  * Improve error message when `req` argument missing
  * perf: enable strict mode
  * perf: hoist regular expression
  * perf: parse with regular expressions
  * perf: remove argument reassignment

1.0.1 / 2015-05-04
==================

  * Update readme

1.0.0 / 2014-07-01
==================

  * Support empty password
  * Support empty username

0.0.1 / 2013-11-30
==================

  * Initial release


---
## Source: node_modules\call-bind-apply-helpers\CHANGELOG.md

# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/)
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [v1.0.2](https://github.com/ljharb/call-bind-apply-helpers/compare/v1.0.1...v1.0.2) - 2025-02-12

### Commits

- [types] improve inferred types [`e6f9586`](https://github.com/ljharb/call-bind-apply-helpers/commit/e6f95860a3c72879cb861a858cdfb8138fbedec1)
- [Dev Deps] update `@arethetypeswrong/cli`, `@ljharb/tsconfig`, `@types/tape`, `es-value-fixtures`, `for-each`, `has-strict-mode`, `object-inspect` [`e43d540`](https://github.com/ljharb/call-bind-apply-helpers/commit/e43d5409f97543bfbb11f345d47d8ce4e066d8c1)

## [v1.0.1](https://github.com/ljharb/call-bind-apply-helpers/compare/v1.0.0...v1.0.1) - 2024-12-08

### Commits

- [types] `reflectApply`: fix types [`4efc396`](https://github.com/ljharb/call-bind-apply-helpers/commit/4efc3965351a4f02cc55e836fa391d3d11ef2ef8)
- [Fix] `reflectApply`: oops, Reflect is not a function [`83cc739`](https://github.com/ljharb/call-bind-apply-helpers/commit/83cc7395de6b79b7730bdf092f1436f0b1263c75)
- [Dev Deps] update `@arethetypeswrong/cli` [`80bd5d3`](https://github.com/ljharb/call-bind-apply-helpers/commit/80bd5d3ae58b4f6b6995ce439dd5a1bcb178a940)

## v1.0.0 - 2024-12-05

### Commits

- Initial implementation, tests, readme [`7879629`](https://github.com/ljharb/call-bind-apply-helpers/commit/78796290f9b7430c9934d6f33d94ae9bc89fce04)
- Initial commit [`3f1dc16`](https://github.com/ljharb/call-bind-apply-helpers/commit/3f1dc164afc43285631b114a5f9dd9137b2b952f)
- npm init [`081df04`](https://github.com/ljharb/call-bind-apply-helpers/commit/081df048c312fcee400922026f6e97281200a603)
- Only apps should have lockfiles [`5b9ca0f`](https://github.com/ljharb/call-bind-apply-helpers/commit/5b9ca0fe8101ebfaf309c549caac4e0a017ed930)


---
## Source: node_modules\call-bound\CHANGELOG.md

# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/)
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [v1.0.4](https://github.com/ljharb/call-bound/compare/v1.0.3...v1.0.4) - 2025-03-03

### Commits

- [types] improve types [`e648922`](https://github.com/ljharb/call-bound/commit/e6489222a9e54f350fbf952ceabe51fd8b6027ff)
- [Dev Deps] update `@arethetypeswrong/cli`, `@ljharb/tsconfig`, `@types/tape`, `es-value-fixtures`, `for-each`, `has-strict-mode`, `object-inspect` [`a42a5eb`](https://github.com/ljharb/call-bound/commit/a42a5ebe6c1b54fcdc7997c7dc64fdca9e936719)
- [Deps] update `call-bind-apply-helpers`, `get-intrinsic` [`f529eac`](https://github.com/ljharb/call-bound/commit/f529eac132404c17156bbc23ab2297a25d0f20b8)

## [v1.0.3](https://github.com/ljharb/call-bound/compare/v1.0.2...v1.0.3) - 2024-12-15

### Commits

- [Refactor] use `call-bind-apply-helpers` instead of `call-bind` [`5e0b134`](https://github.com/ljharb/call-bound/commit/5e0b13496df14fb7d05dae9412f088da8d3f75be)
- [Deps] update `get-intrinsic` [`41fc967`](https://github.com/ljharb/call-bound/commit/41fc96732a22c7b7e8f381f93ccc54bb6293be2e)
- [readme] fix example [`79a0137`](https://github.com/ljharb/call-bound/commit/79a0137723f7c6d09c9c05452bbf8d5efb5d6e49)
- [meta] add `sideEffects` flag [`08b07be`](https://github.com/ljharb/call-bound/commit/08b07be7f1c03f67dc6f3cdaf0906259771859f7)

## [v1.0.2](https://github.com/ljharb/call-bound/compare/v1.0.1...v1.0.2) - 2024-12-10

### Commits

- [Dev Deps] update `@arethetypeswrong/cli`, `@ljharb/tsconfig`, `gopd` [`e6a5ffe`](https://github.com/ljharb/call-bound/commit/e6a5ffe849368fe4f74dfd6cdeca1b9baa39e8d5)
- [Deps] update `call-bind`, `get-intrinsic` [`2aeb5b5`](https://github.com/ljharb/call-bound/commit/2aeb5b521dc2b2683d1345c753ea1161de2d1c14)
- [types] improve return type [`1a0c9fe`](https://github.com/ljharb/call-bound/commit/1a0c9fe3114471e7ca1f57d104e2efe713bb4871)

## v1.0.1 - 2024-12-05

### Commits

- Initial implementation, tests, readme, types [`6d94121`](https://github.com/ljharb/call-bound/commit/6d94121a9243602e506334069f7a03189fe3363d)
- Initial commit [`0eae867`](https://github.com/ljharb/call-bound/commit/0eae867334ea025c33e6e91cdecfc9df96680cf9)
- npm init [`71b2479`](https://github.com/ljharb/call-bound/commit/71b2479c6723e0b7d91a6b663613067e98b7b275)
- Only apps should have lockfiles [`c3754a9`](https://github.com/ljharb/call-bound/commit/c3754a949b7f9132b47e2d18c1729889736741eb)
- [actions] skip `npm ls` in node &lt; 10 [`74275a5`](https://github.com/ljharb/call-bound/commit/74275a5186b8caf6309b6b97472bdcb0df4683a8)
- [Dev Deps] add missing peer dep [`1354de8`](https://github.com/ljharb/call-bound/commit/1354de8679413e4ae9c523d85f76fa7a5e032d97)


---
## Source: node_modules\color-convert\CHANGELOG.md

# 1.0.0 - 2016-01-07

- Removed: unused speed test
- Added: Automatic routing between previously unsupported conversions
([#27](https://github.com/Qix-/color-convert/pull/27))
- Removed: `xxx2xxx()` and `xxx2xxxRaw()` functions
([#27](https://github.com/Qix-/color-convert/pull/27))
- Removed: `convert()` class
([#27](https://github.com/Qix-/color-convert/pull/27))
- Changed: all functions to lookup dictionary
([#27](https://github.com/Qix-/color-convert/pull/27))
- Changed: `ansi` to `ansi256`
([#27](https://github.com/Qix-/color-convert/pull/27))
- Fixed: argument grouping for functions requiring only one argument
([#27](https://github.com/Qix-/color-convert/pull/27))

# 0.6.0 - 2015-07-23

- Added: methods to handle
[ANSI](https://en.wikipedia.org/wiki/ANSI_escape_code#Colors) 16/256 colors:
  - rgb2ansi16
  - rgb2ansi
  - hsl2ansi16
  - hsl2ansi
  - hsv2ansi16
  - hsv2ansi
  - hwb2ansi16
  - hwb2ansi
  - cmyk2ansi16
  - cmyk2ansi
  - keyword2ansi16
  - keyword2ansi
  - ansi162rgb
  - ansi162hsl
  - ansi162hsv
  - ansi162hwb
  - ansi162cmyk
  - ansi162keyword
  - ansi2rgb
  - ansi2hsl
  - ansi2hsv
  - ansi2hwb
  - ansi2cmyk
  - ansi2keyword
([#18](https://github.com/harthur/color-convert/pull/18))

# 0.5.3 - 2015-06-02

- Fixed: hsl2hsv does not return `NaN` anymore when using `[0,0,0]`
([#15](https://github.com/harthur/color-convert/issues/15))

---

Check out commit logs for older releases


---
## Source: node_modules\dunder-proto\CHANGELOG.md

# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/)
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [v1.0.1](https://github.com/es-shims/dunder-proto/compare/v1.0.0...v1.0.1) - 2024-12-16

### Commits

- [Fix] do not crash when `--disable-proto=throw` [`6c367d9`](https://github.com/es-shims/dunder-proto/commit/6c367d919bc1604778689a297bbdbfea65752847)
- [Tests] ensure noproto tests only use the current version of dunder-proto [`b02365b`](https://github.com/es-shims/dunder-proto/commit/b02365b9cf889c4a2cac7be0c3cfc90a789af36c)
- [Dev Deps] update `@arethetypeswrong/cli`, `@types/tape` [`e3c5c3b`](https://github.com/es-shims/dunder-proto/commit/e3c5c3bd81cf8cef7dff2eca19e558f0e307f666)
- [Deps] update `call-bind-apply-helpers` [`19f1da0`](https://github.com/es-shims/dunder-proto/commit/19f1da028b8dd0d05c85bfd8f7eed2819b686450)

## v1.0.0 - 2024-12-06

### Commits

- Initial implementation, tests, readme, types [`a5b74b0`](https://github.com/es-shims/dunder-proto/commit/a5b74b0082f5270cb0905cd9a2e533cee7498373)
- Initial commit [`73fb5a3`](https://github.com/es-shims/dunder-proto/commit/73fb5a353b51ac2ab00c9fdeb0114daffd4c07a8)
- npm init [`80152dc`](https://github.com/es-shims/dunder-proto/commit/80152dc98155da4eb046d9f67a87ed96e8280a1d)
- Only apps should have lockfiles [`03e6660`](https://github.com/es-shims/dunder-proto/commit/03e6660a1d70dc401f3e217a031475ec537243dd)


---
## Source: node_modules\es-define-property\CHANGELOG.md

# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/)
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [v1.0.1](https://github.com/ljharb/es-define-property/compare/v1.0.0...v1.0.1) - 2024-12-06

### Commits

- [types] use shared tsconfig [`954a663`](https://github.com/ljharb/es-define-property/commit/954a66360326e508a0e5daa4b07493d58f5e110e)
- [actions] split out node 10-20, and 20+ [`3a8e84b`](https://github.com/ljharb/es-define-property/commit/3a8e84b23883f26ff37b3e82ff283834228e18c6)
- [Dev Deps] update `@ljharb/eslint-config`, `@ljharb/tsconfig`, `@types/get-intrinsic`, `@types/tape`, `auto-changelog`, `gopd`, `tape` [`86ae27b`](https://github.com/ljharb/es-define-property/commit/86ae27bb8cc857b23885136fad9cbe965ae36612)
- [Refactor] avoid using `get-intrinsic` [`02480c0`](https://github.com/ljharb/es-define-property/commit/02480c0353ef6118965282977c3864aff53d98b1)
- [Tests] replace `aud` with `npm audit` [`f6093ff`](https://github.com/ljharb/es-define-property/commit/f6093ff74ab51c98015c2592cd393bd42478e773)
- [Tests] configure testling [`7139e66`](https://github.com/ljharb/es-define-property/commit/7139e66959247a56086d9977359caef27c6849e7)
- [Dev Deps] update `tape` [`b901b51`](https://github.com/ljharb/es-define-property/commit/b901b511a75e001a40ce1a59fef7d9ffcfc87482)
- [Tests] fix types in tests [`469d269`](https://github.com/ljharb/es-define-property/commit/469d269fd141b1e773ec053a9fa35843493583e0)
- [Dev Deps] add missing peer dep [`733acfb`](https://github.com/ljharb/es-define-property/commit/733acfb0c4c96edf337e470b89a25a5b3724c352)

## v1.0.0 - 2024-02-12

### Commits

- Initial implementation, tests, readme, types [`3e154e1`](https://github.com/ljharb/es-define-property/commit/3e154e11a2fee09127220f5e503bf2c0a31dd480)
- Initial commit [`07d98de`](https://github.com/ljharb/es-define-property/commit/07d98de34a4dc31ff5e83a37c0c3f49e0d85cd50)
- npm init [`c4eb634`](https://github.com/ljharb/es-define-property/commit/c4eb6348b0d3886aac36cef34ad2ee0665ea6f3e)
- Only apps should have lockfiles [`7af86ec`](https://github.com/ljharb/es-define-property/commit/7af86ec1d311ec0b17fdfe616a25f64276903856)


---
## Source: node_modules\es-errors\CHANGELOG.md

# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/)
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [v1.3.0](https://github.com/ljharb/es-errors/compare/v1.2.1...v1.3.0) - 2024-02-05

### Commits

- [New] add `EvalError` and `URIError` [`1927627`](https://github.com/ljharb/es-errors/commit/1927627ba68cb6c829d307231376c967db53acdf)

## [v1.2.1](https://github.com/ljharb/es-errors/compare/v1.2.0...v1.2.1) - 2024-02-04

### Commits

- [Fix] add missing `exports` entry [`5bb5f28`](https://github.com/ljharb/es-errors/commit/5bb5f280f98922701109d6ebb82eea2257cecc7e)

## [v1.2.0](https://github.com/ljharb/es-errors/compare/v1.1.0...v1.2.0) - 2024-02-04

### Commits

- [New] add `ReferenceError` [`6d8cf5b`](https://github.com/ljharb/es-errors/commit/6d8cf5bbb6f3f598d02cf6f30e468ba2caa8e143)

## [v1.1.0](https://github.com/ljharb/es-errors/compare/v1.0.0...v1.1.0) - 2024-02-04

### Commits

- [New] add base Error [`2983ab6`](https://github.com/ljharb/es-errors/commit/2983ab65f7bc5441276cb021dc3aa03c78881698)

## v1.0.0 - 2024-02-03

### Commits

- Initial implementation, tests, readme, type [`8f47631`](https://github.com/ljharb/es-errors/commit/8f476317e9ad76f40ad648081829b1a1a3a1288b)
- Initial commit [`ea5d099`](https://github.com/ljharb/es-errors/commit/ea5d099ef18e550509ab9e2be000526afd81c385)
- npm init [`6f5ebf9`](https://github.com/ljharb/es-errors/commit/6f5ebf9cead474dadd72b9e63dad315820a089ae)
- Only apps should have lockfiles [`e1a0aeb`](https://github.com/ljharb/es-errors/commit/e1a0aeb7b80f5cfc56be54d6b2100e915d47def8)
- [meta] add `sideEffects` flag [`a9c7d46`](https://github.com/ljharb/es-errors/commit/a9c7d460a492f1d8a241c836bc25a322a19cc043)


---
## Source: node_modules\es-object-atoms\CHANGELOG.md

# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/)
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [v1.1.1](https://github.com/ljharb/es-object-atoms/compare/v1.1.0...v1.1.1) - 2025-01-14

### Commits

- [types] `ToObject`: improve types [`cfe8c8a`](https://github.com/ljharb/es-object-atoms/commit/cfe8c8a105c44820cb22e26f62d12ef0ad9715c8)

## [v1.1.0](https://github.com/ljharb/es-object-atoms/compare/v1.0.1...v1.1.0) - 2025-01-14

### Commits

- [New] add `isObject` [`51e4042`](https://github.com/ljharb/es-object-atoms/commit/51e4042df722eb3165f40dc5f4bf33d0197ecb07)

## [v1.0.1](https://github.com/ljharb/es-object-atoms/compare/v1.0.0...v1.0.1) - 2025-01-13

### Commits

- [Dev Deps] update `@ljharb/eslint-config`, `@ljharb/tsconfig`, `@types/tape`, `auto-changelog`, `tape` [`38ab9eb`](https://github.com/ljharb/es-object-atoms/commit/38ab9eb00b62c2f4668644f5e513d9b414ebd595)
- [types] improve types [`7d1beb8`](https://github.com/ljharb/es-object-atoms/commit/7d1beb887958b78b6a728a210a1c8370ab7e2aa1)
- [Tests] replace `aud` with `npm audit` [`25863ba`](https://github.com/ljharb/es-object-atoms/commit/25863baf99178f1d1ad33d1120498db28631907e)
- [Dev Deps] add missing peer dep [`c012309`](https://github.com/ljharb/es-object-atoms/commit/c0123091287e6132d6f4240496340c427433df28)

## v1.0.0 - 2024-03-16

### Commits

- Initial implementation, tests, readme, types [`f1499db`](https://github.com/ljharb/es-object-atoms/commit/f1499db7d3e1741e64979c61d645ab3137705e82)
- Initial commit [`99eedc7`](https://github.com/ljharb/es-object-atoms/commit/99eedc7b5fde38a50a28d3c8b724706e3e4c5f6a)
- [meta] rename repo [`fc851fa`](https://github.com/ljharb/es-object-atoms/commit/fc851fa70616d2d182aaf0bd02c2ed7084dea8fa)
- npm init [`b909377`](https://github.com/ljharb/es-object-atoms/commit/b909377c50049bd0ec575562d20b0f9ebae8947f)
- Only apps should have lockfiles [`7249edd`](https://github.com/ljharb/es-object-atoms/commit/7249edd2178c1b9ddfc66ffcc6d07fdf0d28efc1)


---
## Source: node_modules\function-bind\CHANGELOG.md

# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/)
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [v1.1.2](https://github.com/ljharb/function-bind/compare/v1.1.1...v1.1.2) - 2023-10-12

### Merged

- Point to the correct file [`#16`](https://github.com/ljharb/function-bind/pull/16)

### Commits

- [Tests] migrate tests to Github Actions [`4f8b57c`](https://github.com/ljharb/function-bind/commit/4f8b57c02f2011fe9ae353d5e74e8745f0988af8)
- [Tests] remove `jscs` [`90eb2ed`](https://github.com/ljharb/function-bind/commit/90eb2edbeefd5b76cd6c3a482ea3454db169b31f)
- [meta] update `.gitignore` [`53fcdc3`](https://github.com/ljharb/function-bind/commit/53fcdc371cd66634d6e9b71c836a50f437e89fed)
- [Tests] up to `node` `v11.10`, `v10.15`, `v9.11`, `v8.15`, `v6.16`, `v4.9`; use `nvm install-latest-npm`; run audit script in tests [`1fe8f6e`](https://github.com/ljharb/function-bind/commit/1fe8f6e9aed0dfa8d8b3cdbd00c7f5ea0cd2b36e)
- [meta] add `auto-changelog` [`1921fcb`](https://github.com/ljharb/function-bind/commit/1921fcb5b416b63ffc4acad051b6aad5722f777d)
- [Robustness] remove runtime dependency on all builtins except `.apply` [`f743e61`](https://github.com/ljharb/function-bind/commit/f743e61aa6bb2360358c04d4884c9db853d118b7)
- Docs: enable badges; update wording [`503cb12`](https://github.com/ljharb/function-bind/commit/503cb12d998b5f91822776c73332c7adcd6355dd)
- [readme] update badges [`290c5db`](https://github.com/ljharb/function-bind/commit/290c5dbbbda7264efaeb886552a374b869a4bb48)
- [Tests] switch to nyc for coverage [`ea360ba`](https://github.com/ljharb/function-bind/commit/ea360ba907fc2601ed18d01a3827fa2d3533cdf8)
- [Dev Deps] update `eslint`, `@ljharb/eslint-config`, `tape` [`cae5e9e`](https://github.com/ljharb/function-bind/commit/cae5e9e07a5578dc6df26c03ee22851ce05b943c)
- [meta] add `funding` field; create FUNDING.yml [`c9f4274`](https://github.com/ljharb/function-bind/commit/c9f4274aa80ea3aae9657a3938fdba41a3b04ca6)
- [Tests] fix eslint errors from #15 [`f69aaa2`](https://github.com/ljharb/function-bind/commit/f69aaa2beb2fdab4415bfb885760a699d0b9c964)
- [actions] fix permissions [`99a0cd9`](https://github.com/ljharb/function-bind/commit/99a0cd9f3b5bac223a0d572f081834cd73314be7)
- [meta] use `npmignore` to autogenerate an npmignore file [`f03b524`](https://github.com/ljharb/function-bind/commit/f03b524ca91f75a109a5d062f029122c86ecd1ae)
- [Dev Deps] update `@ljharb/eslint‑config`, `eslint`, `tape` [`7af9300`](https://github.com/ljharb/function-bind/commit/7af930023ae2ce7645489532821e4fbbcd7a2280)
- [Dev Deps] update `eslint`, `@ljharb/eslint-config`, `covert`, `tape` [`64a9127`](https://github.com/ljharb/function-bind/commit/64a9127ab0bd331b93d6572eaf6e9971967fc08c)
- [Tests] use `aud` instead of `npm audit` [`e75069c`](https://github.com/ljharb/function-bind/commit/e75069c50010a8fcce2a9ce2324934c35fdb4386)
- [Dev Deps] update `@ljharb/eslint-config`, `aud`, `tape` [`d03555c`](https://github.com/ljharb/function-bind/commit/d03555ca59dea3b71ce710045e4303b9e2619e28)
- [meta] add `safe-publish-latest` [`9c8f809`](https://github.com/ljharb/function-bind/commit/9c8f8092aed027d7e80c94f517aa892385b64f09)
- [Dev Deps] update `@ljharb/eslint-config`, `tape` [`baf6893`](https://github.com/ljharb/function-bind/commit/baf6893e27f5b59abe88bc1995e6f6ed1e527397)
- [meta] create SECURITY.md [`4db1779`](https://github.com/ljharb/function-bind/commit/4db17799f1f28ae294cb95e0081ca2b591c3911b)
- [Tests] add `npm run audit` [`c8b38ec`](https://github.com/ljharb/function-bind/commit/c8b38ec40ed3f85dabdee40ed4148f1748375bc2)
- Revert "Point to the correct file" [`05cdf0f`](https://github.com/ljharb/function-bind/commit/05cdf0fa205c6a3c5ba40bbedd1dfa9874f915c9)

## [v1.1.1](https://github.com/ljharb/function-bind/compare/v1.1.0...v1.1.1) - 2017-08-28

### Commits

- [Tests] up to `node` `v8`; newer npm breaks on older node; fix scripts [`817f7d2`](https://github.com/ljharb/function-bind/commit/817f7d28470fdbff8ef608d4d565dd4d1430bc5e)
- [Dev Deps] update `eslint`, `jscs`, `tape`, `@ljharb/eslint-config` [`854288b`](https://github.com/ljharb/function-bind/commit/854288b1b6f5c555f89aceb9eff1152510262084)
- [Dev Deps] update `tape`, `jscs`, `eslint`, `@ljharb/eslint-config` [`83e639f`](https://github.com/ljharb/function-bind/commit/83e639ff74e6cd6921285bccec22c1bcf72311bd)
- Only apps should have lockfiles [`5ed97f5`](https://github.com/ljharb/function-bind/commit/5ed97f51235c17774e0832e122abda0f3229c908)
- Use a SPDX-compliant “license” field. [`5feefea`](https://github.com/ljharb/function-bind/commit/5feefea0dc0193993e83e5df01ded424403a5381)

## [v1.1.0](https://github.com/ljharb/function-bind/compare/v1.0.2...v1.1.0) - 2016-02-14

### Commits

- Update `eslint`, `tape`; use my personal shared `eslint` config [`9c9062a`](https://github.com/ljharb/function-bind/commit/9c9062abbe9dd70b59ea2c3a3c3a81f29b457097)
- Add `npm run eslint` [`dd96c56`](https://github.com/ljharb/function-bind/commit/dd96c56720034a3c1ffee10b8a59a6f7c53e24ad)
- [New] return the native `bind` when available. [`82186e0`](https://github.com/ljharb/function-bind/commit/82186e03d73e580f95ff167e03f3582bed90ed72)
- [Dev Deps] update `tape`, `jscs`, `eslint`, `@ljharb/eslint-config` [`a3dd767`](https://github.com/ljharb/function-bind/commit/a3dd76720c795cb7f4586b0544efabf8aa107b8b)
- Update `eslint` [`3dae2f7`](https://github.com/ljharb/function-bind/commit/3dae2f7423de30a2d20313ddb1edc19660142fe9)
- Update `tape`, `covert`, `jscs` [`a181eee`](https://github.com/ljharb/function-bind/commit/a181eee0cfa24eb229c6e843a971f36e060a2f6a)
- [Tests] up to `node` `v5.6`, `v4.3` [`964929a`](https://github.com/ljharb/function-bind/commit/964929a6a4ddb36fb128de2bcc20af5e4f22e1ed)
- Test up to `io.js` `v2.1` [`2be7310`](https://github.com/ljharb/function-bind/commit/2be7310f2f74886a7124ca925be411117d41d5ea)
- Update `tape`, `jscs`, `eslint`, `@ljharb/eslint-config` [`45f3d68`](https://github.com/ljharb/function-bind/commit/45f3d6865c6ca93726abcef54febe009087af101)
- [Dev Deps] update `tape`, `jscs` [`6e1340d`](https://github.com/ljharb/function-bind/commit/6e1340d94642deaecad3e717825db641af4f8b1f)
- [Tests] up to `io.js` `v3.3`, `node` `v4.1` [`d9bad2b`](https://github.com/ljharb/function-bind/commit/d9bad2b778b1b3a6dd2876087b88b3acf319f8cc)
- Update `eslint` [`935590c`](https://github.com/ljharb/function-bind/commit/935590caa024ab356102e4858e8fc315b2ccc446)
- [Dev Deps] update `jscs`, `eslint`, `@ljharb/eslint-config` [`8c9a1ef`](https://github.com/ljharb/function-bind/commit/8c9a1efd848e5167887aa8501857a0940a480c57)
- Test on `io.js` `v2.2` [`9a3a38c`](https://github.com/ljharb/function-bind/commit/9a3a38c92013aed6e108666e7bd40969b84ac86e)
- Run `travis-ci` tests on `iojs` and `node` v0.12; speed up builds; allow 0.8 failures. [`69afc26`](https://github.com/ljharb/function-bind/commit/69afc2617405b147dd2a8d8ae73ca9e9283f18b4)
- [Dev Deps] Update `tape`, `eslint` [`36c1be0`](https://github.com/ljharb/function-bind/commit/36c1be0ab12b45fe5df6b0fdb01a5d5137fd0115)
- Update `tape`, `jscs` [`98d8303`](https://github.com/ljharb/function-bind/commit/98d8303cd5ca1c6b8f985469f86b0d44d7d45f6e)
- Update `jscs` [`9633a4e`](https://github.com/ljharb/function-bind/commit/9633a4e9fbf82051c240855166e468ba8ba0846f)
- Update `tape`, `jscs` [`c80ef0f`](https://github.com/ljharb/function-bind/commit/c80ef0f46efc9791e76fa50de4414092ac147831)
- Test up to `io.js` `v3.0` [`7e2c853`](https://github.com/ljharb/function-bind/commit/7e2c8537d52ab9cf5a655755561d8917684c0df4)
- Test on `io.js` `v2.4` [`5a199a2`](https://github.com/ljharb/function-bind/commit/5a199a27ba46795ba5eaf0845d07d4b8232895c9)
- Test on `io.js` `v2.3` [`a511b88`](https://github.com/ljharb/function-bind/commit/a511b8896de0bddf3b56862daa416c701f4d0453)
- Fixing a typo from 822b4e1938db02dc9584aa434fd3a45cb20caf43 [`732d6b6`](https://github.com/ljharb/function-bind/commit/732d6b63a9b33b45230e630dbcac7a10855d3266)
- Update `jscs` [`da52a48`](https://github.com/ljharb/function-bind/commit/da52a4886c06d6490f46ae30b15e4163ba08905d)
- Lock covert to v1.0.0. [`d6150fd`](https://github.com/ljharb/function-bind/commit/d6150fda1e6f486718ebdeff823333d9e48e7430)

## [v1.0.2](https://github.com/ljharb/function-bind/compare/v1.0.1...v1.0.2) - 2014-10-04

## [v1.0.1](https://github.com/ljharb/function-bind/compare/v1.0.0...v1.0.1) - 2014-10-03

### Merged

- make CI build faster [`#3`](https://github.com/ljharb/function-bind/pull/3)

### Commits

- Using my standard jscs.json [`d8ee94c`](https://github.com/ljharb/function-bind/commit/d8ee94c993eff0a84cf5744fe6a29627f5cffa1a)
- Adding `npm run lint` [`7571ab7`](https://github.com/ljharb/function-bind/commit/7571ab7dfdbd99b25a1dbb2d232622bd6f4f9c10)
- Using consistent indentation [`e91a1b1`](https://github.com/ljharb/function-bind/commit/e91a1b13a61e99ec1e530e299b55508f74218a95)
- Updating jscs [`7e17892`](https://github.com/ljharb/function-bind/commit/7e1789284bc629bc9c1547a61c9b227bbd8c7a65)
- Using consistent quotes [`c50b57f`](https://github.com/ljharb/function-bind/commit/c50b57fcd1c5ec38320979c837006069ebe02b77)
- Adding keywords [`cb94631`](https://github.com/ljharb/function-bind/commit/cb946314eed35f21186a25fb42fc118772f9ee00)
- Directly export a function expression instead of using a declaration, and relying on hoisting. [`5a33c5f`](https://github.com/ljharb/function-bind/commit/5a33c5f45642de180e0d207110bf7d1843ceb87c)
- Naming npm URL and badge in README; use SVG [`2aef8fc`](https://github.com/ljharb/function-bind/commit/2aef8fcb79d54e63a58ae557c4e60949e05d5e16)
- Naming deps URLs in README [`04228d7`](https://github.com/ljharb/function-bind/commit/04228d766670ee45ca24e98345c1f6a7621065b5)
- Naming travis-ci URLs in README; using SVG [`62c810c`](https://github.com/ljharb/function-bind/commit/62c810c2f54ced956cd4d4ab7b793055addfe36e)
- Make sure functions are invoked correctly (also passing coverage tests) [`2b289b4`](https://github.com/ljharb/function-bind/commit/2b289b4dfbf037ffcfa4dc95eb540f6165e9e43a)
- Removing the strict mode pragmas; they make tests fail. [`1aa701d`](https://github.com/ljharb/function-bind/commit/1aa701d199ddc3782476e8f7eef82679be97b845)
- Adding myself as a contributor [`85fd57b`](https://github.com/ljharb/function-bind/commit/85fd57b0860e5a7af42de9a287f3f265fc6d72fc)
- Adding strict mode pragmas [`915b08e`](https://github.com/ljharb/function-bind/commit/915b08e084c86a722eafe7245e21db74aa21ca4c)
- Adding devDeps URLs to README [`4ccc731`](https://github.com/ljharb/function-bind/commit/4ccc73112c1769859e4ca3076caf4086b3cba2cd)
- Fixing the description. [`a7a472c`](https://github.com/ljharb/function-bind/commit/a7a472cf649af515c635cf560fc478fbe48999c8)
- Using a function expression instead of a function declaration. [`b5d3e4e`](https://github.com/ljharb/function-bind/commit/b5d3e4ea6aaffc63888953eeb1fbc7ff45f1fa14)
- Updating tape [`f086be6`](https://github.com/ljharb/function-bind/commit/f086be6029fb56dde61a258c1340600fa174d1e0)
- Updating jscs [`5f9bdb3`](https://github.com/ljharb/function-bind/commit/5f9bdb375ab13ba48f30852aab94029520c54d71)
- Updating jscs [`9b409ba`](https://github.com/ljharb/function-bind/commit/9b409ba6118e23395a4e5d83ef39152aab9d3bfc)
- Run coverage as part of tests. [`8e1b6d4`](https://github.com/ljharb/function-bind/commit/8e1b6d459f047d1bd4fee814e01247c984c80bd0)
- Run linter as part of tests [`c1ca83f`](https://github.com/ljharb/function-bind/commit/c1ca83f832df94587d09e621beba682fabfaa987)
- Updating covert [`701e837`](https://github.com/ljharb/function-bind/commit/701e83774b57b4d3ef631e1948143f43a72f4bb9)

## [v1.0.0](https://github.com/ljharb/function-bind/compare/v0.2.0...v1.0.0) - 2014-08-09

### Commits

- Make sure old and unstable nodes don't fail Travis [`27adca3`](https://github.com/ljharb/function-bind/commit/27adca34a4ab6ad67b6dfde43942a1b103ce4d75)
- Fixing an issue when the bound function is called as a constructor in ES3. [`e20122d`](https://github.com/ljharb/function-bind/commit/e20122d267d92ce553859b280cbbea5d27c07731)
- Adding `npm run coverage` [`a2e29c4`](https://github.com/ljharb/function-bind/commit/a2e29c4ecaef9e2f6cd1603e868c139073375502)
- Updating tape [`b741168`](https://github.com/ljharb/function-bind/commit/b741168b12b235b1717ff696087645526b69213c)
- Upgrading tape [`63631a0`](https://github.com/ljharb/function-bind/commit/63631a04c7fbe97cc2fa61829cc27246d6986f74)
- Updating tape [`363cb46`](https://github.com/ljharb/function-bind/commit/363cb46dafb23cb3e347729a22f9448051d78464)

## v0.2.0 - 2014-03-23

### Commits

- Updating test coverage to match es5-shim. [`aa94d44`](https://github.com/ljharb/function-bind/commit/aa94d44b8f9d7f69f10e060db7709aa7a694e5d4)
- initial [`942ee07`](https://github.com/ljharb/function-bind/commit/942ee07e94e542d91798137bc4b80b926137e066)
- Setting the bound function's length properly. [`079f46a`](https://github.com/ljharb/function-bind/commit/079f46a2d3515b7c0b308c2c13fceb641f97ca25)
- Ensuring that some older browsers will throw when given a regex. [`36ac55b`](https://github.com/ljharb/function-bind/commit/36ac55b87f460d4330253c92870aa26fbfe8227f)
- Removing npm scripts that don't have dependencies [`9d2be60`](https://github.com/ljharb/function-bind/commit/9d2be600002cb8bc8606f8f3585ad3e05868c750)
- Updating tape [`297a4ac`](https://github.com/ljharb/function-bind/commit/297a4acc5464db381940aafb194d1c88f4e678f3)
- Skipping length tests for now. [`d9891ea`](https://github.com/ljharb/function-bind/commit/d9891ea4d2aaffa69f408339cdd61ff740f70565)
- don't take my tea [`dccd930`](https://github.com/ljharb/function-bind/commit/dccd930bfd60ea10cb178d28c97550c3bc8c1e07)


---
## Source: node_modules\get-intrinsic\CHANGELOG.md

# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/)
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [v1.3.0](https://github.com/ljharb/get-intrinsic/compare/v1.2.7...v1.3.0) - 2025-02-22

### Commits

- [Dev Deps] update `es-abstract`, `es-value-fixtures`, `for-each`, `object-inspect` [`9b61553`](https://github.com/ljharb/get-intrinsic/commit/9b61553c587f1c1edbd435597e88c7d387da97dd)
- [Deps] update `call-bind-apply-helpers`, `es-object-atoms`, `get-proto` [`a341fee`](https://github.com/ljharb/get-intrinsic/commit/a341fee0f39a403b0f0069e82c97642d5eb11043)
- [New] add `Float16Array` [`de22116`](https://github.com/ljharb/get-intrinsic/commit/de22116b492fb989a0341bceb6e573abfaed73dc)

## [v1.2.7](https://github.com/ljharb/get-intrinsic/compare/v1.2.6...v1.2.7) - 2025-01-02

### Commits

- [Refactor] use `get-proto` directly [`00ab955`](https://github.com/ljharb/get-intrinsic/commit/00ab95546a0980c8ad42a84253daaa8d2adcedf9)
- [Deps] update `math-intrinsics` [`c716cdd`](https://github.com/ljharb/get-intrinsic/commit/c716cdd6bbe36b438057025561b8bb5a879ac8a0)
- [Dev Deps] update `call-bound`, `es-abstract` [`dc648a6`](https://github.com/ljharb/get-intrinsic/commit/dc648a67eb359037dff8d8619bfa71d86debccb1)

## [v1.2.6](https://github.com/ljharb/get-intrinsic/compare/v1.2.5...v1.2.6) - 2024-12-11

### Commits

- [Refactor] use `math-intrinsics` [`841be86`](https://github.com/ljharb/get-intrinsic/commit/841be8641a9254c4c75483b30c8871b5d5065926)
- [Refactor] use `es-object-atoms` [`42057df`](https://github.com/ljharb/get-intrinsic/commit/42057dfa16f66f64787e66482af381cc6f31d2c1)
- [Deps] update `call-bind-apply-helpers` [`45afa24`](https://github.com/ljharb/get-intrinsic/commit/45afa24a9ee4d6d3c172db1f555b16cb27843ef4)
- [Dev Deps] update `call-bound` [`9cba9c6`](https://github.com/ljharb/get-intrinsic/commit/9cba9c6e70212bc163b7a5529cb25df46071646f)

## [v1.2.5](https://github.com/ljharb/get-intrinsic/compare/v1.2.4...v1.2.5) - 2024-12-06

### Commits

- [actions] split out node 10-20, and 20+ [`6e2b9dd`](https://github.com/ljharb/get-intrinsic/commit/6e2b9dd23902665681ebe453256ccfe21d7966f0)
- [Refactor] use `dunder-proto` and `call-bind-apply-helpers` instead of `has-proto` [`c095d17`](https://github.com/ljharb/get-intrinsic/commit/c095d179ad0f4fbfff20c8a3e0cb4fe668018998)
- [Refactor] use `gopd` [`9841d5b`](https://github.com/ljharb/get-intrinsic/commit/9841d5b35f7ab4fd2d193f0c741a50a077920e90)
- [Dev Deps] update `@ljharb/eslint-config`, `auto-changelog`, `es-abstract`, `es-value-fixtures`, `gopd`, `mock-property`, `object-inspect`, `tape` [`2d07e01`](https://github.com/ljharb/get-intrinsic/commit/2d07e01310cee2cbaedfead6903df128b1f5d425)
- [Deps] update `gopd`, `has-proto`, `has-symbols`, `hasown` [`974d8bf`](https://github.com/ljharb/get-intrinsic/commit/974d8bf5baad7939eef35c25cc1dd88c10a30fa6)
- [Dev Deps] update `call-bind`, `es-abstract`, `tape` [`df9dde1`](https://github.com/ljharb/get-intrinsic/commit/df9dde178186631ab8a3165ede056549918ce4bc)
- [Refactor] cache `es-define-property` as well [`43ef543`](https://github.com/ljharb/get-intrinsic/commit/43ef543cb02194401420e3a914a4ca9168691926)
- [Deps] update `has-proto`, `has-symbols`, `hasown` [`ad4949d`](https://github.com/ljharb/get-intrinsic/commit/ad4949d5467316505aad89bf75f9417ed782f7af)
- [Tests] use `call-bound` directly [`ad5c406`](https://github.com/ljharb/get-intrinsic/commit/ad5c4069774bfe90e520a35eead5fe5ca9d69e80)
- [Deps] update `has-proto`, `hasown` [`45414ca`](https://github.com/ljharb/get-intrinsic/commit/45414caa312333a2798953682c68f85c550627dd)
- [Tests] replace `aud` with `npm audit` [`18d3509`](https://github.com/ljharb/get-intrinsic/commit/18d3509f79460e7924da70409ee81e5053087523)
- [Deps] update `es-define-property` [`aadaa3b`](https://github.com/ljharb/get-intrinsic/commit/aadaa3b2188d77ad9bff394ce5d4249c49eb21f5)
- [Dev Deps] add missing peer dep [`c296a16`](https://github.com/ljharb/get-intrinsic/commit/c296a16246d0c9a5981944f4cc5cf61fbda0cf6a)

## [v1.2.4](https://github.com/ljharb/get-intrinsic/compare/v1.2.3...v1.2.4) - 2024-02-05

### Commits

- [Refactor] use all 7 &lt;+ ES6 Errors from `es-errors` [`bcac811`](https://github.com/ljharb/get-intrinsic/commit/bcac811abdc1c982e12abf848a410d6aae148d14)

## [v1.2.3](https://github.com/ljharb/get-intrinsic/compare/v1.2.2...v1.2.3) - 2024-02-03

### Commits

- [Refactor] use `es-errors`, so things that only need those do not need `get-intrinsic` [`f11db9c`](https://github.com/ljharb/get-intrinsic/commit/f11db9c4fb97d87bbd53d3c73ac6b3db3613ad3b)
- [Dev Deps] update `aud`, `es-abstract`, `mock-property`, `npmignore` [`b7ac7d1`](https://github.com/ljharb/get-intrinsic/commit/b7ac7d1616fefb03877b1aed0c8f8d61aad32b6c)
- [meta] simplify `exports` [`faa0cc6`](https://github.com/ljharb/get-intrinsic/commit/faa0cc618e2830ffb51a8202490b0c215d965cbc)
- [meta] add missing `engines.node` [`774dd0b`](https://github.com/ljharb/get-intrinsic/commit/774dd0b3e8f741c3f05a6322d124d6087f146af1)
- [Dev Deps] update `tape` [`5828e8e`](https://github.com/ljharb/get-intrinsic/commit/5828e8e4a04e69312e87a36c0ea39428a7a4c3d8)
- [Robustness] use null objects for lookups [`eb9a11f`](https://github.com/ljharb/get-intrinsic/commit/eb9a11fa9eb3e13b193fcc05a7fb814341b1a7b7)
- [meta] add `sideEffects` flag [`89bcc7a`](https://github.com/ljharb/get-intrinsic/commit/89bcc7a42e19bf07b7c21e3094d5ab177109e6d2)

## [v1.2.2](https://github.com/ljharb/get-intrinsic/compare/v1.2.1...v1.2.2) - 2023-10-20

### Commits

- [Dev Deps] update `@ljharb/eslint-config`, `aud`, `call-bind`, `es-abstract`, `mock-property`, `object-inspect`, `tape` [`f51bcf2`](https://github.com/ljharb/get-intrinsic/commit/f51bcf26412d58d17ce17c91c9afd0ad271f0762)
- [Refactor] use `hasown` instead of `has` [`18d14b7`](https://github.com/ljharb/get-intrinsic/commit/18d14b799bea6b5765e1cec91890830cbcdb0587)
- [Deps] update `function-bind` [`6e109c8`](https://github.com/ljharb/get-intrinsic/commit/6e109c81e03804cc5e7824fb64353cdc3d8ee2c7)

## [v1.2.1](https://github.com/ljharb/get-intrinsic/compare/v1.2.0...v1.2.1) - 2023-05-13

### Commits

- [Fix] avoid a crash in envs without `__proto__` [`7bad8d0`](https://github.com/ljharb/get-intrinsic/commit/7bad8d061bf8721733b58b73a2565af2b6756b64)
- [Dev Deps] update `es-abstract` [`c60e6b7`](https://github.com/ljharb/get-intrinsic/commit/c60e6b7b4cf9660c7f27ed970970fd55fac48dc5)

## [v1.2.0](https://github.com/ljharb/get-intrinsic/compare/v1.1.3...v1.2.0) - 2023-01-19

### Commits

- [actions] update checkout action [`ca6b12f`](https://github.com/ljharb/get-intrinsic/commit/ca6b12f31eaacea4ea3b055e744cd61623385ffb)
- [Dev Deps] update `@ljharb/eslint-config`, `es-abstract`, `object-inspect`, `tape` [`41a3727`](https://github.com/ljharb/get-intrinsic/commit/41a3727d0026fa04273ae216a5f8e12eefd72da8)
- [Fix] ensure `Error.prototype` is undeniable [`c511e97`](https://github.com/ljharb/get-intrinsic/commit/c511e97ae99c764c4524b540dee7a70757af8da3)
- [Dev Deps] update `aud`, `es-abstract`, `tape` [`1bef8a8`](https://github.com/ljharb/get-intrinsic/commit/1bef8a8fd439ebb80863199b6189199e0851ac67)
- [Dev Deps] update `aud`, `es-abstract` [`0d41f16`](https://github.com/ljharb/get-intrinsic/commit/0d41f16bcd500bc28b7bfc98043ebf61ea081c26)
- [New] add `BigInt64Array` and `BigUint64Array` [`a6cca25`](https://github.com/ljharb/get-intrinsic/commit/a6cca25f29635889b7e9bd669baf9e04be90e48c)
- [Tests] use `gopd` [`ecf7722`](https://github.com/ljharb/get-intrinsic/commit/ecf7722240d15cfd16edda06acf63359c10fb9bd)

## [v1.1.3](https://github.com/ljharb/get-intrinsic/compare/v1.1.2...v1.1.3) - 2022-09-12

### Commits

- [Dev Deps] update `es-abstract`, `es-value-fixtures`, `tape` [`07ff291`](https://github.com/ljharb/get-intrinsic/commit/07ff291816406ebe5a12d7f16965bde0942dd688)
- [Fix] properly check for % signs [`50ac176`](https://github.com/ljharb/get-intrinsic/commit/50ac1760fe99c227e64eabde76e9c0e44cd881b5)

## [v1.1.2](https://github.com/ljharb/get-intrinsic/compare/v1.1.1...v1.1.2) - 2022-06-08

### Fixed

- [Fix] properly validate against extra % signs [`#16`](https://github.com/ljharb/get-intrinsic/issues/16)

### Commits

- [actions] reuse common workflows [`0972547`](https://github.com/ljharb/get-intrinsic/commit/0972547efd0abc863fe4c445a6ca7eb4f8c6901d)
- [meta] use `npmignore` to autogenerate an npmignore file [`5ba0b51`](https://github.com/ljharb/get-intrinsic/commit/5ba0b51d8d8d4f1c31d426d74abc0770fd106bad)
- [actions] use `node/install` instead of `node/run`; use `codecov` action [`c364492`](https://github.com/ljharb/get-intrinsic/commit/c364492af4af51333e6f81c0bf21fd3d602c3661)
- [Dev Deps] update `eslint`, `@ljharb/eslint-config`, `aud`, `auto-changelog`, `es-abstract`, `object-inspect`, `tape` [`dc04dad`](https://github.com/ljharb/get-intrinsic/commit/dc04dad86f6e5608775a2640cb0db5927ae29ed9)
- [Dev Deps] update `eslint`, `@ljharb/eslint-config`, `es-abstract`, `object-inspect`, `safe-publish-latest`, `tape` [`1c14059`](https://github.com/ljharb/get-intrinsic/commit/1c1405984e86dd2dc9366c15d8a0294a96a146a5)
- [Tests] use `mock-property` [`b396ef0`](https://github.com/ljharb/get-intrinsic/commit/b396ef05bb73b1d699811abd64b0d9b97997fdda)
- [Dev Deps] update `eslint`, `@ljharb/eslint-config`, `aud`, `auto-changelog`, `object-inspect`, `tape` [`c2c758d`](https://github.com/ljharb/get-intrinsic/commit/c2c758d3b90af4fef0a76910d8d3c292ec8d1d3e)
- [Dev Deps] update `eslint`, `@ljharb/eslint-config`, `aud`, `es-abstract`, `es-value-fixtures`, `object-inspect`, `tape` [`29e3c09`](https://github.com/ljharb/get-intrinsic/commit/29e3c091c2bf3e17099969847e8729d0e46896de)
- [actions] update codecov uploader [`8cbc141`](https://github.com/ljharb/get-intrinsic/commit/8cbc1418940d7a8941f3a7985cbc4ac095c5e13d)
- [Dev Deps] update `@ljharb/eslint-config`, `es-abstract`, `es-value-fixtures`, `object-inspect`, `tape` [`10b6f5c`](https://github.com/ljharb/get-intrinsic/commit/10b6f5c02593fb3680c581d696ac124e30652932)
- [readme] add github actions/codecov badges [`4e25400`](https://github.com/ljharb/get-intrinsic/commit/4e25400d9f51ae9eb059cbe22d9144e70ea214e8)
- [Tests] use `for-each` instead of `foreach` [`c05b957`](https://github.com/ljharb/get-intrinsic/commit/c05b957ad9a7bc7721af7cc9e9be1edbfe057496)
- [Dev Deps] update `es-abstract` [`29b05ae`](https://github.com/ljharb/get-intrinsic/commit/29b05aec3e7330e9ad0b8e0f685a9112c20cdd97)
- [meta] use `prepublishOnly` script for npm 7+ [`95c285d`](https://github.com/ljharb/get-intrinsic/commit/95c285da810516057d3bbfa871176031af38f05d)
- [Deps] update `has-symbols` [`593cb4f`](https://github.com/ljharb/get-intrinsic/commit/593cb4fb38e7922e40e42c183f45274b636424cd)
- [readme] fix repo URLs [`1c8305b`](https://github.com/ljharb/get-intrinsic/commit/1c8305b5365827c9b6fc785434aac0e1328ff2f5)
- [Deps] update `has-symbols` [`c7138b6`](https://github.com/ljharb/get-intrinsic/commit/c7138b6c6d73132d859471fb8c13304e1e7c8b20)
- [Dev Deps] remove unused `has-bigints` [`bd63aff`](https://github.com/ljharb/get-intrinsic/commit/bd63aff6ad8f3a986c557fcda2914187bdaab359)

## [v1.1.1](https://github.com/ljharb/get-intrinsic/compare/v1.1.0...v1.1.1) - 2021-02-03

### Fixed

- [meta] export `./package.json` [`#9`](https://github.com/ljharb/get-intrinsic/issues/9)

### Commits

- [readme] flesh out the readme; use `evalmd` [`d12f12c`](https://github.com/ljharb/get-intrinsic/commit/d12f12c15345a0a0772cc65a7c64369529abd614)
- [eslint] set up proper globals config [`5a8c098`](https://github.com/ljharb/get-intrinsic/commit/5a8c0984e3319d1ac0e64b102f8ec18b64e79f36)
- [Dev Deps] update `eslint` [`7b9a5c0`](https://github.com/ljharb/get-intrinsic/commit/7b9a5c0d31a90ca1a1234181c74988fb046701cd)

## [v1.1.0](https://github.com/ljharb/get-intrinsic/compare/v1.0.2...v1.1.0) - 2021-01-25

### Fixed

- [Refactor] delay `Function` eval until syntax-derived values are requested [`#3`](https://github.com/ljharb/get-intrinsic/issues/3)

### Commits

- [Tests] migrate tests to Github Actions [`2ab762b`](https://github.com/ljharb/get-intrinsic/commit/2ab762b48164aea8af37a40ba105bbc8246ab8c4)
- [meta] do not publish github action workflow files [`5e7108e`](https://github.com/ljharb/get-intrinsic/commit/5e7108e4768b244d48d9567ba4f8a6cab9c65b8e)
- [Tests] add some coverage [`01ac7a8`](https://github.com/ljharb/get-intrinsic/commit/01ac7a87ac29738567e8524cd8c9e026b1fa8cb3)
- [Dev Deps] update `eslint`, `@ljharb/eslint-config`, `call-bind`, `es-abstract`, `tape`; add `call-bind` [`911b672`](https://github.com/ljharb/get-intrinsic/commit/911b672fbffae433a96924c6ce013585e425f4b7)
- [Refactor] rearrange evalled constructors a bit [`7e7e4bf`](https://github.com/ljharb/get-intrinsic/commit/7e7e4bf583f3799c8ac1c6c5e10d2cb553957347)
- [meta] add Automatic Rebase and Require Allow Edits workflows [`0199968`](https://github.com/ljharb/get-intrinsic/commit/01999687a263ffce0a3cb011dfbcb761754aedbc)

## [v1.0.2](https://github.com/ljharb/get-intrinsic/compare/v1.0.1...v1.0.2) - 2020-12-17

### Commits

- [Fix] Throw for non‑existent intrinsics [`68f873b`](https://github.com/ljharb/get-intrinsic/commit/68f873b013c732a05ad6f5fc54f697e55515461b)
- [Fix] Throw for non‑existent segments in the intrinsic path [`8325dee`](https://github.com/ljharb/get-intrinsic/commit/8325deee43128f3654d3399aa9591741ebe17b21)
- [Dev Deps] update `eslint`, `@ljharb/eslint-config`, `aud`, `has-bigints`, `object-inspect` [`0c227a7`](https://github.com/ljharb/get-intrinsic/commit/0c227a7d8b629166f25715fd242553892e458525)
- [meta] do not lint coverage output [`70d2419`](https://github.com/ljharb/get-intrinsic/commit/70d24199b620043cd9110fc5f426d214ebe21dc9)

## [v1.0.1](https://github.com/ljharb/get-intrinsic/compare/v1.0.0...v1.0.1) - 2020-10-30

### Commits

- [Tests] gather coverage data on every job [`d1d280d`](https://github.com/ljharb/get-intrinsic/commit/d1d280dec714e3f0519cc877dbcb193057d9cac6)
- [Fix] add missing dependencies [`5031771`](https://github.com/ljharb/get-intrinsic/commit/5031771bb1095b38be88ce7c41d5de88718e432e)
- [Tests] use `es-value-fixtures` [`af48765`](https://github.com/ljharb/get-intrinsic/commit/af48765a23c5323fb0b6b38dbf00eb5099c7bebc)

## v1.0.0 - 2020-10-29

### Commits

- Implementation [`bbce57c`](https://github.com/ljharb/get-intrinsic/commit/bbce57c6f33d05b2d8d3efa273ceeb3ee01127bb)
- Tests [`17b4f0d`](https://github.com/ljharb/get-intrinsic/commit/17b4f0d56dea6b4059b56fc30ef3ee4d9500ebc2)
- Initial commit [`3153294`](https://github.com/ljharb/get-intrinsic/commit/31532948de363b0a27dd9fd4649e7b7028ec4b44)
- npm init [`fb326c4`](https://github.com/ljharb/get-intrinsic/commit/fb326c4d2817c8419ec31de1295f06bb268a7902)
- [meta] add Automatic Rebase and Require Allow Edits workflows [`48862fb`](https://github.com/ljharb/get-intrinsic/commit/48862fb2508c8f6a57968e6d08b7c883afc9d550)
- [meta] add `auto-changelog` [`5f28ad0`](https://github.com/ljharb/get-intrinsic/commit/5f28ad019e060a353d8028f9f2591a9cc93074a1)
- [meta] add "funding"; create `FUNDING.yml` [`c2bbdde`](https://github.com/ljharb/get-intrinsic/commit/c2bbddeba73a875be61484ee4680b129a6d4e0a1)
- [Tests] add `npm run lint` [`0a84b98`](https://github.com/ljharb/get-intrinsic/commit/0a84b98b22b7cf7a748666f705b0003a493c35fd)
- Only apps should have lockfiles [`9586c75`](https://github.com/ljharb/get-intrinsic/commit/9586c75866c1ee678e4d5d4dbbdef6997e511b05)


---
## Source: node_modules\get-proto\CHANGELOG.md

# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/)
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [v1.0.1](https://github.com/ljharb/get-proto/compare/v1.0.0...v1.0.1) - 2025-01-02

### Commits

- [Fix] for the `Object.getPrototypeOf` window, throw for non-objects [`7fe6508`](https://github.com/ljharb/get-proto/commit/7fe6508b71419ebe1976bedb86001d1feaeaa49a)

## v1.0.0 - 2025-01-01

### Commits

- Initial implementation, tests, readme, types [`5c70775`](https://github.com/ljharb/get-proto/commit/5c707751e81c3deeb2cf980d185fc7fd43611415)
- Initial commit [`7c65c2a`](https://github.com/ljharb/get-proto/commit/7c65c2ad4e33d5dae2f219ebe1a046ae2256972c)
- npm init [`0b8cf82`](https://github.com/ljharb/get-proto/commit/0b8cf824c9634e4a34ef7dd2a2cdc5be6ac79518)
- Only apps should have lockfiles [`a6d1bff`](https://github.com/ljharb/get-proto/commit/a6d1bffc364f5828377cea7194558b2dbef7aea2)


---
## Source: node_modules\gopd\CHANGELOG.md

# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/)
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [v1.2.0](https://github.com/ljharb/gopd/compare/v1.1.0...v1.2.0) - 2024-12-03

### Commits

- [New] add `gOPD` entry point; remove `get-intrinsic` [`5b61232`](https://github.com/ljharb/gopd/commit/5b61232dedea4591a314bcf16101b1961cee024e)

## [v1.1.0](https://github.com/ljharb/gopd/compare/v1.0.1...v1.1.0) - 2024-11-29

### Commits

- [New] add types [`f585e39`](https://github.com/ljharb/gopd/commit/f585e397886d270e4ba84e53d226e4f9ca2eb0e6)
- [Dev Deps] update `@ljharb/eslint-config`, `auto-changelog`, `tape` [`0b8e4fd`](https://github.com/ljharb/gopd/commit/0b8e4fded64397a7726a9daa144a6cc9a5e2edfa)
- [Dev Deps] update `aud`, `npmignore`, `tape` [`48378b2`](https://github.com/ljharb/gopd/commit/48378b2443f09a4f7efbd0fb6c3ee845a6cabcf3)
- [Dev Deps] update `@ljharb/eslint-config`, `aud`, `tape` [`78099ee`](https://github.com/ljharb/gopd/commit/78099eeed41bfdc134c912280483689cc8861c31)
- [Tests] replace `aud` with `npm audit` [`4e0d0ac`](https://github.com/ljharb/gopd/commit/4e0d0ac47619d24a75318a8e1f543ee04b2a2632)
- [meta] add missing `engines.node` [`1443316`](https://github.com/ljharb/gopd/commit/14433165d07835c680155b3dfd62d9217d735eca)
- [Deps] update `get-intrinsic` [`eee5f51`](https://github.com/ljharb/gopd/commit/eee5f51769f3dbaf578b70e2a3199116b01aa670)
- [Deps] update `get-intrinsic` [`550c378`](https://github.com/ljharb/gopd/commit/550c3780e3a9c77b62565712a001b4ed64ea61f5)
- [Dev Deps] add missing peer dep [`8c2ecf8`](https://github.com/ljharb/gopd/commit/8c2ecf848122e4e30abfc5b5086fb48b390dce75)

## [v1.0.1](https://github.com/ljharb/gopd/compare/v1.0.0...v1.0.1) - 2022-11-01

### Commits

- [Fix] actually export gOPD instead of dP [`4b624bf`](https://github.com/ljharb/gopd/commit/4b624bfbeff788c5e3ff16d9443a83627847234f)

## v1.0.0 - 2022-11-01

### Commits

- Initial implementation, tests, readme [`0911e01`](https://github.com/ljharb/gopd/commit/0911e012cd642092bd88b732c161c58bf4f20bea)
- Initial commit [`b84e33f`](https://github.com/ljharb/gopd/commit/b84e33f5808a805ac57ff88d4247ad935569acbe)
- [actions] add reusable workflows [`12ae28a`](https://github.com/ljharb/gopd/commit/12ae28ae5f50f86e750215b6e2188901646d0119)
- npm init [`280118b`](https://github.com/ljharb/gopd/commit/280118badb45c80b4483836b5cb5315bddf6e582)
- [meta] add `auto-changelog` [`bb78de5`](https://github.com/ljharb/gopd/commit/bb78de5639a180747fb290c28912beaaf1615709)
- [meta] create FUNDING.yml; add `funding` in package.json [`11c22e6`](https://github.com/ljharb/gopd/commit/11c22e6355bb01f24e7fac4c9bb3055eb5b25002)
- [meta] use `npmignore` to autogenerate an npmignore file [`4f4537a`](https://github.com/ljharb/gopd/commit/4f4537a843b39f698c52f072845092e6fca345bb)
- Only apps should have lockfiles [`c567022`](https://github.com/ljharb/gopd/commit/c567022a18573aa7951cf5399445d9840e23e98b)


---
## Source: node_modules\has-symbols\CHANGELOG.md

# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/)
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [v1.1.0](https://github.com/inspect-js/has-symbols/compare/v1.0.3...v1.1.0) - 2024-12-02

### Commits

- [actions] update workflows [`548c0bf`](https://github.com/inspect-js/has-symbols/commit/548c0bf8c9b1235458df7a1c0490b0064647a282)
- [actions] further shard; update action deps [`bec56bb`](https://github.com/inspect-js/has-symbols/commit/bec56bb0fb44b43a786686b944875a3175cf3ff3)
- [meta] use `npmignore` to autogenerate an npmignore file [`ac81032`](https://github.com/inspect-js/has-symbols/commit/ac81032809157e0a079e5264e9ce9b6f1275777e)
- [New] add types [`6469cbf`](https://github.com/inspect-js/has-symbols/commit/6469cbff1866cfe367b2b3d181d9296ec14b2a3d)
- [actions] update rebase action to use reusable workflow [`9c9d4d0`](https://github.com/inspect-js/has-symbols/commit/9c9d4d0d8938e4b267acdf8e421f4e92d1716d72)
- [Dev Deps] update `eslint`, `@ljharb/eslint-config`, `aud`, `tape` [`adb5887`](https://github.com/inspect-js/has-symbols/commit/adb5887ca9444849b08beb5caaa9e1d42320cdfb)
- [Dev Deps] update `@ljharb/eslint-config`, `aud`, `tape` [`13ec198`](https://github.com/inspect-js/has-symbols/commit/13ec198ec80f1993a87710af1606a1970b22c7cb)
- [Dev Deps] update `auto-changelog`, `core-js`, `tape` [`941be52`](https://github.com/inspect-js/has-symbols/commit/941be5248387cab1da72509b22acf3fdb223f057)
- [Tests] replace `aud` with `npm audit` [`74f49e9`](https://github.com/inspect-js/has-symbols/commit/74f49e9a9d17a443020784234a1c53ce765b3559)
- [Dev Deps] update `npmignore` [`9c0ac04`](https://github.com/inspect-js/has-symbols/commit/9c0ac0452a834f4c2a4b54044f2d6a89f17e9a70)
- [Dev Deps] add missing peer dep [`52337a5`](https://github.com/inspect-js/has-symbols/commit/52337a5621cced61f846f2afdab7707a8132cc12)

## [v1.0.3](https://github.com/inspect-js/has-symbols/compare/v1.0.2...v1.0.3) - 2022-03-01

### Commits

- [actions] use `node/install` instead of `node/run`; use `codecov` action [`518b28f`](https://github.com/inspect-js/has-symbols/commit/518b28f6c5a516cbccae30794e40aa9f738b1693)
- [meta] add `bugs` and `homepage` fields; reorder package.json [`c480b13`](https://github.com/inspect-js/has-symbols/commit/c480b13fd6802b557e1cef9749872cb5fdeef744)
- [actions] reuse common workflows [`01d0ee0`](https://github.com/inspect-js/has-symbols/commit/01d0ee0a8d97c0947f5edb73eb722027a77b2b07)
- [actions] update codecov uploader [`6424ebe`](https://github.com/inspect-js/has-symbols/commit/6424ebe86b2c9c7c3d2e9bd4413a4e4f168cb275)
- [Dev Deps] update `eslint`, `@ljharb/eslint-config`, `aud`, `auto-changelog`, `tape` [`dfa7e7f`](https://github.com/inspect-js/has-symbols/commit/dfa7e7ff38b594645d8c8222aab895157fa7e282)
- [Dev Deps] update `eslint`, `@ljharb/eslint-config`, `safe-publish-latest`, `tape` [`0c8d436`](https://github.com/inspect-js/has-symbols/commit/0c8d43685c45189cea9018191d4fd7eca91c9d02)
- [Dev Deps] update `eslint`, `@ljharb/eslint-config`, `aud`, `tape` [`9026554`](https://github.com/inspect-js/has-symbols/commit/902655442a1bf88e72b42345494ef0c60f5d36ab)
- [readme] add actions and codecov badges [`eaa9682`](https://github.com/inspect-js/has-symbols/commit/eaa9682f990f481d3acf7a1c7600bec36f7b3adc)
- [Dev Deps] update `eslint`, `tape` [`bc7a3ba`](https://github.com/inspect-js/has-symbols/commit/bc7a3ba46f27b7743f8a2579732d59d1b9ac791e)
- [Dev Deps] update `eslint`, `auto-changelog` [`0ace00a`](https://github.com/inspect-js/has-symbols/commit/0ace00af08a88cdd1e6ce0d60357d941c60c2d9f)
- [meta] use `prepublishOnly` script for npm 7+ [`093f72b`](https://github.com/inspect-js/has-symbols/commit/093f72bc2b0ed00c781f444922a5034257bf561d)
- [Tests] test on all 16 minors [`9b80d3d`](https://github.com/inspect-js/has-symbols/commit/9b80d3d9102529f04c20ec5b1fcc6e38426c6b03)

## [v1.0.2](https://github.com/inspect-js/has-symbols/compare/v1.0.1...v1.0.2) - 2021-02-27

### Fixed

- [Fix] use a universal way to get the original Symbol [`#11`](https://github.com/inspect-js/has-symbols/issues/11)

### Commits

- [Tests] migrate tests to Github Actions [`90ae798`](https://github.com/inspect-js/has-symbols/commit/90ae79820bdfe7bc703d67f5f3c5e205f98556d3)
- [meta] do not publish github action workflow files [`29e60a1`](https://github.com/inspect-js/has-symbols/commit/29e60a1b7c25c7f1acf7acff4a9320d0d10c49b4)
- [Tests] run `nyc` on all tests [`8476b91`](https://github.com/inspect-js/has-symbols/commit/8476b915650d360915abe2522505abf4b0e8f0ae)
- [readme] fix repo URLs, remove defunct badges [`126288e`](https://github.com/inspect-js/has-symbols/commit/126288ecc1797c0a40247a6b78bcb2e0bc5d7036)
- [Dev Deps] update `eslint`, `@ljharb/eslint-config`, `aud`, `auto-changelog`, `core-js`, `get-own-property-symbols` [`d84bdfa`](https://github.com/inspect-js/has-symbols/commit/d84bdfa48ac5188abbb4904b42614cd6c030940a)
- [Tests] fix linting errors [`0df3070`](https://github.com/inspect-js/has-symbols/commit/0df3070b981b6c9f2ee530c09189a7f5c6def839)
- [actions] add "Allow Edits" workflow [`1e6bc29`](https://github.com/inspect-js/has-symbols/commit/1e6bc29b188f32b9648657b07eda08504be5aa9c)
- [Dev Deps] update `eslint`, `@ljharb/eslint-config`, `tape` [`36cea2a`](https://github.com/inspect-js/has-symbols/commit/36cea2addd4e6ec435f35a2656b4e9ef82498e9b)
- [Dev Deps] update `eslint`, `@ljharb/eslint-config`, `aud`, `tape` [`1278338`](https://github.com/inspect-js/has-symbols/commit/127833801865fbc2cc8979beb9ca869c7bfe8222)
- [Dev Deps] update `eslint`, `@ljharb/eslint-config`, `aud`, `tape` [`1493254`](https://github.com/inspect-js/has-symbols/commit/1493254eda13db5fb8fc5e4a3e8324b3d196029d)
- [Dev Deps] update `eslint`, `@ljharb/eslint-config`, `core-js` [`b090bf2`](https://github.com/inspect-js/has-symbols/commit/b090bf214d3679a30edc1e2d729d466ab5183e1d)
- [actions] switch Automatic Rebase workflow to `pull_request_target` event [`4addb7a`](https://github.com/inspect-js/has-symbols/commit/4addb7ab4dc73f927ae99928d68817554fc21dc0)
- [Dev Deps] update `auto-changelog`, `tape` [`81d0baf`](https://github.com/inspect-js/has-symbols/commit/81d0baf3816096a89a8558e8043895f7a7d10d8b)
- [Dev Deps] update `auto-changelog`; add `aud` [`1a4e561`](https://github.com/inspect-js/has-symbols/commit/1a4e5612c25d91c3a03d509721d02630bc4fe3da)
- [readme] remove unused testling URLs [`3000941`](https://github.com/inspect-js/has-symbols/commit/3000941f958046e923ed8152edb1ef4a599e6fcc)
- [Tests] only audit prod deps [`692e974`](https://github.com/inspect-js/has-symbols/commit/692e9743c912410e9440207631a643a34b4741a1)
- [Dev Deps] update `@ljharb/eslint-config` [`51c946c`](https://github.com/inspect-js/has-symbols/commit/51c946c7f6baa793ec5390bb5a45cdce16b4ba76)

## [v1.0.1](https://github.com/inspect-js/has-symbols/compare/v1.0.0...v1.0.1) - 2019-11-16

### Commits

- [Tests] use shared travis-ci configs [`ce396c9`](https://github.com/inspect-js/has-symbols/commit/ce396c9419ff11c43d0da5d05cdbb79f7fb42229)
- [Tests] up to `node` `v12.4`, `v11.15`, `v10.15`, `v9.11`, `v8.15`, `v7.10`, `v6.17`, `v4.9`; use `nvm install-latest-npm` [`0690732`](https://github.com/inspect-js/has-symbols/commit/0690732801f47ab429f39ba1962f522d5c462d6b)
- [meta] add `auto-changelog` [`2163d0b`](https://github.com/inspect-js/has-symbols/commit/2163d0b7f36343076b8f947cd1667dd1750f26fc)
- [Dev Deps] update `eslint`, `@ljharb/eslint-config`, `core-js`, `safe-publish-latest`, `tape` [`8e0951f`](https://github.com/inspect-js/has-symbols/commit/8e0951f1a7a2e52068222b7bb73511761e6e4d9c)
- [actions] add automatic rebasing / merge commit blocking [`b09cdb7`](https://github.com/inspect-js/has-symbols/commit/b09cdb7cd7ee39e7a769878f56e2d6066f5ccd1d)
- [Dev Deps] update `eslint`, `@ljharb/eslint-config`, `safe-publish-latest`, `core-js`, `get-own-property-symbols`, `tape` [`1dd42cd`](https://github.com/inspect-js/has-symbols/commit/1dd42cd86183ed0c50f99b1062345c458babca91)
- [meta] create FUNDING.yml [`aa57a17`](https://github.com/inspect-js/has-symbols/commit/aa57a17b19708906d1927f821ea8e73394d84ca4)
- Only apps should have lockfiles [`a2d8bea`](https://github.com/inspect-js/has-symbols/commit/a2d8bea23a97d15c09eaf60f5b107fcf9a4d57aa)
- [Tests] use `npx aud` instead of `nsp` or `npm audit` with hoops [`9e96cb7`](https://github.com/inspect-js/has-symbols/commit/9e96cb783746cbed0c10ef78e599a8eaa7ebe193)
- [meta] add `funding` field [`a0b32cf`](https://github.com/inspect-js/has-symbols/commit/a0b32cf68e803f963c1639b6d47b0a9d6440bab0)
- [Dev Deps] update `safe-publish-latest` [`cb9f0a5`](https://github.com/inspect-js/has-symbols/commit/cb9f0a521a3a1790f1064d437edd33bb6c3d6af0)

## v1.0.0 - 2016-09-19

### Commits

- Tests. [`ecb6eb9`](https://github.com/inspect-js/has-symbols/commit/ecb6eb934e4883137f3f93b965ba5e0a98df430d)
- package.json [`88a337c`](https://github.com/inspect-js/has-symbols/commit/88a337cee0864a0da35f5d19e69ff0ef0150e46a)
- Initial commit [`42e1e55`](https://github.com/inspect-js/has-symbols/commit/42e1e5502536a2b8ac529c9443984acd14836b1c)
- Initial implementation. [`33f5cc6`](https://github.com/inspect-js/has-symbols/commit/33f5cc6cdff86e2194b081ee842bfdc63caf43fb)
- read me [`01f1170`](https://github.com/inspect-js/has-symbols/commit/01f1170188ff7cb1558aa297f6ba5b516c6d7b0c)


---
## Source: node_modules\hasown\CHANGELOG.md

# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/)
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [v2.0.2](https://github.com/inspect-js/hasOwn/compare/v2.0.1...v2.0.2) - 2024-03-10

### Commits

- [types] use shared config [`68e9d4d`](https://github.com/inspect-js/hasOwn/commit/68e9d4dab6facb4f05f02c6baea94a3f2a4e44b2)
- [actions] remove redundant finisher; use reusable workflow [`241a68e`](https://github.com/inspect-js/hasOwn/commit/241a68e13ea1fe52bec5ba7f74144befc31fae7b)
- [Tests] increase coverage [`4125c0d`](https://github.com/inspect-js/hasOwn/commit/4125c0d6121db56ae30e38346dfb0c000b04f0a7)
- [Tests] skip `npm ls` in old node due to TS [`01b9282`](https://github.com/inspect-js/hasOwn/commit/01b92822f9971dea031eafdd14767df41d61c202)
- [types] improve predicate type [`d340f85`](https://github.com/inspect-js/hasOwn/commit/d340f85ce02e286ef61096cbbb6697081d40a12b)
- [Dev Deps] update `tape` [`70089fc`](https://github.com/inspect-js/hasOwn/commit/70089fcf544e64acc024cbe60f5a9b00acad86de)
- [Tests] use `@arethetypeswrong/cli` [`50b272c`](https://github.com/inspect-js/hasOwn/commit/50b272c829f40d053a3dd91c9796e0ac0b2af084)

## [v2.0.1](https://github.com/inspect-js/hasOwn/compare/v2.0.0...v2.0.1) - 2024-02-10

### Commits

- [types] use a handwritten d.ts file; fix exported type [`012b989`](https://github.com/inspect-js/hasOwn/commit/012b9898ccf91dc441e2ebf594ff70270a5fda58)
- [Dev Deps] update `@types/function-bind`, `@types/mock-property`, `@types/tape`, `aud`, `mock-property`, `npmignore`, `tape`, `typescript` [`977a56f`](https://github.com/inspect-js/hasOwn/commit/977a56f51a1f8b20566f3c471612137894644025)
- [meta] add `sideEffects` flag [`3a60b7b`](https://github.com/inspect-js/hasOwn/commit/3a60b7bf42fccd8c605e5f145a6fcc83b13cb46f)

## [v2.0.0](https://github.com/inspect-js/hasOwn/compare/v1.0.1...v2.0.0) - 2023-10-19

### Commits

- revamped implementation, tests, readme [`72bf8b3`](https://github.com/inspect-js/hasOwn/commit/72bf8b338e77a638f0a290c63ffaed18339c36b4)
- [meta] revamp package.json [`079775f`](https://github.com/inspect-js/hasOwn/commit/079775fb1ec72c1c6334069593617a0be3847458)
- Only apps should have lockfiles [`6640e23`](https://github.com/inspect-js/hasOwn/commit/6640e233d1bb8b65260880f90787637db157d215)

## v1.0.1 - 2023-10-10

### Commits

- Initial commit [`8dbfde6`](https://github.com/inspect-js/hasOwn/commit/8dbfde6e8fb0ebb076fab38d138f2984eb340a62)


---
## Source: node_modules\http-proxy\CHANGELOG.md

# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/)
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

Generated by [`auto-changelog`](https://github.com/CookPete/auto-changelog).

## [v1.18.1](https://github.com/http-party/node-http-proxy/compare/1.18.0...v1.18.1) - 2020-05-17

### Merged

- Skip sending the proxyReq event when the expect header is present [`#1447`](https://github.com/http-party/node-http-proxy/pull/1447)
- Remove node6 support, add node12 to build [`#1397`](https://github.com/http-party/node-http-proxy/pull/1397)

## [1.18.0](https://github.com/http-party/node-http-proxy/compare/1.17.0...1.18.0) - 2019-09-18

### Merged

- Added in auto-changelog module set to keepachangelog format [`#1373`](https://github.com/http-party/node-http-proxy/pull/1373)
- fix 'Modify Response' readme section to avoid unnecessary array copying [`#1300`](https://github.com/http-party/node-http-proxy/pull/1300)
- Fix incorrect target name for reverse proxy example [`#1135`](https://github.com/http-party/node-http-proxy/pull/1135)
- Fix modify response middleware example [`#1139`](https://github.com/http-party/node-http-proxy/pull/1139)
- [dist] Update dependency async to v3 [`#1359`](https://github.com/http-party/node-http-proxy/pull/1359)
- Fix path to local http-proxy in examples. [`#1072`](https://github.com/http-party/node-http-proxy/pull/1072)
- fix reverse-proxy example require path [`#1067`](https://github.com/http-party/node-http-proxy/pull/1067)
- Update README.md [`#970`](https://github.com/http-party/node-http-proxy/pull/970)
- [dist] Update dependency request to ~2.88.0 [SECURITY] [`#1357`](https://github.com/http-party/node-http-proxy/pull/1357)
- [dist] Update dependency eventemitter3 to v4 [`#1365`](https://github.com/http-party/node-http-proxy/pull/1365)
- [dist] Update dependency colors to v1 [`#1360`](https://github.com/http-party/node-http-proxy/pull/1360)
- [dist] Update all non-major dependencies [`#1356`](https://github.com/http-party/node-http-proxy/pull/1356)
- [dist] Update dependency agentkeepalive to v4 [`#1358`](https://github.com/http-party/node-http-proxy/pull/1358)
- [dist] Update dependency nyc to v14 [`#1367`](https://github.com/http-party/node-http-proxy/pull/1367)
- [dist] Update dependency concat-stream to v2 [`#1363`](https://github.com/http-party/node-http-proxy/pull/1363)
- x-forwarded-host overwrite for mutli level proxies [`#1267`](https://github.com/http-party/node-http-proxy/pull/1267)
- [refactor doc] Complete rename to http-party org. [`#1362`](https://github.com/http-party/node-http-proxy/pull/1362)
- Highlight correct lines for createProxyServer [`#1117`](https://github.com/http-party/node-http-proxy/pull/1117)
- Fix docs for rewrite options - 201 also handled [`#1147`](https://github.com/http-party/node-http-proxy/pull/1147)
- Update .nyc_output [`#1339`](https://github.com/http-party/node-http-proxy/pull/1339)
- Configure Renovate [`#1355`](https://github.com/http-party/node-http-proxy/pull/1355)
- [examples] Restream body before proxying, support for Content-Type of application/x-www-form-urlencoded [`#1264`](https://github.com/http-party/node-http-proxy/pull/1264)

### Commits

- [dist] New test fixtures. [`7e4a0e5`](https://github.com/http-party/node-http-proxy/commit/7e4a0e511bc30c059216860153301de2cdd1e97f)
- [dist] End of an era. [`a9b09cc`](https://github.com/http-party/node-http-proxy/commit/a9b09cce43f072db99fb5170030a05536177ccb7)
- [dist] Version bump. 1.18.0 [`9bbe486`](https://github.com/http-party/node-http-proxy/commit/9bbe486c5efcc356fb4d189ef38eee275bbde345)
- [fix] Latest versions. [`59c4403`](https://github.com/http-party/node-http-proxy/commit/59c4403e9dc15ab9b19ee2a3f4aecbfc6c3d94c4)
- [fix test] Update tests. [`dd1d08b`](https://github.com/http-party/node-http-proxy/commit/dd1d08b6319d1def729554446a5b0176978a8dad)
- [dist] Update dependency ws to v3 [SECURITY] [`b00911c`](https://github.com/http-party/node-http-proxy/commit/b00911c93740a00c5cfbacbb91565cb6912ed255)
- [dist] .gitattributes all the things. [`fc93520`](https://github.com/http-party/node-http-proxy/commit/fc93520d741ec80be8ae31ca005f3e9c199e330e)
- [dist] Regenerate package-lock.json. [`16d4f8a`](https://github.com/http-party/node-http-proxy/commit/16d4f8a95162b2e2e4ee6657c500f1208c044b2d)

## [1.17.0](https://github.com/http-party/node-http-proxy/compare/1.16.2...1.17.0) - 2018-04-20

### Merged

- Fix overwriting of global options [`#1074`](https://github.com/http-party/node-http-proxy/pull/1074)
- Update README.md [`#1131`](https://github.com/http-party/node-http-proxy/pull/1131)
- Update README.md with CoC link [`#1120`](https://github.com/http-party/node-http-proxy/pull/1120)
- Add Code Of Conduct [`#1119`](https://github.com/http-party/node-http-proxy/pull/1119)
- [deps] Update eventemitter3 to version 2.0.x [`#1109`](https://github.com/http-party/node-http-proxy/pull/1109)

### Fixed

- Fix "Can't set headers after they are sent" errors [`#930`](https://github.com/http-party/node-http-proxy/issues/930)
- Include websocket non-upgrade response [`#890`](https://github.com/http-party/node-http-proxy/issues/890)

### Commits

- Add followRedirects option [`c9a556c`](https://github.com/http-party/node-http-proxy/commit/c9a556cfa57c7ce0b877e16f2c2e1448d8cc278d)
- [test] add test for selfHandleRequest and remove modifyResponse as selfHandleRequest is the only way that functionality works [`4a37175`](https://github.com/http-party/node-http-proxy/commit/4a37175a5296d2ea2da0fc15a3f8fe08599bb592)
- Adding ability to set cookie path [`2c98416`](https://github.com/http-party/node-http-proxy/commit/2c98416ac2bf17bb5f515b9e10ee4485f5913846)
- Updating docs and adding more tests. [`f5c2381`](https://github.com/http-party/node-http-proxy/commit/f5c2381395e01bf8d6655cc70e14032c8f0aaa67)
- [dist] make tests work reliably, add package-lock.json [`09dcb98`](https://github.com/http-party/node-http-proxy/commit/09dcb984565dabb159a01a75a188b974f8c176ad)
- add support for modify response [`e5c02b8`](https://github.com/http-party/node-http-proxy/commit/e5c02b8a8a902e204eee886acafbbfe46c4a3aef)
- [wip] proper tests and reporting [`f4ff100`](https://github.com/http-party/node-http-proxy/commit/f4ff1006b9e71eb4185a3edf03333dbe514a84c9)
- Add detail about "buffer" option [`6f88caf`](https://github.com/http-party/node-http-proxy/commit/6f88caf6e46d84a809910c591e138250b333b39f)
- Add use case for proxy to HTTPS using a PKCS12 client certificate [`d2f9db8`](https://github.com/http-party/node-http-proxy/commit/d2f9db824136358a06dc3dd566644f3a016f24e2)
- [test] for override method feature [`81d58c5`](https://github.com/http-party/node-http-proxy/commit/81d58c531be3f61efb56d2489a66c73a7b2325fe)
- [dist] doc updates [`e94d529`](https://github.com/http-party/node-http-proxy/commit/e94d52973a26cf817a9de12d97e5ae603093f70d)
- feat: 添加response自处理参数 [`89f9ef8`](https://github.com/http-party/node-http-proxy/commit/89f9ef87e0532d54d086719c5ace1a968a42e51b)
- [dist][test] codecov config [`a4bccc3`](https://github.com/http-party/node-http-proxy/commit/a4bccc332d36d7db93db984674cd7e51b43a1b99)
- Removing unnecessary check since this is a private API [`bc6a237`](https://github.com/http-party/node-http-proxy/commit/bc6a23709c37c65b5b16cc802d05cb57f099b0ce)
- issue #953: stop using writeHead [`2c44039`](https://github.com/http-party/node-http-proxy/commit/2c44039a7c30b190043da654ee7e5aed0304e979)
- [fix] move badges [`543636d`](https://github.com/http-party/node-http-proxy/commit/543636d0f662308ec8c9afdbf641f4036f002bfd)
- fix small typos in README [`8231984`](https://github.com/http-party/node-http-proxy/commit/8231984fb02dca331b4ef77e089db50855eea4f5)
- Added timeout option to docs [`107c187`](https://github.com/http-party/node-http-proxy/commit/107c18720c3906f9049cc14d075b31910c0ccf55)
- [dist] document the feature [`d533a1b`](https://github.com/http-party/node-http-proxy/commit/d533a1be437b37fed5bd25f5e58298eea819f974)
- [fix] slightly more tolerant [`de1b808`](https://github.com/http-party/node-http-proxy/commit/de1b80851ab1b1251b5eaeaf0beab164024f09b6)
- Forgot 'i' flag when changing from regex shorthand to string. [`50f58b4`](https://github.com/http-party/node-http-proxy/commit/50f58b4cd9b4422a11512a6a065432159b5bc806)
- Update common.js [`c5d8466`](https://github.com/http-party/node-http-proxy/commit/c5d846648304f2e36a172b25d9fb8300d8131f8c)
- [fix] rm newline [`e6f24ba`](https://github.com/http-party/node-http-proxy/commit/e6f24ba6173c4fdd26089b3c729de5dbdd71ad74)
- [dist] update package-lock.json [`abf882e`](https://github.com/http-party/node-http-proxy/commit/abf882e03c92cf1665d5b7d4dbdaf87feb50a677)

## [1.16.2](https://github.com/http-party/node-http-proxy/compare/1.16.1...1.16.2) - 2016-12-06

### Merged

- [WIP] Revert default behavior of writeHeaders method [`#1104`](https://github.com/http-party/node-http-proxy/pull/1104)

## [1.16.1](https://github.com/http-party/node-http-proxy/compare/1.16.0...1.16.1) - 2016-12-04

### Commits

- Enable proxy response to have multiple Set-Cookie raw headers #1101 [`8cb451f`](https://github.com/http-party/node-http-proxy/commit/8cb451f20cff0a19fc9576fc2558307fb17a5710)
- [dist] Version bump. 1.16.1 [`ac1a01b`](https://github.com/http-party/node-http-proxy/commit/ac1a01b1f3caa3a2a9433341bf5e7a95072d6612)

## [1.16.0](https://github.com/http-party/node-http-proxy/compare/1.15.2...1.16.0) - 2016-12-02

### Merged

- Fix newly introduced error in error handler for ECONNREFUSED in forward proxy [`#1100`](https://github.com/http-party/node-http-proxy/pull/1100)
- Keep original letter case of response header keys [`#1098`](https://github.com/http-party/node-http-proxy/pull/1098)
- Handle errors for forward request, add test case [`#1099`](https://github.com/http-party/node-http-proxy/pull/1099)

### Commits

- add node 6 to travis [`2f7f037`](https://github.com/http-party/node-http-proxy/commit/2f7f03778cfb94396acf0d778061ea197212fbb5)

## [1.15.2](https://github.com/http-party/node-http-proxy/compare/1.15.1...1.15.2) - 2016-10-22

### Merged

- Add proxy-timeout option to documentation [`#1075`](https://github.com/http-party/node-http-proxy/pull/1075)

### Commits

- Do not rely on func.name (no scope) [`61c2889`](https://github.com/http-party/node-http-proxy/commit/61c28891093b256bbc0dae78e45e2c5f0acf2101)
- Do not rely on func.name (no scope) [`d48f67e`](https://github.com/http-party/node-http-proxy/commit/d48f67eb90d8af66211093e91efdd6638859e0bf)
- Expose full callback names [`220f5fb`](https://github.com/http-party/node-http-proxy/commit/220f5fb795d2977c5a68ae59d7db65089efed50c)
- test case added [`f5217d6`](https://github.com/http-party/node-http-proxy/commit/f5217d6c20c164ed412a3b20f660786b6f88b35b)
- [fix] style nits [`d0f1dfe`](https://github.com/http-party/node-http-proxy/commit/d0f1dfeb8277d46a057017cd888b50e85f6725d6)
- With a comment [`fbc2668`](https://github.com/http-party/node-http-proxy/commit/fbc266809c289fbdb59d7944345816a858303c96)
- Fix browserification [`8eddf45`](https://github.com/http-party/node-http-proxy/commit/8eddf45f2a043e4e1b3f6e33c304e68fe7e1c406)
- not setting connection header in case of http2 as it is deprecated [`2d01edc`](https://github.com/http-party/node-http-proxy/commit/2d01edc5a5ace591784022b85860a3bbc48c5e12)

## [1.15.1](https://github.com/http-party/node-http-proxy/compare/1.15.0...1.15.1) - 2016-09-14

### Merged

- Properly write response header optionally including statusMessage [`#1061`](https://github.com/http-party/node-http-proxy/pull/1061)

### Commits

- [dist] Version bump. 1.15.1 [`912cd3a`](https://github.com/http-party/node-http-proxy/commit/912cd3acaef484f7ea08affc9339250082e04058)

## [1.15.0](https://github.com/http-party/node-http-proxy/compare/1.14.0...1.15.0) - 2016-09-14

### Merged

- Made it not to crash with omited Host http header [`#1050`](https://github.com/http-party/node-http-proxy/pull/1050)
- README.md: fix typo: 'ingoing' should be 'incoming' [`#1060`](https://github.com/http-party/node-http-proxy/pull/1060)
- Fix for Reason-Phrase being overwritten on proxy response. [`#1051`](https://github.com/http-party/node-http-proxy/pull/1051)
- cookieDomainRewrite option [`#1009`](https://github.com/http-party/node-http-proxy/pull/1009)
- Update ntlm-authentication.js [`#1025`](https://github.com/http-party/node-http-proxy/pull/1025)
- Restream body before proxying [`#1027`](https://github.com/http-party/node-http-proxy/pull/1027)
- Location rewriting for responses with status 201 [`#1024`](https://github.com/http-party/node-http-proxy/pull/1024)
- #866 Copy CA from options into outbound proxy [`#1042`](https://github.com/http-party/node-http-proxy/pull/1042)

### Fixed

- Restream body before proxying (#1027) [`#955`](https://github.com/http-party/node-http-proxy/issues/955)

### Commits

- [dist] Version bump. 1.15.0 [`b98c75b`](https://github.com/http-party/node-http-proxy/commit/b98c75b1ff3ebdf7f78224eb0d9aa857af2db1d9)

## [1.14.0](https://github.com/http-party/node-http-proxy/compare/1.13.3...1.14.0) - 2016-06-15

### Merged

- Emit disconnected event instead of error when ECONNRESET [`#966`](https://github.com/http-party/node-http-proxy/pull/966)
- fix test for node 0.10 + socket.io-client@1.4.6 (engine.io-client@1.6.9) [`#1010`](https://github.com/http-party/node-http-proxy/pull/1010)

### Commits

- [dist] Version bump. 1.14.0 [`fcfb0b3`](https://github.com/http-party/node-http-proxy/commit/fcfb0b37f6ac61369565507446377f91d955cf29)

## [1.13.3](https://github.com/http-party/node-http-proxy/compare/1.13.2...1.13.3) - 2016-05-16

### Merged

- fix browserify compatibility [`#975`](https://github.com/http-party/node-http-proxy/pull/975)
- alter message error [`#998`](https://github.com/http-party/node-http-proxy/pull/998)
- Sanitize header keys before setting them [`#997`](https://github.com/http-party/node-http-proxy/pull/997)
- Update ntlm-authentication.js [`#989`](https://github.com/http-party/node-http-proxy/pull/989)
- Add expected datatype to readme [`#983`](https://github.com/http-party/node-http-proxy/pull/983)
- Update README [`#982`](https://github.com/http-party/node-http-proxy/pull/982)
- Fix formatting of the `headers` option [`#974`](https://github.com/http-party/node-http-proxy/pull/974)
- Set the x-forwarded-host flag when xfwd is enabled [`#967`](https://github.com/http-party/node-http-proxy/pull/967)

### Fixed

- Sanitize header keys before setting them (#997) [`#996`](https://github.com/http-party/node-http-proxy/issues/996)

### Commits

- [dist] Update LICENSE to reflect 2015 changes. [`f345a1a`](https://github.com/http-party/node-http-proxy/commit/f345a1ac2dde1884e72b952a685a0a1796059f14)
- [dist] Version bump. 1.13.3 [`5082acc`](https://github.com/http-party/node-http-proxy/commit/5082acc067bbf287f503bbd5b776f798ab169db1)

## [1.13.2](https://github.com/http-party/node-http-proxy/compare/1.13.1...1.13.2) - 2016-02-17

### Merged

- Fixed missing documentation: #options.headers [`#806`](https://github.com/http-party/node-http-proxy/pull/806)
- #949 Proxy example using req instead res on README [`#950`](https://github.com/http-party/node-http-proxy/pull/950)
- mocha: Use default reporter [`#962`](https://github.com/http-party/node-http-proxy/pull/962)
- Remove "transfer-encoding" header if "content-length" is set to zero [`#961`](https://github.com/http-party/node-http-proxy/pull/961)

### Commits

- [dist] Version bump. 1.13.2 [`e1b2f4c`](https://github.com/http-party/node-http-proxy/commit/e1b2f4c31b34464431db251b3b6169689dadf518)

## [1.13.1](https://github.com/http-party/node-http-proxy/compare/1.13.0...1.13.1) - 2016-02-02

### Merged

- README.md: summary to specify reverse proxy [`#932`](https://github.com/http-party/node-http-proxy/pull/932)
- fix(common) urlJoin replace: ":/" -&gt; "http?s:/" [`#947`](https://github.com/http-party/node-http-proxy/pull/947)
- Update README.md [`#948`](https://github.com/http-party/node-http-proxy/pull/948)

### Commits

- [dist] Version bump. 1.13.1 [`9d9fa94`](https://github.com/http-party/node-http-proxy/commit/9d9fa940cff3aa6134c60732c23aea8171fc7296)

## [1.13.0](https://github.com/http-party/node-http-proxy/compare/1.12.1...1.13.0) - 2016-01-26

### Merged

- Fix for #839 (Ignore path and the trailing slash) [`#934`](https://github.com/http-party/node-http-proxy/pull/934)
- Update license year range to 2016 [`#943`](https://github.com/http-party/node-http-proxy/pull/943)

### Commits

- [dist] Version bump. 1.13.0 [`268994e`](https://github.com/http-party/node-http-proxy/commit/268994ea45d9f8737343001ab9542e03023a5c96)

## [1.12.1](https://github.com/http-party/node-http-proxy/compare/1.12.0...1.12.1) - 2016-01-24

### Merged

- Bump version for npm publish [`#942`](https://github.com/http-party/node-http-proxy/pull/942)
- Added check to passes/web-outgoing.js to make sure the header being s… [`#940`](https://github.com/http-party/node-http-proxy/pull/940)
- Created reverse-proxy.js example. [`#825`](https://github.com/http-party/node-http-proxy/pull/825)
- SSE example and test [`#922`](https://github.com/http-party/node-http-proxy/pull/922)
- More structured readme [`#912`](https://github.com/http-party/node-http-proxy/pull/912)
- Updated markdown docs to mention proxy rules module [`#910`](https://github.com/http-party/node-http-proxy/pull/910)
- Add tests for forwarding of continuation frames [`#901`](https://github.com/http-party/node-http-proxy/pull/901)
- Bump requires-port, server and ws [`#904`](https://github.com/http-party/node-http-proxy/pull/904)
- [example] add an example for NTLM authentication [`#903`](https://github.com/http-party/node-http-proxy/pull/903)

### Commits

- Organized README more [`cd1d777`](https://github.com/http-party/node-http-proxy/commit/cd1d7776e8fb5d67e2c52b9ef27d8c932e7b72e2)
- Add tests for testing forwarding of continuation frames [`64fa520`](https://github.com/http-party/node-http-proxy/commit/64fa52078913c6d4fe95673f182aac4924961e8b)
- Added back to top helpers [`6106d4c`](https://github.com/http-party/node-http-proxy/commit/6106d4c32f7c7960f0391591661e6f0d229db52d)
- [ci] use node 4.2 to test and do not allow failures [`f82ce18`](https://github.com/http-party/node-http-proxy/commit/f82ce18d2f187b085c2c4f49d857755d21c582b1)
- [fix] bump requires-port, server and ws [`9ea1e89`](https://github.com/http-party/node-http-proxy/commit/9ea1e89a2fd9c392cd40265bdb13494a3614e290)
- Updated markdown docs to mention proxy rules [`eea79ca`](https://github.com/http-party/node-http-proxy/commit/eea79cab53f27371cad387a524ee3aaefa742c48)
- Fixed tests depending on ignorePath [`f9540de`](https://github.com/http-party/node-http-proxy/commit/f9540de7b13f41091be2dcb68d8f23be65ad3885)
- Added check to passes/web-outgoing.js to make sure the header being set is not undefined, which should be the only falsey value that could accidently show up and break that call. This fixes windows NTLM auth issues behind http-proxy. [`3b39d2c`](https://github.com/http-party/node-http-proxy/commit/3b39d2c3dcb1785cc06043fcb226c652f554941e)
- No longer appends / to path if ignorePath is set [`f2093b5`](https://github.com/http-party/node-http-proxy/commit/f2093b5313c855cd6309cc0ddebb31f369e525ed)
- README.md: introduction to specify reverse proxy [`41414a5`](https://github.com/http-party/node-http-proxy/commit/41414a56a11ddfac3a337711ac4c64124eb62377)
- Added note for appending trailing / when using ignorePath [`0cb1d3c`](https://github.com/http-party/node-http-proxy/commit/0cb1d3c68e793fed9aa4a7624c32a018e796aa95)

## [1.12.0](https://github.com/http-party/node-http-proxy/compare/1.11.3...1.12.0) - 2015-10-22

### Merged

- Issue #896: provide a "proxyReq" event also for websocket connections. [`#897`](https://github.com/http-party/node-http-proxy/pull/897)

### Commits

- Provide a "proxyReq" event also for websocket connections. [`a05fc2d`](https://github.com/http-party/node-http-proxy/commit/a05fc2d1692d038f1eaad6d9b26c174039bc1949)
- fixes after PR review [`9752652`](https://github.com/http-party/node-http-proxy/commit/9752652e76da3bcfb6a635620e4162518ca43203)
- [dist] Version bump. 1.12.0 [`b5a6d0e`](https://github.com/http-party/node-http-proxy/commit/b5a6d0e58396363f4c457f6d1654614bdfcfcb73)

## [1.11.3](https://github.com/http-party/node-http-proxy/compare/1.11.2...1.11.3) - 2015-10-19

### Merged

- Removed unspecified trailing slash in proxy url [`#893`](https://github.com/http-party/node-http-proxy/pull/893)
- Updating the upgrading doc [`#892`](https://github.com/http-party/node-http-proxy/pull/892)

### Commits

- [dist] Update .travis.yml to be more modern. [`302d981`](https://github.com/http-party/node-http-proxy/commit/302d981dd2cf06dbf751b1f64e3dfea08d0f9476)
- [dist] Version bump. 1.11.3 [`60baca5`](https://github.com/http-party/node-http-proxy/commit/60baca5aed4f45ef1d7b3f7edd909375853d344b)
- docs: options.headers [`c86ae51`](https://github.com/http-party/node-http-proxy/commit/c86ae51bb9658309a9628f4f5182d4c45c803b84)

## [1.11.2](https://github.com/http-party/node-http-proxy/compare/v1.11.1...1.11.2) - 2015-08-30

### Merged

- Update gzip-middleware.js [`#870`](https://github.com/http-party/node-http-proxy/pull/870)
- Fix broken option list indentation [`#863`](https://github.com/http-party/node-http-proxy/pull/863)
- Added missing configuration options [`#852`](https://github.com/http-party/node-http-proxy/pull/852)
- Added installation instructions [`#823`](https://github.com/http-party/node-http-proxy/pull/823)
- fixes comment [`#817`](https://github.com/http-party/node-http-proxy/pull/817)

### Commits

- Created reverse-proxy.js example. [`38864d0`](https://github.com/http-party/node-http-proxy/commit/38864d016794b9ff3d8d1d1cb81a730b40a1bf9c)
- Added websocket set-cookie headers test [`855cebd`](https://github.com/http-party/node-http-proxy/commit/855cebdac4d33ef5f2fab4c4c78fdc07cdb61402)
- [fix] make more functional [`cea0e86`](https://github.com/http-party/node-http-proxy/commit/cea0e8676b3e609828320bb03051eaf78cc43b54)
- Modify the set-cookie header fix to work with node 0.10.x. [`da674ec`](https://github.com/http-party/node-http-proxy/commit/da674ec4df2b371f09e912f3b376c48581090a0f)
- Use raw headers instead parsed. [`8bfd90c`](https://github.com/http-party/node-http-proxy/commit/8bfd90c4d9331fd129f17a788ef9fc733654b7e0)
- Replaced Object.keys().map with for in loop. [`3d2350c`](https://github.com/http-party/node-http-proxy/commit/3d2350c54ff0fb9271f5fcfea1d23f22ad97c47c)
- [dist] Version bump. 1.11.2 [`30e3b37`](https://github.com/http-party/node-http-proxy/commit/30e3b371de0116e40e15156394f31c7e0b0aa9f1)
- Websocket key was unnecessary long. [`ca73208`](https://github.com/http-party/node-http-proxy/commit/ca732087498582df01ab78fb7da77912dab8f138)

## [v1.11.1](https://github.com/http-party/node-http-proxy/compare/v1.11.0...v1.11.1) - 2015-04-22

### Commits

- [dist] Version bump. 1.11.1 [`7e6c66a`](https://github.com/http-party/node-http-proxy/commit/7e6c66a7e485a6c0ec3a1c567bbe800fdc56c9fd)
- [fix] dont use bind in the one case we do [`d26ef56`](https://github.com/http-party/node-http-proxy/commit/d26ef56e1bc2a1232b06c01b4740e3bf35d63eda)
- [dist] update to new version of EE3 [`607f96c`](https://github.com/http-party/node-http-proxy/commit/607f96c00cbda2a6b881b8ff1db05437dbf4ce77)
- [fix] use the main export for EE3 [`18c77ca`](https://github.com/http-party/node-http-proxy/commit/18c77cafc7d5479502cf5c4d2b663d8f85cfd6d4)

## [v1.11.0](https://github.com/http-party/node-http-proxy/compare/v1.10.1...v1.11.0) - 2015-04-20

### Merged

- [api] add an ignorePath option if you want to disregard the path of the ... [`#759`](https://github.com/http-party/node-http-proxy/pull/759)

### Commits

- [dist] Version bump. 1.11.0 [`934e6c4`](https://github.com/http-party/node-http-proxy/commit/934e6c4d54292a1b961452074e02fb5d45da729a)

## [v1.10.1](https://github.com/http-party/node-http-proxy/compare/v1.10.0...v1.10.1) - 2015-04-02

### Merged

- Fix default port detection with node 0.12.x [`#799`](https://github.com/http-party/node-http-proxy/pull/799)

### Commits

- [dist] add semver and normalize package.json with --save-dev [`1b89bc9`](https://github.com/http-party/node-http-proxy/commit/1b89bc9a76c229070ff2572f7a0e1b969c4b4701)
- fix protocol and default port detection on node 0.12.x, compatible with 0.10.x [`5f14bca`](https://github.com/http-party/node-http-proxy/commit/5f14bcaa704fe8a5e6f59d3a89722f22958cade9)
- fix expected error message when node 0.12.x [`0ee314c`](https://github.com/http-party/node-http-proxy/commit/0ee314c436226391318b9a1b623cb3f7e8bf4df7)
- force cipher AES128-GCM-SHA256 in https tests [`c33d161`](https://github.com/http-party/node-http-proxy/commit/c33d1616cdbd60587ca2eb326c48b8a87ac56092)
- [fix] properly support iojs with test checking for HTTPS [`c6dfb04`](https://github.com/http-party/node-http-proxy/commit/c6dfb04a67f3b5ac9a402b7b08c1b8baf29f89e6)
- [dist] Version bump. 1.10.1 [`0bd446c`](https://github.com/http-party/node-http-proxy/commit/0bd446c680e9991accfaa3a6a70e411fdac79164)
- [ci] add 0.12 and iojs to travis [`a6ae6c4`](https://github.com/http-party/node-http-proxy/commit/a6ae6c499743ddade9db12b9f7404d980c79f683)

## [v1.10.0](https://github.com/http-party/node-http-proxy/compare/v1.9.1...v1.10.0) - 2015-04-01

### Merged

- Fixes / additions to URL rewriting [`#787`](https://github.com/http-party/node-http-proxy/pull/787)

### Commits

- [dist] Version bump. 1.10.0 [`1dabda2`](https://github.com/http-party/node-http-proxy/commit/1dabda241f3b93eb9195134042e7a3b84fd0ef57)

## [v1.9.1](https://github.com/http-party/node-http-proxy/compare/v1.9.0...v1.9.1) - 2015-04-01

### Merged

- Fix #747 [`#798`](https://github.com/http-party/node-http-proxy/pull/798)

### Fixed

- Merge pull request #798 from damonmcminn/master [`#747`](https://github.com/http-party/node-http-proxy/issues/747)
- Fix https://github.com/nodejitsu/node-http-proxy/issues/747 [`#747`](https://github.com/nodejitsu/node-http-proxy/issues/747)

### Commits

- Add test for https://github.com/nodejitsu/node-http-proxy/issues/747 [`d145152`](https://github.com/http-party/node-http-proxy/commit/d145152655a69479348b0ebc726d4dc19720a12b)
- [dist] Version bump. 1.9.1 [`21b30b7`](https://github.com/http-party/node-http-proxy/commit/21b30b754db4f6410c3d2052bc123b3fdae57c46)

## [v1.9.0](https://github.com/http-party/node-http-proxy/compare/v1.8.1...v1.9.0) - 2015-03-12

### Merged

- Adding the nodejs0.12 auth option [`#792`](https://github.com/http-party/node-http-proxy/pull/792)
- fix "x-forwarded-proto" in node 0.12 and iojs [`#789`](https://github.com/http-party/node-http-proxy/pull/789)
- Add support for auto host rewriting and protocol rewriting [`#1`](https://github.com/http-party/node-http-proxy/pull/1)
- changed highlighted part - very minor [`#756`](https://github.com/http-party/node-http-proxy/pull/756)
- Update README.md for benchmarks [`#625`](https://github.com/http-party/node-http-proxy/pull/625)

### Fixed

- fix "x-forwarded-proto" in node 0.12 and iojs [`#772`](https://github.com/http-party/node-http-proxy/issues/772)
- [api] add an ignorePath option if you want to disregard the path of the incoming request when proxying to the target server fixes #758 [`#758`](https://github.com/http-party/node-http-proxy/issues/758)

### Commits

- added auth header test [`df158bf`](https://github.com/http-party/node-http-proxy/commit/df158bfc53e35e62609d8169f3883f6dcf12b73c)
- added auth header test [`ff1626f`](https://github.com/http-party/node-http-proxy/commit/ff1626f0719652c92895cf80f9aacc22ededadad)
- refactor some tests for greater readability [`14415a5`](https://github.com/http-party/node-http-proxy/commit/14415a50741d1f258da884686455d87d68eb8121)
- only rewrite redirect urls when it matches target [`26029ba`](https://github.com/http-party/node-http-proxy/commit/26029ba7ac948b5dc0befb2091cc9a5862d0641c)
- auth header added [`ab5c3e5`](https://github.com/http-party/node-http-proxy/commit/ab5c3e5c819ca993e0616d178bc1d282af539508)
- [dist] Version bump. 1.9.0 [`87a92a7`](https://github.com/http-party/node-http-proxy/commit/87a92a72802a27f817fcba87382d55831fd04ddb)
- end of file line space [`e907d7b`](https://github.com/http-party/node-http-proxy/commit/e907d7bb2aa2825b43d9355cb1ee25bec47b15ad)
- space instead of tabs [`7298510`](https://github.com/http-party/node-http-proxy/commit/7298510e9170d74ff057487085bc1e898f044177)
- space instead of tabs [`63c9262`](https://github.com/http-party/node-http-proxy/commit/63c9262df5bd04d83432db44fce2a4d5b19a59ea)
- auth header added tests [`f55ffa3`](https://github.com/http-party/node-http-proxy/commit/f55ffa356a259c09685c6b768a404e4b73f674ce)

## [v1.8.1](https://github.com/http-party/node-http-proxy/compare/v1.8.0...v1.8.1) - 2014-12-17

### Commits

- Pass HTTPS client parameters. [`402ab05`](https://github.com/http-party/node-http-proxy/commit/402ab057340a29db7a521ff239c5e21ac0c12be8)
- [dist] Version bump. 1.8.1 [`3311106`](https://github.com/http-party/node-http-proxy/commit/3311106c2c2346f3ac1ffe402b80bca3c7c59275)

## [v1.8.0](https://github.com/http-party/node-http-proxy/compare/v1.7.3...v1.8.0) - 2014-12-17

### Merged

- Fix variables scope in test [`#752`](https://github.com/http-party/node-http-proxy/pull/752)
- Fix typo [`#751`](https://github.com/http-party/node-http-proxy/pull/751)

### Commits

- Added websocket close event test [`8bff3dd`](https://github.com/http-party/node-http-proxy/commit/8bff3ddc1276e3ba18fd68c34d8982148cd21455)
- Deprecated proxySocket event in favor to open event. [`c62610e`](https://github.com/http-party/node-http-proxy/commit/c62610e8e4d59e8ba4642370ff3fb933c6ddb4eb)
- Update README.md [`05d18a4`](https://github.com/http-party/node-http-proxy/commit/05d18a4e1ba6c2de41b0b803cd1793357979384d)
- [fix] style spacing wtf [`ea0a4de`](https://github.com/http-party/node-http-proxy/commit/ea0a4ded803b30144e442344ad5a38a0d34bb3ba)
- [api] add close event in ws-incoming.js [`2653786`](https://github.com/http-party/node-http-proxy/commit/26537866b3ca522927aa4604a958f90774c0c0c0)
- [minor] grammar [`f304861`](https://github.com/http-party/node-http-proxy/commit/f30486195cfa6cfcf6400ac445975d5adada72e4)
- Changed proxyServer and destiny to local variables. [`8a8a894`](https://github.com/http-party/node-http-proxy/commit/8a8a894092ddbec8f0365ced0e94a75b1307ecf1)
- [dist] Version bump. 1.8.0 [`f0db5b3`](https://github.com/http-party/node-http-proxy/commit/f0db5b3f708b0858f617d472dfdd0ba211b774ef)

## [v1.7.3](https://github.com/http-party/node-http-proxy/compare/v1.7.2...v1.7.3) - 2014-12-09

### Fixed

- [fix] use simple regex instead of indexOf to check the protocol to support without the colon fixes #711 [`#711`](https://github.com/http-party/node-http-proxy/issues/711)

### Commits

- [test] show that we support protocol without the colon [`89f9ca1`](https://github.com/http-party/node-http-proxy/commit/89f9ca1e89d679b2b85a8f85b65e8b0878694207)
- [dist] Version bump. 1.7.3 [`6a330ff`](https://github.com/http-party/node-http-proxy/commit/6a330ff904d02a41f9a1cac338a98da1849c54ca)

## [v1.7.2](https://github.com/http-party/node-http-proxy/compare/v1.7.1...v1.7.2) - 2014-12-08

### Merged

- Fix grammar in README.md [`#749`](https://github.com/http-party/node-http-proxy/pull/749)

### Fixed

- [fix] properly include port in host header with changeOrigin in all cases fixes #750 [`#750`](https://github.com/http-party/node-http-proxy/issues/750)

### Commits

- [test] add tests for the changeOrigin cases in properly setting the host header [`71a06aa`](https://github.com/http-party/node-http-proxy/commit/71a06aab0249487ff650c8a47906cc8281561664)
- [dist] pin down deps and add requires-port [`81874f7`](https://github.com/http-party/node-http-proxy/commit/81874f795b7df7929e03d9d4cb98a947b1ef114b)
- [dist] Version bump. 1.7.2 [`2086e49`](https://github.com/http-party/node-http-proxy/commit/2086e4917c97f347f84c54b166799bc8db9f4162)

## [v1.7.1](https://github.com/http-party/node-http-proxy/compare/v1.7.0...v1.7.1) - 2014-12-02

### Merged

- Adding harmon to the README [`#716`](https://github.com/http-party/node-http-proxy/pull/716)

### Fixed

- [fix] fix #738 [`#738`](https://github.com/http-party/node-http-proxy/issues/738)
- [fix] simple fixes #748 #744 #746 [`#748`](https://github.com/http-party/node-http-proxy/issues/748)

### Commits

- [test] add proper failing test case for #738 [`410a8ce`](https://github.com/http-party/node-http-proxy/commit/410a8ce94ccea566a8e50daf3b78e633b82875cb)
- [Bugfix] Allow for multiple ? in outgoing urls. [`70ed1c4`](https://github.com/http-party/node-http-proxy/commit/70ed1c4273bc64500e8bae9b60d7fd6a19135246)
- [dist] Version bump. 1.7.1 [`56a7b77`](https://github.com/http-party/node-http-proxy/commit/56a7b77645b13d337c1a2f879460193d310454c8)

## [v1.7.0](https://github.com/http-party/node-http-proxy/compare/v1.6.2...v1.7.0) - 2014-11-25

### Merged

- Allow optional redirect host rewriting. [`#741`](https://github.com/http-party/node-http-proxy/pull/741)
- Set `Content-Length` header for OPTIONS requests [`#742`](https://github.com/http-party/node-http-proxy/pull/742)
- copy headers instead of referencing them so they don't unexpectedly get overwritten [`#736`](https://github.com/http-party/node-http-proxy/pull/736)
- Updated to support error callback on proxy.web and start/proxyReq/end co... [`#735`](https://github.com/http-party/node-http-proxy/pull/735)

### Commits

- :pencil: Add host rewrite docs and specs. [`add8133`](https://github.com/http-party/node-http-proxy/commit/add81338a90dae132f9e74fd5a5905fbcef030b7)
- [minor] style consistency [`48ae5d8`](https://github.com/http-party/node-http-proxy/commit/48ae5d828c23d6f19c9e2dd8c922d88a09f5ed0f)
- Updated to support error callback on proxy.web and start/proxyReq/end continue working. [`9ba8311`](https://github.com/http-party/node-http-proxy/commit/9ba8311343fd01b32505b8607ecf4294200f9dde)
- style changes [`84036e9`](https://github.com/http-party/node-http-proxy/commit/84036e9ddd1d4d925006c5438b3bcc0f17ba7a48)
- [fix] be defensive and ensure location is in headers before running url.parse() [`8d68ac0`](https://github.com/http-party/node-http-proxy/commit/8d68ac0e0fa3080b31580aa08e92a46cc1f27696)
- [dist] Version bump. 1.7.0 [`276f65a`](https://github.com/http-party/node-http-proxy/commit/276f65a3b810ded01757ec4bfd4fe2b00a1e66a8)

## [v1.6.2](https://github.com/http-party/node-http-proxy/compare/v1.6.1...v1.6.2) - 2014-11-11

### Merged

- do not modify the query string [`#733`](https://github.com/http-party/node-http-proxy/pull/733)

### Commits

- [fix] style changes [`7c5e40a`](https://github.com/http-party/node-http-proxy/commit/7c5e40a429fbc0c538f38d29d74acb633cb9b8d4)
- [minor] this shouldnt be in var block [`3f19e6e`](https://github.com/http-party/node-http-proxy/commit/3f19e6e178e168a16beee74186691f3e0e54d517)
- [dist] Version bump. 1.6.2 [`709b3e9`](https://github.com/http-party/node-http-proxy/commit/709b3e96560d619fab2617f9ddb902b4982b4103)

## [v1.6.1](https://github.com/http-party/node-http-proxy/compare/v1.6.0...v1.6.1) - 2014-11-04

### Merged

- websocket needs to respect `options.secure` too [`#729`](https://github.com/http-party/node-http-proxy/pull/729)
- changeOrigin option docs fix [`#724`](https://github.com/http-party/node-http-proxy/pull/724)

### Commits

- [dist] Version bump. 1.6.1 [`fa797fc`](https://github.com/http-party/node-http-proxy/commit/fa797fca900c10ebc848a2b445204b47da799483)

## [v1.6.0](https://github.com/http-party/node-http-proxy/compare/v1.5.3...v1.6.0) - 2014-10-29

### Merged

- Added changeOrigin option with test and docs [`#723`](https://github.com/http-party/node-http-proxy/pull/723)
- I presume you mean couchdb here [`#717`](https://github.com/http-party/node-http-proxy/pull/717)
- update modify request body eg [`#712`](https://github.com/http-party/node-http-proxy/pull/712)

### Commits

- harmon notes [`9f684d0`](https://github.com/http-party/node-http-proxy/commit/9f684d0439174d889d7b9a4ef6e2353e09481b2d)
- [dist] Version bump. 1.6.0 [`43641b0`](https://github.com/http-party/node-http-proxy/commit/43641b00b34ccc05bdf09f904695061d7c857aeb)

## [v1.5.3](https://github.com/http-party/node-http-proxy/compare/v1.5.2...v1.5.3) - 2014-10-01

### Merged

- close socket if upstream request fails [`#709`](https://github.com/http-party/node-http-proxy/pull/709)

### Commits

- [dist] Version bump. 1.5.3 [`9577a0f`](https://github.com/http-party/node-http-proxy/commit/9577a0faf2b78af606168673407ac47a851c084c)

## [v1.5.2](https://github.com/http-party/node-http-proxy/compare/v1.5.1...v1.5.2) - 2014-10-01

### Merged

- close websocket if proxyReq is closed before upgrade [`#708`](https://github.com/http-party/node-http-proxy/pull/708)

### Commits

- test closing upstream socket prior to upgrade [`7730548`](https://github.com/http-party/node-http-proxy/commit/77305489d9b88d283802477e155340e5dacfcc2c)
- [dist] Version bump. 1.5.2 [`43c6f0c`](https://github.com/http-party/node-http-proxy/commit/43c6f0c7c06d25a670c410500a8623531df458b1)

## [v1.5.1](https://github.com/http-party/node-http-proxy/compare/v1.5.0...v1.5.1) - 2014-09-30

### Commits

- [fix] do a check to make sure the server exists before we try and emit [`10a294a`](https://github.com/http-party/node-http-proxy/commit/10a294af4d4baac30b98ea9bec683a974443b83d)
- [dist] Version bump. 1.5.1 [`f0bf741`](https://github.com/http-party/node-http-proxy/commit/f0bf7418156db2cb87a616b0a34bb1f028db9142)

## [v1.5.0](https://github.com/http-party/node-http-proxy/compare/v1.4.3...v1.5.0) - 2014-09-30

### Merged

- exposing proxySocket on socket to support sniffing messages coming from proxy target [`#706`](https://github.com/http-party/node-http-proxy/pull/706)
- Fixed misleading documentation [`#705`](https://github.com/http-party/node-http-proxy/pull/705)
- Fix typo in README.md [`#702`](https://github.com/http-party/node-http-proxy/pull/702)
- handle 'upgrade' in comma-separated connection header [`#691`](https://github.com/http-party/node-http-proxy/pull/691)

### Commits

- test new detection of connection: upgrade [`ec683b9`](https://github.com/http-party/node-http-proxy/commit/ec683b924b1ef8cbdd2cd2bfb7e141b502773163)
- emitting proxySocket on proxyServer [`000eb53`](https://github.com/http-party/node-http-proxy/commit/000eb533de144cad01cfd97edf9ab6c350593d3c)
- [fix] perf optimization so we have a precompiled regexp [`c0a796b`](https://github.com/http-party/node-http-proxy/commit/c0a796b3e31de4f22eef00d93164e7238d9aa3ba)
- use regex to check for upgrade header [`65a21bc`](https://github.com/http-party/node-http-proxy/commit/65a21bce6dbbc6142a851dc959e237c0ef2b1091)
- [dist] Version bump. 1.5.0 [`232258b`](https://github.com/http-party/node-http-proxy/commit/232258b6ec2229497fe557454a121d917968f5e8)
- [minor] extra space [`e7d50b1`](https://github.com/http-party/node-http-proxy/commit/e7d50b1a376035a50c82db38605e99feb30afd36)

## [v1.4.3](https://github.com/http-party/node-http-proxy/compare/v1.4.2...v1.4.3) - 2014-09-12

### Merged

- Urgent: Fix breaking bug on url joining resulting in paths like `///path`. [`#699`](https://github.com/http-party/node-http-proxy/pull/699)

### Commits

- [minor] Added missing JSDoc comments [`73e8a4c`](https://github.com/http-party/node-http-proxy/commit/73e8a4cdd576868bf61d0848cc51f083a75454f9)
- Fix breaking bug on url joining resulting in paths like `///path`. [`73d865b`](https://github.com/http-party/node-http-proxy/commit/73d865bc9f8940f61c1ad4812f220920ead553b5)
- [minor] Code style adjustment. [`3ab6e95`](https://github.com/http-party/node-http-proxy/commit/3ab6e9591e66c203647605b4f275d374472c9d5f)
- Bump version v1.4.3 [`554f59c`](https://github.com/http-party/node-http-proxy/commit/554f59c5182d58b359df0159a29ff5ea35dd3830)
- [ignore] Ignore npm-debug.log [`a934cb6`](https://github.com/http-party/node-http-proxy/commit/a934cb6a46298c380e9bc794f18873576cf73c4c)

## [v1.4.2](https://github.com/http-party/node-http-proxy/compare/v1.4.1...v1.4.2) - 2014-09-12

### Commits

- [fix] ensure path works on windows because path.join doesnt like URLs [`ed73f06`](https://github.com/http-party/node-http-proxy/commit/ed73f06ed307ad2204e565781cc3154047941a8c)
- [dist] Version bump. 1.4.2 [`df12aeb`](https://github.com/http-party/node-http-proxy/commit/df12aeb12de79de1157898d45f4347fd0037dd70)

## [v1.4.1](https://github.com/http-party/node-http-proxy/compare/v1.3.1...v1.4.1) - 2014-09-11

### Merged

- Trimming contents of distributed npm package. [`#644`](https://github.com/http-party/node-http-proxy/pull/644)
- Remove changelog - it was not maintained [`#669`](https://github.com/http-party/node-http-proxy/pull/669)
- Removed duplicated imported dependencies [`#695`](https://github.com/http-party/node-http-proxy/pull/695)

### Commits

- [test] add test for prependPath option [`e44fabe`](https://github.com/http-party/node-http-proxy/commit/e44fabe58a233b367d42f26f15113e2022f71d7b)
- [api] add prependPath option to go with path change [`9a534c6`](https://github.com/http-party/node-http-proxy/commit/9a534c6ff63d776140918bc839801d247affd18d)
- [dist] Version bump. 1.4.1 [`d5c656b`](https://github.com/http-party/node-http-proxy/commit/d5c656bceb50dc9008ef223bc58b918adcf05352)
- [dist] Version bump. 1.4.0 [`dceef40`](https://github.com/http-party/node-http-proxy/commit/dceef407a1130033679e7e836c6753b76187ce5f)

## [v1.3.1](https://github.com/http-party/node-http-proxy/compare/v1.3.0...v1.3.1) - 2014-09-09

### Merged

- Allow proxy to maintain the original target path [`#693`](https://github.com/http-party/node-http-proxy/pull/693)
- Clarify usable parameters for 'proxyRes' event [`#686`](https://github.com/http-party/node-http-proxy/pull/686)

### Commits

- fix tests for maintaining proxy path [`a65021d`](https://github.com/http-party/node-http-proxy/commit/a65021d52b0ee039486819b5a95f442229458776)
- Fix proxy path [`511b7b3`](https://github.com/http-party/node-http-proxy/commit/511b7b3d4743636de9d9fbe8ff409730d221d273)
- Clarify usable parameters for proxyRes event. [`49a0de1`](https://github.com/http-party/node-http-proxy/commit/49a0de1e7cdcec9b555695605ab914038f99d66b)
- [dist] Version bump. 1.3.1 [`fc73828`](https://github.com/http-party/node-http-proxy/commit/fc73828035baf3cea3664560f8964f2a2a200d0a)
- [ci] remove 0.11.x to avoid failing builds caused by TLS errors [`6b83ae4`](https://github.com/http-party/node-http-proxy/commit/6b83ae47bbf2d5eab8ac94b4d6130e09a21ac85b)

## [v1.3.0](https://github.com/http-party/node-http-proxy/compare/v1.2.1...v1.3.0) - 2014-08-14

### Merged

- Added functionality to close proxy. [`#679`](https://github.com/http-party/node-http-proxy/pull/679)

### Commits

- [fix] cleanup and stylize close function [`261742a`](https://github.com/http-party/node-http-proxy/commit/261742a4295268ef93f45aa0f1e3a04208a2aed3)
- updated close function for safety [`8be9d94`](https://github.com/http-party/node-http-proxy/commit/8be9d945d03169056bbf84d702292b5763b015dc)
- [dist] Version bump. 1.3.0 [`05f0b89`](https://github.com/http-party/node-http-proxy/commit/05f0b891a610fb7779f90916fcd9ed750df818b2)

## [v1.2.1](https://github.com/http-party/node-http-proxy/compare/v1.2.0...v1.2.1) - 2014-08-14

### Commits

- Added close method to proxy server. [`a3d0219`](https://github.com/http-party/node-http-proxy/commit/a3d02196c5e62cd58bc0ebe8a66afcdb905d96b3)
- [fix] emit an error if proper URL is not passed in as a target [`37036dd`](https://github.com/http-party/node-http-proxy/commit/37036dd32565f72ad5777e47509293db18b60ed3)
- [dist] Version bump. 1.2.1 [`0a6b424`](https://github.com/http-party/node-http-proxy/commit/0a6b424e2c3b6cef68362a71f0e56740b2605af7)

## [v1.2.0](https://github.com/http-party/node-http-proxy/compare/v1.1.6...v1.2.0) - 2014-08-05

### Merged

- [api] Add event-based ability to modify pre-flight proxy requests. [`#673`](https://github.com/http-party/node-http-proxy/pull/673)

### Commits

- [dist] Version bump. 1.2.0 [`63c53a1`](https://github.com/http-party/node-http-proxy/commit/63c53a177217283ec14e4f7c2e891db48842ab4b)

## [v1.1.6](https://github.com/http-party/node-http-proxy/compare/v1.1.5...v1.1.6) - 2014-07-17

### Fixed

- do proper checking for a pass not existing. fixes #671 [`#671`](https://github.com/http-party/node-http-proxy/issues/671)

### Commits

- Remove changelog - it was not maintained [`e336b52`](https://github.com/http-party/node-http-proxy/commit/e336b52629276e647abeee300d7091db44e5b885)
- [dist] Version bump. 1.1.6 [`ed9e12b`](https://github.com/http-party/node-http-proxy/commit/ed9e12b0edb0fc206610e94bd696425619868474)

## [v1.1.5](https://github.com/http-party/node-http-proxy/compare/v1.1.4...v1.1.5) - 2014-07-10

### Merged

- Fix simple-balancer example [`#666`](https://github.com/http-party/node-http-proxy/pull/666)
- Added proxyTimeout option and two tests for timeout [`#658`](https://github.com/http-party/node-http-proxy/pull/658)

### Fixed

- Fix #657 [`#657`](https://github.com/http-party/node-http-proxy/issues/657)
- Fix #657 [`#657`](https://github.com/http-party/node-http-proxy/issues/657)

### Commits

- Added targetTimeout option and two tests for timeout [`0f24351`](https://github.com/http-party/node-http-proxy/commit/0f243516e1c6737b95fba220a5028439264b5de6)
- Change name targetTimeout to proxyTimeout [`7b79a74`](https://github.com/http-party/node-http-proxy/commit/7b79a7409ade7a8c79b2ae5761abc4843529063a)
- Trimming contents of distributed npm package. [`431aba7`](https://github.com/http-party/node-http-proxy/commit/431aba79d8d521e228c1403aaf4fd4a26fba03c3)
- [api] also emit the target on a proxy error [`d1baa36`](https://github.com/http-party/node-http-proxy/commit/d1baa3684e449610a2aae270816a7b8a907e588e)
- [dist] Version bump. 1.1.5 [`7104a7c`](https://github.com/http-party/node-http-proxy/commit/7104a7c023073a49091969f825738c79ae036123)
- fix balancer example [`9df4bc1`](https://github.com/http-party/node-http-proxy/commit/9df4bc1e1216a8e53675f0be16fb9081c11da225)

## [v1.1.4](https://github.com/http-party/node-http-proxy/compare/v1.1.3...v1.1.4) - 2014-05-11

### Merged

- `proxyRes` event, provide access to the req and res objects [`#642`](https://github.com/http-party/node-http-proxy/pull/642)

### Commits

- Add a test for the proxyRes event [`1385635`](https://github.com/http-party/node-http-proxy/commit/1385635e18f081af759c8e088f2f6b0219df83db)
- [dist] Version bump. 1.1.4 [`7cb98a4`](https://github.com/http-party/node-http-proxy/commit/7cb98a4e417312f01cf4432b52dbb3773aca60a0)
- Add the req and res objects to the proxyRes event [`1213e46`](https://github.com/http-party/node-http-proxy/commit/1213e46b1b0975ad1d5c5d0aaeace40a0811118f)

## [v1.1.3](https://github.com/http-party/node-http-proxy/compare/v1.1.2...v1.1.3) - 2014-05-11

### Merged

- Don't override connection header if Upgrading [`#640`](https://github.com/http-party/node-http-proxy/pull/640)

### Commits

- Adding test cases on preventing upgrade override [`8aa7c51`](https://github.com/http-party/node-http-proxy/commit/8aa7c519b15f734af7db34d2102781adbeae10aa)
- Update README.md for benchmarks [`4947484`](https://github.com/http-party/node-http-proxy/commit/4947484806f839d5e0a1b615b56a1bc847b8f534)
- [minor] style [`ccad177`](https://github.com/http-party/node-http-proxy/commit/ccad17795417de74bea2bcb6d6c559a4601af76d)
- [dist] Version bump. 1.1.3 [`c472527`](https://github.com/http-party/node-http-proxy/commit/c472527ea60da8b2f737d5742bc61ad2772b7e0b)

## [v1.1.2](https://github.com/http-party/node-http-proxy/compare/v1.1.1...v1.1.2) - 2014-04-14

### Commits

- [fix test] handle proxy error since we are properly aborting the proxy Request [`61c8734`](https://github.com/http-party/node-http-proxy/commit/61c8734e8b1115fab0e0db23fd8eeccbae61eee0)
- [fix] handle error on incoming request as well and properly abort proxy if client request is aborted [`77a1cff`](https://github.com/http-party/node-http-proxy/commit/77a1cff9bcf697eab27819eef054024bdc0a2ba3)
- [dist] Version bump. 1.1.2 [`c54278b`](https://github.com/http-party/node-http-proxy/commit/c54278bd3b00e82f4253393b6f6beb1d5a1b19e5)

## [v1.1.1](https://github.com/http-party/node-http-proxy/compare/v1.1.0...v1.1.1) - 2014-04-11

### Commits

- [dist] Version bump. 1.1.1 [`d908e2a`](https://github.com/http-party/node-http-proxy/commit/d908e2ad61013ed1f6e2f80c4b67a6dce7d0f504)
- [fix] let user make the decision on what to do with the buffer [`4f07dc2`](https://github.com/http-party/node-http-proxy/commit/4f07dc220d700ac90bd8405f7cb0724bdae4b430)

## [v1.1.0](https://github.com/http-party/node-http-proxy/compare/v1.0.3...v1.1.0) - 2014-04-09

### Merged

- Update UPGRADING.md [`#616`](https://github.com/http-party/node-http-proxy/pull/616)

### Fixed

- [fix] always be an eventemitter for consistency fixes #606 [`#606`](https://github.com/http-party/node-http-proxy/issues/606)

### Commits

- [api] emit a start an an end event [`8b48a9f`](https://github.com/http-party/node-http-proxy/commit/8b48a9fdab01624f7249c53f25919b1295eefb10)
- [dist] Version bump. 1.1.0 [`97ceeb3`](https://github.com/http-party/node-http-proxy/commit/97ceeb37d04e5d2195352365985165866323c4d7)
- [minor] missing angle bracket [`eca765a`](https://github.com/http-party/node-http-proxy/commit/eca765a856164c077ff9128949019552cdaf9a67)

## [v1.0.3](https://github.com/http-party/node-http-proxy/compare/v1.0.2...v1.0.3) - 2014-03-27

### Merged

- Fix for #591 [`#592`](https://github.com/http-party/node-http-proxy/pull/592)
- Add Repository field to package.json [`#578`](https://github.com/http-party/node-http-proxy/pull/578)
- Fix doc: option lines [`#575`](https://github.com/http-party/node-http-proxy/pull/575)

### Fixed

- [api] add toProxy method to allow absolute URLs to be sent when sending to another proxy fixes #603 [`#603`](https://github.com/http-party/node-http-proxy/issues/603)

### Commits

- [doc] update docs with toProxy option [`ece85b4`](https://github.com/http-party/node-http-proxy/commit/ece85b4e1ba379b3ed084bd8f606e285c14d4db3)
- [fix] set connection to CLOSE in cases where the agent is false. [`89a22bc`](https://github.com/http-party/node-http-proxy/commit/89a22bc00396f069eeb054ce30891a204077d16d)
- @xtreme-topher-bullock - update package.json to have proper repository key and formatting [`68fa17b`](https://github.com/http-party/node-http-proxy/commit/68fa17bbcaa73ae2d9539cba6f6ddff29f9e30d5)
- [dist] Version bump. 1.0.3 [`07fceb7`](https://github.com/http-party/node-http-proxy/commit/07fceb7c7aed25a8991d0295db4b4a7e50d79cf9)
- Add support for localAddress [`e633b0f`](https://github.com/http-party/node-http-proxy/commit/e633b0f7e4fd719d809eaeb4725e589f79c271ab)

## [v1.0.2](https://github.com/http-party/node-http-proxy/compare/v1.0.1...v1.0.2) - 2014-01-28

### Merged

- Update README.md [`#566`](https://github.com/http-party/node-http-proxy/pull/566)
- Fix argument order for ws stream pass [`#560`](https://github.com/http-party/node-http-proxy/pull/560)
- Extend listen to enable IPv6 support. [`#558`](https://github.com/http-party/node-http-proxy/pull/558)
- Fix before and after type check [`#556`](https://github.com/http-party/node-http-proxy/pull/556)

### Fixed

- Close outgoing ws if incoming ws emits error [`#559`](https://github.com/http-party/node-http-proxy/issues/559)
- [fix] closes #555 [`#555`](https://github.com/http-party/node-http-proxy/issues/555)

### Commits

- [fix] replicate node core behavior and throw an error if the user does not add their own error listener [`daad470`](https://github.com/http-party/node-http-proxy/commit/daad4703f3a80014936c89f4d67affdc3246f478)
- [dist] Version bump. 1.0.2 [`4bdc3e4`](https://github.com/http-party/node-http-proxy/commit/4bdc3e4f455b2749c03961404db74e3112a3e9e8)
- [doc] Fix broken image in npm by using an absolute link [`8004f4e`](https://github.com/http-party/node-http-proxy/commit/8004f4e5fc0f535806e92ec4e1bd973a45367dac)

## [v1.0.1](https://github.com/http-party/node-http-proxy/compare/v1.0.0...v1.0.1) - 2014-01-17

### Fixed

- [fix] closes #553 [`#553`](https://github.com/http-party/node-http-proxy/issues/553)

### Commits

- [dist] bump v1.0.1 [`68c5512`](https://github.com/http-party/node-http-proxy/commit/68c55123039369cdf8a55a64b36b719c96b672cf)
- typo [`689459f`](https://github.com/http-party/node-http-proxy/commit/689459fe46885a1b3b8e32a4df55f2d1339143e5)

## [v1.0.0](https://github.com/http-party/node-http-proxy/compare/v0.10.4...v1.0.0) - 2014-01-16

### Merged

- Http proxy 1.0 [`#552`](https://github.com/http-party/node-http-proxy/pull/552)
- Caronte [`#551`](https://github.com/http-party/node-http-proxy/pull/551)
- Only emit response if a valid server is present [`#549`](https://github.com/http-party/node-http-proxy/pull/549)
- [fix] add `type` to before and after to grab correct `passes`, fixes #537 [`#539`](https://github.com/http-party/node-http-proxy/pull/539)
- export the proxy itself from the main require [`#536`](https://github.com/http-party/node-http-proxy/pull/536)

### Fixed

- [fix] closes #547 [`#547`](https://github.com/http-party/node-http-proxy/issues/547)
- Merge pull request #539 from nodejitsu/fix-before-after [`#537`](https://github.com/http-party/node-http-proxy/issues/537)
- [fix] add `type` to before and after to grab correct `passes`, fixes #537 [`#537`](https://github.com/http-party/node-http-proxy/issues/537)

### Commits

- [nuke] old files [`a4ee8f9`](https://github.com/http-party/node-http-proxy/commit/a4ee8f9d82f71ef423c401b1f5e9f712b13cbc98)
- [docs] upgrade UPGRADING.md [`e599151`](https://github.com/http-party/node-http-proxy/commit/e5991519dbc7838aa4b8aeb5077d1c1ec5a13813)
- [api] export the httpProxy.Server as the main export but preserve the createServer factory [`182c76c`](https://github.com/http-party/node-http-proxy/commit/182c76cd2322d4d4c041c2a964d51db396c5c96b)
- [fix] remove caronte [`d6d2d0c`](https://github.com/http-party/node-http-proxy/commit/d6d2d0c8821bba9888eee7c3881fc408b3b2008e)
- [fix] ee3 error handling [`d23353d`](https://github.com/http-party/node-http-proxy/commit/d23353d980d8aa1b2606e3d36a83d27432952bef)
- [fix] comments [`6fa23e1`](https://github.com/http-party/node-http-proxy/commit/6fa23e11f6dc0b9c09766b268611ade919bfaa08)

## [v0.10.4](https://github.com/http-party/node-http-proxy/compare/v0.10.3...v0.10.4) - 2013-12-27

### Merged

- Update README.md [`#521`](https://github.com/http-party/node-http-proxy/pull/521)
- Better examples [`#520`](https://github.com/http-party/node-http-proxy/pull/520)
- Send path in req.path and not the url [`#416`](https://github.com/http-party/node-http-proxy/pull/416)
- Fix websocket error handing [`#518`](https://github.com/http-party/node-http-proxy/pull/518)
- attempting to fix links to 2 source locations in README.md [`#502`](https://github.com/http-party/node-http-proxy/pull/502)
- [merge] rename codename to actual project name [`#492`](https://github.com/http-party/node-http-proxy/pull/492)
- [merge] Added error handling example [`#484`](https://github.com/http-party/node-http-proxy/pull/484)
- [merge] https & agent [`#482`](https://github.com/http-party/node-http-proxy/pull/482)
- [merge] caronte tests [`#476`](https://github.com/http-party/node-http-proxy/pull/476)
- FIX: ws error event [`#475`](https://github.com/http-party/node-http-proxy/pull/475)
- Fix accidental write to global variable. [`#472`](https://github.com/http-party/node-http-proxy/pull/472)
- [fix] 2 spelling mistakes [`#14`](https://github.com/http-party/node-http-proxy/pull/14)
- [fix] add ability to proxy websockets over HTTPS [`#11`](https://github.com/http-party/node-http-proxy/pull/11)
- Tests [`#3`](https://github.com/http-party/node-http-proxy/pull/3)

### Fixed

- determine x-forwarded-port from host header [`#341`](https://github.com/http-party/node-http-proxy/issues/341)
- [fix] closes #529 [`#529`](https://github.com/http-party/node-http-proxy/issues/529)
- [fix] fixes #341 [`#341`](https://github.com/http-party/node-http-proxy/issues/341)
- [tests] https test pass, fix #511. Exposed the rejectUnauthorized flag [`#511`](https://github.com/http-party/node-http-proxy/issues/511)
- [fix] pass proper options object that extend the global options and parse the per proxy args into options. fixes #510 [`#510`](https://github.com/http-party/node-http-proxy/issues/510)
- [readme] add links to badges on readme, fix #483 [`#483`](https://github.com/http-party/node-http-proxy/issues/483)
- [fix] pooled connections, closes #478 [`#478`](https://github.com/http-party/node-http-proxy/issues/478)
- [fix] add 0.10 link, fixes #459 [`#459`](https://github.com/http-party/node-http-proxy/issues/459)
- [fix] closes #473 [`#473`](https://github.com/http-party/node-http-proxy/issues/473)
- [fix] add 0.10 compatibily.. closes #474 [`#474`](https://github.com/http-party/node-http-proxy/issues/474)
- [fix] headers, closes #469 [`#469`](https://github.com/http-party/node-http-proxy/issues/469)
- [fix] headers, fixes #467 [`#467`](https://github.com/http-party/node-http-proxy/issues/467)
- [fix] yawnt baaaka .. fixes #8 [`#8`](https://github.com/http-party/node-http-proxy/issues/8)

### Commits

- [fix] more jshint intendation [`17399e7`](https://github.com/http-party/node-http-proxy/commit/17399e7c3ef9addf9dd8f7c628b273e693f128a1)
- [fix] tests [`a255f98`](https://github.com/http-party/node-http-proxy/commit/a255f984fecf24c9290f3ad58d1b68e54a7509eb)
- [minor] remove coverage [`335af81`](https://github.com/http-party/node-http-proxy/commit/335af81d0244e62ecb501690bd15bc5a04ec51a3)
- [examples] updated websockets examples [`ed8c9ee`](https://github.com/http-party/node-http-proxy/commit/ed8c9eeba99d60f39f5c36c4f34ed1a781d2cfd8)
- [tests] removed unused tests [`7e25bde`](https://github.com/http-party/node-http-proxy/commit/7e25bded27effc1b3d47121ce21465a4e2ec7c0b)
- [tests] Added a test case for run all the examples [`bc236d7`](https://github.com/http-party/node-http-proxy/commit/bc236d7e95ef10bc17cf551eea2cd2fb9bf265eb)
- [tests] drop the test of own streams, moved the usable tests [`dc9d7e5`](https://github.com/http-party/node-http-proxy/commit/dc9d7e5452c7d39ae1d242cb8021ca75e4f736d4)
- [fix] default port [`d166354`](https://github.com/http-party/node-http-proxy/commit/d1663549ec070e7ae8bc45ffb148f40ee903192f)
- [tests] added the ws passes test and the streams webscokets test [`8b3fe32`](https://github.com/http-party/node-http-proxy/commit/8b3fe32f6ae60ae067bc5e40cdc43015e689467f)
- [refactor minor] s/caronte/http-proxy/ or s/caronte/httpProxy/ where appropriate. [`bb0d28c`](https://github.com/http-party/node-http-proxy/commit/bb0d28c58729e2cc70e8446f7fbf1113a6fa9310)
- [examples] updated bodyDecoder middleware example [`c82ff2c`](https://github.com/http-party/node-http-proxy/commit/c82ff2c3c0c0165421fbc4e7e94fa3f59d59aa38)
- [dist] first [`4d13156`](https://github.com/http-party/node-http-proxy/commit/4d131567211bcefc6ef0b0592d374fef7bd5abd8)
- [examples] update forward and custom error examples [`b726116`](https://github.com/http-party/node-http-proxy/commit/b7261161343c3471201d6de36ba1030aced26425)
- [refactor docs] add descriptions [`d05af4a`](https://github.com/http-party/node-http-proxy/commit/d05af4af60a5f3d308aa68bf09ab0cf9e5528c52)
- [tests] make the tests run with the last refactor [`5bb83b9`](https://github.com/http-party/node-http-proxy/commit/5bb83b967edb514402698eecfe3db7ab5fe60b06)
- [examples] deleted this examples [`bdeabb7`](https://github.com/http-party/node-http-proxy/commit/bdeabb767a537bcb9f98ef74f6efe9762a9b1c34)
- websocket draft [`07551c6`](https://github.com/http-party/node-http-proxy/commit/07551c63e428551e5d6e52362efd9620a14c71b4)
- [fix] naming [`2a59366`](https://github.com/http-party/node-http-proxy/commit/2a593664a5768c90d9b2edf4c298460416b38926)
- [dist doc] Added documentation for consistent benchmarking of node-http-proxy [`f7f5fa7`](https://github.com/http-party/node-http-proxy/commit/f7f5fa727e8f1d3f4946e61ad03830dab1da01a5)
- [examples] update old examples [`7e44d36`](https://github.com/http-party/node-http-proxy/commit/7e44d3669bbd1b13e6452f265d52b22396f68b5d)
- [docs] more short examples to the Readme [`0393b5d`](https://github.com/http-party/node-http-proxy/commit/0393b5da990bb45e873bb80d87a0bc9e4dd6a477)
- [examples] updated old proxy examples [`e02317c`](https://github.com/http-party/node-http-proxy/commit/e02317ce86ff2dabd496cf7e2741e219a22ac817)
- [wip] Initial HTTPS-&gt;HTTP test, updated https-secure example. Work in progress, need to add more https tests [`33a2462`](https://github.com/http-party/node-http-proxy/commit/33a2462d28c7d1fa26b03bcf290242ff7cd83e7a)
- [docs] readme [`886a870`](https://github.com/http-party/node-http-proxy/commit/886a8707078f59d0467b34686455bb5bdfadbc0c)
- [examples] added error-handling using callbacks and HTTP-to-HTTPS examples [`d7064f2`](https://github.com/http-party/node-http-proxy/commit/d7064f2e1e149fe870cbb158932cb99f9f192fce)
- [examples] updated old examples [`588327c`](https://github.com/http-party/node-http-proxy/commit/588327c2c4392618b515164989f08ef20a30842b)
- stuff [`e45bfd6`](https://github.com/http-party/node-http-proxy/commit/e45bfd66a21a2470c5a4a4cc1d6095494bbc0f6b)
- [doc] added some documentation to functions and comments to understand better the code [`5dcdf2b`](https://github.com/http-party/node-http-proxy/commit/5dcdf2b36c24a9584f044b7529265b9ac861d8c7)
- Fixed issue where error callback would not invoke, including new test cases. Added req/res values to error events. [`0bfb9be`](https://github.com/http-party/node-http-proxy/commit/0bfb9be418926f2113489e92504038127d4c04bb)
- [examples] updated balancer examples [`831a44b`](https://github.com/http-party/node-http-proxy/commit/831a44b3c8c3acf6c046c47703a07cd6362a0d1c)
- socket.io stuff [`a74cd85`](https://github.com/http-party/node-http-proxy/commit/a74cd85c8a5aae2851acf7139648fefd6a02a57b)
- [tests] move contributions of @mmoulton to correct place [`7c72f3b`](https://github.com/http-party/node-http-proxy/commit/7c72f3b407a084a896e420c23ababc3e9357feca)
- [tests] this file is not necessary anymore [`881c7e6`](https://github.com/http-party/node-http-proxy/commit/881c7e62e0bef7b4b9f81b6fd121f7ad6641bd77)
- [refactor] move to leaner architecture [`8273cb6`](https://github.com/http-party/node-http-proxy/commit/8273cb6461e4d33f36e583b0354d1bea038d0a56)
- [fix] remove trailing whitespaces [`0aeaba7`](https://github.com/http-party/node-http-proxy/commit/0aeaba7fe6c51f150d0322eb90a77c1701ed88f5)
- [test] added tests for web-outgoing.js [`16a4d9d`](https://github.com/http-party/node-http-proxy/commit/16a4d9da1136b79f40ad80482d3fd17dc74274b1)
- [fix] some stuff start debugging proxystream [`d4f0da8`](https://github.com/http-party/node-http-proxy/commit/d4f0da898e5e8a2d6740e50a7fc34576435e1132)
- [tests] now each test use a different port to avoid some slow opening and closing ports [`c75d06c`](https://github.com/http-party/node-http-proxy/commit/c75d06c5f92eb7c814deb49bb33cf9fffc632d97)
- [tests] fixed inherits problem and listen for the correct event [`c65ffbb`](https://github.com/http-party/node-http-proxy/commit/c65ffbb976467dc1768983dcffe111d18e8f2db1)
- [fix] ProxyStraem now works [`356f43d`](https://github.com/http-party/node-http-proxy/commit/356f43d719998d135e0fc404ac8508e330cf1e5b)
- [examples] fix the copyright header of example files [`e592c53`](https://github.com/http-party/node-http-proxy/commit/e592c53d1a23b7920d603a9e9ac294fc0e841f6d)
- [feature] start working on the new server [`b79bd29`](https://github.com/http-party/node-http-proxy/commit/b79bd29d5e984f34b9c07fbdc803aed83b3fd0bb)
- ENH: updated examples [`f566a42`](https://github.com/http-party/node-http-proxy/commit/f566a42e511f4a6a8f3620f64e05df209e61b64f)
- [examples] add example of gzip using the connect.compress() middleware [`2142c50`](https://github.com/http-party/node-http-proxy/commit/2142c506e08f56d52e1995da5506c3e032f19c3c)
- [fix] refactor error handling [`601dbcb`](https://github.com/http-party/node-http-proxy/commit/601dbcbfe929af31995568b4f36b877245809058)
- [tests] fixed according new refactor and added test to common.setupSocket() [`1cb967b`](https://github.com/http-party/node-http-proxy/commit/1cb967b90aaa5b9da57727b8acbd95108437797a)
- [feature] websocket support [`79a14ac`](https://github.com/http-party/node-http-proxy/commit/79a14acfd2b2bf03f5ae2b334e7a37e619da6bb9)
- keepalive sockets [`dad211e`](https://github.com/http-party/node-http-proxy/commit/dad211e71c9ac3b32eba1ea3755edb688053b9d3)
- [tests] Using target field, tests now pass. We are missing the tests using forward field [`8085178`](https://github.com/http-party/node-http-proxy/commit/8085178dc2c24567adfb872a583863709ce60b5b)
- [fix] callback as optional error handler [`c7924e0`](https://github.com/http-party/node-http-proxy/commit/c7924e01f92aeec07333273f0882c1dd5e9521ae)
- ENH: added new https example, needs to be simplified before merge [`427d8d8`](https://github.com/http-party/node-http-proxy/commit/427d8d85369b0cd1d38afa0dd0f28ac98fa16001)
- [test] proxystream test [`c961279`](https://github.com/http-party/node-http-proxy/commit/c9612798f1207a4c40b616608bf6274d79ad0e4d)
- [lib] initial draft to websockets passes [`79f7f99`](https://github.com/http-party/node-http-proxy/commit/79f7f99528661162ae4153856888f078f666e017)
- [fix] minor [`7599cee`](https://github.com/http-party/node-http-proxy/commit/7599cee3fd03a5ce645e313f35557a41c9ac1aee)
- [tests] added HTTPS to HTTPS test [`31d919b`](https://github.com/http-party/node-http-proxy/commit/31d919b0a3d0b7f574e88fc5eed093c6b1a53548)
- [feature] started working on error propagation, kinda sucks, gotta think it over [`9ab8749`](https://github.com/http-party/node-http-proxy/commit/9ab8749a9bec33b49c495975e8364336ad7be1a3)
- [test] testing the onResponse proxy method [`27df8d7`](https://github.com/http-party/node-http-proxy/commit/27df8d72ad86d02cfce00a6e5c183d93dd50f97e)
- [fix] remove duplicate [`10c0f11`](https://github.com/http-party/node-http-proxy/commit/10c0f11b68e39552051e508c7bf20d65d2d59177)
- [tests] add more tests [`cedc5c4`](https://github.com/http-party/node-http-proxy/commit/cedc5c4bd2059585e1222ec4f03f09e8bcc808fc)
- [docs] Update readme with more how to [`ae0faef`](https://github.com/http-party/node-http-proxy/commit/ae0faef5aa0080d742a9740f9cb38bfd54b7d97e)
- [tests] added test for socket.io proxying [`10a0db4`](https://github.com/http-party/node-http-proxy/commit/10a0db4f0dd4594839f9098b9d67130085a067bc)
- [tests] added test HTTPS to HTTP using own server [`bbe3bfd`](https://github.com/http-party/node-http-proxy/commit/bbe3bfdf98255b82a185a798ff9f29e74615b6ca)
- [examples] update the error-handling example using the new error handle way [`a1b25a1`](https://github.com/http-party/node-http-proxy/commit/a1b25a123b4ff71e731f9beb27c5e078acfead65)
- [fix] quote [`c4ddc4e`](https://github.com/http-party/node-http-proxy/commit/c4ddc4edd324d9910a11eea14561a0e3b953f29c)
- ENH: updated README and added examples file. [`07091b5`](https://github.com/http-party/node-http-proxy/commit/07091b5077a40dfee29f6fd33ecb38d3fa25b801)
- [test] passes/web.js (first 2 funcs) [`d40e4be`](https://github.com/http-party/node-http-proxy/commit/d40e4beb62381b962b6cf3254451de0a39f182b1)
- [test] add test for forwardstream [`8fc3389`](https://github.com/http-party/node-http-proxy/commit/8fc33893672d26013c2b2ff396b777bcf1751527)
- [tests] fixing tests, fixed some typos and changed how passes are stored [`a704213`](https://github.com/http-party/node-http-proxy/commit/a7042132c881656dd32f915d9b0b962f0ef92efb)
- [test] added the lib/caronte/streams/forward.js initial test, one test pending [`2fac7b9`](https://github.com/http-party/node-http-proxy/commit/2fac7b9b009b12a940efb22de3af6db55ee686a9)
- [api] add draft for proxystream [`4f24664`](https://github.com/http-party/node-http-proxy/commit/4f24664e8a50aa9b9a3ea155d067b85f94a8c81b)
- [experiment] new api for proxying [`07cfa6b`](https://github.com/http-party/node-http-proxy/commit/07cfa6b981ff54d8d96eea6c9aa4b560ee3867ec)
- [tests] the options got a problem and this test probe that timeout is not being set [`1d1ee88`](https://github.com/http-party/node-http-proxy/commit/1d1ee8858283d7c8984f1c1d6c5185b6822f9235)
- new error propagation [`3a39e44`](https://github.com/http-party/node-http-proxy/commit/3a39e444ff68a74f6b586f0736bbd3f8a2511ca5)
- [fix] docs [`ec981c5`](https://github.com/http-party/node-http-proxy/commit/ec981c5b74bf43dd36c8ca89833b751f59f01d38)
- [examples] added concurrent proxy example [`04c1011`](https://github.com/http-party/node-http-proxy/commit/04c10113f7a3b568fb95b18f30e4aca3e059d961)
- [fix] closes number #487 [`cde08fb`](https://github.com/http-party/node-http-proxy/commit/cde08fb2ee2df03c9457678d8e6776a5d89165b2)
- [test] started writing tests [`16eacfa`](https://github.com/http-party/node-http-proxy/commit/16eacfa961d2a2d80534e95eba83010ed6ab01b4)
- [tests] added tests for websockets [`02007ed`](https://github.com/http-party/node-http-proxy/commit/02007ed0fb38f798436ae5669bb18d4f27496667)
- Revert "[fix] fixed options and server reference to can access them from passes functions" [`babdf53`](https://github.com/http-party/node-http-proxy/commit/babdf531fecd32f9af0963902909fcfa2cd374f1)
- mm test file [`1a7bef0`](https://github.com/http-party/node-http-proxy/commit/1a7bef0cda58243416a263075dc6eb51f22b6dec)
- [fix] fixed options and server reference to can access them from passes functions [`90fb01d`](https://github.com/http-party/node-http-proxy/commit/90fb01d38ac5af7ef395547b24e985b6f63b4abc)
- [examples] added forward example [`7a3f6df`](https://github.com/http-party/node-http-proxy/commit/7a3f6dfbcc80ba32fa81004438c637e8d29eb029)
- [docs] add UPGRADING.md [`db12f6c`](https://github.com/http-party/node-http-proxy/commit/db12f6c24e22c034c698457cc28ff60c990b55a5)
- DOC: Added error handling example [`32a4088`](https://github.com/http-party/node-http-proxy/commit/32a40889cedfd6b0d92224aa921700a7b7271c68)
- [examples] updated the modifyResponse-middleware example [`de3ff11`](https://github.com/http-party/node-http-proxy/commit/de3ff11656b4a847de3a63b28feed39b6c816480)
- [test] test onError part, proxying to no where [`b85aa16`](https://github.com/http-party/node-http-proxy/commit/b85aa16e75401a223a947cde444d42cf7eeafb67)
- ENH: updated agent options in `common.setupOutgoing` [`12cda56`](https://github.com/http-party/node-http-proxy/commit/12cda561afe534427a5f84da9d7e0beb64a8ecbc)
- [fix] minor and short fixes [`e0faaaf`](https://github.com/http-party/node-http-proxy/commit/e0faaaf81152203b96f0313c68706468e7ee7357)
- support websockets [`4a4607d`](https://github.com/http-party/node-http-proxy/commit/4a4607d075a912746386d1751fd6b0fc98cf6b20)
- [test] COVERAGE [`004a46c`](https://github.com/http-party/node-http-proxy/commit/004a46c09df2f0f7b15d8e8f7119bc6039e0c01c)
- [misc] add a LICENSE file [`584ce76`](https://github.com/http-party/node-http-proxy/commit/584ce76e7576c906e25cdd04a2e079f97bcf86ff)
- ENH: updated https and agent option [`13741a8`](https://github.com/http-party/node-http-proxy/commit/13741a823f1c1c884d4a37e597e4b188598b0e25)
- [fix] write connection header [`2c10f25`](https://github.com/http-party/node-http-proxy/commit/2c10f256b658bc0e906c20f29d94ab7eaf653055)
- [fix] merge #495, thanks @glasser [`d0862af`](https://github.com/http-party/node-http-proxy/commit/d0862aff0c693366dcb11649b6abe1d011268953)
- support forward [`8c8c455`](https://github.com/http-party/node-http-proxy/commit/8c8c455541f21ad9a9ac7ca19d1f37368206a2e2)
- [tests] fix tests set correct host headers [`cfd417d`](https://github.com/http-party/node-http-proxy/commit/cfd417de2352b0f05535b979dc15abff60c1fb96)
- [fix] Optimize fix for `x-forwarded-for-port`. [`2d42709`](https://github.com/http-party/node-http-proxy/commit/2d42709c3283637de16a49e815b03e63432bbd29)
- ENH: updated readme with an example [`edd8e2f`](https://github.com/http-party/node-http-proxy/commit/edd8e2f04e4b39391b062fa6437d61b4ebde8748)
- [doc] update README.md [`dcb873a`](https://github.com/http-party/node-http-proxy/commit/dcb873ad9992b1534615d59b8a0a70e8b87d7884)
- [test] passes/web.js XHeaders func [`c02b721`](https://github.com/http-party/node-http-proxy/commit/c02b721321c455bc287c3fed6b9b21392ce2fc70)
- [fix] fixed passes functions, now 'this' can be used and options are stored on 'this.options' [`9b3e1eb`](https://github.com/http-party/node-http-proxy/commit/9b3e1eb247df29d18ea299ff4ebb2f10eeb71269)
- Revert "[fix] fixed passes functions, now 'this' can be used and options are stored on 'this.options'" [`5e130de`](https://github.com/http-party/node-http-proxy/commit/5e130de8548ad41b821da49299b4fd1c9536c5f0)
- [minor] Remove duplicate dependencies and cleanup of the scripts [`a51b062`](https://github.com/http-party/node-http-proxy/commit/a51b0622780f48160001f9e74340f7d720cbfce6)
- TEST: added agent and header tests [`39b0c46`](https://github.com/http-party/node-http-proxy/commit/39b0c46a6967fda5329760ad93a8ec01bc4a6f14)
- [examples] fix styling and bad spaces [`6a6dfbb`](https://github.com/http-party/node-http-proxy/commit/6a6dfbb79dc156679f75dd519344d19a5b61613b)
- ENH: added error events [`1b867a7`](https://github.com/http-party/node-http-proxy/commit/1b867a7f594f7dfe49fc17ff53451a353ec509d9)
- [test] remove chunked on http1.0 [`ca09263`](https://github.com/http-party/node-http-proxy/commit/ca092635e7ac4d967b554e3b94a16a931946d464)
- [tests] fix test to use the new way to pass options [`52ecd52`](https://github.com/http-party/node-http-proxy/commit/52ecd52ee5aa78603e44ba8d5ff9187410351622)
- [examples] fixed https examples [`a467b7b`](https://github.com/http-party/node-http-proxy/commit/a467b7b4a9614a7cbfdc256524e1495616e3d4d9)
- Revert "[tests] fix test to use the new way to pass options" [`2bf20d6`](https://github.com/http-party/node-http-proxy/commit/2bf20d61d53201e9820c5f9215e641fcf88f5172)
- [fix] better code [`3d8e538`](https://github.com/http-party/node-http-proxy/commit/3d8e5383cd9d527825f95d9071a87865fcebca05)
- [feature] implement _write and _read [`6a4294c`](https://github.com/http-party/node-http-proxy/commit/6a4294cbdfe85fa162969b1393032adc9d418441)
- [fix] use the correct arguments order [`cc09ae6`](https://github.com/http-party/node-http-proxy/commit/cc09ae6a345cfde1689e1d8731c5822675c59d4d)
- [fix] fix the correct order of arguments in ws-incoming passes [`02df9a3`](https://github.com/http-party/node-http-proxy/commit/02df9a33c5cce17ea32a892017acbe5ce57ab2e5)
- [fix] write status [`e08d4ed`](https://github.com/http-party/node-http-proxy/commit/e08d4edad339d0f7f55900b3e6e6a0e770960215)
- [fix] finished jshint fixes [`455f97e`](https://github.com/http-party/node-http-proxy/commit/455f97e14cb4929e0a3a5c746471e9c5e76436fc)
- Update the README to describe middleware err handler. [`25bb3bf`](https://github.com/http-party/node-http-proxy/commit/25bb3bfa7012e0f975e10f0311cae8c39183fa41)
- Prevent headers to be sent twice [`8332e74`](https://github.com/http-party/node-http-proxy/commit/8332e744202ed9de94288d8f1c822cd9fe788983)
- [examples] added package.json with the dependencies needed by examples [`d85ccdd`](https://github.com/http-party/node-http-proxy/commit/d85ccdd333edcfc7551bcf8e0ffd7dc166e38e61)
- [tests] added .travis.yml file [`0602500`](https://github.com/http-party/node-http-proxy/commit/06025002303f351f71d9e5f78a93895257f0d283)
- [dist minor] 2 space indents next time @samalba [`7e8041d`](https://github.com/http-party/node-http-proxy/commit/7e8041d2b687b8375a1d0fe45270029c6e8ddee6)
- [fix] naming [`8931009`](https://github.com/http-party/node-http-proxy/commit/893100972c22febbf133134394bc0bcef47d9e12)
- Fix for #458. Host header may cause some sites not to be proxyable with changeOrigin enabled [`781c038`](https://github.com/http-party/node-http-proxy/commit/781c038f2b4d14a01cc9297e1e0dba6ce39dd6cb)
- [docs] typos, typos everywhere... [`03880d8`](https://github.com/http-party/node-http-proxy/commit/03880d8d069e9e17ca7d7aea6eb760f6626a869c)
- ENH: updated `ws` and `web` functions to use the global options object as a base [`268afe3`](https://github.com/http-party/node-http-proxy/commit/268afe34bb51448d511c9cd73c03e97d1c1baee0)
- [fix] make @mmalecki a happy camper [`c9cd6d2`](https://github.com/http-party/node-http-proxy/commit/c9cd6d2ad324e0e6222932c8f29f27621071e045)
- write [`f97c0c6`](https://github.com/http-party/node-http-proxy/commit/f97c0c6167371c5ff92e6361b1df02e3fd5506d7)
- [fix] [`a9f9e21`](https://github.com/http-party/node-http-proxy/commit/a9f9e21eda2f8e912523e6b62abb0101c0353505)
- [fix] coveralls.. will it work? [`f36cb4d`](https://github.com/http-party/node-http-proxy/commit/f36cb4d5a110fc86272e878278f103f313c86f56)
- ENH: updated target and forward options so that a string may be specified [`ef946a7`](https://github.com/http-party/node-http-proxy/commit/ef946a7697b38b13178881b3d1ebde63681dd4a1)
- added option for eventlistenerCount(max) [`8eb6780`](https://github.com/http-party/node-http-proxy/commit/8eb6780f8705caff13a5375446539b0621d497d7)
- [fix] support buffer [`1204a35`](https://github.com/http-party/node-http-proxy/commit/1204a35e467c6c1855ba0dac8f55d79f899148a6)
- DOC: updated readme with options [`1b5fb1d`](https://github.com/http-party/node-http-proxy/commit/1b5fb1d8fc21421b8383919d93e4149b586b211b)
- ENH: added 'headers' to available options, to add or overwrite existing headers [`7d840d3`](https://github.com/http-party/node-http-proxy/commit/7d840d35151be1aac612798754af47368594781d)
- [fix] move logo [`57abb7f`](https://github.com/http-party/node-http-proxy/commit/57abb7f26c14e281c3be07a8b84e3c79e066f59f)
- FIX: tests. still need to add more tests tho [`a350fad`](https://github.com/http-party/node-http-proxy/commit/a350fadea6bace293131581487f8c66948009449)
- [fix] move logo [`aaff196`](https://github.com/http-party/node-http-proxy/commit/aaff1966e4e2eb42c9890e57737f57a64e8d964a)
- [docs] add travis build status [`6b61878`](https://github.com/http-party/node-http-proxy/commit/6b618787598a2a37850898dbdb3b4fe8f3c3414d)
- [fix] do not send chunked responses to http1.0 clients [`8663ac1`](https://github.com/http-party/node-http-proxy/commit/8663ac1c43505f0081d906c3cd8e702d4b5ddeb0)
- [dist] Bump dependencies. [`a81dd8d`](https://github.com/http-party/node-http-proxy/commit/a81dd8d53e1595cba9acf5cc3ca9517165dcc4aa)
- [fix] readme [`4d3a4e1`](https://github.com/http-party/node-http-proxy/commit/4d3a4e1ee7370347898d1863ab73aa68ed345d8d)
- [fix] proxying to https [`26c4c43`](https://github.com/http-party/node-http-proxy/commit/26c4c43a06263ec6721bc0e8a90644297d0cf217)
- [fix] new logo [`ee3cc38`](https://github.com/http-party/node-http-proxy/commit/ee3cc380665a31ec6af28ddb73dfc543f430d3f8)
- [fix] naming convention [`7d71a86`](https://github.com/http-party/node-http-proxy/commit/7d71a867a8bdc375f7577cec3905cca89bbf415c)
- fix docs [`9243444`](https://github.com/http-party/node-http-proxy/commit/9243444ac006f73c00b0f1f78c4a77f342b0b4e4)
- [fix] short circuit [`a6256ca`](https://github.com/http-party/node-http-proxy/commit/a6256cac1df1739e3da78fe5f0cf122ef7ce6b14)
- [tests] this test is already in web-incoming tests [`920f1e7`](https://github.com/http-party/node-http-proxy/commit/920f1e7707aa1751577533cd368529f8a704d7af)
- Emit middlewareError when on middleware error. [`bc12ca3`](https://github.com/http-party/node-http-proxy/commit/bc12ca39394f9aeed3e3047f59035ba48afa2885)
- DOC: updated readme [`7ad5c0f`](https://github.com/http-party/node-http-proxy/commit/7ad5c0f993294c9e2e7650e15fbc62d11a2cb062)
- [docs] add logo [`8b05626`](https://github.com/http-party/node-http-proxy/commit/8b05626eed5e45e72cf9b1f14a4c4dca1dd2ed0f)
- [fix] making @stoke a happy camper [`34f16e7`](https://github.com/http-party/node-http-proxy/commit/34f16e74647095199f84ab61e10c8dafd60b505a)
- [feature] add buffer support [`e3f8d5f`](https://github.com/http-party/node-http-proxy/commit/e3f8d5fdbe1ebc4f04188d95bbef768d09718d2c)
- [Fix] 2 spelling mistakes [`5823842`](https://github.com/http-party/node-http-proxy/commit/58238421945bcc4236e280ebca7799b831ae29a4)
- [fix] do not call .end [`6e77cd3`](https://github.com/http-party/node-http-proxy/commit/6e77cd390929842088ae9f6deb922a6627ddfecd)
- attempting to fix link to valid options properties [`bbe2b27`](https://github.com/http-party/node-http-proxy/commit/bbe2b2788a7ee3c74fd44fe88b6dcf213264436f)
- [fix] slimmer proxying [`031aa0f`](https://github.com/http-party/node-http-proxy/commit/031aa0fbf30bd377696c4efa508f6fc769bf1070)
- [fix] use agent pool [`abf1d90`](https://github.com/http-party/node-http-proxy/commit/abf1d90fdf05a17ebe05a3e90d464a592e0aee69)
- [tests] fix test using undefined url [`c4d56a5`](https://github.com/http-party/node-http-proxy/commit/c4d56a5faf1e89cdeb911f0ece0efe065eb58c45)
- [fix] legacy [`162a42f`](https://github.com/http-party/node-http-proxy/commit/162a42f58f515c5418ccfac0b68f4c928103b1e1)
- [tests] fixing minor typos [`b333e63`](https://github.com/http-party/node-http-proxy/commit/b333e63648aa67ea1b1aaf17ba684e5fc6f751a6)
- Updated readme [`bd106d6`](https://github.com/http-party/node-http-proxy/commit/bd106d69f074a1c7018e685a4e144e23a17beb8c)
- [misc] use the local mocha instead the global [`f1aeb05`](https://github.com/http-party/node-http-proxy/commit/f1aeb0500cde39b63e570323e0e478530d1222ab)
- added unlimited listeners to the reverproxy event obj. [`1333c0c`](https://github.com/http-party/node-http-proxy/commit/1333c0cc62e7b590843f9b00326fe80137163c5e)
- [tests] throw error when no options, ALL TESTS PASSING! YAY [`86750c7`](https://github.com/http-party/node-http-proxy/commit/86750c7e594c419dfae957aaf7e44e61e1d480e8)
- ENH: updated example [`1c7ace2`](https://github.com/http-party/node-http-proxy/commit/1c7ace26c5a36fb63497f1ab67793c5b75495063)
- [merge] PR #470 [`38e6d7c`](https://github.com/http-party/node-http-proxy/commit/38e6d7cd5449a7264dcf5244b3dfd07b2dda60e1)
- [fix] remove stuff [`6a03e5f`](https://github.com/http-party/node-http-proxy/commit/6a03e5f7cf356416ea13584e279f5bfa3791c058)
- [test][misc] remove node@0.8 to test on travis [`8eff1a1`](https://github.com/http-party/node-http-proxy/commit/8eff1a1f26bb739dfc5a1ad90b140ff2a18921d5)
- merge with @cronopio [`0fb3381`](https://github.com/http-party/node-http-proxy/commit/0fb33810f5e70b714bd9868557d85a531b8e11e3)
- [merge] text [`98f29bd`](https://github.com/http-party/node-http-proxy/commit/98f29bdcfca9b818ffe107b09578539fdf379c8a)
- [fix] woops [`bd3df45`](https://github.com/http-party/node-http-proxy/commit/bd3df45010f282997cae3a699c7ecb885c01bdf8)
- [test] Test on newer version of node [`ebbba73`](https://github.com/http-party/node-http-proxy/commit/ebbba73eda49563ade09f38bdc8aef13d1cf6c00)
- new error propagation - follows [`1993faf`](https://github.com/http-party/node-http-proxy/commit/1993faf8a4227acda3423d46cf2cf13b4d9861e7)
- [fix] minor typo [`5a1504f`](https://github.com/http-party/node-http-proxy/commit/5a1504f0764b7747b53cc0d92a69ff3093e85ade)
- [fix] proxy to http(s) [`3c91ed3`](https://github.com/http-party/node-http-proxy/commit/3c91ed3d26d9af640d0c7a09fb9cdaf80ad673ca)
- Put the arguments the right way around in the README. [`1457980`](https://github.com/http-party/node-http-proxy/commit/145798062e332ac2aed7f8e8e3240e38464c870a)
- [fix] use some [`4480699`](https://github.com/http-party/node-http-proxy/commit/4480699d3a2a5080c051e7b8a100689fd1f58657)
- [fix] layout [`d7078e2`](https://github.com/http-party/node-http-proxy/commit/d7078e2fdd16d23d0b5f8f1d8a7ab3e9011fea4f)
- [docs] logo [`dd0f7b8`](https://github.com/http-party/node-http-proxy/commit/dd0f7b8876ae5b57fffab8857735b25b159f2bdb)
- [fix] url [`0637322`](https://github.com/http-party/node-http-proxy/commit/0637322d96e54bbcf5a14bf009dd73314cada4ce)
- [fix] opts [`adc5be0`](https://github.com/http-party/node-http-proxy/commit/adc5be020c7fff09a1c05ac771d5c5ab61002c23)
- [docs] fix syntax highlighting [`da9de70`](https://github.com/http-party/node-http-proxy/commit/da9de7034a452d1281217a349bc9403fddcc2b7f)
- [fix] typo [`275a519`](https://github.com/http-party/node-http-proxy/commit/275a5192fa257f78287a954b347e65023795487d)
- [tests] fix code coverage, changed pattern on blanket options [`4090250`](https://github.com/http-party/node-http-proxy/commit/40902506af3361b642b8798350b48404fe0a4e78)
- Put the arguments the right way around in emitter. [`7c8ecc8`](https://github.com/http-party/node-http-proxy/commit/7c8ecc8ea85b59fc16b55b9a142372b6ac168b2a)
- [fix] link [`72a89ea`](https://github.com/http-party/node-http-proxy/commit/72a89eab8bafef3742d78e8de8631094f961f427)
- [fix] space [`69f126b`](https://github.com/http-party/node-http-proxy/commit/69f126b34cbd190be8541a854d21f13bfb5a61bf)
- [fix] tests [`8269eca`](https://github.com/http-party/node-http-proxy/commit/8269eca2bb34d08336b8889e06e53d3522fa79fe)
- [fix] console [`18341d5`](https://github.com/http-party/node-http-proxy/commit/18341d559717e0a86f5ee4da024109e4b5a595a7)
- Set travis to run `npm test` while we fix coveralss.io integration [`e2a5d51`](https://github.com/http-party/node-http-proxy/commit/e2a5d513cac3ebceff446787fa106c7f00caf785)
- [fix] making @jcrugzz a happy camper [`2e7343d`](https://github.com/http-party/node-http-proxy/commit/2e7343d728a3187d48821b88ec2e2d4699bb2afe)
- [fix] minor typo [`5d66ce1`](https://github.com/http-party/node-http-proxy/commit/5d66ce11bb7eef7e704a2de2c0ef3b5f754843e9)
- [tests] tests fixed [`d60353f`](https://github.com/http-party/node-http-proxy/commit/d60353f80bbbcba128a2c51066e107365270e878)
- [tests] disabled the examples-test by now [`d83fdf6`](https://github.com/http-party/node-http-proxy/commit/d83fdf69a1121bfcfba72bbffcd3105ae5852c56)
- [fix] _ because it is unused [`590bb60`](https://github.com/http-party/node-http-proxy/commit/590bb604dae11223a0ae80469b59d6d341488f1f)
- [tests] disable test, by now is not throwing without options [`a2b1f0a`](https://github.com/http-party/node-http-proxy/commit/a2b1f0a4c9079342db6255c5f92db4a0cb992707)
- [fix] support target and forward [`961d2f9`](https://github.com/http-party/node-http-proxy/commit/961d2f9400b4cfd236c3c8ccbf401d37f8e871b8)
- [dist] Version bump. 0.10.4 [`840f6d8`](https://github.com/http-party/node-http-proxy/commit/840f6d8d29dffc11d3726123c2d400940ca2bdda)
- [fix] remove old reminescence [`4d65280`](https://github.com/http-party/node-http-proxy/commit/4d65280ea313438a94589bacf55f7a09cc107888)
- [feature] add emit proxyRes [`dda6f7a`](https://github.com/http-party/node-http-proxy/commit/dda6f7a45a46d2bf63e482d0b47b7c36ae548546)
- [docs] test badge [`1ceea3e`](https://github.com/http-party/node-http-proxy/commit/1ceea3e5f9b6232d60d673946bbccb7d8ccb4beb)
- [tests] remove caronte and use http-proxy for file names [`c9f5772`](https://github.com/http-party/node-http-proxy/commit/c9f5772fc18226aca31471bc96c44a6dbff5cbea)
- [logo] [`4c2f2f3`](https://github.com/http-party/node-http-proxy/commit/4c2f2f3b9a5ba65f97403e778a670f14301d52c1)

## [v0.10.3](https://github.com/http-party/node-http-proxy/compare/v0.10.2...v0.10.3) - 2013-06-20

### Merged

- Pass default certs to SNICallback example [`#419`](https://github.com/http-party/node-http-proxy/pull/419)

### Fixed

- Pass default certs to SNICallback example [`#399`](https://github.com/http-party/node-http-proxy/issues/399)

### Commits

- [dist] Bump version to 0.10.3 [`2fd748f`](https://github.com/http-party/node-http-proxy/commit/2fd748fb61dac7de0daa50aabbface7033c6a222)
- [fix] Respect `maxSockets` from `target` options in `RoutingProxy` [`e1d384e`](https://github.com/http-party/node-http-proxy/commit/e1d384e769e9f4adc5a06c516cfb721ff24b4b6d)
- Send path in req.path and not the url [`0c75323`](https://github.com/http-party/node-http-proxy/commit/0c753234c0c85333f909bdbef034ffb6e192bad5)

## [v0.10.2](https://github.com/http-party/node-http-proxy/compare/v0.10.1...v0.10.2) - 2013-04-21

### Merged

- Correct keep-alive responses to HTTP 1.0 clients [`#407`](https://github.com/http-party/node-http-proxy/pull/407)

### Fixed

- [minor] Style compliance. Fixes #402. [`#402`](https://github.com/http-party/node-http-proxy/issues/402)

### Commits

- Correct keep-alive responses to HTTP 1.0 clients. [`a29b5e8`](https://github.com/http-party/node-http-proxy/commit/a29b5e8e289c34c00d2b450e5fb9dd1969db4b97)
- [minor] Strip trailing whitespace. [`7fc39d7`](https://github.com/http-party/node-http-proxy/commit/7fc39d77f47311b82c24ab05f8e1a45a2733305c)
- Add headers on 'handshake' [`985025c`](https://github.com/http-party/node-http-proxy/commit/985025c90f3b2fafede64d8b17c318326f2423d9)
- Don't test raw HTTP 1.0 requests over HTTPS. [`daf53bd`](https://github.com/http-party/node-http-proxy/commit/daf53bd753879223dc84a49c92d0efaf576c1fd3)
- [dist] Version bump. 0.10.2 [`de0928f`](https://github.com/http-party/node-http-proxy/commit/de0928f616dd62165e8a22c00d091cabf31e1e87)

## [v0.10.1](https://github.com/http-party/node-http-proxy/compare/v0.10.0...v0.10.1) - 2013-04-12

### Merged

- Fix for slab buffer retention, leading to large memory consumption [`#370`](https://github.com/http-party/node-http-proxy/pull/370)

### Commits

- [dist] Version bump. 0.10.1 [`9c13ad4`](https://github.com/http-party/node-http-proxy/commit/9c13ad46e416125373d6604f3954ec3df1f55449)

## [v0.10.0](https://github.com/http-party/node-http-proxy/compare/v0.9.1...v0.10.0) - 2013-03-18

### Merged

- Change the emitter of the `proxyResponse` event [`#385`](https://github.com/http-party/node-http-proxy/pull/385)
- Fixing a bug that generates an unexpected TypeError [`#383`](https://github.com/http-party/node-http-proxy/pull/383)
- Mention Harmon used for response modifications in the readme [`#384`](https://github.com/http-party/node-http-proxy/pull/384)

### Commits

- [dist] Update CHANGELOG.md [`8665f3c`](https://github.com/http-party/node-http-proxy/commit/8665f3cc600feecbb4c8229699823149c69a144f)
- Harmon messsage [`35ba0db`](https://github.com/http-party/node-http-proxy/commit/35ba0db554c6bace21b1bacfa8f5fb6df4228db0)
- [fix breaking] Emit the `proxyResponse` event on the HttpProxy instance to reduce listener churn and reference counts. [`2620f06`](https://github.com/http-party/node-http-proxy/commit/2620f06e2db9a267945566f10837c4c2a5df753d)
- [dist] Version bump. 0.10.0 [`71183bf`](https://github.com/http-party/node-http-proxy/commit/71183bf30bc2b9ad2eaf57c51980eeb0bc7edff0)
- Fixing the if statement as it lead to 'TypeError: Parameter 'url' must be a string, not undefined' in certain cases [`c9b6895`](https://github.com/http-party/node-http-proxy/commit/c9b6895c5e14add6aba4f826a2173458a1896a5f)
- Harmon messsage [`4e42354`](https://github.com/http-party/node-http-proxy/commit/4e42354e77d5731a383d516fc0b249d5d0eda745)

## [v0.9.1](https://github.com/http-party/node-http-proxy/compare/v0.9.0...v0.9.1) - 2013-03-09

### Commits

- [dist doc] Updated CHANGELOG.md for `v0.9.1` [`ea5e214`](https://github.com/http-party/node-http-proxy/commit/ea5e214522d8ac34d1129b28ff188c0f232ce63f)
- [dist] Version bump. 0.9.1 [`701dc69`](https://github.com/http-party/node-http-proxy/commit/701dc698e3eb39ca6836a02611d8dce750f4e212)
- [breaking] Ensure that `webSocketProxyError` also receives the error to be consistent with `proxyError` events. [`c78356e`](https://github.com/http-party/node-http-proxy/commit/c78356e9cf27a21c57e4c98ef7dd3c22abe864c2)

## [v0.9.0](https://github.com/http-party/node-http-proxy/compare/v0.8.7...v0.9.0) - 2013-03-09

### Merged

- If HTTP 1.1 is used and backend doesn't return 'Connection' header, expicitly  return Connection: keep-alive. [`#298`](https://github.com/http-party/node-http-proxy/pull/298)
- add "with custom server logic" to the "Proxying WebSockets" section of the readme [`#332`](https://github.com/http-party/node-http-proxy/pull/332)
- routing proxy 'this' reference bug? [`#365`](https://github.com/http-party/node-http-proxy/pull/365)
- fixed issue #364 'proxyError' event emitted twice [`#374`](https://github.com/http-party/node-http-proxy/pull/374)
- Misleading documentation for Websockets via .createServer [`#349`](https://github.com/http-party/node-http-proxy/pull/349)

### Fixed

- [api test] Manually merge #195 from @tglines since that fork was deleted. Update tests to use new macros. Fixes #195. Fixes #60. [`#195`](https://github.com/http-party/node-http-proxy/issues/195) [`#60`](https://github.com/http-party/node-http-proxy/issues/60)
- [fix] Set "content-length" header to "0" if it is not already set on DELETE requests. Fixes #338. [`#338`](https://github.com/http-party/node-http-proxy/issues/338)
- [fix] Do not use "Transfer-Encoding: chunked" header for proxied DELETE requests with no "Content-Length" header. Fixes #373. [`#373`](https://github.com/http-party/node-http-proxy/issues/373)
- [fix] http-proxy should not modify the protocol in redirect request for external sites. Fixes #359. [`#359`](https://github.com/http-party/node-http-proxy/issues/359)
- [fix] Emit `notFound` event when ProxyTable location does not exist. Fixes #355. Fixes #333. [`#355`](https://github.com/http-party/node-http-proxy/issues/355) [`#333`](https://github.com/http-party/node-http-proxy/issues/333)
- [fix] Make options immutable in `RoutingProxy`. Fixes #248. [`#248`](https://github.com/http-party/node-http-proxy/issues/248)
- [fix] Remove special case handling of `304` responses since it was fixed in 182dcd3. Fixes #322. [`#322`](https://github.com/http-party/node-http-proxy/issues/322)
- [fix] Ensure `response.headers.location` is defined. Fixes #276. [`#276`](https://github.com/http-party/node-http-proxy/issues/276)

### Commits

- [minor] s/function(/function (/ s/){/) {/ [`9cecd97`](https://github.com/http-party/node-http-proxy/commit/9cecd97153ccce4f81c5eda35a49079e651fb27a)
- working on x-forwarded-for [`1332409`](https://github.com/http-party/node-http-proxy/commit/133240937dc63aca0007388327837bc24808f79a)
- Routing Proxy was not sending x-forward-*. Fixing It... [`916d44e`](https://github.com/http-party/node-http-proxy/commit/916d44e3d2a17bb9d5178f347ddad9796b988e05)
- Added timeout option and test to test new timeout parameter, added requestFail assertion. [`89d43c2`](https://github.com/http-party/node-http-proxy/commit/89d43c20dd0dec1dda1fd70e57f3f250b9e3b431)
- Add tests for headers bug fixes [`ecb5472`](https://github.com/http-party/node-http-proxy/commit/ecb547223f3f1d9bf551842c2026ee2f1a18638a)
- Added simple round robin example with websocket support [`83fbd42`](https://github.com/http-party/node-http-proxy/commit/83fbd4250660f41de1ab2b5490a3bf58200ae148)
- - support unix donain sockets and windows named pipes (socketPath) on node 0.8.x. On node 0.6.x the support was opaque via port, but on the new node, socketPath should be set explicitely. [`ffe74ed`](https://github.com/http-party/node-http-proxy/commit/ffe74ed299f81206b898147dbcc985519b2921f8)
- pathnameOnly flag added.  Ignores hostname and applies routing table to the paths being requested. [`46b078a`](https://github.com/http-party/node-http-proxy/commit/46b078a98d10de7726a3bbca89121acc57ad7625)
- [doc] added comments to pathnameOnly block. [`5e6be6c`](https://github.com/http-party/node-http-proxy/commit/5e6be6ccf5a39ff450e57d7b24e374a83569fa85)
- remove offending code, final fix for issue #364 [`3b84e27`](https://github.com/http-party/node-http-proxy/commit/3b84e27ab4efd5ce3b8ac837d699d4ff6661c7e7)
- memory leak fix in closing of the scokets [`2055d0c`](https://github.com/http-party/node-http-proxy/commit/2055d0c8ec16699ffb06adf6d64d9506920b2071)
- Fix truncated chunked responses [`ef66833`](https://github.com/http-party/node-http-proxy/commit/ef66833c4d7f07ae9f42026f2bcc0fbca2440579)
- Re-added previous description [`603106a`](https://github.com/http-party/node-http-proxy/commit/603106a13d28c0199fa4456cc9aee1692eb2588c)
- pathnameOnly option documented in the Readme.md [`a1607c1`](https://github.com/http-party/node-http-proxy/commit/a1607c1684a7d7617e5148a0dca882eb08a9f03b)
- [fix minor] Prevent crashes from attempting to remove listeners more than once when proxying websocket requests. [`a681493`](https://github.com/http-party/node-http-proxy/commit/a681493371ae63f026e869bf58b6fea682dc5de3)
- Added comments [`64efa7f`](https://github.com/http-party/node-http-proxy/commit/64efa7f9291a2377a32e942a247700b71b107993)
- Revert "[fix minor] Prevent crashes from attempting to remove listeners more than once when proxying websocket requests." [`c6da760`](https://github.com/http-party/node-http-proxy/commit/c6da760ca9f375025229fe3fc174aca943362f38)
- [doc dist] Update CHANGELOG.md for `v0.9.0`. [`133115c`](https://github.com/http-party/node-http-proxy/commit/133115c9760130dcef447efbd18c470c08795c90)
- add support for loading CA bundles [`10f6b05`](https://github.com/http-party/node-http-proxy/commit/10f6b0577518bdfcb6b43c1f516dc988bdcade53)
- problem: don't want to run my server as root to bind to privileged ports (e.g. 80, 443). [`2c36507`](https://github.com/http-party/node-http-proxy/commit/2c3650746cd90fed63b140a8d393e18bd35cd8f9)
- Add 'proxyResponse' event so observer can modify response headers or abort response. [`3b86a7a`](https://github.com/http-party/node-http-proxy/commit/3b86a7aae3fc366c5fa8645285a4368dbac7a0dc)
- [minor] Move private helper to end of file. [`476cbe7`](https://github.com/http-party/node-http-proxy/commit/476cbe741fc41b7f1eb269d841d922784e8b3c6b)
- Fix for retaining large slab buffers in node core [`d2888c8`](https://github.com/http-party/node-http-proxy/commit/d2888c83f5eab3fb82425ef4fd51e62621bf2764)
- [dist] Update `devDependencies` [`ad21310`](https://github.com/http-party/node-http-proxy/commit/ad213106d06cfc79004841f04b8e73fe7d7ef67a)
- [minor] Small whitespace compliance. [`ea0587a`](https://github.com/http-party/node-http-proxy/commit/ea0587a8f98b1eedc38c66b69293ae091e24be6e)
- [doc fix] Add undefined var in example. [`deca756`](https://github.com/http-party/node-http-proxy/commit/deca7565c51fd678354d26eaae7fe2481e36e2c3)
- working on x-forwarded-for [`31fc94a`](https://github.com/http-party/node-http-proxy/commit/31fc94aa5e43c54033d5384caaf104eebf3889bd)
- Allow event observers to access upstream response headers and data. [`4c130f5`](https://github.com/http-party/node-http-proxy/commit/4c130f5dac5f2cfbfc2618446b86244aff4cb04f)
- [fix doc] Fix bad variable reference in `README.md`. [`440013c`](https://github.com/http-party/node-http-proxy/commit/440013c263a96c6681bfe92a8f56db93b58efa8d)
- Change wording for handling websocket proxy events [`ee6bbe0`](https://github.com/http-party/node-http-proxy/commit/ee6bbe00244c90bd532b11ff1c796aea8c7372f8)
- [dist] Version bump. 0.9.0 [`c68e038`](https://github.com/http-party/node-http-proxy/commit/c68e0389120d8530e578e20496d8ee091e69a580)
- fix 'this' reference in routing proxy listener bindings [`15afc23`](https://github.com/http-party/node-http-proxy/commit/15afc23a275f3fa16653fff6179368122661a0af)
- cleanning [`8d87399`](https://github.com/http-party/node-http-proxy/commit/8d8739999fcaf4cdd8f2471046f6f036c44dc8f7)
- cleanning [`9672b99`](https://github.com/http-party/node-http-proxy/commit/9672b9927156a0dfe3ce4539f380aaf3172f6267)
- Fix typo which slipped in during patch clean-up [`ba65a48`](https://github.com/http-party/node-http-proxy/commit/ba65a485fcf7230e85cee77f6eefcd17e46c8f86)
- Remove data event that is not needed after-all. [`b1c4bd6`](https://github.com/http-party/node-http-proxy/commit/b1c4bd61e8ae5705d4cc97bf719c381554671967)

## [v0.8.7](https://github.com/http-party/node-http-proxy/compare/v0.8.6...v0.8.7) - 2012-12-22

### Commits

- [fix] Handle errors on request object [`edfe869`](https://github.com/http-party/node-http-proxy/commit/edfe86915941e465a06c1d0a3330ee32e5834aa6)
- [dist] Bump version to 0.8.7 [`26d3646`](https://github.com/http-party/node-http-proxy/commit/26d3646ff252129f35525ab0540a31f5617a31d2)
- [fix] Don't remove `error` listener after response ends [`223eacd`](https://github.com/http-party/node-http-proxy/commit/223eacda85a4267f2860f6c46f7dedfa9db8c224)

## [v0.8.6](https://github.com/http-party/node-http-proxy/compare/v0.8.5...v0.8.6) - 2012-12-21

### Merged

- http-proxy: 304 responses should emit 'end' too [`#337`](https://github.com/http-party/node-http-proxy/pull/337)

### Commits

- [bench] Remove silly "benchmarks" [`2bd9cd9`](https://github.com/http-party/node-http-proxy/commit/2bd9cd9adb6cea6763930468d22cb56fffab6218)
- [bench] Add a benchmark for websockets throughput [`6797a27`](https://github.com/http-party/node-http-proxy/commit/6797a2705a309d19a655ab468bcc80ba2e43cf41)
- [fix] Handle socket errors [`2a61ec8`](https://github.com/http-party/node-http-proxy/commit/2a61ec85bdaeed9a5fca2a117efb36a7f76becc4)
- [dist] Update `devDependencies` [`b81d9b7`](https://github.com/http-party/node-http-proxy/commit/b81d9b71daa32a571384cff29d81227993299236)
- [dist] Bump version to 0.8.6 [`6cd78f6`](https://github.com/http-party/node-http-proxy/commit/6cd78f6af9ca08b8797c409896eea2ae6bb6d835)
- [bench] More exact size display [`7bc1a62`](https://github.com/http-party/node-http-proxy/commit/7bc1a628feab78f8931e9e6481737dd871debfeb)

## [v0.8.5](https://github.com/http-party/node-http-proxy/compare/v0.8.4...v0.8.5) - 2012-11-16

### Merged

- lib: allow overriding maxSockets [`#323`](https://github.com/http-party/node-http-proxy/pull/323)

### Fixed

- [fix] Convert strings to numbers if possible in `.createServer` [`#321`](https://github.com/http-party/node-http-proxy/issues/321)

### Commits

- [test] Delete invalid core test [`886a395`](https://github.com/http-party/node-http-proxy/commit/886a395429f20163992ca76e7b0d059256f56ba6)
- [test] Upgrade `common.js` from node core [`fefbf04`](https://github.com/http-party/node-http-proxy/commit/fefbf04ac03126858bdad07df7b10131a46e17d6)
- add "with custom server logic" to the "Proxying WebSockets" section of the readme.md [`03dbe11`](https://github.com/http-party/node-http-proxy/commit/03dbe115c2b088737e5b9abcadf91a8298f56f1f)
- [test] Kill child process when exiting test runner [`74ec175`](https://github.com/http-party/node-http-proxy/commit/74ec1757153c503ce57eb552031648fe79731d48)
- [fix] Correctly kill test processes [`b8c27ed`](https://github.com/http-party/node-http-proxy/commit/b8c27ed565e416827b7c4bb123aa9ee119d008e6)
- [test] Make global detection work with older node versions [`3531fd6`](https://github.com/http-party/node-http-proxy/commit/3531fd609a8ce156d27c27ca38ac912a73aebfeb)
- [dist] Bump version to 0.8.5 [`22639b3`](https://github.com/http-party/node-http-proxy/commit/22639b378189ec78f9962dde64337df050e29a6f)
- [test] Run core tests on `npm test` [`41c9a9c`](https://github.com/http-party/node-http-proxy/commit/41c9a9caad679221b8f1d4dcfb74f9b2bdb8270b)
- [test] Stop testing on `node v0.9`, tests timeout [`9042665`](https://github.com/http-party/node-http-proxy/commit/9042665ea98a6587e1d6800e51d3c354c0a1b20a)

## [v0.8.4](https://github.com/http-party/node-http-proxy/compare/v0.8.2...v0.8.4) - 2012-10-23

### Merged

- Events patch [`#320`](https://github.com/http-party/node-http-proxy/pull/320)
-  documentation for options [`#315`](https://github.com/http-party/node-http-proxy/pull/315)
- Added travis build status [`#308`](https://github.com/http-party/node-http-proxy/pull/308)
- Fix installation instructions: s/http/https/ [`#302`](https://github.com/http-party/node-http-proxy/pull/302)
- If supplied pass changeOrigin option through to HttpProxy instance if set in RoutingProxy [`#285`](https://github.com/http-party/node-http-proxy/pull/285)

### Commits

- [fix test] Fix examples to use newest version of socket.io and helpers. Added tests for ensuring that examples require as expected with no errors. [`fd648a5`](https://github.com/http-party/node-http-proxy/commit/fd648a529090cefc202613fff3fdfec9ba0e6a72)
- [fix] spdy should look like https when forwarding (until we get a client) [`698b01d`](https://github.com/http-party/node-http-proxy/commit/698b01da8e1fe6195b00e5006032d262a0a86f4e)
- [docs] options [`4c8e1d9`](https://github.com/http-party/node-http-proxy/commit/4c8e1d96a36523a548959415903bc669ebcc138d)
- http-proxy: emit websocket:start [`5df6e7b`](https://github.com/http-party/node-http-proxy/commit/5df6e7bdb8d4685a18e94ff1bf117ce8eff8d1c9)
- [fix] `destroy()` websockets in case of an error [`0d00b06`](https://github.com/http-party/node-http-proxy/commit/0d00b06af307dc5c70c36e89617a08486eb665e2)
- [fix] Suppress EADDRINUSE errors from `test/examples-test.js` since we are just looking for require-time errors. Isolate tests to ensure idempotency of ports [`c4a7b15`](https://github.com/http-party/node-http-proxy/commit/c4a7b1584302fe12a8fc06b6774db5ff602c3607)
- [docs] more options [`d4cb9da`](https://github.com/http-party/node-http-proxy/commit/d4cb9dad6ce36a823c9e8970e0bb3266d844e536)
- If HTTP 1.1 is used and backend doesn't return 'Connection' header, explicitly [`850171c`](https://github.com/http-party/node-http-proxy/commit/850171cdc41cb93343f7c31f650ac908a8d2dacb)
- [refactor] Pass all options to `Agent` constructor [`eafdc74`](https://github.com/http-party/node-http-proxy/commit/eafdc744b67b33b5ed3cfc80de84dafcd850bdd0)
- Fix socket leaks when FIN packet isn't responded to [`24b8406`](https://github.com/http-party/node-http-proxy/commit/24b84068eac1c704d9f8df3dc833b976850c328f)
- [fix] Partial fix for rejecting self-signed certs in tests [`2e7d8a8`](https://github.com/http-party/node-http-proxy/commit/2e7d8a88f4b470dcc9da1639fe2a69e03251036c)
- [fix] Dont use `-i` when running vows because it supresses `--target=` and `--proxy=` CLI arguments [`1783ab0`](https://github.com/http-party/node-http-proxy/commit/1783ab0625743355eecc11f5cfd57469c429daa0)
- [test] Add `node v0.9` testing, test all branches [`4f6387c`](https://github.com/http-party/node-http-proxy/commit/4f6387c17f55c23da4aac161cf2e5a4dd2a25c40)
- [minor] Remove `setEncoding` on incoming socket [`812868d`](https://github.com/http-party/node-http-proxy/commit/812868ddfc720b6c4fd26603c2fe4d5ae68f2492)
- [dist] v0.8.3 [`a89a5b8`](https://github.com/http-party/node-http-proxy/commit/a89a5b80889a56dd31634096bc6546b6b7b26da2)
- [fix] Ignore npm version errors when installing dependencies for examples [`a454666`](https://github.com/http-party/node-http-proxy/commit/a454666e7a0465ed65b7bbd29cf1b0c6c126d153)
- [fix] function [`213e03c`](https://github.com/http-party/node-http-proxy/commit/213e03c99844c5c984fbf857bae32095165a1e8f)
- [dist] Bump version to 0.8.4 [`4d7e8a8`](https://github.com/http-party/node-http-proxy/commit/4d7e8a808d83d3db1b729820aba5f481ab3d18f4)
- [minor doc] Correct comment [`cee27fe`](https://github.com/http-party/node-http-proxy/commit/cee27feeddf9b4db06917dfa9e59e6bcd7e14c27)

## [v0.8.2](https://github.com/http-party/node-http-proxy/compare/v0.8.1...v0.8.2) - 2012-07-22

### Merged

- Add example for gzip middleware using a proxy table. [`#221`](https://github.com/http-party/node-http-proxy/pull/221)
- Implement RoutingProxy.prototype.remove [`#246`](https://github.com/http-party/node-http-proxy/pull/246)
- prefer `target.hostname` over `target.host` [`#235`](https://github.com/http-party/node-http-proxy/pull/235)
- add "Using two certificiates" to the https section of the readme.md [`#275`](https://github.com/http-party/node-http-proxy/pull/275)
- Add support for setting the host in the executable [`#268`](https://github.com/http-party/node-http-proxy/pull/268)
- Hi! I fixed some calls to "sys" for you! [`#270`](https://github.com/http-party/node-http-proxy/pull/270)
- Fix bug: x-forwarded-proto set incorrectly as httphttps or wswss [`#266`](https://github.com/http-party/node-http-proxy/pull/266)

### Commits

- [refactor] Rewrite tests to use saner vows idioms. Update tests to use latest socket.io [`4ae7a5b`](https://github.com/http-party/node-http-proxy/commit/4ae7a5b84011bb5b9ec3a36ded4c5e5b3330db80)
- [dist] Remove out-dated docco docs [`2d75510`](https://github.com/http-party/node-http-proxy/commit/2d75510d827c770c30a7292c31ef0f2007da7086)
- [refactor test] Finish removing old test code. [`e2dc7f9`](https://github.com/http-party/node-http-proxy/commit/e2dc7f96937e5d565fea16c9f56b9f5d3e427de2)
- [dist] Complete JSHint compliance except for `too many var statements` [`36226da`](https://github.com/http-party/node-http-proxy/commit/36226daa2e4cbc65fae80d2d09fd64c0e7ce36ba)
- [refactor test] Add support for `http*-to-http*` testing from CLI arguments [`828dbeb`](https://github.com/http-party/node-http-proxy/commit/828dbebcaaf11e338a7727bf9d2fff8bfbd3726e)
- [fix api] Optimize lookups in the ProxyTable. Ensure that RoutingProxy can proxy to `https` by default. [`55286a7`](https://github.com/http-party/node-http-proxy/commit/55286a7c499c0fe267f75d8e8441ff89f1e65f99)
- Whitespace fixes. [`04ce49c`](https://github.com/http-party/node-http-proxy/commit/04ce49c5b289acb6ad72303e9ac70c637ea490b2)
- [refactor tests] Finished refactoring tests to support `ws*-to-ws*` tests based on CLI arguments [`7e854d7`](https://github.com/http-party/node-http-proxy/commit/7e854d778b89201f7cb933e8bbda66316b98b0b4)
- [doc] Minor formatting updates to README.md [`6753951`](https://github.com/http-party/node-http-proxy/commit/67539519faf1f32073fdb562404bd897072e24ee)
- [fix] Changed require('util') to require('util') for compatibility with node v0.8 [`bf7e328`](https://github.com/http-party/node-http-proxy/commit/bf7e328fb837de69455c42f41822b0caae2777b6)
- [test] Add .travis.yml file for Travis CI. [`29e6e74`](https://github.com/http-party/node-http-proxy/commit/29e6e748f780629d05635eebb421e8ee1d125058)
- Use changeOrigin for proxyRequest. [`0273958`](https://github.com/http-party/node-http-proxy/commit/0273958b0a5c7823c6212cb6ce6e4f801a215d3b)
- adding support for setting the host [`06e78f2`](https://github.com/http-party/node-http-proxy/commit/06e78f27475165d023fd66afbe5dd626a6a548af)
- match style requested by @cronopio [`415d4ed`](https://github.com/http-party/node-http-proxy/commit/415d4ed908e45332421d683eb45e0d6873b85ae7)
- Fix bug: x-forwarded-proto set incorrectly [`0933f1c`](https://github.com/http-party/node-http-proxy/commit/0933f1c598c1b62a75e040c3ed3ccb262612d3c9)
- [dist] Version bump. 0.8.2 [`13c34d0`](https://github.com/http-party/node-http-proxy/commit/13c34d09b2f8be14fbbe4be77c49b23066667f1b)

## [v0.8.1](https://github.com/http-party/node-http-proxy/compare/v0.8.0...v0.8.1) - 2012-06-05

### Merged

- [misc] Updating the changelog. Close #137 [`#256`](https://github.com/http-party/node-http-proxy/pull/256)
- Fix problem with req.url not being not properly replaced. [`#218`](https://github.com/http-party/node-http-proxy/pull/218)
- Re-emit 'start', 'forward' and 'end' events in RoutingProxy, and fix some hanging issues. [`#216`](https://github.com/http-party/node-http-proxy/pull/216)
- Fixes to make the websockets example work. [`#225`](https://github.com/http-party/node-http-proxy/pull/225)
- [minor] Syntax error [`#222`](https://github.com/http-party/node-http-proxy/pull/222)
- [docs] Making README links consistent with latest project structure. [`#208`](https://github.com/http-party/node-http-proxy/pull/208)
- [docs] improved grammar [`#205`](https://github.com/http-party/node-http-proxy/pull/205)
- proposed doc addition for #180 [`#189`](https://github.com/http-party/node-http-proxy/pull/189)

### Fixed

- Merge pull request #256 from nodejitsu/changelog [`#137`](https://github.com/http-party/node-http-proxy/issues/137)
- [misc] Updating the changelog. Close #137 [`#137`](https://github.com/http-party/node-http-proxy/issues/137)

### Commits

- Whitespace fixes [`e9fd3f4`](https://github.com/http-party/node-http-proxy/commit/e9fd3f43d7e890f0164b5a03a34f196dd162d043)
- Added example for gzip middleware using a ProxyTable. [`6201328`](https://github.com/http-party/node-http-proxy/commit/62013281b8a980c53a38362f10d746bfbf36c52e)
- [examples] Added simple load balancer example [`fd7fcd8`](https://github.com/http-party/node-http-proxy/commit/fd7fcd8decbf0c7ab00cab84e151991e380b8fae)
- [dist] Update author field for consistency [`27316e2`](https://github.com/http-party/node-http-proxy/commit/27316e22e8e7786252583cdb9131cfd8cacb07c1)
- Add documentation for listening for proxy events to prevent a common mistake. [`4f2bc58`](https://github.com/http-party/node-http-proxy/commit/4f2bc58431c7f44d486ee8c1ee3136b3637f9405)
- Fix RoutingProxy hanging when there is an error [`b26b434`](https://github.com/http-party/node-http-proxy/commit/b26b434e9fc501f7e0c4a966dbee6220c355bc7c)
- prefer `target.hostname` over `target.host` [`c4d185d`](https://github.com/http-party/node-http-proxy/commit/c4d185dca9696c77d5c38d24d897c2679f6762a0)
- [doc] Fix style in websockets example [`ed06af9`](https://github.com/http-party/node-http-proxy/commit/ed06af97efe406ea2533009be64a6b568f9d0601)
- Add tests for remapping URL properly. [`5d839dd`](https://github.com/http-party/node-http-proxy/commit/5d839dd5f8890c6d2af96807b96d1bd5bb0f7276)
- fixed comment typos in examples/http/proxy-https-to-http.js and proxy-https-to-https.js, lines 37 and 46 [`868f7e7`](https://github.com/http-party/node-http-proxy/commit/868f7e7a287c4709c541c077f3e2303f45b1f072)
- [misc] changelog updated to version 0.8.1 [`e9a3a30`](https://github.com/http-party/node-http-proxy/commit/e9a3a3012c5507dff46afd3e5cececf43b1717ae)
- Implement RoutingProxy.prototype.remove [`0532995`](https://github.com/http-party/node-http-proxy/commit/0532995dfa0be53d285c886a9922b8915f297d36)
- Making README links consistent with latest project structure. [`7fa6599`](https://github.com/http-party/node-http-proxy/commit/7fa6599f4f2c92bb29bc5fc8a9ba06d704652c5e)
- Address ticket #180 here since that problem is so hard to discover when you run into it. If there was an error, people would search for the error text, but there isn't. [`73e415a`](https://github.com/http-party/node-http-proxy/commit/73e415a22634bfc9e5993377902f67ac3212714a)
- [tests] used socket.io 0.6.17 fixed version for tests [`45d67f4`](https://github.com/http-party/node-http-proxy/commit/45d67f42cba373db4f47765d6a3dd38a7d19dae6)
- [fix] x-forwarded-proto sets properly [`ca37ad7`](https://github.com/http-party/node-http-proxy/commit/ca37ad74367764cca479a1af63bd7491dc79606b)
- [doc] add missing {} to make an object [`843901e`](https://github.com/http-party/node-http-proxy/commit/843901eeeb24611ad24889f13edcbfd5dee4314d)
- fix the broken english and clarified the sentence (I hope) [`e15db4f`](https://github.com/http-party/node-http-proxy/commit/e15db4fb50db3e2191f3ebd30e12eeed9c376bc2)
- Re-emit 'start', 'forward' and 'end' events in RoutingProxy. [`99ee542`](https://github.com/http-party/node-http-proxy/commit/99ee54259eae70c0c680ee82efc7dd184313f182)
- [doc] call listen() to get the server started [`4fc1ee8`](https://github.com/http-party/node-http-proxy/commit/4fc1ee85d35d9feb468f808ddd11aaf186eaedd4)
- syntax error fixed [`5842d0e`](https://github.com/http-party/node-http-proxy/commit/5842d0ee7de875378d9b8ae240748dd2af567be9)
- [dist] Version bump 0.8.1 [`81f6095`](https://github.com/http-party/node-http-proxy/commit/81f6095cf08f84a84ae2bbda7ca0315729638fe0)
- finally removed hidden char [`4358a4c`](https://github.com/http-party/node-http-proxy/commit/4358a4c1225acf8c13536fd742b845166f3a65a6)
- [minor fix] delete white space [`df650d1`](https://github.com/http-party/node-http-proxy/commit/df650d11dd0a47653a4905f871d8d3d6c327d600)

## [v0.8.0](https://github.com/http-party/node-http-proxy/compare/v0.7.3...v0.8.0) - 2011-12-23

### Merged

- Fix issue where front-end is HTTPS, back-end is HTTP, and server issues a redirect. [`#165`](https://github.com/http-party/node-http-proxy/pull/165)
- Modified the ad-hoc proxy lookup to use _getKey(), rather than the error-prone in-line method. [`#164`](https://github.com/http-party/node-http-proxy/pull/164)
- Allows node-http-proxy to append new values to existing headers for incoming "x-forward-for","x-forward-proto" and "x-forward-port" [`#163`](https://github.com/http-party/node-http-proxy/pull/163)
- [fix] only set one drain listener while paused [`#136`](https://github.com/http-party/node-http-proxy/pull/136)
- [docs] grammar correction [`#134`](https://github.com/http-party/node-http-proxy/pull/134)

### Fixed

- [fix] Avoid `Transfer-Encoding: chunked` for HTTP/1.0 client, closes #59. [`#59`](https://github.com/http-party/node-http-proxy/issues/59)

### Commits

- [refactor minor] Update vendor/websocket.js to be compatible with node@0.6.x [`ea7fea6`](https://github.com/http-party/node-http-proxy/commit/ea7fea627255ed34d39902438b55e740c7c9b08c)
- [test] Add common.js file from core [`543f214`](https://github.com/http-party/node-http-proxy/commit/543f214361605cffdbee7b233029edf343c358c1)
- [test] Add core `test-http-proxy` test [`feb324b`](https://github.com/http-party/node-http-proxy/commit/feb324b0d4c0a2307493b35be944ed08ffc9187a)
- [test] Add core `test-http` test [`25a9e2d`](https://github.com/http-party/node-http-proxy/commit/25a9e2d217cabef07d6f161f5d6ded49342dbb2f)
- [test] Add core `test-http-host-headers` test [`f298411`](https://github.com/http-party/node-http-proxy/commit/f298411f76a106791f34dd4d31ea033a7bdca9c7)
- [test] Add core `test-http-extra-response` test [`c26ab5e`](https://github.com/http-party/node-http-proxy/commit/c26ab5e46ff2649f0ea6585f20d8f58b7d0cadef)
- [test] Add core `test-http-set-cookies` test [`b3b5cce`](https://github.com/http-party/node-http-proxy/commit/b3b5cce3aee98a7fd5b50fb8e1bd6bd5e1c7512f)
- [test] Add core `test-http-client-abort` test [`7bf8d4a`](https://github.com/http-party/node-http-proxy/commit/7bf8d4a7be668591b350144b4546559abf9a0b5f)
- [test] Add core `test-http-client-upload` test [`7648fe5`](https://github.com/http-party/node-http-proxy/commit/7648fe50c1859597dc390e9e628db938372483e7)
- [test] Add core `test-http-client-upload-buf` test [`5ac9878`](https://github.com/http-party/node-http-proxy/commit/5ac987857c934d07073b853f5243d2d8fc6d8c2b)
- [test] Add core `test-http-upgrade-server2` test [`bc98c0d`](https://github.com/http-party/node-http-proxy/commit/bc98c0dbce154ef266eef83d3c2f737a2d60f0e6)
- [test] Implement basic runner for multiple tests [`a4079c6`](https://github.com/http-party/node-http-proxy/commit/a4079c6a1c8b87334d12d47d67f060cbb1214696)
- [test] Add core `test-http-upload-timeout` test [`60ff181`](https://github.com/http-party/node-http-proxy/commit/60ff181af9c22405d3822ce5955f178ab13de79d)
- [test] Add core `test-http-status-code` test [`82060a5`](https://github.com/http-party/node-http-proxy/commit/82060a53430de05f2dc95450d8487bc8139544d5)
- [test] Add core `test-http-many-keep-alive-connections` test [`4e1ca6e`](https://github.com/http-party/node-http-proxy/commit/4e1ca6e61899b11cad1b437cc9d9490b9d856665)
- [test] Add core `test-http-chunked` test [`d7461f3`](https://github.com/http-party/node-http-proxy/commit/d7461f3206cca0691fbd438545ff325589770627)
- [test] Add core `test-http-head-response-has-no-body-end` test [`13389db`](https://github.com/http-party/node-http-proxy/commit/13389db1bef38a7fc7ddc3ada479a608f033020c)
- [test] Add core `test-http-server-multiheaders` test [`d7f15d0`](https://github.com/http-party/node-http-proxy/commit/d7f15d02f7477c76529fc76daddee5029079eb2d)
- [test] Add core `test-http-multi-line-headers` test [`35d2088`](https://github.com/http-party/node-http-proxy/commit/35d2088c96bacb44b17755176b6e9451ed0299dd)
- [test] Add core `test-http-head-response-has-no-body` test [`f79f3ad`](https://github.com/http-party/node-http-proxy/commit/f79f3adf0295ec5bb7fb9f6525b48ba5209d04c6)
- [refactor] Improved event handler cleanup  [`9f92332`](https://github.com/http-party/node-http-proxy/commit/9f923325d08ac018a3325beaa9e0805b5eda61e6)
- [fix minor] Correctly set x-forwarded-proto in WebSocket requests [`c81bae2`](https://github.com/http-party/node-http-proxy/commit/c81bae2fdde3bf0087fe71a39855c61c43ffb145)
- Revert "[refactor] Improved event handler cleanup " [`c83d88e`](https://github.com/http-party/node-http-proxy/commit/c83d88ee88faac10b53cd4296165ed85f26036b4)
- Allowing the common proxy headers' value to be appended in proxy chain scenarios. [`621f9b4`](https://github.com/http-party/node-http-proxy/commit/621f9b425a272421de98a674f1679f0c47912733)
- [test] Add basic test runner [`87999d0`](https://github.com/http-party/node-http-proxy/commit/87999d028880dfccca349c9c44f9e66a613c4d38)
- [examples] Add some hand-crafted middleware [`6e65c20`](https://github.com/http-party/node-http-proxy/commit/6e65c20017a2e1a87dc6d58e847bc6db16440f3c)
- [test] Add core `test-http-malformed-request` test [`a635389`](https://github.com/http-party/node-http-proxy/commit/a6353897cdbe8c380d52a060f5e66784f67ad98e)
- [example] Response modification middleware [`dd83199`](https://github.com/http-party/node-http-proxy/commit/dd8319972c1c2f9421a90a21dce9560fd5ca199f)
- [test] Add core `test-http-head-request` test [`c0857f2`](https://github.com/http-party/node-http-proxy/commit/c0857f2d59c33d91cb3e0c131c44ec1667f592fa)
- [test] Add core `test-http-response-close` test [`f1c0be3`](https://github.com/http-party/node-http-proxy/commit/f1c0be3f0bd2c5e87d44a37ba4f29aafd9903ad4)
- [refactor] core proxy logic. all tests should be passing. [`63ac925`](https://github.com/http-party/node-http-proxy/commit/63ac9252606d23e2003696da1fb34a539abee7ca)
- [test] Add core `test-http-contentLength0` test [`275109b`](https://github.com/http-party/node-http-proxy/commit/275109b2f8c8519c56ca9f456096d4002698fab1)
- [test] Add core `test-http-client-abort2` test [`98bbe54`](https://github.com/http-party/node-http-proxy/commit/98bbe541e4fa581f1b9e2eadb821c0609da6ab81)
- adding tests for url segment proxytable routing [`91e9bb9`](https://github.com/http-party/node-http-proxy/commit/91e9bb90709cc8a361066d6f6b8f51f58bfd7e36)
- [test] Add core `test-http-eof-on-connect` test [`80c216d`](https://github.com/http-party/node-http-proxy/commit/80c216df0cc59b88c6934f795c03ea16a737af34)
- [example] Replace `sys` usages with `util` [`8d701bb`](https://github.com/http-party/node-http-proxy/commit/8d701bb20b593c6cdf0ff1bc35cf83051b21a35e)
- [refactor] Updates to support http2 from @mikeal [`5b52c89`](https://github.com/http-party/node-http-proxy/commit/5b52c896947db42ac01e6038c9170d8859d33aea)
- [refactor] Listen for `socket` events since reverseProxy.socket is no longer set synchronously [`3828616`](https://github.com/http-party/node-http-proxy/commit/38286168161d4f4ad24d2ad95ccd8335e9ed08a4)
- [test] Run tests in `test/core/simple` by default [`68cebbe`](https://github.com/http-party/node-http-proxy/commit/68cebbe0e79ea283eea8a1ca850ab462c66c611a)
- simplify proxytable path segment rewrite logic [`c03a450`](https://github.com/http-party/node-http-proxy/commit/c03a450d9b952e1463ae2609303029e317ff5da2)
- change proxytable routing to route one level shallower [`4d50915`](https://github.com/http-party/node-http-proxy/commit/4d50915373b6afaafc7857a3e9366e8e77315683)
- [docs] Little explanation for test/core directory [`8ca5d83`](https://github.com/http-party/node-http-proxy/commit/8ca5d83497cc106a2456ff7f2ebe3db5c8634d69)
- [minor] Allow user to set `colors.mode` [`48d4a8b`](https://github.com/http-party/node-http-proxy/commit/48d4a8b263faa9acda06651bceeff50881f21b26)
- [minor] Indentation fix [`9e630da`](https://github.com/http-party/node-http-proxy/commit/9e630daf81d10485206ec136c3e1a07fe065ffeb)
- [v0.6] `http.Agent` uses different structure for sockets [`86b4122`](https://github.com/http-party/node-http-proxy/commit/86b4122323ca32d455714b1149b99acce49a9e45)
- [minor] Nicer output from test runner [`5c3d41b`](https://github.com/http-party/node-http-proxy/commit/5c3d41bf4e101d0250fb0b3db4a8dc078104dcad)
- Modified the ad-hoc proxy lookup to use _getKey(), rather than the [`553e7fb`](https://github.com/http-party/node-http-proxy/commit/553e7fbc335a9befd166d472f057aa50452a9d40)
- [fix] When client request is aborted, abort server request [`4d43d81`](https://github.com/http-party/node-http-proxy/commit/4d43d81e5c2d7c8088716d4fd574019f43ebb5ce)
- Fixes memory leak when clients abort connections [`c98ccb4`](https://github.com/http-party/node-http-proxy/commit/c98ccb40e9fe5c5198a1605fa8835efc3ff1856c)
- [fix test] Make test runner exit after test exits [`31a8c68`](https://github.com/http-party/node-http-proxy/commit/31a8c6800ddf8d91b477d980605a4c19284a1648)
- [test dist] Run core tests on `npm test` [`8358ef8`](https://github.com/http-party/node-http-proxy/commit/8358ef8a2bdf817c8ed515be7bc9cec0a9b5f486)
- don't add upgrade handler if a custom handler is passed in [`d6ea3a4`](https://github.com/http-party/node-http-proxy/commit/d6ea3a425c203695394eaba4ce8abd57f7809e98)
- always emit end in 0.4 [`182dcd3`](https://github.com/http-party/node-http-proxy/commit/182dcd34555f361c1bb2b8d2777689e64ce32f87)
- [fix] Fix incorrect depth check. [`3ab02f3`](https://github.com/http-party/node-http-proxy/commit/3ab02f3ad7f2c59d73c621695eb238233c16d09c)
- [minor] Everybody loves Unicode [`38bd906`](https://github.com/http-party/node-http-proxy/commit/38bd906f2bc9322b156b92c47457bb7904f0d23a)
- [test minor] Update copyright notice on test runner [`2ccc5c7`](https://github.com/http-party/node-http-proxy/commit/2ccc5c73eaef30ab5a2af7e456bfcc270583c460)
- [minor] When running tests output only basename [`e109eba`](https://github.com/http-party/node-http-proxy/commit/e109eba9724494737021579938c1094c9dfbc8ee)
- [dist] Version bump. 0.8.0 [`5055689`](https://github.com/http-party/node-http-proxy/commit/5055689a11f3b990f848bf2699e0111d9e708d5f)
- Revert "[dist] Adjusted engines field to allow for 0.6; version bump 0.7.7" [`1e33434`](https://github.com/http-party/node-http-proxy/commit/1e33434fcc4772c233825b5aada7472113c0be50)
- changeOrigin option: set the host header to the proxy destination [`f27d26f`](https://github.com/http-party/node-http-proxy/commit/f27d26f4515c900ea4cf1756ef279257a189e308)
- [dist] Adjusted engines field to allow for 0.6; version bump 0.7.7 [`30dac89`](https://github.com/http-party/node-http-proxy/commit/30dac898f30a8508b4c4b4236e9438987f320167)
- [fix] In routing proxy, match line beginning [`63dfc7f`](https://github.com/http-party/node-http-proxy/commit/63dfc7f1757fc9a1a9bceeb3b035e97be6504692)
- [v0.6] Don't use `agent.appendMessage()` [`6655e01`](https://github.com/http-party/node-http-proxy/commit/6655e0164216449a97090651230266da8ced0150)
- bump version 0.7.4 [`3dfba2b`](https://github.com/http-party/node-http-proxy/commit/3dfba2ba4591e0fcd65ff0bfd012b3ab749a0a02)
- bump version 0.7.6 [`c5dc929`](https://github.com/http-party/node-http-proxy/commit/c5dc9295c711177c165bfb34c67407e1a5a0ed06)
- Revert "update outgoing.headers.host incase the destination does proxying" [`2061c71`](https://github.com/http-party/node-http-proxy/commit/2061c713664b044852fdf67aa5e173e5c3b6d874)
- update outgoing.headers.host incase the destination does proxying [`65b7872`](https://github.com/http-party/node-http-proxy/commit/65b7872e6ad433deae4de823c63629cb341bd649)
- bump version 0.7.5 [`b4d41c3`](https://github.com/http-party/node-http-proxy/commit/b4d41c3628ade82792eb361b095ab014a88d537a)
- [minor] Fix indent on timeout notice [`c4124da`](https://github.com/http-party/node-http-proxy/commit/c4124da4f25860497790fc06c97dde6e8985ab73)
- [minor] Change test runner output order [`b76680b`](https://github.com/http-party/node-http-proxy/commit/b76680b045f69e03759bc119f4827f337a8f395d)
- grammar correction [`729496d`](https://github.com/http-party/node-http-proxy/commit/729496d2898612969f5369e7f1c313cb4034f96c)
- [dist] Test runner depends on `async` [`219b0ff`](https://github.com/http-party/node-http-proxy/commit/219b0ff8f8780cde4714267273b0a1637c84679f)
- [test fix] Remove unnecessary console.log in tests/websocket/websocket-proxy-test.js [`f188f4f`](https://github.com/http-party/node-http-proxy/commit/f188f4ffd8c47b6312cd88c28de7e5ac63565047)
- [test refactor] `test/core/{run =&gt; run-single}` [`004be38`](https://github.com/http-party/node-http-proxy/commit/004be38048792d6f1d3efb361a5e7e66d5dbee8d)

## [v0.7.3](https://github.com/http-party/node-http-proxy/compare/v0.7.2...v0.7.3) - 2011-10-03

### Commits

- added what is necessary for having proxyError on Routing proxywq [`b7adf86`](https://github.com/http-party/node-http-proxy/commit/b7adf866b595f0d64a3ef6bde19271276450e723)
- [dist] Version bump. 0.7.3 [`db185bb`](https://github.com/http-party/node-http-proxy/commit/db185bb303ce9c413b2abccbc885f8ec43b61202)

## [v0.7.2](https://github.com/http-party/node-http-proxy/compare/v0.7.1...v0.7.2) - 2011-09-30

### Merged

- [fix] Examples have working require paths now. [`#118`](https://github.com/http-party/node-http-proxy/pull/118)

### Commits

- [fix] Fixed require paths in examples [`2e8d4c6`](https://github.com/http-party/node-http-proxy/commit/2e8d4c6e49e2e9b27443c0b9ae2b96331715402b)
- [websockets] add latest websockets support [`45ef87e`](https://github.com/http-party/node-http-proxy/commit/45ef87e71bc9cccefe5fb6afc3121fb09b8efbc3)
- [dist] Version bump. 0.7.2 [`ccccc45`](https://github.com/http-party/node-http-proxy/commit/ccccc45f11fbe535017b1806fad43578f143649d)

## [v0.7.1](https://github.com/http-party/node-http-proxy/compare/v0.7.0...v0.7.1) - 2011-09-21

### Merged

- Readme fixes [`#114`](https://github.com/http-party/node-http-proxy/pull/114)
- #107: Set x-forwarded-for header (amongst others) [`#110`](https://github.com/http-party/node-http-proxy/pull/110)
- command line tool - make sure targetPort is an integer [`#109`](https://github.com/http-party/node-http-proxy/pull/109)

### Fixed

- [dist] Version bump v0.7.1, closes #107 #112 [`#107`](https://github.com/http-party/node-http-proxy/issues/107)

### Commits

- [test] Added a test for the "x-forwarded-for" header [`66e9820`](https://github.com/http-party/node-http-proxy/commit/66e982060c6c41ad7dfadce1403c8e13d267781a)
- [docs] Updated examples in README.md for 0.7.x API. [`24ef919`](https://github.com/http-party/node-http-proxy/commit/24ef9194953c27fb11a8f1ceb499e5feca11c30c)
- [examples] Updated examples to v0.7.x API. [`8fc8d96`](https://github.com/http-party/node-http-proxy/commit/8fc8d966c4681d514af00516b348105608e13382)
- [examples] More fixes to examples. [`549360a`](https://github.com/http-party/node-http-proxy/commit/549360a462c134cc2b02301070209084ec94c393)
- [fix] x-forwarded http headers should set properly. [`2677bb6`](https://github.com/http-party/node-http-proxy/commit/2677bb6c44244ea0b584db744955bedf7aee2c62)
- [fix] connection.socket -&gt; socket for source of x-forwarded-for data [`1f33943`](https://github.com/http-party/node-http-proxy/commit/1f33943b231cdf2cb619977801c7b0d4e98ab6df)
- Make sure the target port is an integer [`5ba25aa`](https://github.com/http-party/node-http-proxy/commit/5ba25aa3451f131b6c6c8892848a4f236f5b859e)

## [v0.7.0](https://github.com/http-party/node-http-proxy/compare/v0.6.6...v0.7.0) - 2011-09-10

### Fixed

- [fix] Add `x-forward-*` headers for WebSocket requests. Closes #74 [`#74`](https://github.com/http-party/node-http-proxy/issues/74)
- [doc] Document `setMaxSockets`. Fixes #81 [`#81`](https://github.com/http-party/node-http-proxy/issues/81)

### Commits

- [api test dist] Stubbed out the API for the higher-level `RoutingProxy` object to be exposed by `node-http-proxy` [`5927ecd`](https://github.com/http-party/node-http-proxy/commit/5927ecd62a082269c3b6a0ae4f5b4a673784bcdb)
- [api] Finalized the RoutingProxy API [`f765f90`](https://github.com/http-party/node-http-proxy/commit/f765f90ec37defaa2b493f859a982add51e25b76)
- [minor] Move private methods to the bottom of file(s) [`ec03d72`](https://github.com/http-party/node-http-proxy/commit/ec03d72c5d8749aee835f571869f69816be02265)
- [test] Updated tests to reflect finalized API of the RoutingProxy [`734769f`](https://github.com/http-party/node-http-proxy/commit/734769fa9b2c3054d45e33c3e552af80ce3f4740)
- [api doc] Rebuilt httpProxy.createServer() with the newer high-level RoutingProxy API [`598fe2e`](https://github.com/http-party/node-http-proxy/commit/598fe2e38def56518a1f0a8196b2fcb7f1bc569e)
- [minor] Remove commented out debug statements. [`5575bcf`](https://github.com/http-party/node-http-proxy/commit/5575bcf60c87def74d1755b2e5cc73e085dbf8c3)
- [doc] Updated examples [`13eaec5`](https://github.com/http-party/node-http-proxy/commit/13eaec55dc50e2aae164cb8adaa0f1a3c5a66c68)
- Add flow control [`6a7fd14`](https://github.com/http-party/node-http-proxy/commit/6a7fd14bfa9f25694d75cf490e32817ff15a94fe)
- Add flow control [`2b9e09b`](https://github.com/http-party/node-http-proxy/commit/2b9e09b00ac40e6c6de2b68754df7b8e8c1e3878)
- Emit drain if it doesn't happen on its own in 100ms [`37e2541`](https://github.com/http-party/node-http-proxy/commit/37e25418916a31e4a513ee5866d6013858d579cf)
- resume() can throw [`558a8a4`](https://github.com/http-party/node-http-proxy/commit/558a8a4f79716496dbdee13759c8641606458c05)
- [fix] Memory leak hunting. [`ca1d12c`](https://github.com/http-party/node-http-proxy/commit/ca1d12cf1bbfbe98b5159f9c02e2f6c818a1c749)
- Emit drain if it doesn't happen on its own in 100ms [`84be9f2`](https://github.com/http-party/node-http-proxy/commit/84be9f2c3a244c7dbfe2c6320fa26d85cf80ec31)
- resume() can throw [`0c71119`](https://github.com/http-party/node-http-proxy/commit/0c71119ee58ee84068120be72308ecb28cb3e532)
- [dist] Update examples/package.json to conform to nodejitsu style guidelines [`2937229`](https://github.com/http-party/node-http-proxy/commit/29372298208135f571538cc29dcc05f41f79b01c)
- Fixed large DoS vector in the middleware implementation [`0e36912`](https://github.com/http-party/node-http-proxy/commit/0e36912906640fdb007e0492b75c3f6a7b580ec6)
- [api] Added new `close()` method which cleans up sockets from HttpProxy instances [`0eae2a9`](https://github.com/http-party/node-http-proxy/commit/0eae2a913a2173d85478f8c9deec929388284ee2)
- Fixed large DoS vector in the middleware implementation [`07c8d2e`](https://github.com/http-party/node-http-proxy/commit/07c8d2ee6017264c3d4deac9f42ca264a3740b48)
- [minor] More contextual errors when middleware(s) error [`38315f6`](https://github.com/http-party/node-http-proxy/commit/38315f6b1f7b01bc6e55587878a57590135945c0)
- [dist] Update scripts in package.json [`6e1ade0`](https://github.com/http-party/node-http-proxy/commit/6e1ade0bb8174b744abb58df72b098bd96134ca4)
- [dist] Version bump. 0.7.0 [`0182ba3`](https://github.com/http-party/node-http-proxy/commit/0182ba37cd4c618cd50947ea2addef823349e49f)
- [merge] Merge from significant internal refactor in v0.7.x. No external API changes [`f7010e5`](https://github.com/http-party/node-http-proxy/commit/f7010e5169ac23114b9b35da272e9a041743fbb9)
- [minor] Small update to bin/node-http-proxy [`2cd8256`](https://github.com/http-party/node-http-proxy/commit/2cd8256c4d6089409f603655ea3b3a5ccf1fb065)
- [dist] Update .gitignore [`6c1c554`](https://github.com/http-party/node-http-proxy/commit/6c1c5544515bf17f0e6ed3588e16ae1a75f8a25b)
- [doc] Update README.md [`0ba5023`](https://github.com/http-party/node-http-proxy/commit/0ba5023e82fe8a08ed55194644d147c323368f41)
- [doc] Drop version number from README.md. [`bdf48be`](https://github.com/http-party/node-http-proxy/commit/bdf48bea36eae441c775e9321ab6e17db470bf27)
- [dist] Version bump. 0.7.0 [`00e34a1`](https://github.com/http-party/node-http-proxy/commit/00e34a10bd9ffca9e636b2e5aebb4f18ff6765ec)
- [test] Whitespace fix [`3a4d312`](https://github.com/http-party/node-http-proxy/commit/3a4d312eda08e7a5cecb3c82b04023e22f368e2b)
- [dist] Reorganize examples based on classification(s): http, websocket, or middleware [`81d6c31`](https://github.com/http-party/node-http-proxy/commit/81d6c318758231f77a52fab7de174fcc63b7a243)

## [v0.6.6](https://github.com/http-party/node-http-proxy/compare/v0.6.5...v0.6.6) - 2011-08-31

### Commits

- Memory leak hunting. [`f4fcf93`](https://github.com/http-party/node-http-proxy/commit/f4fcf934030e84c15cceca620e974aafc35f1691)
- [fix] Add guards to every throw-able res.end call [`e1c41d0`](https://github.com/http-party/node-http-proxy/commit/e1c41d06942b56f6cd65a079ae78b54456a8bbe1)
- [fix] Only set `x-forward-*` headers if req.connection and req.connection.socket [`de4a6fe`](https://github.com/http-party/node-http-proxy/commit/de4a6fe8a5f78460b030e635e5f4a63312cd4a76)
- [dist] Version bump. 0.6.6 [`967884c`](https://github.com/http-party/node-http-proxy/commit/967884c5de311f21b8405a5030730ef8db912531)

## [v0.6.5](https://github.com/http-party/node-http-proxy/compare/v0.6.4...v0.6.5) - 2011-08-29

### Commits

- [fix] Use `req.connection` for all x-forward-* headers [`f6dc12a`](https://github.com/http-party/node-http-proxy/commit/f6dc12a971fdd892614b32d2a4fb2ff39ddc0e67)
- [dist] Version bump. 0.6.5 [`7beead5`](https://github.com/http-party/node-http-proxy/commit/7beead54654bdc7f9ab4ed0c17000118a3e7b4fc)

## [v0.6.4](https://github.com/http-party/node-http-proxy/compare/v0.6.3...v0.6.4) - 2011-08-28

### Fixed

- Fix #95 Don't look on req.connection if it's not set. [`#95`](https://github.com/http-party/node-http-proxy/issues/95)

### Commits

- [api breaking] Begin refactor to optimize node-http-proxy by managing one instance of HttpProxy per `host:port` location [`d2b0e43`](https://github.com/http-party/node-http-proxy/commit/d2b0e4399e8026d3e2ece78ac8fdb1def6649950)
- [api test] Updated httpProxy.createServer() for new API exposed by simplified HttpProxy object. [`be4562d`](https://github.com/http-party/node-http-proxy/commit/be4562da9fafef8b26856f7f73f6c5a2c4e389b0)
- [test fix] A few minor fixes to ensure basic WebSocket tests are working. Better scope tests by supported protocol [`daf9231`](https://github.com/http-party/node-http-proxy/commit/daf9231a66f10a25782d2227df1b1501099ac5d1)
- [test] Updates for readability [`db10c4a`](https://github.com/http-party/node-http-proxy/commit/db10c4af918c3e4bc448163f4b9e9b9267145d47)
- Add guards to every throw-able res.end call [`7bda25b`](https://github.com/http-party/node-http-proxy/commit/7bda25b1c60d082f0f2fd12fc61b45a33b74f13d)
- [minor] Dont use `.bind()` [`340be42`](https://github.com/http-party/node-http-proxy/commit/340be42797e87fcc11859a771200075e7fe0c5f1)
- [dist] Version bump. 0.6.4 [`216d46d`](https://github.com/http-party/node-http-proxy/commit/216d46dc81bda1aeb0feb1318e34f37bee38c8fb)

## [v0.6.3](https://github.com/http-party/node-http-proxy/compare/v0.5.11...v0.6.3) - 2011-08-28

### Merged

- This adds a flag to ProxyRequest to disable the setting of x-forwarded-[for|port|proto] [`#73`](https://github.com/http-party/node-http-proxy/pull/73)

### Fixed

- Merge branch 'patch-1' of https://github.com/KimSchneider/node-http-proxy [`#80`](https://github.com/http-party/node-http-proxy/issues/80)

### Commits

- [minor] Style updates and whitespace cleaning for consistency [`f0917a3`](https://github.com/http-party/node-http-proxy/commit/f0917a3f97e8df2d58252f14c15ec54369c969ae)
- [api] refactor out middlewares from examples. [`2cf4e0a`](https://github.com/http-party/node-http-proxy/commit/2cf4e0a9e6c78dfd093c098fc87100ae71bc9450)
- [docs] add middleware examples (first draft) [`020290a`](https://github.com/http-party/node-http-proxy/commit/020290a162146c4996831f4f13d71c1dc949f508)
- [fix] use routing table mhen proxying WebSockets. [`efa17ef`](https://github.com/http-party/node-http-proxy/commit/efa17ef6cf614b763fc3b76570a24e750e2ddd31)
- Tested & fixed url middleware example, added comments. [`4cc18f4`](https://github.com/http-party/node-http-proxy/commit/4cc18f4217739b0bd1b3ac88287cc8a23d486b6b)
- [minor] add middleware to node-http-proxy [`b54666f`](https://github.com/http-party/node-http-proxy/commit/b54666ff69c574d842ce1349700c6b6248484d24)
- [minor] add middleware to node-http-proxy [`c773eed`](https://github.com/http-party/node-http-proxy/commit/c773eedeb6d0b22e2b41ab9215cfdc064a8095e3)
- [minor] add url-proxying middleware example [`45f3df8`](https://github.com/http-party/node-http-proxy/commit/45f3df80937ffd5854727c91ea6b0e09cf77e160)
- [fix] Removed bad example. [`2626308`](https://github.com/http-party/node-http-proxy/commit/2626308cd845982c82a284b0d0bc064090aaf116)
- [minor] add example to test concurrency [`6ec8d6c`](https://github.com/http-party/node-http-proxy/commit/6ec8d6caace3797841c0447feb081aa7920aa0dd)
- [minor] add example of using middleware to gzip response [`d3c0697`](https://github.com/http-party/node-http-proxy/commit/d3c06973a1bf1f1c54ca55a5d7f93b77133ef9a2)
- support old (port,host) and (options) style when using middlewares [`7976de1`](https://github.com/http-party/node-http-proxy/commit/7976de1121a40f963e18ea0a4673d185f847df4c)
- [minor] Added body decoder middleware example.  Needs fixing. [`8eaec35`](https://github.com/http-party/node-http-proxy/commit/8eaec3507456731c1138c0b8ebb4e51dedc7c300)
- [minor dist] Use `pkginfo`. Minor updates to variable scoping in `.createServer()` [`5d0bbb3`](https://github.com/http-party/node-http-proxy/commit/5d0bbb38c3af14907567e2dc7c4f84a915b60ce5)
- [doc] add comments to examples/url-middleware.js [`f6484de`](https://github.com/http-party/node-http-proxy/commit/f6484de4112463c74105db82d27f131d64478f1d)
- Handle cases where res.write throws [`be3a0d8`](https://github.com/http-party/node-http-proxy/commit/be3a0d84a1e75b45bc1fc63fe63cdabd9844eb59)
- [minor] code style changes [`8b48b7e`](https://github.com/http-party/node-http-proxy/commit/8b48b7e0af656fdbd6da2b16ec6365beec47c302)
- [doc] note in readme about middleware [`b5d5eaa`](https://github.com/http-party/node-http-proxy/commit/b5d5eaababa276f7d197e4b6a8a771b364b73139)
- Allow forwarding for x-forwarded-[for|port|proto] to enabled layering of http-proxies. [`404818b`](https://github.com/http-party/node-http-proxy/commit/404818b1dce9e77a917ce9f0c187772eb8c18042)
- [style] tidy [`0f8fe8e`](https://github.com/http-party/node-http-proxy/commit/0f8fe8e2460fd27edfba44989b78aa6b8c9a38e2)
- [fix] do not use middleware code if it's not needed [`2012588`](https://github.com/http-party/node-http-proxy/commit/20125889b362c61c85924810de446e1e7b18d079)
- [minor] minor fixes to gzip middleware example [`caa1f49`](https://github.com/http-party/node-http-proxy/commit/caa1f494ab4effabad6d08272c3606c1d82005ea)
- [minor] default enableXForwarded to true [`e3d95ec`](https://github.com/http-party/node-http-proxy/commit/e3d95ecab24700535184df32f3a97e8699099b7f)
- Updating to enableXForwarded [`ee3506a`](https://github.com/http-party/node-http-proxy/commit/ee3506a8e7262f780eeada331898d42ca0e9838a)
- [api] Expose adapted version of `stack` so it can be used with HttpProxy instances not created by `httpProxy.createServer()` [`5d6e6b9`](https://github.com/http-party/node-http-proxy/commit/5d6e6b9f78eb98b28db01490a36b23c1aade133f)
- The number of maxSockets has to be set after the agent is created. Setting the property in the constructor does not work. [`2caa5d2`](https://github.com/http-party/node-http-proxy/commit/2caa5d2b0d55898c133a0bf3a0048ee969efb121)
- [fix] Dont use res.* in proxyWebSocketRequest [`f7452bc`](https://github.com/http-party/node-http-proxy/commit/f7452bc42d963406f7ee19dfa353d72ce3252dd6)
- [fix] fix syntax errors. close issue #86 [`b8f8499`](https://github.com/http-party/node-http-proxy/commit/b8f84994b0515e12c9d87f89f81a8601be47a6ff)
- [api] merge middleware branch [`e6ff8d6`](https://github.com/http-party/node-http-proxy/commit/e6ff8d6597a977baf0caf4f69c75bfa93d7281f3)
- [dist] Version bump. 0.6.3 [`1389b70`](https://github.com/http-party/node-http-proxy/commit/1389b706b5c1d857c571c2947b7c758b5cc70ca3)
- merged [`5ba0f89`](https://github.com/http-party/node-http-proxy/commit/5ba0f89aa356b2e76f5cf64c16e8578d71c45d8a)
- [fix] handler variable in createServer was global (!)  [`25c06a3`](https://github.com/http-party/node-http-proxy/commit/25c06a3a952068de6a24c643cb0c872f7b9a0846)
- [dist] bump version 6.0 [`03475a5`](https://github.com/http-party/node-http-proxy/commit/03475a59445a1c1c1029d0673aafabe63af1e711)
- [dist] bump version 0.6.2 [`d8068a8`](https://github.com/http-party/node-http-proxy/commit/d8068a832d437790ce8680b9b34a9f171d75786c)
- [dist] bump version 5.12 [`5d33ad7`](https://github.com/http-party/node-http-proxy/commit/5d33ad711895b2afcbd6dd5e1c0449cee1ceae7b)
- [dist] bump version 0.6.1 [`fea371d`](https://github.com/http-party/node-http-proxy/commit/fea371dc0a47dfb4f84427e5740e8756f4e5b285)
- [fix] broken RegExp [`549bfea`](https://github.com/http-party/node-http-proxy/commit/549bfeac233888ec84edeec350ed5a7377f3773e)
- [doc] add note on middleware to Using node-http-proxy section of the README [`5bf2d59`](https://github.com/http-party/node-http-proxy/commit/5bf2d59241a7695f43bb89e5cb41ade2ab7a0ad2)

## [v0.5.11](https://github.com/http-party/node-http-proxy/compare/v0.5.10...v0.5.11) - 2011-06-26

### Fixed

- [api] Simplify the usage for the `.changeHeaders` option. Fixes #34 [`#34`](https://github.com/http-party/node-http-proxy/issues/34)

### Commits

- [api doc test] node-http-proxy now emits `websocket:*` on important WebSocket events. Added tests for these features and updated some code docs [`4f85ca0`](https://github.com/http-party/node-http-proxy/commit/4f85ca04e425a7d4df1e46c9cadd6026eeed32f6)
- [doc] Updated docco docs [`f0649d8`](https://github.com/http-party/node-http-proxy/commit/f0649d8d6a9f84ac61d5f173c585fa4307ffb3c3)
- [doc] Added examples/latent-websocket-proxy.js [`fcfe846`](https://github.com/http-party/node-http-proxy/commit/fcfe84626fff15be21ac83ccd69b96bf3ca1f7a2)
- [doc] Added sample for custom error messages using the `proxyError` event [`4cdbf0e`](https://github.com/http-party/node-http-proxy/commit/4cdbf0e8729a0665904b577376240c00e56ad876)
- [doc] Add examples/standalone-websocket-proxy.js [`1ee8ae7`](https://github.com/http-party/node-http-proxy/commit/1ee8ae710497e239716f72d45e2f61ead3995dc3)
- [dist] Version bump. 0.5.11 [`baf0b9e`](https://github.com/http-party/node-http-proxy/commit/baf0b9e25af53e2738812ff78614cc12966e99e3)
- [doc] Small update to code docs [`9d9509f`](https://github.com/http-party/node-http-proxy/commit/9d9509f791c4c566629c2e323259885f1c3db7ed)
- [minor] Add missing space [`b608a02`](https://github.com/http-party/node-http-proxy/commit/b608a029f8aa26f1a74a917e0bec0ac37e4615a0)

## [v0.5.10](https://github.com/http-party/node-http-proxy/compare/v0.5.9...v0.5.10) - 2011-06-13

### Commits

- [refactor] Manage our own internal list of Agent instances [`887c580`](https://github.com/http-party/node-http-proxy/commit/887c5808c90b7128c040e510e237ddb4d034fe3e)
- [doc] Update docco docs for 0.5.9 [`b4ac4d4`](https://github.com/http-party/node-http-proxy/commit/b4ac4d441fe4fb84d463bd889a5ce8d7f4d596ca)
- [test] Update tests to use `localhost` [`a1cdf00`](https://github.com/http-party/node-http-proxy/commit/a1cdf005b98c422c777c88a7d7baf2eeb91f732d)
- [dist] Version bump. 0.5.10 [`7b574d3`](https://github.com/http-party/node-http-proxy/commit/7b574d3d3e52b09a6445c011b8f2ae0d78282111)
- [doc] Bump version in README.md [`653c6ca`](https://github.com/http-party/node-http-proxy/commit/653c6ca1af607623b653d3148b1bb45a304aab87)

## [v0.5.9](https://github.com/http-party/node-http-proxy/compare/v0.5.8...v0.5.9) - 2011-05-23

### Commits

- [fix] Change sec-websocket-location header when proxying WSS --&gt; WS. Added test coverage for this scenario [`028d204`](https://github.com/http-party/node-http-proxy/commit/028d2044e71d70b7bc21d339de29e2275c3be5c2)
- [dist] Version bump. 0.5.9 [`57ca62c`](https://github.com/http-party/node-http-proxy/commit/57ca62c878c9a953f2344719556e05492ece3435)

## [v0.5.8](https://github.com/http-party/node-http-proxy/compare/v0.5.7...v0.5.8) - 2011-05-21

### Commits

- [doc] Regenerate docco docs [`c5fd368`](https://github.com/http-party/node-http-proxy/commit/c5fd368a8d803b6ab47e32e744a6fd6a6ca5361f)
- [doc] Update docco docs [`74120d8`](https://github.com/http-party/node-http-proxy/commit/74120d8988627bb0686d3a26cb8ec1408cc41287)
- [doc] Update to v0.5.7 in code and README.md [`6fd272a`](https://github.com/http-party/node-http-proxy/commit/6fd272ac18240811d8a8a39c85ee483557c414b3)
- [dist] Version bump. 0.5.8. Forwards compatible with new versions of nodejs [`76ecb51`](https://github.com/http-party/node-http-proxy/commit/76ecb51e7b41a23288f922c9c5df3ce40f67bf80)
- [fix] Dont force `Connection: close` now that Keep-Alive is supported [`a86d18b`](https://github.com/http-party/node-http-proxy/commit/a86d18bc7f93d013df715d1f4d88e651846f645d)
- [test] Update to vows description for web-socket-proxy-test.js [`a865fe6`](https://github.com/http-party/node-http-proxy/commit/a865fe662ff04a4badcc90ce2af80d2380c40a85)

## [v0.5.7](https://github.com/http-party/node-http-proxy/compare/v0.5.6...v0.5.7) - 2011-05-19

### Commits

- [api] Add `x-forwarded-proto` and `x-forwarded-port` to proxied HTTP requests [`421895f`](https://github.com/http-party/node-http-proxy/commit/421895fa308d49628bbbb546d542efa96769c3f4)
- [dist] Version bump. v0.5.7. Only good on node v0.4.7. See issue #48. [`0911c17`](https://github.com/http-party/node-http-proxy/commit/0911c1719e641c6e4342027e8d5d82c47c6f310e)
- [fix] Set `x-forwarded-for` from req.connection.socket.remoteAddress if req.connection.remoteAddress is not defined [`e9b3ec9`](https://github.com/http-party/node-http-proxy/commit/e9b3ec9b1d0ebf427e138176b28af44f0f973670)

## [v0.5.6](https://github.com/http-party/node-http-proxy/compare/v0.5.5...v0.5.6) - 2011-05-19

### Commits

- [fix doc] Add `error` handler to reverseProxy request when proxying WebSockets to prevent unhandled ParseError. Rename some variables in proxyWebSocketRequest to make the code more readable [`76580c2`](https://github.com/http-party/node-http-proxy/commit/76580c292a152c0007352a9d383f59e48993cd03)
- [doc] Regenerate docco docs [`bd45216`](https://github.com/http-party/node-http-proxy/commit/bd45216bc9207e5016f394a4bfee2bdffcc669c7)
- [api minor] Small refactor to emit `webSocketProxyError` from a single helper function on any of the various `error` events in the proxy chain [`5d2192e`](https://github.com/http-party/node-http-proxy/commit/5d2192e654f23e1b76e0b66554debe1590a3af64)
- [api] Manual merge of #46: add custom `proxyError` event and enable production error handling. [`652cca3`](https://github.com/http-party/node-http-proxy/commit/652cca37ea321ec9d1d55125217df0214c8090b6)
- [dist] Version bump. v0.5.6 Only good on node v0.4.7. See issue #48. [`f1c0f64`](https://github.com/http-party/node-http-proxy/commit/f1c0f641aa14dc3c267de37370a7369c3131c636)

## [v0.5.5](https://github.com/http-party/node-http-proxy/compare/v0.5.4...v0.5.5) - 2011-05-19

### Commits

- [fix] Change variable references for Websockets, bugs found from using wsbench [`7bf0cae`](https://github.com/http-party/node-http-proxy/commit/7bf0caef9fae86a34719f04f7b9926095fb6a146)
- [dist] Version bump. 0.5.5. Only good on node v0.4.7. See issue #48. [`acacc05`](https://github.com/http-party/node-http-proxy/commit/acacc0561f2efabc0a7859b9a410e954f2dca6fd)

## [v0.5.4](https://github.com/http-party/node-http-proxy/compare/v0.5.3...v0.5.4) - 2011-05-19

### Commits

- [doc] Update docco docs [`faf2618`](https://github.com/http-party/node-http-proxy/commit/faf2618cf3b53a972779514842bc4264ec9541fa)
- [doc] Update README.md to reflect the new HTTPS to HTTP proxy capabilities [`abc01bc`](https://github.com/http-party/node-http-proxy/commit/abc01bce293f7c1a88f9be08b0540407d2b0f4a1)
- [doc test api] Improve node-http-proxy API to allow for HTTPS to HTTP proxying scenarios. Update tests accordingly. [`895f577`](https://github.com/http-party/node-http-proxy/commit/895f577744e3cbcbb5f479c4aacec5323bb001f7)
- [doc] Update examples for HTTPS to HTTP proxying [`91737fa`](https://github.com/http-party/node-http-proxy/commit/91737fadb640f30d3cd959f29069537473207efd)
- [dist] Version bump. 0.5.4. Only good on node v0.4.7. See issue #48. [`c04eec1`](https://github.com/http-party/node-http-proxy/commit/c04eec1c370ca0eb212c96c0896c27b349f7ea97)
- [minor] Update README.md to conform to Github flavored markdown [`32a15dd`](https://github.com/http-party/node-http-proxy/commit/32a15dd79d860343453c38a7eef8339d7b99718b)
- [minor] Update README.md to conform to Github flavored markdown [`521fe27`](https://github.com/http-party/node-http-proxy/commit/521fe271853632563143fb4b76c032f7afa7831a)

## [v0.5.3](https://github.com/http-party/node-http-proxy/compare/v0.5.2...v0.5.3) - 2011-05-18

### Commits

- [test] Continued work around Origin mismatch tests [`44a8566`](https://github.com/http-party/node-http-proxy/commit/44a85664a80fd67e20bbc36d280816dbd1a796c5)
- [doc] Regenerate docco docs [`9e36d2d`](https://github.com/http-party/node-http-proxy/commit/9e36d2d2e619be322bb73092db2a9d72ef6709e8)
- [fix test api] Only change Origin headers in WebSocket requests when the `changeOrigin` option is set explicitly. Added tests to ensure Origin and sec-websocket-origin headers match when proxying websockets. [`9c6c4b9`](https://github.com/http-party/node-http-proxy/commit/9c6c4b908b7d6ce67144ba9d41702b5694254099)
- [test] Improve websocket tests to inspect outgoing and incoming HTTP headers to test origin mismatch bugs [`6e679c8`](https://github.com/http-party/node-http-proxy/commit/6e679c8019e1eb62b2b1da48628f89b8046203fd)
- [test] Refined tests to begin checking Origin == Sec-Websocket-Origin [`9ab54ab`](https://github.com/http-party/node-http-proxy/commit/9ab54ab47fc43d98f3182da9c41487f524933783)
- [doc minor] Update docs and code docs for v0.5.3 release [`03b9087`](https://github.com/http-party/node-http-proxy/commit/03b908744612faed82d9233f3b6d4af70368cf3c)
- [dist] Version bump. v0.5.3. Only good on node v0.4.7. See issue #48. [`d9fa261`](https://github.com/http-party/node-http-proxy/commit/d9fa261cdc97aee71279064e536a4a22edbe3b5b)

## [v0.5.2](https://github.com/http-party/node-http-proxy/compare/v0.5.1...v0.5.2) - 2011-05-17

### Merged

- Readme: fix syntax error, reformat code blocks [`#52`](https://github.com/http-party/node-http-proxy/pull/52)

### Commits

- format markdown for syntax highlighting on GitHub [`28f6dc1`](https://github.com/http-party/node-http-proxy/commit/28f6dc153a7d9fa9b6a08637c90765cf3a07fd3e)
- [doc] Regenerate docco docs [`a5e1e3e`](https://github.com/http-party/node-http-proxy/commit/a5e1e3e70d02f32ab86b711ec4b262df5955a1a9)
- [test] Fix tests in https mode [`1ee6bef`](https://github.com/http-party/node-http-proxy/commit/1ee6beff6aa3087e332701fd3cfda70b4e968ce8)
- [fix] Manage bookkeeping for incoming requests to the underlying sockets behind reverse proxied websocket events. Only use the appropriate variables in the closure scope of the `upgrade` event from this bookkeeping [`85223ea`](https://github.com/http-party/node-http-proxy/commit/85223ea0800ad63ea82783c9dc2dc4a0e3345ae8)
- [minor] Fix syntax in examples/ [`ff82946`](https://github.com/http-party/node-http-proxy/commit/ff829467d33d326c588861a46acc2bf9adbdddd2)
- add spacing around code blocks to fix README rendering [`ab8c264`](https://github.com/http-party/node-http-proxy/commit/ab8c264e6d729de81c93982f97875006e52240f0)
- [dist] Use devDependencies in package.json [`e6c52d4`](https://github.com/http-party/node-http-proxy/commit/e6c52d431f8a32e11cd347fbabeb7a03d0d40790)
- don't highlight non-javascript as javascript [`d5b9ba7`](https://github.com/http-party/node-http-proxy/commit/d5b9ba7180376b8a67b9cbfebe9acf7399cab3ed)
- fix syntax error in README example [`332d2d7`](https://github.com/http-party/node-http-proxy/commit/332d2d780ab62ccc996157dacd2498c568816ffc)
- [minor] Ignore npm modules and debug logs [`e90cbd6`](https://github.com/http-party/node-http-proxy/commit/e90cbd6f148633ef7d3e2de06aaabe1cc493cc37)
- [dist] Include docco module as a dev dependency [`d08c2bb`](https://github.com/http-party/node-http-proxy/commit/d08c2bb525ec661c0c8e6539e28605972b1ae9b8)
- [dist] Version bump. 0.5.2. Only good on node v0.4.7. See issue #48. [`360e79a`](https://github.com/http-party/node-http-proxy/commit/360e79a005d298f40f36ee0e25c34fe534311b09)

## [v0.5.1](https://github.com/http-party/node-http-proxy/compare/v0.5.0...v0.5.1) - 2011-05-10

### Commits

- [dist] Version bump. 0.5.1. Only good on node v0.4.7. See issue #48. [`6c80177`](https://github.com/http-party/node-http-proxy/commit/6c8017734053bc683f32a2b9f0ba18ba0c014855)
- Revert "Fixed "Invalid argument to getAgent" when proxying HTTP" [`40dc9de`](https://github.com/http-party/node-http-proxy/commit/40dc9dee2d1e617af7f85a056d281b4f220f2802)
- [fix] Fix typo in bin/node-http-proxy [`57127a3`](https://github.com/http-party/node-http-proxy/commit/57127a367193bcf12be2b367e1e01cbc57d685fe)
- Merged pull request #39 from timmattison/master. [`ac425d7`](https://github.com/http-party/node-http-proxy/commit/ac425d70ef63b847fe6eb17dbfc4b084d0dd2d20)
- Fixed "Invalid argument to getAgent" when proxying HTTP [`642e158`](https://github.com/http-party/node-http-proxy/commit/642e15805dbd572835bb4fee9527e4f2da658833)

## [v0.5.0](https://github.com/http-party/node-http-proxy/compare/v0.4.2...v0.5.0) - 2011-04-17

### Commits

- [doc] Breakout demo.js into files in example/. Add web-socket-proxy.js example [`6e4bf6a`](https://github.com/http-party/node-http-proxy/commit/6e4bf6a9cbc400fcd2be420649ce08936417dd83)
- [api test doc] Improve HTTPS support. Update minor documentation. Change tests accordingly. [`bf68dc3`](https://github.com/http-party/node-http-proxy/commit/bf68dc30a5c508bc8f533f52c083206b87963811)
- [api] Update WebSocket support to use http.Agent APIs [`b0b0183`](https://github.com/http-party/node-http-proxy/commit/b0b0183c2b54fa63bd2a6f9c92475c7f56d811a3)
- [api] Update `.proxyRequest()` and `.proxyWebSocketRequest()` APIs to take an options hash instead of a set of arguments. Add HTTPS support. [`cfddd12`](https://github.com/http-party/node-http-proxy/commit/cfddd12e821bd6b07ff2dbf0aa543ddfc3664dca)
- [doc api] Update README.md and CHANGELOG.md for v0.5.0. Update bin/node-http-proxy to read files specified in `config.https` [`212009d`](https://github.com/http-party/node-http-proxy/commit/212009df6b08de3c0c97a4e9ec43f60f6bf49ea6)
- [test] Add WebSocket tests [`4d18ac1`](https://github.com/http-party/node-http-proxy/commit/4d18ac1ae611f84e5e0cc599234124d183d81ffd)
- [doc] Regenerate docco docs [`c485c87`](https://github.com/http-party/node-http-proxy/commit/c485c8742c86b504823020d2cf6c1342a1bcce48)
- [doc test] Small updates to README.md. Update to try require socket.io [`12064d8`](https://github.com/http-party/node-http-proxy/commit/12064d8e5debf674cd5d367e563b699f10a4325e)
- [api] Remove winston logging in favor of custom events [`a89b397`](https://github.com/http-party/node-http-proxy/commit/a89b3976b25516db9b601c0327948f3d90fab006)
- [doc] Update README.md [`bd6a262`](https://github.com/http-party/node-http-proxy/commit/bd6a2622ad67b8c7ec15868037a48048207ce0df)
- [dist] Version bump. v0.5.0 [`ddf31b2`](https://github.com/http-party/node-http-proxy/commit/ddf31b22ec71ef9dacca9c178ee26b6314d9fdf4)
- [api] Update `request` event to be consistent by emitting both `req` and `res`. Add `x-forwarded-for` header. [`a3cb527`](https://github.com/http-party/node-http-proxy/commit/a3cb527be5e42d5192400933bf32a361b8c707c4)
- [api] Emit `end` event when done proxying [`5681fc1`](https://github.com/http-party/node-http-proxy/commit/5681fc1a28ff06dfa91d9bf5512c688235cafac4)
- [minor] Small update to README.md [`40c51a7`](https://github.com/http-party/node-http-proxy/commit/40c51a703baaf050b35f60131d3e78b42e7b0858)
- [dist] Move pgriess' websocket client into vendor/* [`7cbf447`](https://github.com/http-party/node-http-proxy/commit/7cbf44732068dc788d31432553b3bdfcfb39f743)

## [v0.4.2](https://github.com/http-party/node-http-proxy/compare/v0.4.1...v0.4.2) - 2011-04-13

### Commits

- [dist] Version bump. 0.4.2. Remove `eyes` dependency. [`a5d88aa`](https://github.com/http-party/node-http-proxy/commit/a5d88aaacc209bdceaf0799e99ff82bdce1bdc10)

## [v0.4.1](https://github.com/http-party/node-http-proxy/compare/v0.4.0...v0.4.1) - 2011-03-20

### Commits

- [dist] Version bump. 0.4.1. Fix package.json [`0d1a3fe`](https://github.com/http-party/node-http-proxy/commit/0d1a3fe99511dda1ac949536a9eb4a045db39979)

## [v0.4.0](https://github.com/http-party/node-http-proxy/compare/v0.3.1...v0.4.0) - 2011-03-20

### Commits

- [api] Further work on refactor for node 0.4.0 [`e39a9f9`](https://github.com/http-party/node-http-proxy/commit/e39a9f93d2f9ab6ea769fad5e9dda25d022d8a1a)
- [doc] Added docco generated literate coding documentation [`3bc7d16`](https://github.com/http-party/node-http-proxy/commit/3bc7d16adc48ad1aa1161bb02bd0c27d4fb20639)
- [doc api test] Wrap things up for v0.4.0 release: Add hostnameOnly routing to ProxyTable, add more documentation, fix edge-cases until they can be further investigated in node.js core [`5715318`](https://github.com/http-party/node-http-proxy/commit/571531820e2233b0d2f7268a1d4db8510fcabf91)
- [api] First pass at removing pool and working with node v0.4.0 [`9faa924`](https://github.com/http-party/node-http-proxy/commit/9faa924a29544cfd84c28cb1c45489f495e3806a)
- [doc api test] Rename HttpProxy.pause to HttpProxy.resume. Update documentation and tests accordingly [`4110448`](https://github.com/http-party/node-http-proxy/commit/4110448046dd945afe3e092968d9382d573a369a)
- [doc] Added more documentation [`973f19f`](https://github.com/http-party/node-http-proxy/commit/973f19fd5a14e3bfad5f67e54710a4076a469fe0)
- [doc] Regenerate docco docs [`6c42f04`](https://github.com/http-party/node-http-proxy/commit/6c42f045241194061c3786ba5827aebf88070201)
- [api] Force connection header to be `close` until keep-alive is replemented [`3fd3c96`](https://github.com/http-party/node-http-proxy/commit/3fd3c96fa05fda45c7ef9ff44594644ac54f4a1e)
- [dist] Version bump. 0.4.0 [`cbb5fbc`](https://github.com/http-party/node-http-proxy/commit/cbb5fbccd0e65c51eba14e75ef44184714cc8971)
- [api test] All tests are passing when run as individual files [`389159d`](https://github.com/http-party/node-http-proxy/commit/389159da1b91ab60b8de3c379d84e76c703e6b59)
- [minor doc] Update demo and small fix to node-http-proxy [`d8c5406`](https://github.com/http-party/node-http-proxy/commit/d8c54063dc5961fa619f7c04fa2d225da9aa1439)
- [fix] Fixed cli parsing issue when --argument=value is not used [`34cba38`](https://github.com/http-party/node-http-proxy/commit/34cba38c297d6dcb845e95b9e1ce0271da1631d2)
- [test] Small update to proxy-table-test.js [`3588687`](https://github.com/http-party/node-http-proxy/commit/3588687874eb691fe59407a207d38efa418211d0)
- [minor] Expose version on module [`1dd9b3b`](https://github.com/http-party/node-http-proxy/commit/1dd9b3b15088a3c4595faae64822969014a61d52)
- [doc] Update to v0.3.1 in README.md [`8ef2e1f`](https://github.com/http-party/node-http-proxy/commit/8ef2e1fe33e0fca2b80c0d6474dba994e625f094)
- [dist] Change package.json for npm version bump [`0e7f362`](https://github.com/http-party/node-http-proxy/commit/0e7f3626718ecf108f3cafa814b0f4ffb3e6faa2)

## [v0.3.1](https://github.com/http-party/node-http-proxy/compare/v0.3.0...v0.3.1) - 2010-11-22

### Commits

- [api test doc] Updated tests. Added ProxyTable functionality [`bedc7a3`](https://github.com/http-party/node-http-proxy/commit/bedc7a3ae57d5ec07b372a550fa69772f9fbc19e)
- [test] Simplified tests. Added tests for experimental websocket support [`8c3e993`](https://github.com/http-party/node-http-proxy/commit/8c3e993833e2a09376fdb5e7c847ff00b53e70d8)
- [test doc api] Added forward proxy functionality with tests [`c06f4bf`](https://github.com/http-party/node-http-proxy/commit/c06f4bf7fe50f29677dc5a5aad596193fc893018)
- [dist minor] Removed vendored pool. Changed all references of sys to util [`8251296`](https://github.com/http-party/node-http-proxy/commit/8251296d7f5c472ec523316e905d678042b043d3)
- WebSocket proxy support, fixed 304 code halting [`7249ef3`](https://github.com/http-party/node-http-proxy/commit/7249ef3ee776c66acc95036dc76a2d08dc3f6350)
- [api] pseduo-vendor pool until pull request is finalized [`7c2eb5d`](https://github.com/http-party/node-http-proxy/commit/7c2eb5de3531f20ea92c99dd8ab207d26be9dce8)
- No-server fix [`f84880f`](https://github.com/http-party/node-http-proxy/commit/f84880fcd946e55585d8e901e5bc32933f629837)
- [api test bin doc] Added bin script and simple logging [`00014d6`](https://github.com/http-party/node-http-proxy/commit/00014d624c052e7404ce96c7e06769440c4eae2a)
- [debug] Removed pool as a dependency for stress test [`73381cf`](https://github.com/http-party/node-http-proxy/commit/73381cf71ae92b9ed1c2da5986aa7ca31a7cf2e8)
- 'end' event becomes 'close', added more try-catch handling [`cd78af5`](https://github.com/http-party/node-http-proxy/commit/cd78af5feaa67c5005df921a8d1a61575a58fca2)
- Added support of automatic websocket tunneling, added test for it [`56003b5`](https://github.com/http-party/node-http-proxy/commit/56003b527625b2d83a191f3172005c87856aa87d)
- [debug] Better debug messages to try to determine if pool is slowly losing clients to forever busy [`dd1918d`](https://github.com/http-party/node-http-proxy/commit/dd1918dc360dc0f9553c35c82f3f0f93ac3bfb46)
- [doc dist] Version bump. Added CHANGELOG.md [`de53d5e`](https://github.com/http-party/node-http-proxy/commit/de53d5eb2c3d671be0ad0e736a6435c3bf5f55f4)
- Moved error handling to response.on('end'), fixed error handling in websocket's part [`7e61f0c`](https://github.com/http-party/node-http-proxy/commit/7e61f0cf5725dedf37b956545639c2d6129855d3)
- [minor] Pushing hot-fix from Mikeal for vendored pool repo [`60791f3`](https://github.com/http-party/node-http-proxy/commit/60791f361f8a11f9d1bad2c6366bf0ce72b40f66)
- [api] Integrated commits from donnerjack and worked on pool changes [`3bb458e`](https://github.com/http-party/node-http-proxy/commit/3bb458e115037bc27691705d255b0d2e2504a9f1)
- [doc] Updated Copyright ... added Fedor [`9128a8c`](https://github.com/http-party/node-http-proxy/commit/9128a8c5a15d0f64a0bae946f3e741ea708bc56f)
- [minor] Listen to error event on pool so we dont fail out unexpectedly anymore [`711258e`](https://github.com/http-party/node-http-proxy/commit/711258ef469d064cc0dbe0f0320ed1047ed0bd54)
- adding more debugging messages [`5d54ea5`](https://github.com/http-party/node-http-proxy/commit/5d54ea58c93c26635e0de96871e824baffea34dd)
- adding some debug messages for live testing [`4069a7e`](https://github.com/http-party/node-http-proxy/commit/4069a7e98c22a48bae7fd57ad5f315d0e5006dfc)
- [minor] Listen to error events re-emitted by pool into the ClientRequest [`f8bff4c`](https://github.com/http-party/node-http-proxy/commit/f8bff4c618ab2a6b6185ac973cd0e21cea19c23a)
- [minor] Updated max clients for pool [`32aaf74`](https://github.com/http-party/node-http-proxy/commit/32aaf74e95f8a39d847b352ca984145e7abe89a6)
- [debug] Trying to repair pool busy client growth [`7b0ea85`](https://github.com/http-party/node-http-proxy/commit/7b0ea85e2ac58d5f711f64b855f746fb2423a276)
- [debug] Roll back last commit ... connection = close was ineffective [`266e524`](https://github.com/http-party/node-http-proxy/commit/266e5246eacb4877bb6ab557e6e6b9b8434ad612)

## [v0.3.0](https://github.com/http-party/node-http-proxy/compare/v0.2.0...v0.3.0) - 2010-09-10

### Commits

- [api] Revert to old 0.1.x codebase for bug testing and performance comparison [`66afb2a`](https://github.com/http-party/node-http-proxy/commit/66afb2a2a35a479512ce2601c89b82f13596fc9f)
- [api test dist doc] Updated for 0.3.0 release [`a9084b9`](https://github.com/http-party/node-http-proxy/commit/a9084b923afa66c3004abec4951ff02e031631da)
- [api] Object creation is cheap for HttpProxy, so lets take advantage [`9f0aeac`](https://github.com/http-party/node-http-proxy/commit/9f0aeacab1a632136f5905a0d03ad04be9f93f51)
- [doc] Update contributors for 0.3.0 [`6d47d98`](https://github.com/http-party/node-http-proxy/commit/6d47d98f5345b7f335c3b93f8e4a31dd90235dda)

## [v0.2.0](https://github.com/http-party/node-http-proxy/compare/v0.1.5...v0.2.0) - 2010-09-07

### Commits

- [dist] Version bump and update to README + LICENCE. Word to Mikeal for coming thru for 0.2.0 [`69c162d`](https://github.com/http-party/node-http-proxy/commit/69c162dc3da334b2ece0a19be5ea4c8da7e0fe87)
- [api dist] Merge of branch 0.2.0 [`fd61828`](https://github.com/http-party/node-http-proxy/commit/fd618289338ca2d7595f695c0b8531b40145bbca)
- [api] Completely refactored node-http-proxy with help from Mikeal [`1221939`](https://github.com/http-party/node-http-proxy/commit/1221939accf00467adb25f8908e991e984043c85)
- [api minor debug] Remove debug code, set Connection header if not set [`6d08f24`](https://github.com/http-party/node-http-proxy/commit/6d08f24c863e071eb4a0d3ede15656e5e7c27c4b)
- [debug] Added some debugging to figure out why AB wont complete a test with v0.2.0 [`9715ebd`](https://github.com/http-party/node-http-proxy/commit/9715ebd40bdbbe883eb383676d5b0df24968dd72)
- [api] Integrated a little more from Mikeal to make our return headers consistent [`eb39018`](https://github.com/http-party/node-http-proxy/commit/eb39018fd0b5751dd90fabce905997e52f2ffecd)
- [doc] Updated README.md [`f291efb`](https://github.com/http-party/node-http-proxy/commit/f291efbaa4360d6e7ff4004cc11f8df0d737c1d0)

## v0.1.5 - 2010-09-02

### Commits

- [api] More changes for createServer api [`5d94ae2`](https://github.com/http-party/node-http-proxy/commit/5d94ae27bc2d56d1f817b0cf1dfdb01dcc376393)
- added colors and asciimo [`d490b50`](https://github.com/http-party/node-http-proxy/commit/d490b50ada8c1024cb785335966b71d69fae3407)
- [api] First commit of http-proxy [`30b68c1`](https://github.com/http-party/node-http-proxy/commit/30b68c153270619119ec36615bb54ee7a2816ecc)
- updating demo [`c4b7c0d`](https://github.com/http-party/node-http-proxy/commit/c4b7c0d8a0cc5fd7f43257594bd0a71c7bd12a63)
- initial release v0.1.0, sure to have many updates coming. [`85f7372`](https://github.com/http-party/node-http-proxy/commit/85f73723415ec54539721777e77d5d10de383469)
- fleshing out demo [`994f748`](https://github.com/http-party/node-http-proxy/commit/994f7481ce07c15afa5ab993b79d920b8220be44)
- [docs] added benchmarks [`bbed176`](https://github.com/http-party/node-http-proxy/commit/bbed17640f84e56aaea06c6d4eb7d04952957fce)
- updated paths to use npm [`972c8c0`](https://github.com/http-party/node-http-proxy/commit/972c8c05274c72c7320291389f88b0694ac290ca)
- added spark demo [`d0ad931`](https://github.com/http-party/node-http-proxy/commit/d0ad93176d8430301a8a42f8c2b817674ce7ba32)
- [test] Updated tests to include support for latent requests [`095e86a`](https://github.com/http-party/node-http-proxy/commit/095e86aa653c1c8e07cd1403697e0e4b638b8294)
- started to flesh out simple demo based on tests [`2fb5ffb`](https://github.com/http-party/node-http-proxy/commit/2fb5ffba7765462e95badd0f7243e65395a3fd2e)
- added createServer but hated it, gonna remove [`b1eb13e`](https://github.com/http-party/node-http-proxy/commit/b1eb13eb70b67ea76f5ab720d566894677a53ca2)
- [test] Updated node-http-proxy tests [`2f265a2`](https://github.com/http-party/node-http-proxy/commit/2f265a23e4a10971495d0bd7b324b7ba786e5065)
- [api] Updated request hashes to use a unique identifier [`c887a75`](https://github.com/http-party/node-http-proxy/commit/c887a757623f5a3d7d1e0fafeb00b96731c89872)
- [api] Updated http-proxy to work with vows [`ead7567`](https://github.com/http-party/node-http-proxy/commit/ead7567db8099264a2001fd876cded84bc4f111f)
- [dist] Renamed node-proxy to node-http-proxy, updated package.json [`2f49810`](https://github.com/http-party/node-http-proxy/commit/2f49810ef86f49927991f32ae42605f1118b0c25)
- updating docs, almost there [`6e651f4`](https://github.com/http-party/node-http-proxy/commit/6e651f420f4d1e15dbbf823a8e3b311e9533c805)
- changed api to better reflect nodes api. updated demos, tests, docs [`bde98f4`](https://github.com/http-party/node-http-proxy/commit/bde98f489234fe22f49468011b7e342cd108603f)
- updating docs [`341bbd4`](https://github.com/http-party/node-http-proxy/commit/341bbd404f3fd81e65197b3830c3fa9e544bc1e7)
- fixed npm package, i think. bumped version 0.1.1 [`fca40da`](https://github.com/http-party/node-http-proxy/commit/fca40da694d8df17ed6140265e374c0ceabd1167)
- updated demo [`b622702`](https://github.com/http-party/node-http-proxy/commit/b62270210e7ad3c54fd6b2c86bde9f9942328a67)
- added readme [`d6a2f8a`](https://github.com/http-party/node-http-proxy/commit/d6a2f8aa7dae3f6721b9607a702c68b1ad7fc692)
- [api] Corrected chain of argument passing [`da55777`](https://github.com/http-party/node-http-proxy/commit/da55777a92d100a5ddb7a8267e56ba26bd8c2270)
- updated demo [`e9511ea`](https://github.com/http-party/node-http-proxy/commit/e9511eafdf9ada6a0ce6defb3c5f2299411633b1)
- [deploy] Added package.json [`dce80b9`](https://github.com/http-party/node-http-proxy/commit/dce80b9b4546064da1943e0e396e19b41390588a)
- updated readme [`76d0649`](https://github.com/http-party/node-http-proxy/commit/76d0649abcafd80509af922503c5544e646bcebb)
- update to docs and package.json [`d15bba4`](https://github.com/http-party/node-http-proxy/commit/d15bba4c1d2cbdaf0af27f3adcaa1db9b534d968)
- [minor] Removed eyes dependency [`eaeed83`](https://github.com/http-party/node-http-proxy/commit/eaeed8306d6dc6e1b30223cf6d59cda6d5bb76de)
- merge [`93505a4`](https://github.com/http-party/node-http-proxy/commit/93505a422c688b7f41fdaf304270c893ef4cf09a)
- fixed additional port / server mismatches for new api [`15c18b6`](https://github.com/http-party/node-http-proxy/commit/15c18b612d6cd5a1f3ae46b5590dda1fc586fb35)
- [doc] added nodejitsu.com link to ReadMe. http-proxy is used in our front facing load-balancers. look for bugs...try to improve benchmarks.... ^_^ [`6661753`](https://github.com/http-party/node-http-proxy/commit/6661753f07dcf4e5ae684df4d1709f3c238346c9)
- removed extra self, updated colors requirement, bumped to version 0.1.3 [`9bc5b6f`](https://github.com/http-party/node-http-proxy/commit/9bc5b6f8621fb2a37e84524c3e5b91aab9b45675)
- fixed pathing issue, bumped version 0.1.3 [`ede6490`](https://github.com/http-party/node-http-proxy/commit/ede649037e08b615a8995179f46bc701550354d6)
- updated docs [`07d96bb`](https://github.com/http-party/node-http-proxy/commit/07d96bb8887a7880a21a739e0a8f495698e7e79e)
- updated docs [`1594367`](https://github.com/http-party/node-http-proxy/commit/15943675edef490d9b8732345a750bc5ab1f5d7e)
- updated readme [`fb8c5ab`](https://github.com/http-party/node-http-proxy/commit/fb8c5abd3c2a722c1c18046dcf2fffea4fa7d050)
- updated docs [`17b6c69`](https://github.com/http-party/node-http-proxy/commit/17b6c6998544572300fc9d4faa63af1aee4c3d88)
- updated docs [`c8dd8c4`](https://github.com/http-party/node-http-proxy/commit/c8dd8c4e28e09f25c161980316b259d81d5a4e91)
- updated package.json again [`ddba155`](https://github.com/http-party/node-http-proxy/commit/ddba155377942259554842f37de98c508130fe11)
- initial release v0.1.0, sure to have many updates coming. [`6a1baa2`](https://github.com/http-party/node-http-proxy/commit/6a1baa25ccf9fc3a3fc4d1a4764c968993e48cab)
- bumped to version 0.1.5 [`b195a16`](https://github.com/http-party/node-http-proxy/commit/b195a16406534912161671448a53d6633a1f2458)
- updated readme [`9aa2216`](https://github.com/http-party/node-http-proxy/commit/9aa22162f139ab2fa6df6b11e2a96336ee1d2612)
- added spark demo [`d408e39`](https://github.com/http-party/node-http-proxy/commit/d408e39ed6dbd44709d0164a95ad9bc67f76ba13)
- bumped to version 0.1.4. improved on api [`82b8228`](https://github.com/http-party/node-http-proxy/commit/82b822827d35a54501068f9880111473e19c72f9)
- initial release v0.1.0, sure to have many updates coming. [`1e04552`](https://github.com/http-party/node-http-proxy/commit/1e04552bd8f39e3dcba36bbf7fb36674e5c0c9ff)
- updated readme [`0a2eaaa`](https://github.com/http-party/node-http-proxy/commit/0a2eaaa7db690f86aca8c0b952f745e806ad818c)
- updating docs [`198000f`](https://github.com/http-party/node-http-proxy/commit/198000feefd525125a2031557b3556978a057bde)
- [api] Added createServer api to node-http-proxy [`2e2b55f`](https://github.com/http-party/node-http-proxy/commit/2e2b55f113eb3bc81c43717c0db5de695fb694c1)


---
## Source: node_modules\http-proxy\CODE_OF_CONDUCT.md

# Contributor Covenant Code of Conduct

## Our Pledge

In the interest of fostering an open and welcoming environment, we as
contributors and maintainers pledge to making participation in our project and
our community a harassment-free experience for everyone, regardless of age, body
size, disability, ethnicity, gender identity and expression, level of experience,
nationality, personal appearance, race, religion, or sexual identity and
orientation.

## Our Standards

Examples of behavior that contributes to creating a positive environment
include:

* Using welcoming and inclusive language
* Being respectful of differing viewpoints and experiences
* Gracefully accepting constructive criticism
* Focusing on what is best for the community
* Showing empathy towards other community members

Examples of unacceptable behavior by participants include:

* The use of sexualized language or imagery and unwelcome sexual attention or
advances
* Trolling, insulting/derogatory comments, and personal or political attacks
* Public or private harassment
* Publishing others' private information, such as a physical or electronic
  address, without explicit permission
* Other conduct which could reasonably be considered inappropriate in a
  professional setting

## Our Responsibilities

Project maintainers are responsible for clarifying the standards of acceptable
behavior and are expected to take appropriate and fair corrective action in
response to any instances of unacceptable behavior.

Project maintainers have the right and responsibility to remove, edit, or
reject comments, commits, code, wiki edits, issues, and other contributions
that are not aligned to this Code of Conduct, or to ban temporarily or
permanently any contributor for other behaviors that they deem inappropriate,
threatening, offensive, or harmful.

## Scope

This Code of Conduct applies both within project spaces and in public spaces
when an individual is representing the project or its community. Examples of
representing a project or community include using an official project e-mail
address, posting via an official social media account, or acting as an appointed
representative at an online or offline event. Representation of a project may be
further defined and clarified by project maintainers.

## Enforcement

Instances of abusive, harassing, or otherwise unacceptable behavior may be
reported by contacting the project team at <https://github.com/http-party/node-http-proxy>. All
complaints will be reviewed and investigated and will result in a response that
is deemed necessary and appropriate to the circumstances. The project team is
obligated to maintain confidentiality with regard to the reporter of an incident.
Further details of specific enforcement policies may be posted separately.

Project maintainers who do not follow or enforce the Code of Conduct in good
faith may face temporary or permanent repercussions as determined by other
members of the project's leadership.

## Attribution

This Code of Conduct is adapted from the [Contributor Covenant][homepage], version 1.4,
available at [http://contributor-covenant.org/version/1/4][version]

[homepage]: http://contributor-covenant.org
[version]: http://contributor-covenant.org/version/1/4/


---
## Source: node_modules\iconv-lite\Changelog.md

## 0.6.3 / 2021-05-23
  * Fix HKSCS encoding to prefer Big5 codes if both Big5 and HKSCS codes are possible (#264)


## 0.6.2 / 2020-07-08
  * Support Uint8Array-s decoding without conversion to Buffers, plus fix an edge case.


## 0.6.1 / 2020-06-28
  * Support Uint8Array-s directly when decoding (#246, by @gyzerok)
  * Unify package.json version ranges to be strictly semver-compatible (#241)
  * Fix minor issue in UTF-32 decoder's endianness detection code.


## 0.6.0 / 2020-06-08
  * Updated 'gb18030' encoding to :2005 edition (see https://github.com/whatwg/encoding/issues/22).
  * Removed `iconv.extendNodeEncodings()` mechanism. It was deprecated 5 years ago and didn't work 
    in recent Node versions.
  * Reworked Streaming API behavior in browser environments to fix #204. Streaming API will be 
    excluded by default in browser packs, saving ~100Kb bundle size, unless enabled explicitly using 
    `iconv.enableStreamingAPI(require('stream'))`.
  * Updates to development environment & tests:
    * Added ./test/webpack private package to test complex new use cases that need custom environment. 
      It's tested as a separate job in Travis CI.
    * Updated generation code for the new EUC-KR index file format from Encoding Standard.
    * Removed Buffer() constructor in tests (#197 by @gabrielschulhof).


## 0.5.2 / 2020-06-08
  * Added `iconv.getEncoder()` and `iconv.getDecoder()` methods to typescript definitions (#229).
  * Fixed semver version to 6.1.2 to support Node 8.x (by @tanandara).
  * Capped iconv version to 2.x as 3.x has dropped support for older Node versions.
  * Switched from instanbul to c8 for code coverage.


## 0.5.1 / 2020-01-18

  * Added cp720 encoding (#221, by @kr-deps)
  * (minor) Changed Changelog.md formatting to use h2. 


## 0.5.0 / 2019-06-26

  * Added UTF-32 encoding, both little-endian and big-endian variants (UTF-32LE, UTF32-BE). If endianness
    is not provided for decoding, it's deduced automatically from the stream using a heuristic similar to
    what we use in UTF-16. (great work in #216 by @kshetline)
  * Several minor updates to README (#217 by @oldj, plus some more)
  * Added Node versions 10 and 12 to Travis test harness.


## 0.4.24 / 2018-08-22

  * Added MIK encoding (#196, by @Ivan-Kalatchev)


## 0.4.23 / 2018-05-07

  * Fix deprecation warning in Node v10 due to the last usage of `new Buffer` (#185, by @felixbuenemann)
  * Switched from NodeBuffer to Buffer in typings (#155 by @felixfbecker, #186 by @larssn)


## 0.4.22 / 2018-05-05

  * Use older semver style for dependencies to be compatible with Node version 0.10 (#182, by @dougwilson)
  * Fix tests to accomodate fixes in Node v10 (#182, by @dougwilson)


## 0.4.21 / 2018-04-06

  * Fix encoding canonicalization (#156)
  * Fix the paths in the "browser" field in package.json (#174 by @LMLB)
  * Removed "contributors" section in package.json - see Git history instead.


## 0.4.20 / 2018-04-06

  * Updated `new Buffer()` usages with recommended replacements as it's being deprecated in Node v10 (#176, #178 by @ChALkeR)


## 0.4.19 / 2017-09-09

  * Fixed iso8859-1 codec regression in handling untranslatable characters (#162, caused by #147)
  * Re-generated windows1255 codec, because it was updated in iconv project
  * Fixed grammar in error message when iconv-lite is loaded with encoding other than utf8


## 0.4.18 / 2017-06-13

  * Fixed CESU-8 regression in Node v8.


## 0.4.17 / 2017-04-22

 * Updated typescript definition file to support Angular 2 AoT mode (#153 by @larssn)


## 0.4.16 / 2017-04-22

 * Added support for React Native (#150)
 * Changed iso8859-1 encoding to usine internal 'binary' encoding, as it's the same thing (#147 by @mscdex)
 * Fixed typo in Readme (#138 by @jiangzhuo)
 * Fixed build for Node v6.10+ by making correct version comparison
 * Added a warning if iconv-lite is loaded not as utf-8 (see #142)


## 0.4.15 / 2016-11-21

 * Fixed typescript type definition (#137)


## 0.4.14 / 2016-11-20

 * Preparation for v1.0
 * Added Node v6 and latest Node versions to Travis CI test rig
 * Deprecated Node v0.8 support
 * Typescript typings (@larssn)
 * Fix encoding of Euro character in GB 18030 (inspired by @lygstate)
 * Add ms prefix to dbcs windows encodings (@rokoroku)


## 0.4.13 / 2015-10-01

 * Fix silly mistake in deprecation notice.


## 0.4.12 / 2015-09-26

 * Node v4 support:
   * Added CESU-8 decoding (#106)
   * Added deprecation notice for `extendNodeEncodings`
   * Added Travis tests for Node v4 and io.js latest (#105 by @Mithgol)


## 0.4.11 / 2015-07-03

 * Added CESU-8 encoding.


## 0.4.10 / 2015-05-26

 * Changed UTF-16 endianness heuristic to take into account any ASCII chars, not
   just spaces. This should minimize the importance of "default" endianness.


## 0.4.9 / 2015-05-24

 * Streamlined BOM handling: strip BOM by default, add BOM when encoding if 
   addBOM: true. Added docs to Readme.
 * UTF16 now uses UTF16-LE by default.
 * Fixed minor issue with big5 encoding.
 * Added io.js testing on Travis; updated node-iconv version to test against.
   Now we just skip testing SBCS encodings that node-iconv doesn't support.
 * (internal refactoring) Updated codec interface to use classes.
 * Use strict mode in all files.


## 0.4.8 / 2015-04-14
 
 * added alias UNICODE-1-1-UTF-7 for UTF-7 encoding (#94)


## 0.4.7 / 2015-02-05

 * stop official support of Node.js v0.8. Should still work, but no guarantees.
   reason: Packages needed for testing are hard to get on Travis CI.
 * work in environment where Object.prototype is monkey patched with enumerable 
   props (#89).


## 0.4.6 / 2015-01-12
 
 * fix rare aliases of single-byte encodings (thanks @mscdex)
 * double the timeout for dbcs tests to make them less flaky on travis


## 0.4.5 / 2014-11-20

 * fix windows-31j and x-sjis encoding support (@nleush)
 * minor fix: undefined variable reference when internal error happens


## 0.4.4 / 2014-07-16

 * added encodings UTF-7 (RFC2152) and UTF-7-IMAP (RFC3501 Section 5.1.3)
 * fixed streaming base64 encoding


## 0.4.3 / 2014-06-14

 * added encodings UTF-16BE and UTF-16 with BOM


## 0.4.2 / 2014-06-12

 * don't throw exception if `extendNodeEncodings()` is called more than once


## 0.4.1 / 2014-06-11

 * codepage 808 added


## 0.4.0 / 2014-06-10

 * code is rewritten from scratch
 * all widespread encodings are supported
 * streaming interface added
 * browserify compatibility added
 * (optional) extend core primitive encodings to make usage even simpler
 * moved from vows to mocha as the testing framework




---
## Source: node_modules\math-intrinsics\CHANGELOG.md

# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/)
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [v1.1.0](https://github.com/es-shims/math-intrinsics/compare/v1.0.0...v1.1.0) - 2024-12-18

### Commits

- [New] add `round` [`7cfb044`](https://github.com/es-shims/math-intrinsics/commit/7cfb04460c0fbdf1ca101eecbac3f59d11994130)
- [Tests] add attw [`e96be8f`](https://github.com/es-shims/math-intrinsics/commit/e96be8fbf58449eafe976446a0470e6ea561ad8d)
- [Dev Deps] update `@types/tape` [`30d0023`](https://github.com/es-shims/math-intrinsics/commit/30d00234ce8a3fa0094a61cd55d6686eb91e36ec)

## v1.0.0 - 2024-12-11

### Commits

- Initial implementation, tests, readme, types [`b898caa`](https://github.com/es-shims/math-intrinsics/commit/b898caae94e9994a94a42b8740f7bbcfd0a868fe)
- Initial commit [`02745b0`](https://github.com/es-shims/math-intrinsics/commit/02745b03a62255af8a332771987b55d127538d9c)
- [New] add `constants/maxArrayLength`, `mod` [`b978178`](https://github.com/es-shims/math-intrinsics/commit/b978178a57685bd23ed1c7efe2137f3784f5fcc5)
- npm init [`a39fc57`](https://github.com/es-shims/math-intrinsics/commit/a39fc57e5639a645d0bd52a0dc56202480223be2)
- Only apps should have lockfiles [`9451580`](https://github.com/es-shims/math-intrinsics/commit/94515800fb34db4f3cc7e99290042d45609ac7bd)


---
## Source: node_modules\mime\CHANGELOG.md

# Changelog

## v1.6.0 (24/11/2017)
*No changelog for this release.*

---

## v2.0.4 (24/11/2017)
- [**closed**] Switch to mime-score module for resolving extension contention issues. [#182](https://github.com/broofa/node-mime/issues/182)
- [**closed**] Update mime-db to 1.31.0 in v1.x branch [#181](https://github.com/broofa/node-mime/issues/181)

---

## v1.5.0 (22/11/2017)
- [**closed**] need ES5 version ready in npm package [#179](https://github.com/broofa/node-mime/issues/179)
- [**closed**] mime-db no trace of iWork - pages / numbers / etc. [#178](https://github.com/broofa/node-mime/issues/178)
- [**closed**] How it works in brownser ? [#176](https://github.com/broofa/node-mime/issues/176)
- [**closed**] Missing `./Mime` [#175](https://github.com/broofa/node-mime/issues/175)
- [**closed**] Vulnerable Regular Expression [#167](https://github.com/broofa/node-mime/issues/167)

---

## v2.0.3 (25/09/2017)
*No changelog for this release.*

---

## v1.4.1 (25/09/2017)
- [**closed**] Issue when bundling with webpack [#172](https://github.com/broofa/node-mime/issues/172)

---

## v2.0.2 (15/09/2017)
- [**V2**] fs.readFileSync is not a function [#165](https://github.com/broofa/node-mime/issues/165)
- [**closed**] The extension for video/quicktime should map to .mov, not .qt [#164](https://github.com/broofa/node-mime/issues/164)
- [**V2**] [v2 Feedback request] Mime class API [#163](https://github.com/broofa/node-mime/issues/163)
- [**V2**] [v2 Feedback request] Resolving conflicts over extensions [#162](https://github.com/broofa/node-mime/issues/162)
- [**V2**] Allow callers to load module with official, full, or no defined types.  [#161](https://github.com/broofa/node-mime/issues/161)
- [**V2**] Use "facets" to resolve extension conflicts [#160](https://github.com/broofa/node-mime/issues/160)
- [**V2**] Remove fs and path dependencies [#152](https://github.com/broofa/node-mime/issues/152)
- [**V2**] Default content-type should not be application/octet-stream [#139](https://github.com/broofa/node-mime/issues/139)
- [**V2**] reset mime-types [#124](https://github.com/broofa/node-mime/issues/124)
- [**V2**] Extensionless paths should return null or false [#113](https://github.com/broofa/node-mime/issues/113)

---

## v2.0.1 (14/09/2017)
- [**closed**] Changelog for v2.0 does not mention breaking changes [#171](https://github.com/broofa/node-mime/issues/171)
- [**closed**] MIME breaking with 'class' declaration as it is without 'use strict mode' [#170](https://github.com/broofa/node-mime/issues/170)

---

## v2.0.0 (12/09/2017)
- [**closed**] woff and woff2 [#168](https://github.com/broofa/node-mime/issues/168)

---

## v1.4.0 (28/08/2017)
- [**closed**] support for ac3 voc files [#159](https://github.com/broofa/node-mime/issues/159)
- [**closed**] Help understanding change from application/xml to text/xml [#158](https://github.com/broofa/node-mime/issues/158)
- [**closed**] no longer able to override mimetype [#157](https://github.com/broofa/node-mime/issues/157)
- [**closed**] application/vnd.adobe.photoshop [#147](https://github.com/broofa/node-mime/issues/147)
- [**closed**] Directories should appear as something other than application/octet-stream [#135](https://github.com/broofa/node-mime/issues/135)
- [**closed**] requested features [#131](https://github.com/broofa/node-mime/issues/131)
- [**closed**] Make types.json loading optional? [#129](https://github.com/broofa/node-mime/issues/129)
- [**closed**] Cannot find module './types.json' [#120](https://github.com/broofa/node-mime/issues/120)
- [**V2**] .wav files show up as "audio/x-wav" instead of "audio/x-wave" [#118](https://github.com/broofa/node-mime/issues/118)
- [**closed**] Don't be a pain in the ass for node community [#108](https://github.com/broofa/node-mime/issues/108)
- [**closed**] don't make default_type global [#78](https://github.com/broofa/node-mime/issues/78)
- [**closed**] mime.extension() fails if the content-type is parameterized [#74](https://github.com/broofa/node-mime/issues/74)

---

## v1.3.6 (11/05/2017)
- [**closed**] .md should be text/markdown as of March 2016 [#154](https://github.com/broofa/node-mime/issues/154)
- [**closed**] Error while installing mime [#153](https://github.com/broofa/node-mime/issues/153)
- [**closed**] application/manifest+json [#149](https://github.com/broofa/node-mime/issues/149)
- [**closed**] Dynamic adaptive streaming over HTTP (DASH) file extension typo [#141](https://github.com/broofa/node-mime/issues/141)
- [**closed**] charsets image/png undefined [#140](https://github.com/broofa/node-mime/issues/140)
- [**closed**] Mime-db dependency out of date [#130](https://github.com/broofa/node-mime/issues/130)
- [**closed**] how to support plist？ [#126](https://github.com/broofa/node-mime/issues/126)
- [**closed**] how does .types file format look like? [#123](https://github.com/broofa/node-mime/issues/123)
- [**closed**] Feature: support for expanding MIME patterns [#121](https://github.com/broofa/node-mime/issues/121)
- [**closed**] DEBUG_MIME doesn't work [#117](https://github.com/broofa/node-mime/issues/117)

---

## v1.3.4 (06/02/2015)
*No changelog for this release.*

---

## v1.3.3 (06/02/2015)
*No changelog for this release.*

---

## v1.3.1 (05/02/2015)
- [**closed**] Consider adding support for Handlebars .hbs file ending [#111](https://github.com/broofa/node-mime/issues/111)
- [**closed**] Consider adding support for hjson. [#110](https://github.com/broofa/node-mime/issues/110)
- [**closed**] Add mime type for Opus audio files [#94](https://github.com/broofa/node-mime/issues/94)
- [**closed**] Consider making the `Requesting New Types` information more visible [#77](https://github.com/broofa/node-mime/issues/77)

---

## v1.3.0 (05/02/2015)
- [**closed**] Add common name? [#114](https://github.com/broofa/node-mime/issues/114)
- [**closed**] application/x-yaml [#104](https://github.com/broofa/node-mime/issues/104)
- [**closed**] Add mime type for WOFF file format 2.0 [#102](https://github.com/broofa/node-mime/issues/102)
- [**closed**] application/x-msi for .msi [#99](https://github.com/broofa/node-mime/issues/99)
- [**closed**] Add mimetype for gettext translation files [#98](https://github.com/broofa/node-mime/issues/98)
- [**closed**] collaborators [#88](https://github.com/broofa/node-mime/issues/88)
- [**closed**] getting errot in installation of mime module...any1 can help? [#87](https://github.com/broofa/node-mime/issues/87)
- [**closed**] should application/json's charset be utf8? [#86](https://github.com/broofa/node-mime/issues/86)
- [**closed**] Add "license" and "licenses" to package.json [#81](https://github.com/broofa/node-mime/issues/81)
- [**closed**] lookup with extension-less file on Windows returns wrong type [#68](https://github.com/broofa/node-mime/issues/68)

---

## v1.2.11 (15/08/2013)
- [**closed**] Update mime.types [#65](https://github.com/broofa/node-mime/issues/65)
- [**closed**] Publish a new version [#63](https://github.com/broofa/node-mime/issues/63)
- [**closed**] README should state upfront that "application/octet-stream" is default for unknown extension [#55](https://github.com/broofa/node-mime/issues/55)
- [**closed**] Suggested improvement to the charset API [#52](https://github.com/broofa/node-mime/issues/52)

---

## v1.2.10 (25/07/2013)
- [**closed**] Mime type for woff files should be application/font-woff and not application/x-font-woff [#62](https://github.com/broofa/node-mime/issues/62)
- [**closed**] node.types in conflict with mime.types [#51](https://github.com/broofa/node-mime/issues/51)

---

## v1.2.9 (17/01/2013)
- [**closed**] Please update "mime" NPM [#49](https://github.com/broofa/node-mime/issues/49)
- [**closed**] Please add semicolon [#46](https://github.com/broofa/node-mime/issues/46)
- [**closed**] parse full mime types [#43](https://github.com/broofa/node-mime/issues/43)

---

## v1.2.8 (10/01/2013)
- [**closed**] /js directory mime is application/javascript. Is it correct? [#47](https://github.com/broofa/node-mime/issues/47)
- [**closed**] Add mime types for lua code. [#45](https://github.com/broofa/node-mime/issues/45)

---

## v1.2.7 (19/10/2012)
- [**closed**] cannot install 1.2.7 via npm [#41](https://github.com/broofa/node-mime/issues/41)
- [**closed**] Transfer ownership to @broofa [#36](https://github.com/broofa/node-mime/issues/36)
- [**closed**] it's wrong to set charset to UTF-8 for text [#30](https://github.com/broofa/node-mime/issues/30)
- [**closed**] Allow multiple instances of MIME types container [#27](https://github.com/broofa/node-mime/issues/27)

---

## v1.2.5 (16/02/2012)
- [**closed**] When looking up a types, check hasOwnProperty [#23](https://github.com/broofa/node-mime/issues/23)
- [**closed**] Bump version to 1.2.2 [#18](https://github.com/broofa/node-mime/issues/18)
- [**closed**] No license [#16](https://github.com/broofa/node-mime/issues/16)
- [**closed**] Some types missing that are used by html5/css3 [#13](https://github.com/broofa/node-mime/issues/13)
- [**closed**] npm install fails for 1.2.1 [#12](https://github.com/broofa/node-mime/issues/12)
- [**closed**] image/pjpeg + image/x-png [#10](https://github.com/broofa/node-mime/issues/10)
- [**closed**] symlink [#8](https://github.com/broofa/node-mime/issues/8)
- [**closed**] gzip [#2](https://github.com/broofa/node-mime/issues/2)
- [**closed**] ALL CAPS filenames return incorrect mime type [#1](https://github.com/broofa/node-mime/issues/1)


---
## Source: node_modules\minimist\CHANGELOG.md

# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/)
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [v1.2.8](https://github.com/minimistjs/minimist/compare/v1.2.7...v1.2.8) - 2023-02-09

### Merged

- [Fix] Fix long option followed by single dash [`#17`](https://github.com/minimistjs/minimist/pull/17)
- [Tests] Remove duplicate test [`#12`](https://github.com/minimistjs/minimist/pull/12)
- [Fix] opt.string works with multiple aliases [`#10`](https://github.com/minimistjs/minimist/pull/10)

### Fixed

- [Fix] Fix long option followed by single dash (#17) [`#15`](https://github.com/minimistjs/minimist/issues/15)
- [Tests] Remove duplicate test (#12) [`#8`](https://github.com/minimistjs/minimist/issues/8)
- [Fix] Fix long option followed by single dash [`#15`](https://github.com/minimistjs/minimist/issues/15)
- [Fix] opt.string works with multiple aliases (#10) [`#9`](https://github.com/minimistjs/minimist/issues/9)
- [Fix] Fix handling of short option with non-trivial equals [`#5`](https://github.com/minimistjs/minimist/issues/5)
- [Tests] Remove duplicate test [`#8`](https://github.com/minimistjs/minimist/issues/8)
- [Fix] opt.string works with multiple aliases [`#9`](https://github.com/minimistjs/minimist/issues/9)

### Commits

- Merge tag 'v0.2.3' [`a026794`](https://github.com/minimistjs/minimist/commit/a0267947c7870fc5847cf2d437fbe33f392767da)
- [eslint] fix indentation and whitespace [`5368ca4`](https://github.com/minimistjs/minimist/commit/5368ca4147e974138a54cc0dc4cea8f756546b70)
- [eslint] fix indentation and whitespace [`e5f5067`](https://github.com/minimistjs/minimist/commit/e5f5067259ceeaf0b098d14bec910f87e58708c7)
- [eslint] more cleanup [`62fde7d`](https://github.com/minimistjs/minimist/commit/62fde7d935f83417fb046741531a9e2346a36976)
- [eslint] more cleanup [`36ac5d0`](https://github.com/minimistjs/minimist/commit/36ac5d0d95e4947d074e5737d94814034ca335d1)
- [meta] add `auto-changelog` [`73923d2`](https://github.com/minimistjs/minimist/commit/73923d223553fca08b1ba77e3fbc2a492862ae4c)
- [actions] add reusable workflows [`d80727d`](https://github.com/minimistjs/minimist/commit/d80727df77bfa9e631044d7f16368d8f09242c91)
- [eslint] add eslint; rules to enable later are warnings [`48bc06a`](https://github.com/minimistjs/minimist/commit/48bc06a1b41f00e9cdf183db34f7a51ba70e98d4)
- [eslint] fix indentation [`34b0f1c`](https://github.com/minimistjs/minimist/commit/34b0f1ccaa45183c3c4f06a91f9b405180a6f982)
- [readme] rename and add badges [`5df0fe4`](https://github.com/minimistjs/minimist/commit/5df0fe49211bd09a3636f8686a7cb3012c3e98f0)
- [Dev Deps] switch from `covert` to `nyc` [`a48b128`](https://github.com/minimistjs/minimist/commit/a48b128fdb8d427dfb20a15273f83e38d97bef07)
- [Dev Deps] update `covert`, `tape`; remove unnecessary `tap` [`f0fb958`](https://github.com/minimistjs/minimist/commit/f0fb958e9a1fe980cdffc436a211b0bda58f621b)
- [meta] create FUNDING.yml; add `funding` in package.json [`3639e0c`](https://github.com/minimistjs/minimist/commit/3639e0c819359a366387e425ab6eabf4c78d3caa)
- [meta] use `npmignore` to autogenerate an npmignore file [`be2e038`](https://github.com/minimistjs/minimist/commit/be2e038c342d8333b32f0fde67a0026b79c8150e)
- Only apps should have lockfiles [`282b570`](https://github.com/minimistjs/minimist/commit/282b570e7489d01b03f2d6d3dabf79cd3e5f84cf)
- isConstructorOrProto adapted from PR [`ef9153f`](https://github.com/minimistjs/minimist/commit/ef9153fc52b6cea0744b2239921c5dcae4697f11)
- [Dev Deps] update `@ljharb/eslint-config`, `aud` [`098873c`](https://github.com/minimistjs/minimist/commit/098873c213cdb7c92e55ae1ef5aa1af3a8192a79)
- [Dev Deps] update `@ljharb/eslint-config`, `aud` [`3124ed3`](https://github.com/minimistjs/minimist/commit/3124ed3e46306301ebb3c834874ce0241555c2c4)
- [meta] add `safe-publish-latest` [`4b927de`](https://github.com/minimistjs/minimist/commit/4b927de696d561c636b4f43bf49d4597cb36d6d6)
- [Tests] add `aud` in `posttest` [`b32d9bd`](https://github.com/minimistjs/minimist/commit/b32d9bd0ab340f4e9f8c3a97ff2a4424f25fab8c)
- [meta] update repo URLs [`f9fdfc0`](https://github.com/minimistjs/minimist/commit/f9fdfc032c54884d9a9996a390c63cd0719bbe1a)
- [actions] Avoid 0.6 tests due to build failures [`ba92fe6`](https://github.com/minimistjs/minimist/commit/ba92fe6ebbdc0431cca9a2ea8f27beb492f5e4ec)
- [Dev Deps] update `tape` [`950eaa7`](https://github.com/minimistjs/minimist/commit/950eaa74f112e04d23e9c606c67472c46739b473)
- [Dev Deps] add missing `npmignore` dev dep [`3226afa`](https://github.com/minimistjs/minimist/commit/3226afaf09e9d127ca369742437fe6e88f752d6b)
- Merge tag 'v0.2.2' [`980d7ac`](https://github.com/minimistjs/minimist/commit/980d7ac61a0b4bd552711251ac107d506b23e41f)

## [v1.2.7](https://github.com/minimistjs/minimist/compare/v1.2.6...v1.2.7) - 2022-10-10

### Commits

- [meta] add `auto-changelog` [`0ebf4eb`](https://github.com/minimistjs/minimist/commit/0ebf4ebcd5f7787a5524d31a849ef41316b83c3c)
- [actions] add reusable workflows [`e115b63`](https://github.com/minimistjs/minimist/commit/e115b63fa9d3909f33b00a2db647ff79068388de)
- [eslint] add eslint; rules to enable later are warnings [`f58745b`](https://github.com/minimistjs/minimist/commit/f58745b9bb84348e1be72af7dbba5840c7c13013)
- [Dev Deps] switch from `covert` to `nyc` [`ab03356`](https://github.com/minimistjs/minimist/commit/ab033567b9c8b31117cb026dc7f1e592ce455c65)
- [readme] rename and add badges [`236f4a0`](https://github.com/minimistjs/minimist/commit/236f4a07e4ebe5ee44f1496ec6974991ab293ffd)
- [meta] create FUNDING.yml; add `funding` in package.json [`783a49b`](https://github.com/minimistjs/minimist/commit/783a49bfd47e8335d3098a8cac75662cf71eb32a)
- [meta] use `npmignore` to autogenerate an npmignore file [`f81ece6`](https://github.com/minimistjs/minimist/commit/f81ece6aaec2fa14e69ff4f1e0407a8c4e2635a2)
- Only apps should have lockfiles [`56cad44`](https://github.com/minimistjs/minimist/commit/56cad44c7f879b9bb5ec18fcc349308024a89bfc)
- [Dev Deps] update `covert`, `tape`; remove unnecessary `tap` [`49c5f9f`](https://github.com/minimistjs/minimist/commit/49c5f9fb7e6a92db9eb340cc679de92fb3aacded)
- [Tests] add `aud` in `posttest` [`228ae93`](https://github.com/minimistjs/minimist/commit/228ae938f3cd9db9dfd8bd7458b076a7b2aef280)
- [meta] add `safe-publish-latest` [`01fc23f`](https://github.com/minimistjs/minimist/commit/01fc23f5104f85c75059972e01dd33796ab529ff)
- [meta] update repo URLs [`6b164c7`](https://github.com/minimistjs/minimist/commit/6b164c7d68e0b6bf32f894699effdfb7c63041dd)

## [v1.2.6](https://github.com/minimistjs/minimist/compare/v1.2.5...v1.2.6) - 2022-03-21

### Commits

- test from prototype pollution PR [`bc8ecee`](https://github.com/minimistjs/minimist/commit/bc8ecee43875261f4f17eb20b1243d3ed15e70eb)
- isConstructorOrProto adapted from PR [`c2b9819`](https://github.com/minimistjs/minimist/commit/c2b981977fa834b223b408cfb860f933c9811e4d)
- security notice for additional prototype pollution issue [`ef88b93`](https://github.com/minimistjs/minimist/commit/ef88b9325f77b5ee643ccfc97e2ebda577e4c4e2)

## [v1.2.5](https://github.com/minimistjs/minimist/compare/v1.2.4...v1.2.5) - 2020-03-12

## [v1.2.4](https://github.com/minimistjs/minimist/compare/v1.2.3...v1.2.4) - 2020-03-11

### Commits

- security notice [`4cf1354`](https://github.com/minimistjs/minimist/commit/4cf1354839cb972e38496d35e12f806eea92c11f)
- additional test for constructor prototype pollution [`1043d21`](https://github.com/minimistjs/minimist/commit/1043d212c3caaf871966e710f52cfdf02f9eea4b)

## [v1.2.3](https://github.com/minimistjs/minimist/compare/v1.2.2...v1.2.3) - 2020-03-10

### Commits

- more failing proto pollution tests [`13c01a5`](https://github.com/minimistjs/minimist/commit/13c01a5327736903704984b7f65616b8476850cc)
- even more aggressive checks for protocol pollution [`38a4d1c`](https://github.com/minimistjs/minimist/commit/38a4d1caead72ef99e824bb420a2528eec03d9ab)

## [v1.2.2](https://github.com/minimistjs/minimist/compare/v1.2.1...v1.2.2) - 2020-03-10

### Commits

- failing test for protocol pollution [`0efed03`](https://github.com/minimistjs/minimist/commit/0efed0340ec8433638758f7ca0c77cb20a0bfbab)
- cleanup [`67d3722`](https://github.com/minimistjs/minimist/commit/67d3722413448d00a62963d2d30c34656a92d7e2)
- console.dir -&gt; console.log [`47acf72`](https://github.com/minimistjs/minimist/commit/47acf72c715a630bf9ea013867f47f1dd69dfc54)
- don't assign onto __proto__ [`63e7ed0`](https://github.com/minimistjs/minimist/commit/63e7ed05aa4b1889ec2f3b196426db4500cbda94)

## [v1.2.1](https://github.com/minimistjs/minimist/compare/v1.2.0...v1.2.1) - 2020-03-10

### Merged

- move the `opts['--']` example back where it belongs [`#63`](https://github.com/minimistjs/minimist/pull/63)

### Commits

- add test [`6be5dae`](https://github.com/minimistjs/minimist/commit/6be5dae35a32a987bcf4137fcd6c19c5200ee909)
- fix bad boolean regexp [`ac3fc79`](https://github.com/minimistjs/minimist/commit/ac3fc796e63b95128fdbdf67ea7fad71bd59aa76)

## [v1.2.0](https://github.com/minimistjs/minimist/compare/v1.1.3...v1.2.0) - 2015-08-24

### Commits

- failing -k=v short test [`63416b8`](https://github.com/minimistjs/minimist/commit/63416b8cd1d0d70e4714564cce465a36e4dd26d7)
- kv short fix [`6bbe145`](https://github.com/minimistjs/minimist/commit/6bbe14529166245e86424f220a2321442fe88dc3)
- failing kv short test [`f72ab7f`](https://github.com/minimistjs/minimist/commit/f72ab7f4572adc52902c9b6873cc969192f01b10)
- fixed kv test [`f5a48c3`](https://github.com/minimistjs/minimist/commit/f5a48c3e50e40ca54f00c8e84de4b4d6e9897fa8)
- enforce space between arg key and value [`86b321a`](https://github.com/minimistjs/minimist/commit/86b321affe648a8e016c095a4f0efa9d9074f502)

## [v1.1.3](https://github.com/minimistjs/minimist/compare/v1.1.2...v1.1.3) - 2015-08-06

### Commits

- add failing test - boolean alias array [`0fa3c5b`](https://github.com/minimistjs/minimist/commit/0fa3c5b3dd98551ddecf5392831b4c21211743fc)
- fix boolean values with multiple aliases [`9c0a6e7`](https://github.com/minimistjs/minimist/commit/9c0a6e7de25a273b11bbf9a7464f0bd833779795)

## [v1.1.2](https://github.com/minimistjs/minimist/compare/v1.1.1...v1.1.2) - 2015-07-22

### Commits

- Convert boolean arguments to boolean values [`8f3dc27`](https://github.com/minimistjs/minimist/commit/8f3dc27cf833f1d54671b6d0bcb55c2fe19672a9)
- use non-ancient npm, node 0.12 and iojs [`61ed1d0`](https://github.com/minimistjs/minimist/commit/61ed1d034b9ec7282764ce76f3992b1a0b4906ae)
- an older npm for 0.8 [`25cf778`](https://github.com/minimistjs/minimist/commit/25cf778b1220e7838a526832ad6972f75244054f)

## [v1.1.1](https://github.com/minimistjs/minimist/compare/v1.1.0...v1.1.1) - 2015-03-10

### Commits

- check that they type of a value is a boolean, not just that it is currently set to a boolean [`6863198`](https://github.com/minimistjs/minimist/commit/6863198e36139830ff1f20ffdceaddd93f2c1db9)
- upgrade tape, fix type issues from old tape version [`806712d`](https://github.com/minimistjs/minimist/commit/806712df91604ed02b8e39aa372b84aea659ee34)
- test for setting a boolean to a null default [`8c444fe`](https://github.com/minimistjs/minimist/commit/8c444fe89384ded7d441c120915ea60620b01dd3)
- if the previous value was a boolean, without an default (or with an alias) don't make an array either [`e5f419a`](https://github.com/minimistjs/minimist/commit/e5f419a3b5b3bc3f9e5ac71b7040621af70ed2dd)

## [v1.1.0](https://github.com/minimistjs/minimist/compare/v1.0.0...v1.1.0) - 2014-08-10

### Commits

- add support for handling "unknown" options not registered with the parser. [`6f3cc5d`](https://github.com/minimistjs/minimist/commit/6f3cc5d4e84524932a6ef2ce3592acc67cdd4383)
- reformat package.json [`02ed371`](https://github.com/minimistjs/minimist/commit/02ed37115194d3697ff358e8e25e5e66bab1d9f8)
- coverage script [`e5531ba`](https://github.com/minimistjs/minimist/commit/e5531ba0479da3b8138d3d8cac545d84ccb1c8df)
- extra fn to get 100% coverage again [`a6972da`](https://github.com/minimistjs/minimist/commit/a6972da89e56bf77642f8ec05a13b6558db93498)

## [v1.0.0](https://github.com/minimistjs/minimist/compare/v0.2.3...v1.0.0) - 2014-08-10

### Commits

- added stopEarly option [`471c7e4`](https://github.com/minimistjs/minimist/commit/471c7e4a7e910fc7ad8f9df850a186daf32c64e9)
- fix list [`fef6ae7`](https://github.com/minimistjs/minimist/commit/fef6ae79c38b9dc1c49569abb7cd04eb965eac5e)

## [v0.2.3](https://github.com/minimistjs/minimist/compare/v0.2.2...v0.2.3) - 2023-02-09

### Merged

- [Fix] Fix long option followed by single dash [`#17`](https://github.com/minimistjs/minimist/pull/17)
- [Tests] Remove duplicate test [`#12`](https://github.com/minimistjs/minimist/pull/12)
- [Fix] opt.string works with multiple aliases [`#10`](https://github.com/minimistjs/minimist/pull/10)

### Fixed

- [Fix] Fix long option followed by single dash (#17) [`#15`](https://github.com/minimistjs/minimist/issues/15)
- [Tests] Remove duplicate test (#12) [`#8`](https://github.com/minimistjs/minimist/issues/8)
- [Fix] opt.string works with multiple aliases (#10) [`#9`](https://github.com/minimistjs/minimist/issues/9)

### Commits

- [eslint] fix indentation and whitespace [`e5f5067`](https://github.com/minimistjs/minimist/commit/e5f5067259ceeaf0b098d14bec910f87e58708c7)
- [eslint] more cleanup [`36ac5d0`](https://github.com/minimistjs/minimist/commit/36ac5d0d95e4947d074e5737d94814034ca335d1)
- [eslint] fix indentation [`34b0f1c`](https://github.com/minimistjs/minimist/commit/34b0f1ccaa45183c3c4f06a91f9b405180a6f982)
- isConstructorOrProto adapted from PR [`ef9153f`](https://github.com/minimistjs/minimist/commit/ef9153fc52b6cea0744b2239921c5dcae4697f11)
- [Dev Deps] update `@ljharb/eslint-config`, `aud` [`098873c`](https://github.com/minimistjs/minimist/commit/098873c213cdb7c92e55ae1ef5aa1af3a8192a79)
- [Dev Deps] add missing `npmignore` dev dep [`3226afa`](https://github.com/minimistjs/minimist/commit/3226afaf09e9d127ca369742437fe6e88f752d6b)

## [v0.2.2](https://github.com/minimistjs/minimist/compare/v0.2.1...v0.2.2) - 2022-10-10

### Commits

- [meta] add `auto-changelog` [`73923d2`](https://github.com/minimistjs/minimist/commit/73923d223553fca08b1ba77e3fbc2a492862ae4c)
- [actions] add reusable workflows [`d80727d`](https://github.com/minimistjs/minimist/commit/d80727df77bfa9e631044d7f16368d8f09242c91)
- [eslint] add eslint; rules to enable later are warnings [`48bc06a`](https://github.com/minimistjs/minimist/commit/48bc06a1b41f00e9cdf183db34f7a51ba70e98d4)
- [readme] rename and add badges [`5df0fe4`](https://github.com/minimistjs/minimist/commit/5df0fe49211bd09a3636f8686a7cb3012c3e98f0)
- [Dev Deps] switch from `covert` to `nyc` [`a48b128`](https://github.com/minimistjs/minimist/commit/a48b128fdb8d427dfb20a15273f83e38d97bef07)
- [Dev Deps] update `covert`, `tape`; remove unnecessary `tap` [`f0fb958`](https://github.com/minimistjs/minimist/commit/f0fb958e9a1fe980cdffc436a211b0bda58f621b)
- [meta] create FUNDING.yml; add `funding` in package.json [`3639e0c`](https://github.com/minimistjs/minimist/commit/3639e0c819359a366387e425ab6eabf4c78d3caa)
- [meta] use `npmignore` to autogenerate an npmignore file [`be2e038`](https://github.com/minimistjs/minimist/commit/be2e038c342d8333b32f0fde67a0026b79c8150e)
- Only apps should have lockfiles [`282b570`](https://github.com/minimistjs/minimist/commit/282b570e7489d01b03f2d6d3dabf79cd3e5f84cf)
- [meta] add `safe-publish-latest` [`4b927de`](https://github.com/minimistjs/minimist/commit/4b927de696d561c636b4f43bf49d4597cb36d6d6)
- [Tests] add `aud` in `posttest` [`b32d9bd`](https://github.com/minimistjs/minimist/commit/b32d9bd0ab340f4e9f8c3a97ff2a4424f25fab8c)
- [meta] update repo URLs [`f9fdfc0`](https://github.com/minimistjs/minimist/commit/f9fdfc032c54884d9a9996a390c63cd0719bbe1a)

## [v0.2.1](https://github.com/minimistjs/minimist/compare/v0.2.0...v0.2.1) - 2020-03-12

## [v0.2.0](https://github.com/minimistjs/minimist/compare/v0.1.0...v0.2.0) - 2014-06-19

### Commits

- support all-boolean mode [`450a97f`](https://github.com/minimistjs/minimist/commit/450a97f6e2bc85c7a4a13185c19a818d9a5ebe69)

## [v0.1.0](https://github.com/minimistjs/minimist/compare/v0.0.10...v0.1.0) - 2014-05-12

### Commits

- Provide a mechanism to segregate -- arguments [`ce4a1e6`](https://github.com/minimistjs/minimist/commit/ce4a1e63a7e8d5ab88d2a3768adefa6af98a445a)
- documented argv['--'] [`14db0e6`](https://github.com/minimistjs/minimist/commit/14db0e6dbc6d2b9e472adaa54dad7004b364634f)
- Adding a test-case for notFlags segregation [`715c1e3`](https://github.com/minimistjs/minimist/commit/715c1e3714be223f998f6c537af6b505f0236c16)

## [v0.0.10](https://github.com/minimistjs/minimist/compare/v0.0.9...v0.0.10) - 2014-05-11

### Commits

- dedicated boolean test [`46e448f`](https://github.com/minimistjs/minimist/commit/46e448f9f513cfeb2bcc8b688b9b47ba1e515c2b)
- dedicated num test [`9bf2d36`](https://github.com/minimistjs/minimist/commit/9bf2d36f1d3b8795be90b8f7de0a937f098aa394)
- aliased values treated as strings [`1ab743b`](https://github.com/minimistjs/minimist/commit/1ab743bad4484d69f1259bed42f9531de01119de)
- cover the case of already numbers, at 100% coverage [`b2bb044`](https://github.com/minimistjs/minimist/commit/b2bb04436599d77a2ce029e8e555e25b3aa55d13)
- another test for higher coverage [`3662624`](https://github.com/minimistjs/minimist/commit/3662624be976d5489d486a856849c048d13be903)

## [v0.0.9](https://github.com/minimistjs/minimist/compare/v0.0.8...v0.0.9) - 2014-05-08

### Commits

- Eliminate `longest` fn. [`824f642`](https://github.com/minimistjs/minimist/commit/824f642038d1b02ede68b6261d1d65163390929a)

## [v0.0.8](https://github.com/minimistjs/minimist/compare/v0.0.7...v0.0.8) - 2014-02-20

### Commits

- return '' if flag is string and empty [`fa63ed4`](https://github.com/minimistjs/minimist/commit/fa63ed4651a4ef4eefddce34188e0d98d745a263)
- handle joined single letters [`66c248f`](https://github.com/minimistjs/minimist/commit/66c248f0241d4d421d193b022e9e365f11178534)

## [v0.0.7](https://github.com/minimistjs/minimist/compare/v0.0.6...v0.0.7) - 2014-02-08

### Commits

- another swap of .test for .match [`d1da408`](https://github.com/minimistjs/minimist/commit/d1da40819acbe846d89a5c02721211e3c1260dde)

## [v0.0.6](https://github.com/minimistjs/minimist/compare/v0.0.5...v0.0.6) - 2014-02-08

### Commits

- use .test() instead of .match() to not crash on non-string values in the arguments array [`7e0d1ad`](https://github.com/minimistjs/minimist/commit/7e0d1add8c9e5b9b20a4d3d0f9a94d824c578da1)

## [v0.0.5](https://github.com/minimistjs/minimist/compare/v0.0.4...v0.0.5) - 2013-09-18

### Commits

- Improve '--' handling. [`b11822c`](https://github.com/minimistjs/minimist/commit/b11822c09cc9d2460f30384d12afc0b953c037a4)

## [v0.0.4](https://github.com/minimistjs/minimist/compare/v0.0.3...v0.0.4) - 2013-09-17

## [v0.0.3](https://github.com/minimistjs/minimist/compare/v0.0.2...v0.0.3) - 2013-09-12

### Commits

- failing test for single dash preceeding a double dash [`b465514`](https://github.com/minimistjs/minimist/commit/b465514b82c9ae28972d714facd951deb2ad762b)
- fix for the dot test [`6a095f1`](https://github.com/minimistjs/minimist/commit/6a095f1d364c8fab2d6753d2291a0649315d297a)

## [v0.0.2](https://github.com/minimistjs/minimist/compare/v0.0.1...v0.0.2) - 2013-08-28

### Commits

- allow dotted aliases & defaults [`321c33e`](https://github.com/minimistjs/minimist/commit/321c33e755485faaeb44eeb1c05d33b2e0a5a7c4)
- use a better version of ff [`e40f611`](https://github.com/minimistjs/minimist/commit/e40f61114cf7be6f7947f7b3eed345853a67dbbb)

## [v0.0.1](https://github.com/minimistjs/minimist/compare/v0.0.0...v0.0.1) - 2013-06-25

### Commits

- remove trailing commas [`6ff0fa0`](https://github.com/minimistjs/minimist/commit/6ff0fa055064f15dbe06d50b89d5173a6796e1db)

## v0.0.0 - 2013-06-25

### Commits

- half of the parse test ported [`3079326`](https://github.com/minimistjs/minimist/commit/307932601325087de6cf94188eb798ffc4f3088a)
- stripped down code and a passing test from optimist [`7cced88`](https://github.com/minimistjs/minimist/commit/7cced88d82e399d1a03ed23eb667f04d3f320d10)
- ported parse tests completely over [`9448754`](https://github.com/minimistjs/minimist/commit/944875452e0820df6830b1408c26a0f7d3e1db04)
- docs, package.json [`a5bf46a`](https://github.com/minimistjs/minimist/commit/a5bf46ac9bb3bd114a9c340276c62c1091e538d5)
- move more short tests into short.js [`503edb5`](https://github.com/minimistjs/minimist/commit/503edb5c41d89c0d40831ee517154fc13b0f18b9)
- default bool test was wrong, not the code [`1b9f5db`](https://github.com/minimistjs/minimist/commit/1b9f5db4741b49962846081b68518de824992097)
- passing long tests ripped out of parse.js [`7972c4a`](https://github.com/minimistjs/minimist/commit/7972c4aff1f4803079e1668006658e2a761a0428)
- badges [`84c0370`](https://github.com/minimistjs/minimist/commit/84c037063664d42878aace715fe6572ce01b6f3b)
- all the tests now ported, some failures [`64239ed`](https://github.com/minimistjs/minimist/commit/64239edfe92c711c4eb0da254fcdfad2a5fdb605)
- failing short test [`f8a5341`](https://github.com/minimistjs/minimist/commit/f8a534112dd1138d2fad722def56a848480c446f)
- fixed the numeric test [`6b034f3`](https://github.com/minimistjs/minimist/commit/6b034f37c79342c60083ed97fd222e16928aac51)


---
## Source: node_modules\ms\license.md

The MIT License (MIT)

Copyright (c) 2020 Vercel, Inc.

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.


---
## Source: node_modules\object-inspect\CHANGELOG.md

# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/)
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [v1.13.4](https://github.com/inspect-js/object-inspect/compare/v1.13.3...v1.13.4) - 2025-02-04

### Commits

- [Fix] avoid being fooled by a `Symbol.toStringTag` [`fa5870d`](https://github.com/inspect-js/object-inspect/commit/fa5870da468a525d2f20193700f70752f506cbf7)
- [Tests] fix tests in node v6.0 - v6.4 [`2abfe1b`](https://github.com/inspect-js/object-inspect/commit/2abfe1bc3c69f9293c07c5cd65a9d7d87a628b84)
- [Dev Deps] update `es-value-fixtures`, `for-each`, `has-symbols` [`3edfb01`](https://github.com/inspect-js/object-inspect/commit/3edfb01cc8cce220fba0dfdfe2dc8bc955758cdd)

## [v1.13.3](https://github.com/inspect-js/object-inspect/compare/v1.13.2...v1.13.3) - 2024-11-09

### Commits

- [actions] split out node 10-20, and 20+ [`44395a8`](https://github.com/inspect-js/object-inspect/commit/44395a8fc1deda6718a5e125e86b9ffcaa1c7580)
- [Fix] `quoteStyle`: properly escape only the containing quotes [`5137f8f`](https://github.com/inspect-js/object-inspect/commit/5137f8f7bea69a7fc671bb683fd35f244f38fc52)
- [Refactor] clean up `quoteStyle` code [`450680c`](https://github.com/inspect-js/object-inspect/commit/450680cd50de4e689ee3b8e1d6db3a1bcf3fc18c)
- [Tests] add `quoteStyle` escaping tests [`e997c59`](https://github.com/inspect-js/object-inspect/commit/e997c595aeaea84fd98ca35d7e1c3b5ab3ae26e0)
- [Dev Deps] update `auto-changelog`, `es-value-fixtures`, `tape` [`d5a469c`](https://github.com/inspect-js/object-inspect/commit/d5a469c99ec07ccaeafc36ac4b36a93285086d48)
- [Tests] replace `aud` with `npm audit` [`fb7815f`](https://github.com/inspect-js/object-inspect/commit/fb7815f9b72cae277a04f65bbb0543f85b88be62)
- [Dev Deps] update `mock-property` [`11c817b`](https://github.com/inspect-js/object-inspect/commit/11c817bf10392aa017755962ba6bc89d731359ee)

## [v1.13.2](https://github.com/inspect-js/object-inspect/compare/v1.13.1...v1.13.2) - 2024-06-21

### Commits

- [readme] update badges [`8a51e6b`](https://github.com/inspect-js/object-inspect/commit/8a51e6bedaf389ec40cc4659e9df53e8543d176e)
- [Dev Deps] update `@ljharb/eslint-config`, `tape` [`ef05f58`](https://github.com/inspect-js/object-inspect/commit/ef05f58c9761a41416ab907299bf0fa79517014b)
- [Dev Deps] update `error-cause`, `has-tostringtag`, `tape` [`c0c6c26`](https://github.com/inspect-js/object-inspect/commit/c0c6c26c44cee6671f7c5d43d2b91d27c5c00d90)
- [Fix] Don't throw when `global` is not defined [`d4d0965`](https://github.com/inspect-js/object-inspect/commit/d4d096570f7dbd0e03266a96de11d05eb7b63e0f)
- [meta] add missing `engines.node` [`17a352a`](https://github.com/inspect-js/object-inspect/commit/17a352af6fe1ba6b70a19081674231eb1a50c940)
- [Dev Deps] update `globalthis` [`9c08884`](https://github.com/inspect-js/object-inspect/commit/9c08884aa662a149e2f11403f413927736b97da7)
- [Dev Deps] update `error-cause` [`6af352d`](https://github.com/inspect-js/object-inspect/commit/6af352d7c3929a4cc4c55768c27bf547a5e900f4)
- [Dev Deps] update `npmignore` [`94e617d`](https://github.com/inspect-js/object-inspect/commit/94e617d38831722562fa73dff4c895746861d267)
- [Dev Deps] update `mock-property` [`2ac24d7`](https://github.com/inspect-js/object-inspect/commit/2ac24d7e58cd388ad093c33249e413e05bbfd6c3)
- [Dev Deps] update `tape` [`46125e5`](https://github.com/inspect-js/object-inspect/commit/46125e58f1d1dcfb170ed3d1ea69da550ea8d77b)

## [v1.13.1](https://github.com/inspect-js/object-inspect/compare/v1.13.0...v1.13.1) - 2023-10-19

### Commits

- [Fix] in IE 8, global can !== window despite them being prototypes of each other [`30d0859`](https://github.com/inspect-js/object-inspect/commit/30d0859dc4606cf75c2410edcd5d5c6355f8d372)

## [v1.13.0](https://github.com/inspect-js/object-inspect/compare/v1.12.3...v1.13.0) - 2023-10-14

### Commits

- [New] add special handling for the global object [`431bab2`](https://github.com/inspect-js/object-inspect/commit/431bab21a490ee51d35395966a504501e8c685da)
- [Dev Deps] update `@ljharb/eslint-config`, `aud`, `tape` [`fd4f619`](https://github.com/inspect-js/object-inspect/commit/fd4f6193562b4b0e95dcf5c0201b4e8cbbc4f58d)
- [Dev Deps] update `mock-property`, `tape` [`b453f6c`](https://github.com/inspect-js/object-inspect/commit/b453f6ceeebf8a1b738a1029754092e0367a4134)
- [Dev Deps] update `error-cause` [`e8ffc57`](https://github.com/inspect-js/object-inspect/commit/e8ffc577d73b92bb6a4b00c44f14e3319e374888)
- [Dev Deps] update `tape` [`054b8b9`](https://github.com/inspect-js/object-inspect/commit/054b8b9b98633284cf989e582450ebfbbe53503c)
- [Dev Deps] temporarily remove `aud` due to breaking change in transitive deps [`2476845`](https://github.com/inspect-js/object-inspect/commit/2476845e0678dd290c541c81cd3dec8420782c52)
- [Dev Deps] pin `glob`, since v10.3.8+ requires a broken `jackspeak` [`383fa5e`](https://github.com/inspect-js/object-inspect/commit/383fa5eebc0afd705cc778a4b49d8e26452e49a8)
- [Dev Deps] pin `jackspeak` since 2.1.2+ depends on npm aliases, which kill the install process in npm &lt; 6 [`68c244c`](https://github.com/inspect-js/object-inspect/commit/68c244c5174cdd877e5dcb8ee90aa3f44b2f25be)

## [v1.12.3](https://github.com/inspect-js/object-inspect/compare/v1.12.2...v1.12.3) - 2023-01-12

### Commits

- [Fix] in eg FF 24, collections lack forEach [`75fc226`](https://github.com/inspect-js/object-inspect/commit/75fc22673c82d45f28322b1946bb0eb41b672b7f)
- [actions] update rebase action to use reusable workflow [`250a277`](https://github.com/inspect-js/object-inspect/commit/250a277a095e9dacc029ab8454dcfc15de549dcd)
- [Dev Deps] update `aud`, `es-value-fixtures`, `tape` [`66a19b3`](https://github.com/inspect-js/object-inspect/commit/66a19b3209ccc3c5ef4b34c3cb0160e65d1ce9d5)
- [Dev Deps] update `@ljharb/eslint-config`, `aud`, `error-cause` [`c43d332`](https://github.com/inspect-js/object-inspect/commit/c43d3324b48384a16fd3dc444e5fc589d785bef3)
- [Tests] add `@pkgjs/support` to `postlint` [`e2618d2`](https://github.com/inspect-js/object-inspect/commit/e2618d22a7a3fa361b6629b53c1752fddc9c4d80)

## [v1.12.2](https://github.com/inspect-js/object-inspect/compare/v1.12.1...v1.12.2) - 2022-05-26

### Commits

- [Fix] use `util.inspect` for a custom inspection symbol method [`e243bf2`](https://github.com/inspect-js/object-inspect/commit/e243bf2eda6c4403ac6f1146fddb14d12e9646c1)
- [meta] add support info [`ca20ba3`](https://github.com/inspect-js/object-inspect/commit/ca20ba35713c17068ca912a86c542f5e8acb656c)
- [Fix] ignore `cause` in node v16.9 and v16.10 where it has a bug [`86aa553`](https://github.com/inspect-js/object-inspect/commit/86aa553a4a455562c2c56f1540f0bf857b9d314b)

## [v1.12.1](https://github.com/inspect-js/object-inspect/compare/v1.12.0...v1.12.1) - 2022-05-21

### Commits

- [Tests] use `mock-property` [`4ec8893`](https://github.com/inspect-js/object-inspect/commit/4ec8893ea9bfd28065ca3638cf6762424bf44352)
- [meta] use `npmignore` to autogenerate an npmignore file [`07f868c`](https://github.com/inspect-js/object-inspect/commit/07f868c10bd25a9d18686528339bb749c211fc9a)
- [Dev Deps] update `eslint`, `@ljharb/eslint-config`, `aud`, `auto-changelog`, `tape` [`b05244b`](https://github.com/inspect-js/object-inspect/commit/b05244b4f331e00c43b3151bc498041be77ccc91)
- [Dev Deps] update `@ljharb/eslint-config`, `error-cause`, `es-value-fixtures`, `functions-have-names`, `tape` [`d037398`](https://github.com/inspect-js/object-inspect/commit/d037398dcc5d531532e4c19c4a711ed677f579c1)
- [Fix] properly handle callable regexes in older engines [`848fe48`](https://github.com/inspect-js/object-inspect/commit/848fe48bd6dd0064ba781ee6f3c5e54a94144c37)

## [v1.12.0](https://github.com/inspect-js/object-inspect/compare/v1.11.1...v1.12.0) - 2021-12-18

### Commits

- [New] add `numericSeparator` boolean option [`2d2d537`](https://github.com/inspect-js/object-inspect/commit/2d2d537f5359a4300ce1c10241369f8024f89e11)
- [Robustness] cache more prototype methods [`191533d`](https://github.com/inspect-js/object-inspect/commit/191533da8aec98a05eadd73a5a6e979c9c8653e8)
- [New] ensure an Error’s `cause` is displayed [`53bc2ce`](https://github.com/inspect-js/object-inspect/commit/53bc2cee4e5a9cc4986f3cafa22c0685f340715e)
- [Dev Deps] update `eslint`, `@ljharb/eslint-config` [`bc164b6`](https://github.com/inspect-js/object-inspect/commit/bc164b6e2e7d36b263970f16f54de63048b84a36)
- [Robustness] cache `RegExp.prototype.test` [`a314ab8`](https://github.com/inspect-js/object-inspect/commit/a314ab8271b905cbabc594c82914d2485a8daf12)
- [meta] fix auto-changelog settings [`5ed0983`](https://github.com/inspect-js/object-inspect/commit/5ed0983be72f73e32e2559997517a95525c7e20d)

## [v1.11.1](https://github.com/inspect-js/object-inspect/compare/v1.11.0...v1.11.1) - 2021-12-05

### Commits

- [meta] add `auto-changelog` [`7dbdd22`](https://github.com/inspect-js/object-inspect/commit/7dbdd228401d6025d8b7391476d88aee9ea9bbdf)
- [actions] reuse common workflows [`c8823bc`](https://github.com/inspect-js/object-inspect/commit/c8823bc0a8790729680709d45fb6e652432e91aa)
- [Dev Deps] update `eslint`, `@ljharb/eslint-config`, `safe-publish-latest`, `tape` [`7532b12`](https://github.com/inspect-js/object-inspect/commit/7532b120598307497b712890f75af8056f6d37a6)
- [Refactor] use `has-tostringtag` to behave correctly in the presence of symbol shams [`94abb5d`](https://github.com/inspect-js/object-inspect/commit/94abb5d4e745bf33253942dea86b3e538d2ff6c6)
- [actions] update codecov uploader [`5ed5102`](https://github.com/inspect-js/object-inspect/commit/5ed51025267a00e53b1341357315490ac4eb0874)
- [Dev Deps] update `eslint`, `tape` [`37b2ad2`](https://github.com/inspect-js/object-inspect/commit/37b2ad26c08d94bfd01d5d07069a0b28ef4e2ad7)
- [meta] add `sideEffects` flag [`d341f90`](https://github.com/inspect-js/object-inspect/commit/d341f905ef8bffa6a694cda6ddc5ba343532cd4f)

## [v1.11.0](https://github.com/inspect-js/object-inspect/compare/v1.10.3...v1.11.0) - 2021-07-12

### Commits

- [New] `customInspect`: add `symbol` option, to mimic modern util.inspect behavior [`e973a6e`](https://github.com/inspect-js/object-inspect/commit/e973a6e21f8140c5837cf25e9d89bdde88dc3120)
- [Dev Deps] update `eslint` [`05f1cb3`](https://github.com/inspect-js/object-inspect/commit/05f1cb3cbcfe1f238e8b51cf9bc294305b7ed793)

## [v1.10.3](https://github.com/inspect-js/object-inspect/compare/v1.10.2...v1.10.3) - 2021-05-07

### Commits

- [Fix] handle core-js Symbol shams [`4acfc2c`](https://github.com/inspect-js/object-inspect/commit/4acfc2c4b503498759120eb517abad6d51c9c5d6)
- [readme] update badges [`95c323a`](https://github.com/inspect-js/object-inspect/commit/95c323ad909d6cbabb95dd6015c190ba6db9c1f2)
- [Dev Deps] update `eslint`, `@ljharb/eslint-config`, `aud` [`cb38f48`](https://github.com/inspect-js/object-inspect/commit/cb38f485de6ec7a95109b5a9bbd0a1deba2f6611)

## [v1.10.2](https://github.com/inspect-js/object-inspect/compare/v1.10.1...v1.10.2) - 2021-04-17

### Commits

- [Fix] use a robust check for a boxed Symbol [`87f12d6`](https://github.com/inspect-js/object-inspect/commit/87f12d6e69ce530be04659c81a4cd502943acac5)

## [v1.10.1](https://github.com/inspect-js/object-inspect/compare/v1.10.0...v1.10.1) - 2021-04-17

### Commits

- [Fix] use a robust check for a boxed bigint [`d5ca829`](https://github.com/inspect-js/object-inspect/commit/d5ca8298b6d2e5c7b9334a5b21b96ed95d225c91)

## [v1.10.0](https://github.com/inspect-js/object-inspect/compare/v1.9.0...v1.10.0) - 2021-04-17

### Commits

- [Tests] increase coverage [`d8abb8a`](https://github.com/inspect-js/object-inspect/commit/d8abb8a62c2f084919df994a433b346e0d87a227)
- [actions] use `node/install` instead of `node/run`; use `codecov` action [`4bfec2e`](https://github.com/inspect-js/object-inspect/commit/4bfec2e30aaef6ddef6cbb1448306f9f8b9520b7)
- [New] respect `Symbol.toStringTag` on objects [`799b58f`](https://github.com/inspect-js/object-inspect/commit/799b58f536a45e4484633a8e9daeb0330835f175)
- [Fix] do not allow Symbol.toStringTag to masquerade as builtins [`d6c5b37`](https://github.com/inspect-js/object-inspect/commit/d6c5b37d7e94427796b82432fb0c8964f033a6ab)
- [New] add `WeakRef` support [`b6d898e`](https://github.com/inspect-js/object-inspect/commit/b6d898ee21868c780a7ee66b28532b5b34ed7f09)
- [meta] do not publish github action workflow files [`918cdfc`](https://github.com/inspect-js/object-inspect/commit/918cdfc4b6fe83f559ff6ef04fe66201e3ff5cbd)
- [meta] create `FUNDING.yml` [`0bb5fc5`](https://github.com/inspect-js/object-inspect/commit/0bb5fc516dbcd2cd728bd89cee0b580acc5ce301)
- [Dev Deps] update `eslint`, `@ljharb/eslint-config`, `aud`, `tape` [`22c8dc0`](https://github.com/inspect-js/object-inspect/commit/22c8dc0cac113d70f4781e49a950070923a671be)
- [meta] use `prepublishOnly` script for npm 7+ [`e52ee09`](https://github.com/inspect-js/object-inspect/commit/e52ee09e8050b8dbac94ef57f786675567728223)
- [Dev Deps] update `eslint` [`7c4e6fd`](https://github.com/inspect-js/object-inspect/commit/7c4e6fdedcd27cc980e13c9ad834d05a96f3d40c)

## [v1.9.0](https://github.com/inspect-js/object-inspect/compare/v1.8.0...v1.9.0) - 2020-11-30

### Commits

- [Tests] migrate tests to Github Actions [`d262251`](https://github.com/inspect-js/object-inspect/commit/d262251e13e16d3490b5473672f6b6d6ff86675d)
- [New] add enumerable own Symbols to plain object output [`ee60c03`](https://github.com/inspect-js/object-inspect/commit/ee60c033088cff9d33baa71e59a362a541b48284)
- [Tests] add passing tests [`01ac3e4`](https://github.com/inspect-js/object-inspect/commit/01ac3e4b5a30f97875a63dc9b1416b3bd626afc9)
- [actions] add "Require Allow Edits" action [`c2d7746`](https://github.com/inspect-js/object-inspect/commit/c2d774680cde4ca4af332d84d4121b26f798ba9e)
- [Dev Deps] update `eslint`, `@ljharb/eslint-config`, `aud`, `core-js` [`70058de`](https://github.com/inspect-js/object-inspect/commit/70058de1579fc54d1d15ed6c2dbe246637ce70ff)
- [Fix] hex characters in strings should be uppercased, to match node `assert` [`6ab8faa`](https://github.com/inspect-js/object-inspect/commit/6ab8faaa0abc08fe7a8e2afd8b39c6f1f0e00113)
- [Tests] run `nyc` on all tests [`4c47372`](https://github.com/inspect-js/object-inspect/commit/4c473727879ddc8e28b599202551ddaaf07b6210)
- [Tests] node 0.8 has an unpredictable property order; fix `groups` test by removing property [`f192069`](https://github.com/inspect-js/object-inspect/commit/f192069a978a3b60e6f0e0d45ac7df260ab9a778)
- [New] add enumerable properties to Function inspect result, per node’s `assert` [`fd38e1b`](https://github.com/inspect-js/object-inspect/commit/fd38e1bc3e2a1dc82091ce3e021917462eee64fc)
- [Tests] fix tests for node &lt; 10, due to regex match `groups` [`2ac6462`](https://github.com/inspect-js/object-inspect/commit/2ac6462cc4f72eaa0b63a8cfee9aabe3008b2330)
- [Dev Deps] update `eslint`, `@ljharb/eslint-config` [`44b59e2`](https://github.com/inspect-js/object-inspect/commit/44b59e2676a7f825ef530dfd19dafb599e3b9456)
- [Robustness] cache `Symbol.prototype.toString` [`f3c2074`](https://github.com/inspect-js/object-inspect/commit/f3c2074d8f32faf8292587c07c9678ea931703dd)
- [Dev Deps] update `eslint` [`9411294`](https://github.com/inspect-js/object-inspect/commit/94112944b9245e3302e25453277876402d207e7f)
- [meta] `require-allow-edits` no longer requires an explicit github token [`36c0220`](https://github.com/inspect-js/object-inspect/commit/36c02205de3c2b0e84d53777c5c9fd54a36c48ab)
- [actions] update rebase checkout action to v2 [`55a39a6`](https://github.com/inspect-js/object-inspect/commit/55a39a64e944f19c6a7d8efddf3df27700f20d14)
- [actions] switch Automatic Rebase workflow to `pull_request_target` event [`f59fd3c`](https://github.com/inspect-js/object-inspect/commit/f59fd3cf406c3a7c7ece140904a80bbc6bacfcca)
- [Dev Deps] update `eslint` [`a492bec`](https://github.com/inspect-js/object-inspect/commit/a492becec644b0155c9c4bc1caf6f9fac11fb2c7)

## [v1.8.0](https://github.com/inspect-js/object-inspect/compare/v1.7.0...v1.8.0) - 2020-06-18

### Fixed

- [New] add `indent` option [`#27`](https://github.com/inspect-js/object-inspect/issues/27)

### Commits

- [Tests] add codecov [`4324cbb`](https://github.com/inspect-js/object-inspect/commit/4324cbb1a2bd7710822a4151ff373570db22453e)
- [New] add `maxStringLength` option [`b3995cb`](https://github.com/inspect-js/object-inspect/commit/b3995cb71e15b5ee127a3094c43994df9d973502)
- [New] add `customInspect` option, to disable custom inspect methods [`28b9179`](https://github.com/inspect-js/object-inspect/commit/28b9179ee802bb3b90810100c11637db90c2fb6d)
- [Tests] add Date and RegExp tests [`3b28eca`](https://github.com/inspect-js/object-inspect/commit/3b28eca57b0367aeadffac604ea09e8bdae7d97b)
- [actions] add automatic rebasing / merge commit blocking [`0d9c6c0`](https://github.com/inspect-js/object-inspect/commit/0d9c6c044e83475ff0bfffb9d35b149834c83a2e)
- [Dev Deps] update `eslint`, `@ljharb/eslint-config`, `core-js`, `tape`; add `aud` [`7c204f2`](https://github.com/inspect-js/object-inspect/commit/7c204f22b9e41bc97147f4d32d4cb045b17769a6)
- [readme] fix repo URLs, remove testling [`34ca9a0`](https://github.com/inspect-js/object-inspect/commit/34ca9a0dabfe75bd311f806a326fadad029909a3)
- [Fix] when truncating a deep array, note it as `[Array]` instead of just `[Object]` [`f74c82d`](https://github.com/inspect-js/object-inspect/commit/f74c82dd0b35386445510deb250f34c41be3ec0e)
- [Dev Deps] update `eslint`, `@ljharb/eslint-config`, `tape` [`1a8a5ea`](https://github.com/inspect-js/object-inspect/commit/1a8a5ea069ea2bee89d77caedad83ffa23d35711)
- [Fix] do not be fooled by a function’s own `toString` method [`7cb5c65`](https://github.com/inspect-js/object-inspect/commit/7cb5c657a976f94715c19c10556a30f15bb7d5d7)
- [patch] indicate explicitly that anon functions are anonymous, to match node [`81ebdd4`](https://github.com/inspect-js/object-inspect/commit/81ebdd4215005144074bbdff3f6bafa01407910a)
- [Dev Deps] loosen the `core-js` dep [`e7472e8`](https://github.com/inspect-js/object-inspect/commit/e7472e8e242117670560bd995830c2a4d12080f5)
- [Dev Deps] update `tape` [`699827e`](https://github.com/inspect-js/object-inspect/commit/699827e6b37258b5203c33c78c009bf4b0e6a66d)
- [meta] add `safe-publish-latest` [`c5d2868`](https://github.com/inspect-js/object-inspect/commit/c5d2868d6eb33c472f37a20f89ceef2787046088)
- [Dev Deps] update `@ljharb/eslint-config` [`9199501`](https://github.com/inspect-js/object-inspect/commit/919950195d486114ccebacbdf9d74d7f382693b0)

## [v1.7.0](https://github.com/inspect-js/object-inspect/compare/v1.6.0...v1.7.0) - 2019-11-10

### Commits

- [Tests] use shared travis-ci configs [`19899ed`](https://github.com/inspect-js/object-inspect/commit/19899edbf31f4f8809acf745ce34ad1ce1bfa63b)
- [Tests] add linting [`a00f057`](https://github.com/inspect-js/object-inspect/commit/a00f057d917f66ea26dd37769c6b810ec4af97e8)
- [Tests] lint last file [`2698047`](https://github.com/inspect-js/object-inspect/commit/2698047b58af1e2e88061598ef37a75f228dddf6)
- [Tests] up to `node` `v12.7`, `v11.15`, `v10.16`, `v8.16`, `v6.17` [`589e87a`](https://github.com/inspect-js/object-inspect/commit/589e87a99cadcff4b600e6a303418e9d922836e8)
- [New] add support for `WeakMap` and `WeakSet` [`3ddb3e4`](https://github.com/inspect-js/object-inspect/commit/3ddb3e4e0c8287130c61a12e0ed9c104b1549306)
- [meta] clean up license so github can detect it properly [`27527bb`](https://github.com/inspect-js/object-inspect/commit/27527bb801520c9610c68cc3b55d6f20a2bee56d)
- [Tests] cover `util.inspect.custom` [`36d47b9`](https://github.com/inspect-js/object-inspect/commit/36d47b9c59056a57ef2f1491602c726359561800)
- [Dev Deps] update `eslint`, `@ljharb/eslint-config`, `core-js`, `tape` [`b614eaa`](https://github.com/inspect-js/object-inspect/commit/b614eaac901da0e5c69151f534671f990a94cace)
- [Tests] fix coverage thresholds [`7b7b176`](https://github.com/inspect-js/object-inspect/commit/7b7b176e15f8bd6e8b2f261ff5a493c2fe78d9c2)
- [Tests] bigint tests now can run on unflagged node [`063af31`](https://github.com/inspect-js/object-inspect/commit/063af31ce9cd13c202e3b67c07ba06dc9b7c0f81)
- [Refactor] add early bailout to `isMap` and `isSet` checks [`fc51047`](https://github.com/inspect-js/object-inspect/commit/fc5104714a3671d37e225813db79470d6335683b)
- [meta] add `funding` field [`7f9953a`](https://github.com/inspect-js/object-inspect/commit/7f9953a113eec7b064a6393cf9f90ba15f1d131b)
- [Tests] Fix invalid strict-mode syntax with hexadecimal [`a8b5425`](https://github.com/inspect-js/object-inspect/commit/a8b542503b4af1599a275209a1a99f5fdedb1ead)
- [Dev Deps] update `@ljharb/eslint-config` [`98df157`](https://github.com/inspect-js/object-inspect/commit/98df1577314d9188a3fc3f17fdcf2fba697ae1bd)
- add copyright to LICENSE [`bb69fd0`](https://github.com/inspect-js/object-inspect/commit/bb69fd017a062d299e44da1f9b2c7dcd67f621e6)
- [Tests] use `npx aud` in `posttest` [`4838353`](https://github.com/inspect-js/object-inspect/commit/4838353593974cf7f905b9ef04c03c094f0cdbe2)
- [Tests] move `0.6` to allowed failures, because it won‘t build on travis [`1bff32a`](https://github.com/inspect-js/object-inspect/commit/1bff32aa52e8aea687f0856b28ba754b3e43ebf7)

## [v1.6.0](https://github.com/inspect-js/object-inspect/compare/v1.5.0...v1.6.0) - 2018-05-02

### Commits

- [New] add support for boxed BigInt primitives [`356c66a`](https://github.com/inspect-js/object-inspect/commit/356c66a410e7aece7162c8319880a5ef647beaa9)
- [Tests] up to `node` `v10.0`, `v9.11`, `v8.11`, `v6.14`, `v4.9` [`c77b65b`](https://github.com/inspect-js/object-inspect/commit/c77b65bba593811b906b9ec57561c5cba92e2db3)
- [New] Add support for upcoming `BigInt` [`1ac548e`](https://github.com/inspect-js/object-inspect/commit/1ac548e4b27e26466c28c9a5e63e5d4e0591c31f)
- [Tests] run bigint tests in CI with --harmony-bigint flag [`d31b738`](https://github.com/inspect-js/object-inspect/commit/d31b73831880254b5c6cf5691cda9a149fbc5f04)
- [Dev Deps] update `core-js`, `tape` [`ff9eff6`](https://github.com/inspect-js/object-inspect/commit/ff9eff67113341ee1aaf80c1c22d683f43bfbccf)
- [Docs] fix example to use `safer-buffer` [`48cae12`](https://github.com/inspect-js/object-inspect/commit/48cae12a73ec6cacc955175bc56bbe6aee6a211f)

## [v1.5.0](https://github.com/inspect-js/object-inspect/compare/v1.4.1...v1.5.0) - 2017-12-25

### Commits

- [New] add `quoteStyle` option [`f5a72d2`](https://github.com/inspect-js/object-inspect/commit/f5a72d26edb3959b048f74c056ca7100a6b091e4)
- [Tests] add more test coverage [`30ebe4e`](https://github.com/inspect-js/object-inspect/commit/30ebe4e1fa943b99ecbb85be7614256d536e2759)
- [Tests] require 0.6 to pass [`99a008c`](https://github.com/inspect-js/object-inspect/commit/99a008ccace189a60fd7da18bf00e32c9572b980)

## [v1.4.1](https://github.com/inspect-js/object-inspect/compare/v1.4.0...v1.4.1) - 2017-12-19

### Commits

- [Tests] up to `node` `v9.3`, `v8.9`, `v6.12` [`6674476`](https://github.com/inspect-js/object-inspect/commit/6674476cc56acaac1bde96c84fed5ef631911906)
- [Fix] `inspect(Object(-0))` should be “Object(-0)”, not “Object(0)” [`d0a031f`](https://github.com/inspect-js/object-inspect/commit/d0a031f1cbb3024ee9982bfe364dd18a7e4d1bd3)

## [v1.4.0](https://github.com/inspect-js/object-inspect/compare/v1.3.0...v1.4.0) - 2017-10-24

### Commits

- [Tests] add `npm run coverage` [`3b48fb2`](https://github.com/inspect-js/object-inspect/commit/3b48fb25db037235eeb808f0b2830aad7aa36f70)
- [Tests] remove commented-out osx builds [`71e24db`](https://github.com/inspect-js/object-inspect/commit/71e24db8ad6ee3b9b381c5300b0475f2ba595a73)
- [New] add support for `util.inspect.custom`, in node only. [`20cca77`](https://github.com/inspect-js/object-inspect/commit/20cca7762d7e17f15b21a90793dff84acce155df)
- [Tests] up to `node` `v8.6`; use `nvm install-latest-npm` to ensure new npm doesn’t break old node [`252952d`](https://github.com/inspect-js/object-inspect/commit/252952d230d8065851dd3d4d5fe8398aae068529)
- [Tests] up to `node` `v8.8` [`4aa868d`](https://github.com/inspect-js/object-inspect/commit/4aa868d3a62914091d489dd6ec6eed194ee67cd3)
- [Dev Deps] update `core-js`, `tape` [`59483d1`](https://github.com/inspect-js/object-inspect/commit/59483d1df418f852f51fa0db7b24aa6b0209a27a)

## [v1.3.0](https://github.com/inspect-js/object-inspect/compare/v1.2.2...v1.3.0) - 2017-07-31

### Fixed

- [Fix] Map/Set: work around core-js bug &lt; v2.5.0 [`#9`](https://github.com/inspect-js/object-inspect/issues/9)

### Commits

- [New] add support for arrays with additional object keys [`0d19937`](https://github.com/inspect-js/object-inspect/commit/0d199374ee37959e51539616666f420ccb29acb9)
- [Tests] up to `node` `v8.2`, `v7.10`, `v6.11`; fix new npm breaking on older nodes [`e24784a`](https://github.com/inspect-js/object-inspect/commit/e24784a90c49117787157a12a63897c49cf89bbb)
- Only apps should have lockfiles [`c6faebc`](https://github.com/inspect-js/object-inspect/commit/c6faebcb2ee486a889a4a1c4d78c0776c7576185)
- [Dev Deps] update `tape` [`7345a0a`](https://github.com/inspect-js/object-inspect/commit/7345a0aeba7e91b888a079c10004d17696a7f586)

## [v1.2.2](https://github.com/inspect-js/object-inspect/compare/v1.2.1...v1.2.2) - 2017-03-24

### Commits

- [Tests] up to `node` `v7.7`, `v6.10`, `v4.8`; improve test matrix [`a2ddc15`](https://github.com/inspect-js/object-inspect/commit/a2ddc15a1f2c65af18076eea1c0eb9cbceb478a0)
- [Tests] up to `node` `v7.0`, `v6.9`, `v5.12`, `v4.6`, `io.js` `v3.3`; improve test matrix [`a48949f`](https://github.com/inspect-js/object-inspect/commit/a48949f6b574b2d4d2298109d8e8d0eb3e7a83e7)
- [Performance] check for primitive types as early as possible. [`3b8092a`](https://github.com/inspect-js/object-inspect/commit/3b8092a2a4deffd0575f94334f00194e2d48dad3)
- [Refactor] remove unneeded `else`s. [`7255034`](https://github.com/inspect-js/object-inspect/commit/725503402e08de4f96f6bf2d8edef44ac36f26b6)
- [Refactor] avoid recreating `lowbyte` function every time. [`81edd34`](https://github.com/inspect-js/object-inspect/commit/81edd3475bd15bdd18e84de7472033dcf5004aaa)
- [Fix] differentiate -0 from 0 [`521d345`](https://github.com/inspect-js/object-inspect/commit/521d3456b009da7bf1c5785c8a9df5a9f8718264)
- [Refactor] move object key gathering into separate function [`aca6265`](https://github.com/inspect-js/object-inspect/commit/aca626536eaeef697196c6e9db3e90e7e0355b6a)
- [Refactor] consolidate wrapping logic for boxed primitives into a function. [`4e440cd`](https://github.com/inspect-js/object-inspect/commit/4e440cd9065df04802a2a1dead03f48c353ca301)
- [Robustness] use `typeof` instead of comparing to literal `undefined` [`5ca6f60`](https://github.com/inspect-js/object-inspect/commit/5ca6f601937506daff8ed2fcf686363b55807b69)
- [Refactor] consolidate Map/Set notations. [`4e576e5`](https://github.com/inspect-js/object-inspect/commit/4e576e5d7ed2f9ec3fb7f37a0d16732eb10758a9)
- [Tests] ensure that this function remains anonymous, despite ES6 name inference. [`7540ae5`](https://github.com/inspect-js/object-inspect/commit/7540ae591278756db614fa4def55ca413150e1a3)
- [Refactor] explicitly coerce Error objects to strings. [`7f4ca84`](https://github.com/inspect-js/object-inspect/commit/7f4ca8424ee8dc2c0ca5a422d94f7fac40327261)
- [Refactor] split up `var` declarations for debuggability [`6f2c11e`](https://github.com/inspect-js/object-inspect/commit/6f2c11e6a85418586a00292dcec5e97683f89bc3)
- [Robustness] cache `Object.prototype.toString` [`df44a20`](https://github.com/inspect-js/object-inspect/commit/df44a20adfccf31529d60d1df2079bfc3c836e27)
- [Dev Deps] update `tape` [`3ec714e`](https://github.com/inspect-js/object-inspect/commit/3ec714eba57bc3f58a6eb4fca1376f49e70d300a)
- [Dev Deps] update `tape` [`beb72d9`](https://github.com/inspect-js/object-inspect/commit/beb72d969653747d7cde300393c28755375329b0)

## [v1.2.1](https://github.com/inspect-js/object-inspect/compare/v1.2.0...v1.2.1) - 2016-04-09

### Fixed

- [Fix] fix Boolean `false` object inspection. [`#7`](https://github.com/substack/object-inspect/pull/7)

## [v1.2.0](https://github.com/inspect-js/object-inspect/compare/v1.1.0...v1.2.0) - 2016-04-09

### Fixed

- [New] add support for inspecting String/Number/Boolean objects. [`#6`](https://github.com/inspect-js/object-inspect/issues/6)

### Commits

- [Dev Deps] update `tape` [`742caa2`](https://github.com/inspect-js/object-inspect/commit/742caa262cf7af4c815d4821c8bd0129c1446432)

## [v1.1.0](https://github.com/inspect-js/object-inspect/compare/1.0.2...v1.1.0) - 2015-12-14

### Merged

- [New] add ES6 Map/Set support. [`#4`](https://github.com/inspect-js/object-inspect/pull/4)

### Fixed

- [New] add ES6 Map/Set support. [`#3`](https://github.com/inspect-js/object-inspect/issues/3)

### Commits

- Update `travis.yml` to test on bunches of `iojs` and `node` versions. [`4c1fd65`](https://github.com/inspect-js/object-inspect/commit/4c1fd65cc3bd95307e854d114b90478324287fd2)
- [Dev Deps] update `tape` [`88a907e`](https://github.com/inspect-js/object-inspect/commit/88a907e33afbe408e4b5d6e4e42a33143f88848c)

## [1.0.2](https://github.com/inspect-js/object-inspect/compare/1.0.1...1.0.2) - 2015-08-07

### Commits

- [Fix] Cache `Object.prototype.hasOwnProperty` in case it's deleted later. [`1d0075d`](https://github.com/inspect-js/object-inspect/commit/1d0075d3091dc82246feeb1f9871cb2b8ed227b3)
- [Dev Deps] Update `tape` [`ca8d5d7`](https://github.com/inspect-js/object-inspect/commit/ca8d5d75635ddbf76f944e628267581e04958457)
- gitignore node_modules since this is a reusable modules. [`ed41407`](https://github.com/inspect-js/object-inspect/commit/ed41407811743ca530cdeb28f982beb96026af82)

## [1.0.1](https://github.com/inspect-js/object-inspect/compare/1.0.0...1.0.1) - 2015-07-19

### Commits

- Make `inspect` work with symbol primitives and objects, including in node 0.11 and 0.12. [`ddf1b94`](https://github.com/inspect-js/object-inspect/commit/ddf1b94475ab951f1e3bccdc0a48e9073cfbfef4)
- bump tape [`103d674`](https://github.com/inspect-js/object-inspect/commit/103d67496b504bdcfdd765d303a773f87ec106e2)
- use newer travis config [`d497276`](https://github.com/inspect-js/object-inspect/commit/d497276c1da14234bb5098a59cf20de75fbc316a)

## [1.0.0](https://github.com/inspect-js/object-inspect/compare/0.4.0...1.0.0) - 2014-08-05

### Commits

- error inspect works properly [`260a22d`](https://github.com/inspect-js/object-inspect/commit/260a22d134d3a8a482c67d52091c6040c34f4299)
- seen coverage [`57269e8`](https://github.com/inspect-js/object-inspect/commit/57269e8baa992a7439047f47325111fdcbcb8417)
- htmlelement instance coverage [`397ffe1`](https://github.com/inspect-js/object-inspect/commit/397ffe10a1980350868043ef9de65686d438979f)
- more element coverage [`6905cc2`](https://github.com/inspect-js/object-inspect/commit/6905cc2f7df35600177e613b0642b4df5efd3eca)
- failing test for type errors [`385b615`](https://github.com/inspect-js/object-inspect/commit/385b6152e49b51b68449a662f410b084ed7c601a)
- fn name coverage [`edc906d`](https://github.com/inspect-js/object-inspect/commit/edc906d40fca6b9194d304062c037ee8e398c4c2)
- server-side element test [`362d1d3`](https://github.com/inspect-js/object-inspect/commit/362d1d3e86f187651c29feeb8478110afada385b)
- custom inspect fn [`e89b0f6`](https://github.com/inspect-js/object-inspect/commit/e89b0f6fe6d5e03681282af83732a509160435a6)
- fixed browser test [`b530882`](https://github.com/inspect-js/object-inspect/commit/b5308824a1c8471c5617e394766a03a6977102a9)
- depth test, matches node [`1cfd9e0`](https://github.com/inspect-js/object-inspect/commit/1cfd9e0285a4ae1dff44101ad482915d9bf47e48)
- exercise hasOwnProperty path [`8d753fb`](https://github.com/inspect-js/object-inspect/commit/8d753fb362a534fa1106e4d80f2ee9bea06a66d9)
- more cases covered for errors [`c5c46a5`](https://github.com/inspect-js/object-inspect/commit/c5c46a569ec4606583497e8550f0d8c7ad39a4a4)
- \W obj key test case [`b0eceee`](https://github.com/inspect-js/object-inspect/commit/b0eceeea6e0eb94d686c1046e99b9e25e5005f75)
- coverage for explicit depth param [`e12b91c`](https://github.com/inspect-js/object-inspect/commit/e12b91cd59683362f3a0e80f46481a0211e26c15)

## [0.4.0](https://github.com/inspect-js/object-inspect/compare/0.3.1...0.4.0) - 2014-03-21

### Commits

- passing lowbyte interpolation test [`b847511`](https://github.com/inspect-js/object-inspect/commit/b8475114f5def7e7961c5353d48d3d8d9a520985)
- lowbyte test [`4a2b0e1`](https://github.com/inspect-js/object-inspect/commit/4a2b0e142667fc933f195472759385ac08f3946c)

## [0.3.1](https://github.com/inspect-js/object-inspect/compare/0.3.0...0.3.1) - 2014-03-04

### Commits

- sort keys [`a07b19c`](https://github.com/inspect-js/object-inspect/commit/a07b19cc3b1521a82d4fafb6368b7a9775428a05)

## [0.3.0](https://github.com/inspect-js/object-inspect/compare/0.2.0...0.3.0) - 2014-03-04

### Commits

- [] and {} instead of [ ] and { } [`654c44b`](https://github.com/inspect-js/object-inspect/commit/654c44b2865811f3519e57bb8526e0821caf5c6b)

## [0.2.0](https://github.com/inspect-js/object-inspect/compare/0.1.3...0.2.0) - 2014-03-04

### Commits

- failing holes test [`99cdfad`](https://github.com/inspect-js/object-inspect/commit/99cdfad03c6474740275a75636fe6ca86c77737a)
- regex already work [`e324033`](https://github.com/inspect-js/object-inspect/commit/e324033267025995ec97d32ed0a65737c99477a6)
- failing undef/null test [`1f88a00`](https://github.com/inspect-js/object-inspect/commit/1f88a00265d3209719dda8117b7e6360b4c20943)
- holes in the all example [`7d345f3`](https://github.com/inspect-js/object-inspect/commit/7d345f3676dcbe980cff89a4f6c243269ebbb709)
- check for .inspect(), fixes Buffer use-case [`c3f7546`](https://github.com/inspect-js/object-inspect/commit/c3f75466dbca125347d49847c05262c292f12b79)
- fixes for holes [`ce25f73`](https://github.com/inspect-js/object-inspect/commit/ce25f736683de4b92ff27dc5471218415e2d78d8)
- weird null behavior [`405c1ea`](https://github.com/inspect-js/object-inspect/commit/405c1ea72cd5a8cf3b498c3eaa903d01b9fbcab5)
- tape is actually a devDependency, upgrade [`703b0ce`](https://github.com/inspect-js/object-inspect/commit/703b0ce6c5817b4245a082564bccd877e0bb6990)
- put date in the example [`a342219`](https://github.com/inspect-js/object-inspect/commit/a3422190eeaa013215f46df2d0d37b48595ac058)
- passing the null test [`4ab737e`](https://github.com/inspect-js/object-inspect/commit/4ab737ebf862a75d247ebe51e79307a34d6380d4)

## [0.1.3](https://github.com/inspect-js/object-inspect/compare/0.1.1...0.1.3) - 2013-07-26

### Commits

- special isElement() check [`882768a`](https://github.com/inspect-js/object-inspect/commit/882768a54035d30747be9de1baf14e5aa0daa128)
- oh right old IEs don't have indexOf either [`36d1275`](https://github.com/inspect-js/object-inspect/commit/36d12756c38b08a74370b0bb696c809e529913a5)

## [0.1.1](https://github.com/inspect-js/object-inspect/compare/0.1.0...0.1.1) - 2013-07-26

### Commits

- tests! [`4422fd9`](https://github.com/inspect-js/object-inspect/commit/4422fd95532c2745aa6c4f786f35f1090be29998)
- fix for ie&lt;9, doesn't have hasOwnProperty [`6b7d611`](https://github.com/inspect-js/object-inspect/commit/6b7d61183050f6da801ea04473211da226482613)
- fix for all IEs: no f.name [`4e0c2f6`](https://github.com/inspect-js/object-inspect/commit/4e0c2f6dfd01c306d067d7163319acc97c94ee50)
- badges [`5ed0d88`](https://github.com/inspect-js/object-inspect/commit/5ed0d88e4e407f9cb327fa4a146c17921f9680f3)

## [0.1.0](https://github.com/inspect-js/object-inspect/compare/0.0.0...0.1.0) - 2013-07-26

### Commits

- [Function] for functions [`ad5c485`](https://github.com/inspect-js/object-inspect/commit/ad5c485098fc83352cb540a60b2548ca56820e0b)

## 0.0.0 - 2013-07-26

### Commits

- working browser example [`34be6b6`](https://github.com/inspect-js/object-inspect/commit/34be6b6548f9ce92bdc3c27572857ba0c4a1218d)
- package.json etc [`cad51f2`](https://github.com/inspect-js/object-inspect/commit/cad51f23fc6bcf1a456ed6abe16088256c2f632f)
- docs complete [`b80cce2`](https://github.com/inspect-js/object-inspect/commit/b80cce2490c4e7183a9ee11ea89071f0abec4446)
- circular example [`4b4a7b9`](https://github.com/inspect-js/object-inspect/commit/4b4a7b92209e4e6b4630976cb6bcd17d14165a59)
- string rep [`7afb479`](https://github.com/inspect-js/object-inspect/commit/7afb479baa798d27f09e0a178b72ea327f60f5c8)


---
## Source: node_modules\qs\CHANGELOG.md

## **6.14.0**
- [New] `parse`: add `throwOnParameterLimitExceeded` option (#517)
- [Refactor] `parse`: use `utils.combine` more
- [patch] `parse`: add explicit `throwOnLimitExceeded` default
- [actions] use shared action; re-add finishers
- [meta] Fix changelog formatting bug
- [Deps] update `side-channel`
- [Dev Deps] update `es-value-fixtures`, `has-bigints`, `has-proto`, `has-symbols`
- [Tests] increase coverage

## **6.13.1**
- [Fix] `stringify`: avoid a crash when a `filter` key is `null`
- [Fix] `utils.merge`: functions should not be stringified into keys
- [Fix] `parse`: avoid a crash with interpretNumericEntities: true, comma: true, and iso charset
- [Fix] `stringify`: ensure a non-string `filter` does not crash
- [Refactor] use `__proto__` syntax instead of `Object.create` for null objects
- [Refactor] misc cleanup
- [Tests] `utils.merge`: add some coverage
- [Tests] fix a test case
- [actions] split out node 10-20, and 20+
- [Dev Deps] update `es-value-fixtures`, `mock-property`, `object-inspect`, `tape`

## **6.13.0**
- [New] `parse`: add `strictDepth` option (#511)
- [Tests] use `npm audit` instead of `aud`

## **6.12.3**
- [Fix] `parse`: properly account for `strictNullHandling` when `allowEmptyArrays`
- [meta] fix changelog indentation

## **6.12.2**
- [Fix] `parse`: parse encoded square brackets (#506)
- [readme] add CII best practices badge

## **6.12.1**
- [Fix] `parse`: Disable `decodeDotInKeys` by default to restore previous behavior (#501)
- [Performance] `utils`: Optimize performance under large data volumes, reduce memory usage, and speed up processing (#502)
- [Refactor] `utils`: use `+=`
- [Tests] increase coverage

## **6.12.0**

- [New] `parse`/`stringify`: add `decodeDotInKeys`/`encodeDotKeys` options (#488)
- [New] `parse`: add `duplicates` option
- [New] `parse`/`stringify`: add `allowEmptyArrays` option to allow [] in object values (#487)
- [Refactor] `parse`/`stringify`: move allowDots config logic to its own variable
- [Refactor] `stringify`: move option-handling code into `normalizeStringifyOptions`
- [readme] update readme, add logos (#484)
- [readme] `stringify`: clarify default `arrayFormat` behavior
- [readme] fix line wrapping
- [readme] remove dead badges
- [Deps] update `side-channel`
- [meta] make the dist build 50% smaller
- [meta] add `sideEffects` flag
- [meta] run build in prepack, not prepublish
- [Tests] `parse`: remove useless tests; add coverage
- [Tests] `stringify`: increase coverage
- [Tests] use `mock-property`
- [Tests] `stringify`: improve coverage
- [Dev Deps] update `@ljharb/eslint-config `, `aud`, `has-override-mistake`, `has-property-descriptors`, `mock-property`, `npmignore`, `object-inspect`, `tape`
- [Dev Deps] pin `glob`, since v10.3.8+ requires a broken `jackspeak`
- [Dev Deps] pin `jackspeak` since 2.1.2+ depends on npm aliases, which kill the install process in npm < 6

## **6.11.2**
- [Fix] `parse`: Fix parsing when the global Object prototype is frozen (#473)
- [Tests] add passing test cases with empty keys (#473)

## **6.11.1**
- [Fix] `stringify`: encode comma values more consistently (#463)
- [readme] add usage of `filter` option for injecting custom serialization, i.e. of custom types (#447)
- [meta] remove extraneous code backticks (#457)
- [meta] fix changelog markdown
- [actions] update checkout action
- [actions] restrict action permissions
- [Dev Deps] update `@ljharb/eslint-config`, `aud`, `object-inspect`, `tape`

## **6.11.0**
- [New] [Fix] `stringify`: revert 0e903c0; add `commaRoundTrip` option (#442)
- [readme] fix version badge

## **6.10.5**
- [Fix] `stringify`: with `arrayFormat: comma`, properly include an explicit `[]` on a single-item array (#434)

## **6.10.4**
- [Fix] `stringify`: with `arrayFormat: comma`, include an explicit `[]` on a single-item array (#441)
- [meta] use `npmignore` to autogenerate an npmignore file
- [Dev Deps] update `eslint`, `@ljharb/eslint-config`, `aud`, `has-symbol`, `object-inspect`, `tape`

## **6.10.3**
- [Fix] `parse`: ignore `__proto__` keys (#428)
- [Robustness] `stringify`: avoid relying on a global `undefined` (#427)
- [actions] reuse common workflows
- [Dev Deps] update `eslint`, `@ljharb/eslint-config`, `object-inspect`, `tape`

## **6.10.2**
- [Fix] `stringify`: actually fix cyclic references (#426)
- [Fix] `stringify`: avoid encoding arrayformat comma when `encodeValuesOnly = true` (#424)
- [readme] remove travis badge; add github actions/codecov badges; update URLs
- [Docs] add note and links for coercing primitive values (#408)
- [actions] update codecov uploader
- [actions] update workflows
- [Tests] clean up stringify tests slightly
- [Dev Deps] update `eslint`, `@ljharb/eslint-config`, `aud`, `object-inspect`, `safe-publish-latest`, `tape`

## **6.10.1**
- [Fix] `stringify`: avoid exception on repeated object values (#402)

## **6.10.0**
- [New] `stringify`: throw on cycles, instead of an infinite loop (#395, #394, #393)
- [New] `parse`: add `allowSparse` option for collapsing arrays with missing indices (#312)
- [meta] fix README.md (#399)
- [meta] only run `npm run dist` in publish, not install
- [Dev Deps] update `eslint`, `@ljharb/eslint-config`, `aud`, `has-symbols`, `tape`
- [Tests] fix tests on node v0.6
- [Tests] use `ljharb/actions/node/install` instead of `ljharb/actions/node/run`
- [Tests] Revert "[meta] ignore eclint transitive audit warning"

## **6.9.7**
- [Fix] `parse`: ignore `__proto__` keys (#428)
- [Fix] `stringify`: avoid encoding arrayformat comma when `encodeValuesOnly = true` (#424)
- [Robustness] `stringify`: avoid relying on a global `undefined` (#427)
- [readme] remove travis badge; add github actions/codecov badges; update URLs
- [Docs] add note and links for coercing primitive values (#408)
- [Tests] clean up stringify tests slightly
- [meta] fix README.md (#399)
- Revert "[meta] ignore eclint transitive audit warning"
- [actions] backport actions from main
- [Dev Deps] backport updates from main

## **6.9.6**
- [Fix] restore `dist` dir; mistakenly removed in d4f6c32

## **6.9.5**
- [Fix] `stringify`: do not encode parens for RFC1738
- [Fix] `stringify`: fix arrayFormat comma with empty array/objects (#350)
- [Refactor] `format`: remove `util.assign` call
- [meta] add "Allow Edits" workflow; update rebase workflow
- [actions] switch Automatic Rebase workflow to `pull_request_target` event
- [Tests] `stringify`: add tests for #378
- [Tests] migrate tests to Github Actions
- [Tests] run `nyc` on all tests; use `tape` runner
- [Dev Deps] update `eslint`, `@ljharb/eslint-config`, `browserify`, `mkdirp`, `object-inspect`, `tape`; add `aud`

## **6.9.4**
- [Fix] `stringify`: when `arrayFormat` is `comma`, respect `serializeDate` (#364)
- [Refactor] `stringify`: reduce branching (part of #350)
- [Refactor] move `maybeMap` to `utils`
- [Dev Deps] update `browserify`, `tape`

## **6.9.3**
- [Fix] proper comma parsing of URL-encoded commas (#361)
- [Fix] parses comma delimited array while having percent-encoded comma treated as normal text (#336)

## **6.9.2**
- [Fix] `parse`: Fix parsing array from object with `comma` true (#359)
- [Fix] `parse`: throw a TypeError instead of an Error for bad charset (#349)
- [meta] ignore eclint transitive audit warning
- [meta] fix indentation in package.json
- [meta] add tidelift marketing copy
- [Dev Deps] update `eslint`, `@ljharb/eslint-config`, `object-inspect`, `has-symbols`, `tape`, `mkdirp`, `iconv-lite`
- [actions] add automatic rebasing / merge commit blocking

## **6.9.1**
- [Fix] `parse`: with comma true, handle field that holds an array of arrays (#335)
- [Fix] `parse`: with comma true, do not split non-string values (#334)
- [meta] add `funding` field
- [Dev Deps] update `eslint`, `@ljharb/eslint-config`
- [Tests] use shared travis-ci config

## **6.9.0**
- [New] `parse`/`stringify`: Pass extra key/value argument to `decoder` (#333)
- [Dev Deps] update `eslint`, `@ljharb/eslint-config`, `evalmd`
- [Tests] `parse`: add passing `arrayFormat` tests
- [Tests] add `posttest` using `npx aud` to run `npm audit` without a lockfile
- [Tests] up to `node` `v12.10`, `v11.15`, `v10.16`, `v8.16`
- [Tests] `Buffer.from` in node v5.0-v5.9 and v4.0-v4.4 requires a TypedArray

## **6.8.3**
- [Fix] `parse`: ignore `__proto__` keys (#428)
- [Robustness] `stringify`: avoid relying on a global `undefined` (#427)
- [Fix] `stringify`: avoid encoding arrayformat comma when `encodeValuesOnly = true` (#424)
- [readme] remove travis badge; add github actions/codecov badges; update URLs
- [Tests] clean up stringify tests slightly
- [Docs] add note and links for coercing primitive values (#408)
- [meta] fix README.md (#399)
- [actions] backport actions from main
- [Dev Deps] backport updates from main
- [Refactor] `stringify`: reduce branching
- [meta] do not publish workflow files

## **6.8.2**
- [Fix] proper comma parsing of URL-encoded commas (#361)
- [Fix] parses comma delimited array while having percent-encoded comma treated as normal text (#336)

## **6.8.1**
- [Fix] `parse`: Fix parsing array from object with `comma` true (#359)
- [Fix] `parse`: throw a TypeError instead of an Error for bad charset (#349)
- [Fix] `parse`: with comma true, handle field that holds an array of arrays (#335)
- [fix] `parse`: with comma true, do not split non-string values (#334)
- [meta] add tidelift marketing copy
- [meta] add `funding` field
- [Dev Deps] update `eslint`, `@ljharb/eslint-config`, `tape`, `safe-publish-latest`, `evalmd`, `has-symbols`, `iconv-lite`, `mkdirp`, `object-inspect`
- [Tests] `parse`: add passing `arrayFormat` tests
- [Tests] use shared travis-ci configs
- [Tests] `Buffer.from` in node v5.0-v5.9 and v4.0-v4.4 requires a TypedArray
- [actions] add automatic rebasing / merge commit blocking

## **6.8.0**
- [New] add `depth=false` to preserve the original key; [Fix] `depth=0` should preserve the original key (#326)
- [New] [Fix] stringify symbols and bigints
- [Fix] ensure node 0.12 can stringify Symbols
- [Fix] fix for an impossible situation: when the formatter is called with a non-string value
- [Refactor] `formats`: tiny bit of cleanup.
- [Dev Deps] update `eslint`, `@ljharb/eslint-config`, `browserify`, `safe-publish-latest`, `iconv-lite`, `tape`
- [Tests] add tests for `depth=0` and `depth=false` behavior, both current and intuitive/intended (#326)
- [Tests] use `eclint` instead of `editorconfig-tools`
- [docs] readme: add security note
- [meta] add github sponsorship
- [meta] add FUNDING.yml
- [meta] Clean up license text so it’s properly detected as BSD-3-Clause

## **6.7.3**
- [Fix] `parse`: ignore `__proto__` keys (#428)
- [Fix] `stringify`: avoid encoding arrayformat comma when `encodeValuesOnly = true` (#424)
- [Robustness] `stringify`: avoid relying on a global `undefined` (#427)
- [readme] remove travis badge; add github actions/codecov badges; update URLs
- [Docs] add note and links for coercing primitive values (#408)
- [meta] fix README.md (#399)
- [meta] do not publish workflow files
- [actions] backport actions from main
- [Dev Deps] backport updates from main
- [Tests] use `nyc` for coverage
- [Tests] clean up stringify tests slightly

## **6.7.2**
- [Fix] proper comma parsing of URL-encoded commas (#361)
- [Fix] parses comma delimited array while having percent-encoded comma treated as normal text (#336)

## **6.7.1**
- [Fix] `parse`: Fix parsing array from object with `comma` true (#359)
- [Fix] `parse`: with comma true, handle field that holds an array of arrays (#335)
- [fix] `parse`: with comma true, do not split non-string values (#334)
- [Fix] `parse`: throw a TypeError instead of an Error for bad charset (#349)
- [Fix] fix for an impossible situation: when the formatter is called with a non-string value
- [Refactor] `formats`: tiny bit of cleanup.
- readme: add security note
- [meta] add tidelift marketing copy
- [meta] add `funding` field
- [meta] add FUNDING.yml
- [meta] Clean up license text so it’s properly detected as BSD-3-Clause
- [Dev Deps] update `eslint`, `@ljharb/eslint-config`, `tape`, `safe-publish-latest`, `evalmd`, `iconv-lite`, `mkdirp`, `object-inspect`, `browserify`
- [Tests] `parse`: add passing `arrayFormat` tests
- [Tests] use shared travis-ci configs
- [Tests] `Buffer.from` in node v5.0-v5.9 and v4.0-v4.4 requires a TypedArray
- [Tests] add tests for `depth=0` and `depth=false` behavior, both current and intuitive/intended
- [Tests] use `eclint` instead of `editorconfig-tools`
- [actions] add automatic rebasing / merge commit blocking

## **6.7.0**
- [New] `stringify`/`parse`: add `comma` as an `arrayFormat` option (#276, #219)
- [Fix] correctly parse nested arrays (#212)
- [Fix] `utils.merge`: avoid a crash with a null target and a truthy non-array source, also with an array source
- [Robustness] `stringify`: cache `Object.prototype.hasOwnProperty`
- [Refactor] `utils`: `isBuffer`: small tweak; add tests
- [Refactor] use cached `Array.isArray`
- [Refactor] `parse`/`stringify`: make a function to normalize the options
- [Refactor] `utils`: reduce observable [[Get]]s
- [Refactor] `stringify`/`utils`: cache `Array.isArray`
- [Tests] always use `String(x)` over `x.toString()`
- [Tests] fix Buffer tests to work in node < 4.5 and node < 5.10
- [Tests] temporarily allow coverage to fail

## **6.6.1**
- [Fix] `parse`: ignore `__proto__` keys (#428)
- [Fix] fix for an impossible situation: when the formatter is called with a non-string value
- [Fix] `utils.merge`: avoid a crash with a null target and an array source
- [Fix] `utils.merge`: avoid a crash with a null target and a truthy non-array source
- [Fix] correctly parse nested arrays
- [Robustness] `stringify`: avoid relying on a global `undefined` (#427)
- [Robustness] `stringify`: cache `Object.prototype.hasOwnProperty`
- [Refactor] `formats`: tiny bit of cleanup.
- [Refactor] `utils`: `isBuffer`: small tweak; add tests
- [Refactor]: `stringify`/`utils`: cache `Array.isArray`
- [Refactor] `utils`: reduce observable [[Get]]s
- [Refactor] use cached `Array.isArray`
- [Refactor] `parse`/`stringify`: make a function to normalize the options
- [readme] remove travis badge; add github actions/codecov badges; update URLs
- [Docs] Clarify the need for "arrayLimit" option
- [meta] fix README.md (#399)
- [meta] do not publish workflow files
- [meta] Clean up license text so it’s properly detected as BSD-3-Clause
- [meta] add FUNDING.yml
- [meta] Fixes typo in CHANGELOG.md
- [actions] backport actions from main
- [Tests] fix Buffer tests to work in node < 4.5 and node < 5.10
- [Tests] always use `String(x)` over `x.toString()`
- [Dev Deps] backport from main

## **6.6.0**
- [New] Add support for iso-8859-1, utf8 "sentinel" and numeric entities (#268)
- [New] move two-value combine to a `utils` function (#189)
- [Fix] `stringify`: fix a crash with `strictNullHandling` and a custom `filter`/`serializeDate` (#279)
- [Fix] when `parseArrays` is false, properly handle keys ending in `[]` (#260)
- [Fix] `stringify`: do not crash in an obscure combo of `interpretNumericEntities`, a bad custom `decoder`, & `iso-8859-1`
- [Fix] `utils`: `merge`: fix crash when `source` is a truthy primitive & no options are provided
- [refactor] `stringify`: Avoid arr = arr.concat(...), push to the existing instance (#269)
- [Refactor] `parse`: only need to reassign the var once
- [Refactor] `parse`/`stringify`: clean up `charset` options checking; fix defaults
- [Refactor] add missing defaults
- [Refactor] `parse`: one less `concat` call
- [Refactor] `utils`: `compactQueue`: make it explicitly side-effecting
- [Dev Deps] update `browserify`, `eslint`, `@ljharb/eslint-config`, `iconv-lite`, `safe-publish-latest`, `tape`
- [Tests] up to `node` `v10.10`, `v9.11`, `v8.12`, `v6.14`, `v4.9`; pin included builds to LTS

## **6.5.3**
- [Fix] `parse`: ignore `__proto__` keys (#428)
- [Fix] `utils.merge`: avoid a crash with a null target and a truthy non-array source
- [Fix] correctly parse nested arrays
- [Fix] `stringify`: fix a crash with `strictNullHandling` and a custom `filter`/`serializeDate` (#279)
- [Fix] `utils`: `merge`: fix crash when `source` is a truthy primitive & no options are provided
- [Fix] when `parseArrays` is false, properly handle keys ending in `[]`
- [Fix] fix for an impossible situation: when the formatter is called with a non-string value
- [Fix] `utils.merge`: avoid a crash with a null target and an array source
- [Refactor] `utils`: reduce observable [[Get]]s
- [Refactor] use cached `Array.isArray`
- [Refactor] `stringify`: Avoid arr = arr.concat(...), push to the existing instance (#269)
- [Refactor] `parse`: only need to reassign the var once
- [Robustness] `stringify`: avoid relying on a global `undefined` (#427)
- [readme] remove travis badge; add github actions/codecov badges; update URLs
- [Docs] Clean up license text so it’s properly detected as BSD-3-Clause
- [Docs] Clarify the need for "arrayLimit" option
- [meta] fix README.md (#399)
- [meta] add FUNDING.yml
- [actions] backport actions from main
- [Tests] always use `String(x)` over `x.toString()`
- [Tests] remove nonexistent tape option
- [Dev Deps] backport from main

## **6.5.2**
- [Fix] use `safer-buffer` instead of `Buffer` constructor
- [Refactor] utils: `module.exports` one thing, instead of mutating `exports` (#230)
- [Dev Deps] update `browserify`, `eslint`, `iconv-lite`, `safer-buffer`, `tape`, `browserify`

## **6.5.1**
- [Fix] Fix parsing & compacting very deep objects (#224)
- [Refactor] name utils functions
- [Dev Deps] update `eslint`, `@ljharb/eslint-config`, `tape`
- [Tests] up to `node` `v8.4`; use `nvm install-latest-npm` so newer npm doesn’t break older node
- [Tests] Use precise dist for Node.js 0.6 runtime (#225)
- [Tests] make 0.6 required, now that it’s passing
- [Tests] on `node` `v8.2`; fix npm on node 0.6

## **6.5.0**
- [New] add `utils.assign`
- [New] pass default encoder/decoder to custom encoder/decoder functions (#206)
- [New] `parse`/`stringify`: add `ignoreQueryPrefix`/`addQueryPrefix` options, respectively (#213)
- [Fix] Handle stringifying empty objects with addQueryPrefix (#217)
- [Fix] do not mutate `options` argument (#207)
- [Refactor] `parse`: cache index to reuse in else statement (#182)
- [Docs] add various badges to readme (#208)
- [Dev Deps] update `eslint`, `browserify`, `iconv-lite`, `tape`
- [Tests] up to `node` `v8.1`, `v7.10`, `v6.11`; npm v4.6 breaks on node < v1; npm v5+ breaks on node < v4
- [Tests] add `editorconfig-tools`

## **6.4.1**
- [Fix] `parse`: ignore `__proto__` keys (#428)
- [Fix] fix for an impossible situation: when the formatter is called with a non-string value
- [Fix] use `safer-buffer` instead of `Buffer` constructor
- [Fix] `utils.merge`: avoid a crash with a null target and an array source
- [Fix] `utils.merge`: avoid a crash with a null target and a truthy non-array source
- [Fix] `stringify`: fix a crash with `strictNullHandling` and a custom `filter`/`serializeDate` (#279)
- [Fix] `utils`: `merge`: fix crash when `source` is a truthy primitive & no options are provided
- [Fix] when `parseArrays` is false, properly handle keys ending in `[]`
- [Robustness] `stringify`: avoid relying on a global `undefined` (#427)
- [Refactor] use cached `Array.isArray`
- [Refactor] `stringify`: Avoid arr = arr.concat(...), push to the existing instance (#269)
- [readme] remove travis badge; add github actions/codecov badges; update URLs
- [Docs] Clarify the need for "arrayLimit" option
- [meta] fix README.md (#399)
- [meta] Clean up license text so it’s properly detected as BSD-3-Clause
- [meta] add FUNDING.yml
- [actions] backport actions from main
- [Tests] remove nonexistent tape option
- [Dev Deps] backport from main

## **6.4.0**
- [New] `qs.stringify`: add `encodeValuesOnly` option
- [Fix] follow `allowPrototypes` option during merge (#201, #201)
- [Fix] support keys starting with brackets (#202, #200)
- [Fix] chmod a-x
- [Dev Deps] update `eslint`
- [Tests] up to `node` `v7.7`, `v6.10`,` v4.8`; disable osx builds since they block linux builds
- [eslint] reduce warnings

## **6.3.3**
- [Fix] `parse`: ignore `__proto__` keys (#428)
- [Fix] fix for an impossible situation: when the formatter is called with a non-string value
- [Fix] `utils.merge`: avoid a crash with a null target and an array source
- [Fix] `utils.merge`: avoid a crash with a null target and a truthy non-array source
- [Fix] `stringify`: fix a crash with `strictNullHandling` and a custom `filter`/`serializeDate` (#279)
- [Fix] `utils`: `merge`: fix crash when `source` is a truthy primitive & no options are provided
- [Fix] when `parseArrays` is false, properly handle keys ending in `[]`
- [Robustness] `stringify`: avoid relying on a global `undefined` (#427)
- [Refactor] use cached `Array.isArray`
- [Refactor] `stringify`: Avoid arr = arr.concat(...), push to the existing instance (#269)
- [Docs] Clarify the need for "arrayLimit" option
- [meta] fix README.md (#399)
- [meta] Clean up license text so it’s properly detected as BSD-3-Clause
- [meta] add FUNDING.yml
- [actions] backport actions from main
- [Tests] use `safer-buffer` instead of `Buffer` constructor
- [Tests] remove nonexistent tape option
- [Dev Deps] backport from main

## **6.3.2**
- [Fix] follow `allowPrototypes` option during merge (#201, #200)
- [Dev Deps] update `eslint`
- [Fix] chmod a-x
- [Fix] support keys starting with brackets (#202, #200)
- [Tests] up to `node` `v7.7`, `v6.10`,` v4.8`; disable osx builds since they block linux builds

## **6.3.1**
- [Fix] ensure that `allowPrototypes: false` does not ever shadow Object.prototype properties (thanks, @snyk!)
- [Dev Deps] update `eslint`, `@ljharb/eslint-config`, `browserify`, `iconv-lite`, `qs-iconv`, `tape`
- [Tests] on all node minors; improve test matrix
- [Docs] document stringify option `allowDots` (#195)
- [Docs] add empty object and array values example (#195)
- [Docs] Fix minor inconsistency/typo (#192)
- [Docs] document stringify option `sort` (#191)
- [Refactor] `stringify`: throw faster with an invalid encoder
- [Refactor] remove unnecessary escapes (#184)
- Remove contributing.md, since `qs` is no longer part of `hapi` (#183)

## **6.3.0**
- [New] Add support for RFC 1738 (#174, #173)
- [New] `stringify`: Add `serializeDate` option to customize Date serialization (#159)
- [Fix] ensure `utils.merge` handles merging two arrays
- [Refactor] only constructors should be capitalized
- [Refactor] capitalized var names are for constructors only
- [Refactor] avoid using a sparse array
- [Robustness] `formats`: cache `String#replace`
- [Dev Deps] update `browserify`, `eslint`, `@ljharb/eslint-config`; add `safe-publish-latest`
- [Tests] up to `node` `v6.8`, `v4.6`; improve test matrix
- [Tests] flesh out arrayLimit/arrayFormat tests (#107)
- [Tests] skip Object.create tests when null objects are not available
- [Tests] Turn on eslint for test files (#175)

## **6.2.4**
- [Fix] `parse`: ignore `__proto__` keys (#428)
- [Fix] `utils.merge`: avoid a crash with a null target and an array source
- [Fix] `utils.merge`: avoid a crash with a null target and a truthy non-array source
- [Fix] `utils`: `merge`: fix crash when `source` is a truthy primitive & no options are provided
- [Fix] when `parseArrays` is false, properly handle keys ending in `[]`
- [Robustness] `stringify`: avoid relying on a global `undefined` (#427)
- [Refactor] use cached `Array.isArray`
- [Docs] Clarify the need for "arrayLimit" option
- [meta] fix README.md (#399)
- [meta] Clean up license text so it’s properly detected as BSD-3-Clause
- [meta] add FUNDING.yml
- [actions] backport actions from main
- [Tests] use `safer-buffer` instead of `Buffer` constructor
- [Tests] remove nonexistent tape option
- [Dev Deps] backport from main

## **6.2.3**
- [Fix] follow `allowPrototypes` option during merge (#201, #200)
- [Fix] chmod a-x
- [Fix] support keys starting with brackets (#202, #200)
- [Tests] up to `node` `v7.7`, `v6.10`,` v4.8`; disable osx builds since they block linux builds

## **6.2.2**
- [Fix] ensure that `allowPrototypes: false` does not ever shadow Object.prototype properties

## **6.2.1**
- [Fix] ensure `key[]=x&key[]&key[]=y` results in 3, not 2, values
- [Refactor] Be explicit and use `Object.prototype.hasOwnProperty.call`
- [Tests] remove `parallelshell` since it does not reliably report failures
- [Tests] up to `node` `v6.3`, `v5.12`
- [Dev Deps] update `tape`, `eslint`, `@ljharb/eslint-config`, `qs-iconv`

## [**6.2.0**](https://github.com/ljharb/qs/issues?milestone=36&state=closed)
- [New] pass Buffers to the encoder/decoder directly (#161)
- [New] add "encoder" and "decoder" options, for custom param encoding/decoding (#160)
- [Fix] fix compacting of nested sparse arrays (#150)

## **6.1.2**
- [Fix] follow `allowPrototypes` option during merge (#201, #200)
- [Fix] chmod a-x
- [Fix] support keys starting with brackets (#202, #200)
- [Tests] up to `node` `v7.7`, `v6.10`,` v4.8`; disable osx builds since they block linux builds

## **6.1.1**
- [Fix] ensure that `allowPrototypes: false` does not ever shadow Object.prototype properties

## [**6.1.0**](https://github.com/ljharb/qs/issues?milestone=35&state=closed)
- [New] allowDots option for `stringify` (#151)
- [Fix] "sort" option should work at a depth of 3 or more (#151)
- [Fix] Restore `dist` directory; will be removed in v7 (#148)

## **6.0.4**
- [Fix] follow `allowPrototypes` option during merge (#201, #200)
- [Fix] chmod a-x
- [Fix] support keys starting with brackets (#202, #200)
- [Tests] up to `node` `v7.7`, `v6.10`,` v4.8`; disable osx builds since they block linux builds

## **6.0.3**
- [Fix] ensure that `allowPrototypes: false` does not ever shadow Object.prototype properties
- [Fix] Restore `dist` directory; will be removed in v7 (#148)

## [**6.0.2**](https://github.com/ljharb/qs/issues?milestone=33&state=closed)
- Revert ES6 requirement and restore support for node down to v0.8.

## [**6.0.1**](https://github.com/ljharb/qs/issues?milestone=32&state=closed)
- [**#127**](https://github.com/ljharb/qs/pull/127) Fix engines definition in package.json

## [**6.0.0**](https://github.com/ljharb/qs/issues?milestone=31&state=closed)
- [**#124**](https://github.com/ljharb/qs/issues/124) Use ES6 and drop support for node < v4

## **5.2.1**
- [Fix] ensure `key[]=x&key[]&key[]=y` results in 3, not 2, values

## [**5.2.0**](https://github.com/ljharb/qs/issues?milestone=30&state=closed)
- [**#64**](https://github.com/ljharb/qs/issues/64) Add option to sort object keys in the query string

## [**5.1.0**](https://github.com/ljharb/qs/issues?milestone=29&state=closed)
- [**#117**](https://github.com/ljharb/qs/issues/117) make URI encoding stringified results optional
- [**#106**](https://github.com/ljharb/qs/issues/106) Add flag `skipNulls` to optionally skip null values in stringify

## [**5.0.0**](https://github.com/ljharb/qs/issues?milestone=28&state=closed)
- [**#114**](https://github.com/ljharb/qs/issues/114) default allowDots to false
- [**#100**](https://github.com/ljharb/qs/issues/100) include dist to npm

## [**4.0.0**](https://github.com/ljharb/qs/issues?milestone=26&state=closed)
- [**#98**](https://github.com/ljharb/qs/issues/98) make returning plain objects and allowing prototype overwriting properties optional

## [**3.1.0**](https://github.com/ljharb/qs/issues?milestone=24&state=closed)
- [**#89**](https://github.com/ljharb/qs/issues/89) Add option to disable "Transform dot notation to bracket notation"

## [**3.0.0**](https://github.com/ljharb/qs/issues?milestone=23&state=closed)
- [**#80**](https://github.com/ljharb/qs/issues/80) qs.parse silently drops properties
- [**#77**](https://github.com/ljharb/qs/issues/77) Perf boost
- [**#60**](https://github.com/ljharb/qs/issues/60) Add explicit option to disable array parsing
- [**#74**](https://github.com/ljharb/qs/issues/74) Bad parse when turning array into object
- [**#81**](https://github.com/ljharb/qs/issues/81) Add a `filter` option
- [**#68**](https://github.com/ljharb/qs/issues/68) Fixed issue with recursion and passing strings into objects.
- [**#66**](https://github.com/ljharb/qs/issues/66) Add mixed array and object dot notation support Closes: #47
- [**#76**](https://github.com/ljharb/qs/issues/76) RFC 3986
- [**#85**](https://github.com/ljharb/qs/issues/85) No equal sign
- [**#84**](https://github.com/ljharb/qs/issues/84) update license attribute

## [**2.4.1**](https://github.com/ljharb/qs/issues?milestone=20&state=closed)
- [**#73**](https://github.com/ljharb/qs/issues/73) Property 'hasOwnProperty' of object #<Object> is not a function

## [**2.4.0**](https://github.com/ljharb/qs/issues?milestone=19&state=closed)
- [**#70**](https://github.com/ljharb/qs/issues/70) Add arrayFormat option

## [**2.3.3**](https://github.com/ljharb/qs/issues?milestone=18&state=closed)
- [**#59**](https://github.com/ljharb/qs/issues/59) make sure array indexes are >= 0, closes #57
- [**#58**](https://github.com/ljharb/qs/issues/58) make qs usable for browser loader

## [**2.3.2**](https://github.com/ljharb/qs/issues?milestone=17&state=closed)
- [**#55**](https://github.com/ljharb/qs/issues/55) allow merging a string into an object

## [**2.3.1**](https://github.com/ljharb/qs/issues?milestone=16&state=closed)
- [**#52**](https://github.com/ljharb/qs/issues/52) Return "undefined" and "false" instead of throwing "TypeError".

## [**2.3.0**](https://github.com/ljharb/qs/issues?milestone=15&state=closed)
- [**#50**](https://github.com/ljharb/qs/issues/50) add option to omit array indices, closes #46

## [**2.2.5**](https://github.com/ljharb/qs/issues?milestone=14&state=closed)
- [**#39**](https://github.com/ljharb/qs/issues/39) Is there an alternative to Buffer.isBuffer?
- [**#49**](https://github.com/ljharb/qs/issues/49) refactor utils.merge, fixes #45
- [**#41**](https://github.com/ljharb/qs/issues/41) avoid browserifying Buffer, for #39

## [**2.2.4**](https://github.com/ljharb/qs/issues?milestone=13&state=closed)
- [**#38**](https://github.com/ljharb/qs/issues/38) how to handle object keys beginning with a number

## [**2.2.3**](https://github.com/ljharb/qs/issues?milestone=12&state=closed)
- [**#37**](https://github.com/ljharb/qs/issues/37) parser discards first empty value in array
- [**#36**](https://github.com/ljharb/qs/issues/36) Update to lab 4.x

## [**2.2.2**](https://github.com/ljharb/qs/issues?milestone=11&state=closed)
- [**#33**](https://github.com/ljharb/qs/issues/33) Error when plain object in a value
- [**#34**](https://github.com/ljharb/qs/issues/34) use Object.prototype.hasOwnProperty.call instead of obj.hasOwnProperty
- [**#24**](https://github.com/ljharb/qs/issues/24) Changelog? Semver?

## [**2.2.1**](https://github.com/ljharb/qs/issues?milestone=10&state=closed)
- [**#32**](https://github.com/ljharb/qs/issues/32) account for circular references properly, closes #31
- [**#31**](https://github.com/ljharb/qs/issues/31) qs.parse stackoverflow on circular objects

## [**2.2.0**](https://github.com/ljharb/qs/issues?milestone=9&state=closed)
- [**#26**](https://github.com/ljharb/qs/issues/26) Don't use Buffer global if it's not present
- [**#30**](https://github.com/ljharb/qs/issues/30) Bug when merging non-object values into arrays
- [**#29**](https://github.com/ljharb/qs/issues/29) Don't call Utils.clone at the top of Utils.merge
- [**#23**](https://github.com/ljharb/qs/issues/23) Ability to not limit parameters?

## [**2.1.0**](https://github.com/ljharb/qs/issues?milestone=8&state=closed)
- [**#22**](https://github.com/ljharb/qs/issues/22) Enable using a RegExp as delimiter

## [**2.0.0**](https://github.com/ljharb/qs/issues?milestone=7&state=closed)
- [**#18**](https://github.com/ljharb/qs/issues/18) Why is there arrayLimit?
- [**#20**](https://github.com/ljharb/qs/issues/20) Configurable parametersLimit
- [**#21**](https://github.com/ljharb/qs/issues/21) make all limits optional, for #18, for #20

## [**1.2.2**](https://github.com/ljharb/qs/issues?milestone=6&state=closed)
- [**#19**](https://github.com/ljharb/qs/issues/19) Don't overwrite null values

## [**1.2.1**](https://github.com/ljharb/qs/issues?milestone=5&state=closed)
- [**#16**](https://github.com/ljharb/qs/issues/16) ignore non-string delimiters
- [**#15**](https://github.com/ljharb/qs/issues/15) Close code block

## [**1.2.0**](https://github.com/ljharb/qs/issues?milestone=4&state=closed)
- [**#12**](https://github.com/ljharb/qs/issues/12) Add optional delim argument
- [**#13**](https://github.com/ljharb/qs/issues/13) fix #11: flattened keys in array are now correctly parsed

## [**1.1.0**](https://github.com/ljharb/qs/issues?milestone=3&state=closed)
- [**#7**](https://github.com/ljharb/qs/issues/7) Empty values of a POST array disappear after being submitted
- [**#9**](https://github.com/ljharb/qs/issues/9) Should not omit equals signs (=) when value is null
- [**#6**](https://github.com/ljharb/qs/issues/6) Minor grammar fix in README

## [**1.0.2**](https://github.com/ljharb/qs/issues?milestone=2&state=closed)
- [**#5**](https://github.com/ljharb/qs/issues/5) array holes incorrectly copied into object on large index


---
## Source: node_modules\qs\LICENSE.md

BSD 3-Clause License

Copyright (c) 2014, Nathan LaFreniere and other [contributors](https://github.com/ljharb/qs/graphs/contributors)
All rights reserved.

Redistribution and use in source and binary forms, with or without
modification, are permitted provided that the following conditions are met:

1. Redistributions of source code must retain the above copyright notice, this
   list of conditions and the following disclaimer.

2. Redistributions in binary form must reproduce the above copyright notice,
   this list of conditions and the following disclaimer in the documentation
   and/or other materials provided with the distribution.

3. Neither the name of the copyright holder nor the names of its
   contributors may be used to endorse or promote products derived from
   this software without specific prior written permission.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE
FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL
DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR
SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER
CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY,
OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.


---
## Source: node_modules\safer-buffer\Porting-Buffer.md

# Porting to the Buffer.from/Buffer.alloc API

<a id="overview"></a>
## Overview

- [Variant 1: Drop support for Node.js ≤ 4.4.x and 5.0.0 — 5.9.x.](#variant-1) (*recommended*)
- [Variant 2: Use a polyfill](#variant-2)
- [Variant 3: manual detection, with safeguards](#variant-3)

### Finding problematic bits of code using grep

Just run `grep -nrE '[^a-zA-Z](Slow)?Buffer\s*\(' --exclude-dir node_modules`.

It will find all the potentially unsafe places in your own code (with some considerably unlikely
exceptions).

### Finding problematic bits of code using Node.js 8

If you’re using Node.js ≥ 8.0.0 (which is recommended), Node.js exposes multiple options that help with finding the relevant pieces of code:

- `--trace-warnings` will make Node.js show a stack trace for this warning and other warnings that are printed by Node.js.
- `--trace-deprecation` does the same thing, but only for deprecation warnings.
- `--pending-deprecation` will show more types of deprecation warnings. In particular, it will show the `Buffer()` deprecation warning, even on Node.js 8.

You can set these flags using an environment variable:

```console
$ export NODE_OPTIONS='--trace-warnings --pending-deprecation'
$ cat example.js
'use strict';
const foo = new Buffer('foo');
$ node example.js
(node:7147) [DEP0005] DeprecationWarning: The Buffer() and new Buffer() constructors are not recommended for use due to security and usability concerns. Please use the new Buffer.alloc(), Buffer.allocUnsafe(), or Buffer.from() construction methods instead.
    at showFlaggedDeprecation (buffer.js:127:13)
    at new Buffer (buffer.js:148:3)
    at Object.<anonymous> (/path/to/example.js:2:13)
    [... more stack trace lines ...]
```

### Finding problematic bits of code using linters

Eslint rules [no-buffer-constructor](https://eslint.org/docs/rules/no-buffer-constructor)
or
[node/no-deprecated-api](https://github.com/mysticatea/eslint-plugin-node/blob/master/docs/rules/no-deprecated-api.md)
also find calls to deprecated `Buffer()` API. Those rules are included in some pre-sets.

There is a drawback, though, that it doesn't always
[work correctly](https://github.com/chalker/safer-buffer#why-not-safe-buffer) when `Buffer` is
overriden e.g. with a polyfill, so recommended is a combination of this and some other method
described above.

<a id="variant-1"></a>
## Variant 1: Drop support for Node.js ≤ 4.4.x and 5.0.0 — 5.9.x.

This is the recommended solution nowadays that would imply only minimal overhead.

The Node.js 5.x release line has been unsupported since July 2016, and the Node.js 4.x release line reaches its End of Life in April 2018 (→ [Schedule](https://github.com/nodejs/Release#release-schedule)). This means that these versions of Node.js will *not* receive any updates, even in case of security issues, so using these release lines should be avoided, if at all possible.

What you would do in this case is to convert all `new Buffer()` or `Buffer()` calls to use `Buffer.alloc()` or `Buffer.from()`, in the following way:

- For `new Buffer(number)`, replace it with `Buffer.alloc(number)`.
- For `new Buffer(string)` (or `new Buffer(string, encoding)`), replace it with `Buffer.from(string)` (or `Buffer.from(string, encoding)`).
- For all other combinations of arguments (these are much rarer), also replace `new Buffer(...arguments)` with `Buffer.from(...arguments)`.

Note that `Buffer.alloc()` is also _faster_ on the current Node.js versions than
`new Buffer(size).fill(0)`, which is what you would otherwise need to ensure zero-filling.

Enabling eslint rule [no-buffer-constructor](https://eslint.org/docs/rules/no-buffer-constructor)
or
[node/no-deprecated-api](https://github.com/mysticatea/eslint-plugin-node/blob/master/docs/rules/no-deprecated-api.md)
is recommended to avoid accidential unsafe Buffer API usage.

There is also a [JSCodeshift codemod](https://github.com/joyeecheung/node-dep-codemod#dep005)
for automatically migrating Buffer constructors to `Buffer.alloc()` or `Buffer.from()`.
Note that it currently only works with cases where the arguments are literals or where the
constructor is invoked with two arguments.

_If you currently support those older Node.js versions and dropping them would be a semver-major change
for you, or if you support older branches of your packages, consider using [Variant 2](#variant-2)
or [Variant 3](#variant-3) on older branches, so people using those older branches will also receive
the fix. That way, you will eradicate potential issues caused by unguarded Buffer API usage and
your users will not observe a runtime deprecation warning when running your code on Node.js 10._

<a id="variant-2"></a>
## Variant 2: Use a polyfill

Utilize [safer-buffer](https://www.npmjs.com/package/safer-buffer) as a polyfill to support older
Node.js versions.

You would take exacly the same steps as in [Variant 1](#variant-1), but with a polyfill
`const Buffer = require('safer-buffer').Buffer` in all files where you use the new `Buffer` api.

Make sure that you do not use old `new Buffer` API — in any files where the line above is added,
using old `new Buffer()` API will _throw_. It will be easy to notice that in CI, though.

Alternatively, you could use [buffer-from](https://www.npmjs.com/package/buffer-from) and/or
[buffer-alloc](https://www.npmjs.com/package/buffer-alloc) [ponyfills](https://ponyfill.com/) —
those are great, the only downsides being 4 deps in the tree and slightly more code changes to
migrate off them (as you would be using e.g. `Buffer.from` under a different name). If you need only
`Buffer.from` polyfilled — `buffer-from` alone which comes with no extra dependencies.

_Alternatively, you could use [safe-buffer](https://www.npmjs.com/package/safe-buffer) — it also
provides a polyfill, but takes a different approach which has
[it's drawbacks](https://github.com/chalker/safer-buffer#why-not-safe-buffer). It will allow you
to also use the older `new Buffer()` API in your code, though — but that's arguably a benefit, as
it is problematic, can cause issues in your code, and will start emitting runtime deprecation
warnings starting with Node.js 10._

Note that in either case, it is important that you also remove all calls to the old Buffer
API manually — just throwing in `safe-buffer` doesn't fix the problem by itself, it just provides
a polyfill for the new API. I have seen people doing that mistake.

Enabling eslint rule [no-buffer-constructor](https://eslint.org/docs/rules/no-buffer-constructor)
or
[node/no-deprecated-api](https://github.com/mysticatea/eslint-plugin-node/blob/master/docs/rules/no-deprecated-api.md)
is recommended.

_Don't forget to drop the polyfill usage once you drop support for Node.js < 4.5.0._

<a id="variant-3"></a>
## Variant 3 — manual detection, with safeguards

This is useful if you create Buffer instances in only a few places (e.g. one), or you have your own
wrapper around them.

### Buffer(0)

This special case for creating empty buffers can be safely replaced with `Buffer.concat([])`, which
returns the same result all the way down to Node.js 0.8.x.

### Buffer(notNumber)

Before:

```js
var buf = new Buffer(notNumber, encoding);
```

After:

```js
var buf;
if (Buffer.from && Buffer.from !== Uint8Array.from) {
  buf = Buffer.from(notNumber, encoding);
} else {
  if (typeof notNumber === 'number')
    throw new Error('The "size" argument must be of type number.');
  buf = new Buffer(notNumber, encoding);
}
```

`encoding` is optional.

Note that the `typeof notNumber` before `new Buffer` is required (for cases when `notNumber` argument is not
hard-coded) and _is not caused by the deprecation of Buffer constructor_ — it's exactly _why_ the
Buffer constructor is deprecated. Ecosystem packages lacking this type-check caused numereous
security issues — situations when unsanitized user input could end up in the `Buffer(arg)` create
problems ranging from DoS to leaking sensitive information to the attacker from the process memory.

When `notNumber` argument is hardcoded (e.g. literal `"abc"` or `[0,1,2]`), the `typeof` check can
be omitted.

Also note that using TypeScript does not fix this problem for you — when libs written in
`TypeScript` are used from JS, or when user input ends up there — it behaves exactly as pure JS, as
all type checks are translation-time only and are not present in the actual JS code which TS
compiles to.

### Buffer(number)

For Node.js 0.10.x (and below) support:

```js
var buf;
if (Buffer.alloc) {
  buf = Buffer.alloc(number);
} else {
  buf = new Buffer(number);
  buf.fill(0);
}
```

Otherwise (Node.js ≥ 0.12.x):

```js
const buf = Buffer.alloc ? Buffer.alloc(number) : new Buffer(number).fill(0);
```

## Regarding Buffer.allocUnsafe

Be extra cautious when using `Buffer.allocUnsafe`:
 * Don't use it if you don't have a good reason to
   * e.g. you probably won't ever see a performance difference for small buffers, in fact, those
     might be even faster with `Buffer.alloc()`,
   * if your code is not in the hot code path — you also probably won't notice a difference,
   * keep in mind that zero-filling minimizes the potential risks.
 * If you use it, make sure that you never return the buffer in a partially-filled state,
   * if you are writing to it sequentially — always truncate it to the actuall written length

Errors in handling buffers allocated with `Buffer.allocUnsafe` could result in various issues,
ranged from undefined behaviour of your code to sensitive data (user input, passwords, certs)
leaking to the remote attacker.

_Note that the same applies to `new Buffer` usage without zero-filling, depending on the Node.js
version (and lacking type checks also adds DoS to the list of potential problems)._

<a id="faq"></a>
## FAQ

<a id="design-flaws"></a>
### What is wrong with the `Buffer` constructor?

The `Buffer` constructor could be used to create a buffer in many different ways:

- `new Buffer(42)` creates a `Buffer` of 42 bytes. Before Node.js 8, this buffer contained
  *arbitrary memory* for performance reasons, which could include anything ranging from
  program source code to passwords and encryption keys.
- `new Buffer('abc')` creates a `Buffer` that contains the UTF-8-encoded version of
  the string `'abc'`. A second argument could specify another encoding: For example,
  `new Buffer(string, 'base64')` could be used to convert a Base64 string into the original
  sequence of bytes that it represents.
- There are several other combinations of arguments.

This meant that, in code like `var buffer = new Buffer(foo);`, *it is not possible to tell
what exactly the contents of the generated buffer are* without knowing the type of `foo`.

Sometimes, the value of `foo` comes from an external source. For example, this function
could be exposed as a service on a web server, converting a UTF-8 string into its Base64 form:

```
function stringToBase64(req, res) {
  // The request body should have the format of `{ string: 'foobar' }`
  const rawBytes = new Buffer(req.body.string)
  const encoded = rawBytes.toString('base64')
  res.end({ encoded: encoded })
}
```

Note that this code does *not* validate the type of `req.body.string`:

- `req.body.string` is expected to be a string. If this is the case, all goes well.
- `req.body.string` is controlled by the client that sends the request.
- If `req.body.string` is the *number* `50`, the `rawBytes` would be 50 bytes:
  - Before Node.js 8, the content would be uninitialized
  - After Node.js 8, the content would be `50` bytes with the value `0`

Because of the missing type check, an attacker could intentionally send a number
as part of the request. Using this, they can either:

- Read uninitialized memory. This **will** leak passwords, encryption keys and other
  kinds of sensitive information. (Information leak)
- Force the program to allocate a large amount of memory. For example, when specifying
  `500000000` as the input value, each request will allocate 500MB of memory.
  This can be used to either exhaust the memory available of a program completely
  and make it crash, or slow it down significantly. (Denial of Service)

Both of these scenarios are considered serious security issues in a real-world
web server context.

when using `Buffer.from(req.body.string)` instead, passing a number will always
throw an exception instead, giving a controlled behaviour that can always be
handled by the program.

<a id="ecosystem-usage"></a>
### The `Buffer()` constructor has been deprecated for a while. Is this really an issue?

Surveys of code in the `npm` ecosystem have shown that the `Buffer()` constructor is still
widely used. This includes new code, and overall usage of such code has actually been
*increasing*.


---
## Source: node_modules\side-channel-list\CHANGELOG.md

# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/)
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## v1.0.0 - 2024-12-10

### Commits

- Initial implementation, tests, readme, types [`5d6baee`](https://github.com/ljharb/side-channel-list/commit/5d6baee5c9054a1238007f5a1dfc109a7a816251)
- Initial commit [`3ae784c`](https://github.com/ljharb/side-channel-list/commit/3ae784c63a47895fbaeed2a91ab54a8029a7a100)
- npm init [`07055a4`](https://github.com/ljharb/side-channel-list/commit/07055a4d139895565b199dba5fe2479c1a1b9e28)
- Only apps should have lockfiles [`9573058`](https://github.com/ljharb/side-channel-list/commit/9573058a47494e2d68f8c6c77b5d7fbe441949c1)


---
## Source: node_modules\side-channel-map\CHANGELOG.md

# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/)
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [v1.0.1](https://github.com/ljharb/side-channel-map/compare/v1.0.0...v1.0.1) - 2024-12-10

### Commits

- [Deps] update `call-bound` [`6d05aaa`](https://github.com/ljharb/side-channel-map/commit/6d05aaa4ce5f2be4e7825df433d650696f0ba40f)
- [types] fix generics ordering [`11c0184`](https://github.com/ljharb/side-channel-map/commit/11c0184132ac11fdc16857e12682e148e5e9ee74)

## v1.0.0 - 2024-12-10

### Commits

- Initial implementation, tests, readme, types [`ad877b4`](https://github.com/ljharb/side-channel-map/commit/ad877b42926d46d63fff76a2bd01d2b4a01959a9)
- Initial commit [`28f8879`](https://github.com/ljharb/side-channel-map/commit/28f8879c512abe8fcf9b6a4dc7754a0287e5eba4)
- npm init [`2c9604e`](https://github.com/ljharb/side-channel-map/commit/2c9604e5aa40223e425ea7cea78f8a07697504bd)
- Only apps should have lockfiles [`5e7ba9c`](https://github.com/ljharb/side-channel-map/commit/5e7ba9cffe3ef42095815adc8ac1255b49bbadf5)


---
## Source: node_modules\side-channel-weakmap\CHANGELOG.md

# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/)
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [v1.0.2](https://github.com/ljharb/side-channel-weakmap/compare/v1.0.1...v1.0.2) - 2024-12-10

### Commits

- [types] fix generics ordering [`1b62e94`](https://github.com/ljharb/side-channel-weakmap/commit/1b62e94a2ad6ed30b640ba73c4a2535836c67289)

## [v1.0.1](https://github.com/ljharb/side-channel-weakmap/compare/v1.0.0...v1.0.1) - 2024-12-10

### Commits

- [types] fix generics ordering [`08a4a5d`](https://github.com/ljharb/side-channel-weakmap/commit/08a4a5dbffedc3ebc79f1aaaf5a3dd6d2196dc1b)
- [Deps] update `side-channel-map` [`b53fe44`](https://github.com/ljharb/side-channel-weakmap/commit/b53fe447dfdd3a9aebedfd015b384eac17fce916)

## v1.0.0 - 2024-12-10

### Commits

- Initial implementation, tests, readme, types [`53c0fa4`](https://github.com/ljharb/side-channel-weakmap/commit/53c0fa4788435a006f58b9d7b43cb65989ecee49)
- Initial commit [`a157947`](https://github.com/ljharb/side-channel-weakmap/commit/a157947f26fcaf2c4a941d3a044e76bf67343532)
- npm init [`54dfc55`](https://github.com/ljharb/side-channel-weakmap/commit/54dfc55bafb16265910d5aad4e743c43aee5bbbb)
- Only apps should have lockfiles [`0ddd6c7`](https://github.com/ljharb/side-channel-weakmap/commit/0ddd6c7b07fe8ee04d67b2e9f7255af7ce62c07d)


---
## Source: node_modules\side-channel\CHANGELOG.md

# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/)
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [v1.1.0](https://github.com/ljharb/side-channel/compare/v1.0.6...v1.1.0) - 2024-12-11

### Commits

- [Refactor] extract implementations to `side-channel-weakmap`, `side-channel-map`, `side-channel-list` [`ada5955`](https://github.com/ljharb/side-channel/commit/ada595549a5c4c6c853756d598846b180941c6da)
- [New] add `channel.delete` [`c01d2d3`](https://github.com/ljharb/side-channel/commit/c01d2d3fd51dbb1ce6da72ad7916e61bd6172aad)
- [types] improve types [`0c54356`](https://github.com/ljharb/side-channel/commit/0c5435651417df41b8cc1a5f7cdce8bffae68cde)
- [readme] add content [`be24868`](https://github.com/ljharb/side-channel/commit/be248682ac294b0e22c883092c45985aa91c490a)
- [actions] split out node 10-20, and 20+ [`c4488e2`](https://github.com/ljharb/side-channel/commit/c4488e241ef3d49a19fe266ac830a2e644305911)
- [types] use shared tsconfig [`0e0d57c`](https://github.com/ljharb/side-channel/commit/0e0d57c2ff17c7b45c6cbd43ebcf553edc9e3adc)
- [Dev Deps] update `@ljharb/eslint-config`, `@ljharb/tsconfig`, `@types/get-intrinsic`, `@types/object-inspect`, `@types/tape`, `auto-changelog`, `tape` [`fb4f622`](https://github.com/ljharb/side-channel/commit/fb4f622e64a99a1e40b6e5cd7691674a9dc429e4)
- [Deps] update `call-bind`, `get-intrinsic`, `object-inspect` [`b78336b`](https://github.com/ljharb/side-channel/commit/b78336b886172d1b457d414ac9e28de8c5fecc78)
- [Tests] replace `aud` with `npm audit` [`ee3ab46`](https://github.com/ljharb/side-channel/commit/ee3ab4690d954311c35115651bcfd45edd205aa1)
- [Dev Deps] add missing peer dep [`c03e21a`](https://github.com/ljharb/side-channel/commit/c03e21a7def3b67cdc15ae22316884fefcb2f6a8)

## [v1.0.6](https://github.com/ljharb/side-channel/compare/v1.0.5...v1.0.6) - 2024-02-29

### Commits

- add types [`9beef66`](https://github.com/ljharb/side-channel/commit/9beef6643e6d717ea57bedabf86448123a7dd9e9)
- [meta] simplify `exports` [`4334cf9`](https://github.com/ljharb/side-channel/commit/4334cf9df654151504c383b62a2f9ebdc8d9d5ac)
- [Deps] update `call-bind` [`d6043c4`](https://github.com/ljharb/side-channel/commit/d6043c4d8f4d7be9037dd0f0419c7a2e0e39ec6a)
- [Dev Deps] update `tape` [`6aca376`](https://github.com/ljharb/side-channel/commit/6aca3761868dc8cd5ff7fd9799bf6b95e09a6eb0)

## [v1.0.5](https://github.com/ljharb/side-channel/compare/v1.0.4...v1.0.5) - 2024-02-06

### Commits

- [actions] reuse common workflows [`3d2e1ff`](https://github.com/ljharb/side-channel/commit/3d2e1ffd16dd6eaaf3e40ff57951f840d2d63c04)
- [meta] use `npmignore` to autogenerate an npmignore file [`04296ea`](https://github.com/ljharb/side-channel/commit/04296ea17d1544b0a5d20fd5bfb31aa4f6513eb9)
- [meta] add `.editorconfig`; add `eclint` [`130f0a6`](https://github.com/ljharb/side-channel/commit/130f0a6adbc04d385c7456a601d38344dce3d6a9)
- [Dev Deps] update `eslint`, `@ljharb/eslint-config`, `aud`, `auto-changelog`, `safe-publish-latest`, `tape` [`d480c2f`](https://github.com/ljharb/side-channel/commit/d480c2fbe757489ae9b4275491ffbcc3ac4725e9)
- [Dev Deps] update `eslint`, `@ljharb/eslint-config`, `aud`, `auto-changelog`, `tape` [`ecbe70e`](https://github.com/ljharb/side-channel/commit/ecbe70e53a418234081a77971fec1fdfae20c841)
- [actions] update rebase action [`75240b9`](https://github.com/ljharb/side-channel/commit/75240b9963b816e8846400d2287cb68f88c7fba7)
- [Dev Deps] update `@ljharb/eslint-config`, `aud`, `npmignore`, `tape` [`ae8d281`](https://github.com/ljharb/side-channel/commit/ae8d281572430099109870fd9430d2ca3f320b8d)
- [Dev Deps] update `@ljharb/eslint-config`, `aud`, `tape` [`7125b88`](https://github.com/ljharb/side-channel/commit/7125b885fd0eacad4fee9b073b72d14065ece278)
- [Deps] update `call-bind`, `get-intrinsic`, `object-inspect` [`82577c9`](https://github.com/ljharb/side-channel/commit/82577c9796304519139a570f82a317211b5f3b86)
- [Deps] update `call-bind`, `get-intrinsic`, `object-inspect` [`550aadf`](https://github.com/ljharb/side-channel/commit/550aadf20475a6081fd70304cc54f77259a5c8a8)
- [Tests] increase coverage [`5130877`](https://github.com/ljharb/side-channel/commit/5130877a7b27c862e64e6d1c12a178b28808859d)
- [Deps] update `get-intrinsic`, `object-inspect` [`ba0194c`](https://github.com/ljharb/side-channel/commit/ba0194c505b1a8a0427be14cadd5b8a46d4d01b8)
- [meta] add missing `engines.node` [`985fd24`](https://github.com/ljharb/side-channel/commit/985fd249663cb06617a693a94fe08cad12f5cb70)
- [Refactor] use `es-errors`, so things that only need those do not need `get-intrinsic` [`40227a8`](https://github.com/ljharb/side-channel/commit/40227a87b01709ad2c0eebf87eb4223a800099b9)
- [Deps] update `get-intrinsic` [`a989b40`](https://github.com/ljharb/side-channel/commit/a989b4024958737ae7be9fbffdeff2078f33a0fd)
- [Deps] update `object-inspect` [`aec42d2`](https://github.com/ljharb/side-channel/commit/aec42d2ec541a31aaa02475692c87d489237d9a3)

## [v1.0.4](https://github.com/ljharb/side-channel/compare/v1.0.3...v1.0.4) - 2020-12-29

### Commits

- [Tests] migrate tests to Github Actions [`10909cb`](https://github.com/ljharb/side-channel/commit/10909cbf8ce9c0bf96f604cf13d7ffd5a22c2d40)
- [Refactor] Use a linked list rather than an array, and move accessed nodes to the beginning [`195613f`](https://github.com/ljharb/side-channel/commit/195613f28b5c1e6072ef0b61b5beebaf2b6a304e)
- [meta] do not publish github action workflow files [`290ec29`](https://github.com/ljharb/side-channel/commit/290ec29cd21a60585145b4a7237ec55228c52c27)
- [Tests] run `nyc` on all tests; use `tape` runner [`ea6d030`](https://github.com/ljharb/side-channel/commit/ea6d030ff3fe6be2eca39e859d644c51ecd88869)
- [actions] add "Allow Edits" workflow [`d464d8f`](https://github.com/ljharb/side-channel/commit/d464d8fe52b5eddf1504a0ed97f0941a90f32c15)
- [Dev Deps] update `eslint`, `@ljharb/eslint-config`, `aud`, `auto-changelog` [`02daca8`](https://github.com/ljharb/side-channel/commit/02daca87c6809821c97be468d1afa2f5ef447383)
- [Refactor] use `call-bind` and `get-intrinsic` instead of `es-abstract` [`e09d481`](https://github.com/ljharb/side-channel/commit/e09d481528452ebafa5cdeae1af665c35aa2deee)
- [Deps] update `object.assign` [`ee83aa8`](https://github.com/ljharb/side-channel/commit/ee83aa81df313b5e46319a63adb05cf0c179079a)
- [actions] update rebase action to use checkout v2 [`7726b0b`](https://github.com/ljharb/side-channel/commit/7726b0b058b632fccea709f58960871defaaa9d7)

## [v1.0.3](https://github.com/ljharb/side-channel/compare/v1.0.2...v1.0.3) - 2020-08-23

### Commits

- [Dev Deps] update `eslint`, `@ljharb/eslint-config`, `aud`, `auto-changelog`, `tape` [`1f10561`](https://github.com/ljharb/side-channel/commit/1f105611ef3acf32dec8032ae5c0baa5e56bb868)
- [Deps] update `es-abstract`, `object-inspect` [`bc20159`](https://github.com/ljharb/side-channel/commit/bc201597949a505e37cef9eaf24c7010831e6f03)
- [Dev Deps] update `@ljharb/eslint-config`, `tape` [`b9b2b22`](https://github.com/ljharb/side-channel/commit/b9b2b225f9e0ea72a6ec2b89348f0bd690bc9ed1)
- [Dev Deps] update `eslint`, `@ljharb/eslint-config`, `tape` [`7055ab4`](https://github.com/ljharb/side-channel/commit/7055ab4de0860606efd2003674a74f1fe6ebc07e)
- [Dev Deps] update `auto-changelog`; add `aud` [`d278c37`](https://github.com/ljharb/side-channel/commit/d278c37d08227be4f84aa769fcd919e73feeba40)
- [actions] switch Automatic Rebase workflow to `pull_request_target` event [`3bcf982`](https://github.com/ljharb/side-channel/commit/3bcf982faa122745b39c33ce83d32fdf003741c6)
- [Tests] only audit prod deps [`18d01c4`](https://github.com/ljharb/side-channel/commit/18d01c4015b82a3d75044c4d5ba7917b2eac01ec)
- [Deps] update `es-abstract` [`6ab096d`](https://github.com/ljharb/side-channel/commit/6ab096d9de2b482cf5e0717e34e212f5b2b9bc9a)
- [Dev Deps] update `tape` [`9dc174c`](https://github.com/ljharb/side-channel/commit/9dc174cc651dfd300b4b72da936a0a7eda5f9452)
- [Deps] update `es-abstract` [`431d0f0`](https://github.com/ljharb/side-channel/commit/431d0f0ff11fbd2ae6f3115582a356d3a1cfce82)
- [Deps] update `es-abstract` [`49869fd`](https://github.com/ljharb/side-channel/commit/49869fd323bf4453f0ba515c0fb265cf5ab7b932)
- [meta] Add package.json to package's exports [`77d9cdc`](https://github.com/ljharb/side-channel/commit/77d9cdceb2a9e47700074f2ae0c0a202e7dac0d4)

## [v1.0.2](https://github.com/ljharb/side-channel/compare/v1.0.1...v1.0.2) - 2019-12-20

### Commits

- [Dev Deps] update `@ljharb/eslint-config`, `tape` [`4a526df`](https://github.com/ljharb/side-channel/commit/4a526df44e4701566ed001ec78546193f818b082)
- [Deps] update `es-abstract` [`d4f6e62`](https://github.com/ljharb/side-channel/commit/d4f6e629b6fb93a07415db7f30d3c90fd7f264fe)

## [v1.0.1](https://github.com/ljharb/side-channel/compare/v1.0.0...v1.0.1) - 2019-12-01

### Commits

- [Fix] add missing "exports" [`d212907`](https://github.com/ljharb/side-channel/commit/d2129073abf0701a5343bf28aa2145617604dc2e)

## v1.0.0 - 2019-12-01

### Commits

- Initial implementation [`dbebd3a`](https://github.com/ljharb/side-channel/commit/dbebd3a4b5ed64242f9a6810efe7c4214cd8cde4)
- Initial tests [`73bdefe`](https://github.com/ljharb/side-channel/commit/73bdefe568c9076cf8c0b8719bc2141aec0e19b8)
- Initial commit [`43c03e1`](https://github.com/ljharb/side-channel/commit/43c03e1c2849ec50a87b7a5cd76238a62b0b8770)
- npm init [`5c090a7`](https://github.com/ljharb/side-channel/commit/5c090a765d66a5527d9889b89aeff78dee91348c)
- [meta] add `auto-changelog` [`a5c4e56`](https://github.com/ljharb/side-channel/commit/a5c4e5675ec02d5eb4d84b4243aeea2a1d38fbec)
- [actions] add automatic rebasing / merge commit blocking [`bab1683`](https://github.com/ljharb/side-channel/commit/bab1683d8f9754b086e94397699fdc645e0d7077)
- [meta] add `funding` field; create FUNDING.yml [`63d7aea`](https://github.com/ljharb/side-channel/commit/63d7aeaf34f5650650ae97ca4b9fae685bd0937c)
- [Tests] add `npm run lint` [`46a5a81`](https://github.com/ljharb/side-channel/commit/46a5a81705cd2664f83df232c01dbbf2ee952885)
- Only apps should have lockfiles [`8b16b03`](https://github.com/ljharb/side-channel/commit/8b16b0305f00895d90c4e2e5773c854cfea0e448)
- [meta] add `safe-publish-latest` [`2f098ef`](https://github.com/ljharb/side-channel/commit/2f098ef092a39399cfe548b19a1fc03c2fd2f490)


---
## Source: node_modules\union\CHANGELOG.md


0.3.4 / 2012-07-24
==================

  * Added SPDY support
  * Added http redirect utility function



---
## Source: node_modules\url-join\CHANGELOG.md

## 4.0.0 - 2018-02-02

 - Ignore empty string arguments and throw an exception for non-string. Closes #36, #18 ([da05242f381bfe1ae09d00b708cfdbdb93c1a85d](https://github.com/jfromaniello/url-join/commit/da05242f381bfe1ae09d00b708cfdbdb93c1a85d)), closes [#36](https://github.com/jfromaniello/url-join/issues/36) [#18](https://github.com/jfromaniello/url-join/issues/18)



## 3.0.0 - 2018-01-12

 - add new test ([d65d7c1696cb53b53ceabadf1a77917196967b4c](https://github.com/jfromaniello/url-join/commit/d65d7c1696cb53b53ceabadf1a77917196967b4c))
 - Fixed to handle the colon in non-protocol separation role in the first part. ([9212db75f805031a9cc06120b5dd08a6cdd805e4](https://github.com/jfromaniello/url-join/commit/9212db75f805031a9cc06120b5dd08a6cdd805e4))



## 2.0.5 - 2018-01-10

 - revert to previous behavior #30 ([b6943343af7bd723cbca266388e84e036543577d](https://github.com/jfromaniello/url-join/commit/b6943343af7bd723cbca266388e84e036543577d)), closes [#30](https://github.com/jfromaniello/url-join/issues/30)



## 2.0.4 - 2018-01-10

 - fix bower.json ([9677895a4afe51d8a1d670980bc6fede71252e9a](https://github.com/jfromaniello/url-join/commit/9677895a4afe51d8a1d670980bc6fede71252e9a))



## 2.0.3 - 2018-01-09

 - 2.0.3 ([7b7806b21cf81a3476e39ddb8a6f51272a276186](https://github.com/jfromaniello/url-join/commit/7b7806b21cf81a3476e39ddb8a6f51272a276186))
 - Added a test for simple paths for issue #21 ([be99b10a707b4d22aac015d19eb087fff46d4270](https://github.com/jfromaniello/url-join/commit/be99b10a707b4d22aac015d19eb087fff46d4270)), closes [#21](https://github.com/jfromaniello/url-join/issues/21)
 - Added some new tests for cases that fail. ([f1afbd62c3149476a9ef099ba523e85fb4839732](https://github.com/jfromaniello/url-join/commit/f1afbd62c3149476a9ef099ba523e85fb4839732))
 - Passes all the tests with these changes. ([8cde667f400fa83efc7ed5c2437c7cb25c7d7600](https://github.com/jfromaniello/url-join/commit/8cde667f400fa83efc7ed5c2437c7cb25c7d7600))
 - The protocol slashes should be normalized also when the protocol is not alone in the first argument. ([0ce1239c60f7bbb625d4ccbf1fcf044f37488bd8](https://github.com/jfromaniello/url-join/commit/0ce1239c60f7bbb625d4ccbf1fcf044f37488bd8))



## 2.0.2 - 2017-05-18

 - fix: remove consecutives slashes ([33639364ef186e257b8424620017b9d1ba225539](https://github.com/jfromaniello/url-join/commit/33639364ef186e257b8424620017b9d1ba225539))



## 2.0.1 - 2017-04-12

 - update mocha and bower.json ([ebd3665028b2408d405f9a31f8479e91c4ef52c1](https://github.com/jfromaniello/url-join/commit/ebd3665028b2408d405f9a31f8479e91c4ef52c1))
 - feat: add test ([46d3387141e5d2f751da699e02d57fc36bfe37a8](https://github.com/jfromaniello/url-join/commit/46d3387141e5d2f751da699e02d57fc36bfe37a8))
 - fix: ignore encoded url when removing consecusive slashes ([711add4e8af8fc97390adef14b9a4722cac5e70a](https://github.com/jfromaniello/url-join/commit/711add4e8af8fc97390adef14b9a4722cac5e70a))



## 2.0.0 - 2017-04-11

 - Add a LICENSE file ([ffd3b2253470cee648152c55dd51c1bf4e688a60](https://github.com/jfromaniello/url-join/commit/ffd3b2253470cee648152c55dd51c1bf4e688a60))
 - change copyright year ([9f67671dd8ab23b4d2da6ae775efdf66d594eac3](https://github.com/jfromaniello/url-join/commit/9f67671dd8ab23b4d2da6ae775efdf66d594eac3))
 - refactor: use local startsWith function ([a1e1214644cd187f2584b79b4241ac3b8c9b9f1b](https://github.com/jfromaniello/url-join/commit/a1e1214644cd187f2584b79b4241ac3b8c9b9f1b))
 - fix: split logic for files ([d7053a99aa40b0c2f4802819f7e0643be8889ac4](https://github.com/jfromaniello/url-join/commit/d7053a99aa40b0c2f4802819f7e0643be8889ac4))
 - feat: add file protocol support ([48ebe0d84e8e2eca3a02fe5e3259cdd294e519dc](https://github.com/jfromaniello/url-join/commit/48ebe0d84e8e2eca3a02fe5e3259cdd294e519dc))



## 1.1.0 - 2016-04-05

 - add .travis.yml ([c75e7507f72fd4be101b64bb44539fd249842cc0](https://github.com/jfromaniello/url-join/commit/c75e7507f72fd4be101b64bb44539fd249842cc0))
 - added new syntax to allow options, fixed #! urls ([b8e5d8372c55187cdd9c6fa5e02830f76858347e](https://github.com/jfromaniello/url-join/commit/b8e5d8372c55187cdd9c6fa5e02830f76858347e))
 - added travis, updated version in bower.json ([5a58405d89298e693e8f97a74b14324d83a8a87a](https://github.com/jfromaniello/url-join/commit/5a58405d89298e693e8f97a74b14324d83a8a87a))
 - fixed query string handling, closes #9, closes #4 ([e190fe28282287204dbe7877979f18b4570042f9](https://github.com/jfromaniello/url-join/commit/e190fe28282287204dbe7877979f18b4570042f9)), closes [#9](https://github.com/jfromaniello/url-join/issues/9) [#4](https://github.com/jfromaniello/url-join/issues/4)



## 1.0.0 - 2016-03-23




## 0.1.0 - 2016-03-23

 - 0.1.0 ([2db128d268dfd531f1af6c9bd0543458387e94cd](https://github.com/jfromaniello/url-join/commit/2db128d268dfd531f1af6c9bd0543458387e94cd))
 - add support for AMD and windows['url-join'] ([b02169596877a1e6cd518f1b0d711f38c721fb02](https://github.com/jfromaniello/url-join/commit/b02169596877a1e6cd518f1b0d711f38c721fb02))
 - added comments, fixed leading // ([3f72b6ea6fa84c4b254d0c656815a5df6b89a10a](https://github.com/jfromaniello/url-join/commit/3f72b6ea6fa84c4b254d0c656815a5df6b89a10a))
 - added test for leading // ([baac627b2052e1d9b5c05e48c8dc6a05a80e08fa](https://github.com/jfromaniello/url-join/commit/baac627b2052e1d9b5c05e48c8dc6a05a80e08fa))
 - bower init ([650dcfe72eee854108dd0832963553eae5ede7c5](https://github.com/jfromaniello/url-join/commit/650dcfe72eee854108dd0832963553eae5ede7c5))
 - initial ([af68a208966de3d4be757c9d0f4a918c6dfa360e](https://github.com/jfromaniello/url-join/commit/af68a208966de3d4be757c9d0f4a918c6dfa360e))
 - minor ([dde2dc6815f9a0476d7aade1d6848cbc5f3a14a4](https://github.com/jfromaniello/url-join/commit/dde2dc6815f9a0476d7aade1d6848cbc5f3a14a4))
 - minor ([4d9d8ee16591da2092739a172145f968f71598dc](https://github.com/jfromaniello/url-join/commit/4d9d8ee16591da2092739a172145f968f71598dc))
 - minor ([9ed0161497ee7d7d1b4b04d1735483a6216fe2c6](https://github.com/jfromaniello/url-join/commit/9ed0161497ee7d7d1b4b04d1735483a6216fe2c6))
 - simplify normalize function ([d6886a362828eacc028c6167b9ae0efd8b2fbfc8](https://github.com/jfromaniello/url-join/commit/d6886a362828eacc028c6167b9ae0efd8b2fbfc8))





---
## Source: SETUP_ADMIN.md

# Admin Setup Guide

This guide will help you set up the admin authentication and user management system for your Telegram Task Manager mini app.

## 🔧 Initial Configuration

### 1. Configure Environment Variables

Copy the example environment file and fill in your details:

```bash
cp .env.example .env
```

Edit the `.env` file with your information:

```env
# Telegram Bot Configuration
TELEGRAM_BOT_TOKEN=1234567890:ABCdefGhIJKlmNOPqrsTUVwxyZ1234567890
TELEGRAM_BOT_USERNAME=YourTaskBot

# Admin Configuration  
ADMIN_TELEGRAM_ID=123456789
ADMIN_PHONE_NUMBER=+1234567890
ADMIN_USERNAME=admin_username
```

### 2. Get Your Telegram ID

To find your Telegram ID:

1. **Option 1: Use @userinfobot**
   - Start a chat with [@userinfobot](https://t.me/userinfobot)
   - Send any message
   - The bot will reply with your user information including your ID

2. **Option 2: Use @get_id_bot**
   - Start a chat with [@get_id_bot](https://t.me/get_id_bot)
   - Send `/start`
   - Your ID will be displayed

3. **Option 3: Browser Console (Development)**
   - Open the mini app in development
   - Open browser developer tools (F12)
   - Go to Console tab
   - Your Telegram user data will be logged

### 3. Set Up Your Bot

1. **Create a Telegram Bot**
   - Message [@BotFather](https://t.me/BotFather)
   - Send `/newbot`
   - Choose a name and username for your bot
   - Save the bot token

2. **Configure Mini App**
   - Send `/newapp` to @BotFather
   - Select your bot
   - Enter app details:
     - **Name**: Task Manager
     - **Description**: Team task management mini app
     - **Photo**: Upload a 512x512 icon
     - **Demo GIF/Video**: Optional
   - Set your web app URL (where you'll host the app)

## 🚀 Initial Admin Setup

### First Time Setup

1. **Deploy your app** to a hosting service:
   - GitHub Pages (free)
   - Vercel (free)
   - Netlify (free)
   - Your own server

2. **Configure the bot** with @BotFather:
   - Set the web app URL
   - Configure menu button (optional)

3. **First admin login**:
   - Open your Telegram bot
   - Start the mini app
   - If you've set the correct `ADMIN_TELEGRAM_ID`, you'll be logged in as admin
   - If not configured, you'll see a manual login form

### Manual Admin Configuration (Development)

If you're testing locally or need to set up admin manually:

1. **Open the app in your browser**
2. **In the login form, enter**:
   - Your Telegram ID (the one you got from @userinfobot)
   - Your name details
   - Your phone number
3. **The system will recognize you as admin** if your ID matches the configuration

## 👥 User Management

### Adding Users

As an admin, you can add users in several ways:

#### Method 1: Admin Dashboard
1. Go to the Admin tab (⚙️)
2. Click "Add User" button
3. Fill in user details:
   - **Telegram ID**: Required (user gets this from @userinfobot)
   - **Name**: Required
   - **Phone**: Recommended for verification
   - **Role**: User or Admin

#### Method 2: User Self-Registration (if enabled)
1. Set `ENABLE_USER_REGISTRATION=true` in your config
2. Users can request access through the app
3. You approve/deny requests in the admin dashboard

### User Authentication Flow

1. **User opens the mini app**
2. **System checks authentication**:
   - If user has valid Telegram data → automatic login
   - If user is not authorized → shows access denied message
   - If user is admin → shows admin interface

3. **Phone verification** (if enabled):
   - System requests phone number verification
   - Sends SMS code (in production)
   - User enters code to complete authentication

## 🔐 Security Features

### Authentication Methods

1. **Telegram Native Auth**:
   - Uses Telegram's WebApp authentication
   - Verifies user data with hash validation
   - No passwords needed

2. **Phone Verification**:
   - Optional additional security layer
   - Validates phone numbers with SMS codes
   - Prevents unauthorized access

3. **Admin Controls**:
   - Only pre-approved users can access
   - Admin can disable/enable users
   - Full user management capabilities

### Data Storage

- **Local Storage**: User data and settings (client-side)
- **No Server Required**: Works entirely in browser
- **Export/Import**: Admin can backup all data
- **Privacy**: No data sent to external servers

## 📱 Production Deployment

### 1. Choose a Hosting Service

#### GitHub Pages (Recommended for beginners)
```bash
# Push to GitHub repository
git add .
git commit -m "Initial commit"
git push origin main

# Enable GitHub Pages in repository settings
# Your app will be at: https://username.github.io/repository-name
```

#### Vercel
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Your app will get a vercel.app URL
```

#### Netlify
```bash
# Drag and drop your project folder to netlify.com
# Or connect your GitHub repository
# Instant deployment with custom domain options
```

### 2. Configure Bot with Production URL

```bash
# Message @BotFather
/setmenubutton

# Select your bot
# Set button text: "Open Task Manager"
# Set web app URL: https://your-production-url.com
```

### 3. Update Environment Variables

Update your `.env` file with production settings:

```env
APP_URL=https://your-production-url.com
ENABLE_PHONE_VERIFICATION=true
REQUIRE_ADMIN_APPROVAL=true
```

## 🛠️ Troubleshooting

### Common Issues

#### "Access Denied" Message
- **Cause**: User's Telegram ID not in authorized users list
- **Solution**: Admin needs to add the user through Admin Dashboard

#### "Authentication Failed"
- **Cause**: Invalid Telegram authentication data
- **Solution**: Refresh the app, check bot configuration

#### Admin Dashboard Not Showing
- **Cause**: User is not configured as admin
- **Solution**: Check `ADMIN_TELEGRAM_ID` in configuration

#### Phone Verification Not Working
- **Cause**: Phone verification service not configured
- **Solution**: In development, check browser console for verification codes

### Development Testing

```javascript
// Test admin login (browser console)
localStorage.setItem('admin_telegram_id', 'YOUR_TELEGRAM_ID');
location.reload();

// Clear all data (reset)
localStorage.clear();
location.reload();

// View current user data
console.log(JSON.parse(localStorage.getItem('current_user')));
```

## 🔄 Maintenance

### Regular Tasks

1. **Monitor Users**: Check Admin Dashboard regularly
2. **Export Data**: Regular backups using export function
3. **Update Configuration**: Adjust settings as needed
4. **Review Access**: Remove inactive users

### Data Management

```javascript
// Export all data (Admin Dashboard → Export User Data)
// Import data (restore from backup file)
// Clear inactive users (Admin Dashboard → User Management)
```

## 📞 Support

If you encounter issues:

1. Check this setup guide first
2. Review browser console for errors
3. Verify Telegram bot configuration
4. Test with a fresh browser/incognito mode
5. Check that all required fields in `.env` are filled

## 🎯 Next Steps

After completing the setup:

1. ✅ Test admin login
2. ✅ Add a few test users
3. ✅ Test user authentication
4. ✅ Configure phone verification (optional)
5. ✅ Deploy to production
6. ✅ Share with your team

Your Telegram Task Manager with admin authentication is now ready to use! 🚀

---
## Source: TELEGRAM_BOT_SETUP.md

# Telegram Bot Setup for Native Push Notifications

This guide explains how to set up your Telegram Bot to send native push notifications when users are not actively using the mini app.

## 🚀 Overview

Your Task Manager now sends **native Telegram notifications** that appear as regular Telegram messages with:
- ✅ **Native sound & vibration** alerts
- 🔔 **System notification badges** 
- 📱 **Works even when mini app is closed**
- ⚡ **Interactive buttons** for quick actions
- 🎯 **Smart delivery** - only when user is not in the app

## 📋 Prerequisites

- Telegram Bot created with @BotFather
- Bot token from previous setup
- Web hosting with HTTPS (required for webhooks)
- Your domain name or hosting URL

## 🤖 Step 1: Configure Bot for Push Notifications

### 1.1 Update Environment Variables

Edit your `.env` file:

```env
# Your existing bot configuration
TELEGRAM_BOT_TOKEN=1234567890:ABCdefGhIJKlmNOPqrsTUVwxyZ1234567890
TELEGRAM_BOT_USERNAME=YourTaskManagerBot

# Add these new settings
APP_URL=https://your-domain.com
WEBHOOK_URL=https://your-domain.com/webhook
TELEGRAM_WEBHOOK_SECRET=your-random-secret-key-here
```

### 1.2 Generate Webhook Secret

```bash
# Generate a secure random string for webhook verification
openssl rand -hex 32
# Example output: a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6
```

Add this to your `.env` file as `TELEGRAM_WEBHOOK_SECRET`.

## 🌐 Step 2: Deploy with Webhook Support

### Option A: Node.js/Express Server (Recommended)

Create `server.js`:

```javascript
const express = require('express');
const path = require('path');
const crypto = require('crypto');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.static('.'));

// Webhook endpoint for Telegram Bot
app.post('/webhook', (req, res) => {
    // Verify webhook signature
    const secretToken = process.env.TELEGRAM_WEBHOOK_SECRET;
    const signature = req.headers['x-telegram-bot-api-secret-token'];
    
    if (signature !== secretToken) {
        return res.status(401).send('Unauthorized');
    }
    
    // Process the webhook update
    const update = req.body;
    console.log('Received webhook update:', update);
    
    // Send to webhook handler (you'll need to implement this)
    // processWebhookUpdate(update);
    
    res.status(200).send('OK');
});

// Serve the mini app
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Webhook URL: ${process.env.APP_URL}/webhook`);
});
```

**Package.json:**
```json
{
  "name": "telegram-task-manager",
  "version": "1.0.0",
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js"
  },
  "dependencies": {
    "express": "^4.18.0",
    "dotenv": "^16.0.0"
  },
  "devDependencies": {
    "nodemon": "^2.0.0"
  }
}
```

### Option B: Vercel Serverless

Create `api/webhook.js`:

```javascript
export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }
    
    // Verify webhook signature
    const secretToken = process.env.TELEGRAM_WEBHOOK_SECRET;
    const signature = req.headers['x-telegram-bot-api-secret-token'];
    
    if (signature !== secretToken) {
        return res.status(401).json({ error: 'Unauthorized' });
    }
    
    const update = req.body;
    console.log('Webhook update:', update);
    
    // Process the update
    // Your webhook processing logic here
    
    res.status(200).json({ success: true });
}
```

**Vercel.json:**
```json
{
  "functions": {
    "api/webhook.js": {
      "maxDuration": 10
    }
  },
  "env": {
    "TELEGRAM_BOT_TOKEN": "@telegram_bot_token",
    "TELEGRAM_WEBHOOK_SECRET": "@webhook_secret"
  }
}
```

### Option C: Netlify Functions

Create `netlify/functions/webhook.js`:

```javascript
exports.handler = async (event, context) => {
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: 'Method Not Allowed' };
    }
    
    // Verify webhook signature
    const secretToken = process.env.TELEGRAM_WEBHOOK_SECRET;
    const signature = event.headers['x-telegram-bot-api-secret-token'];
    
    if (signature !== secretToken) {
        return { statusCode: 401, body: 'Unauthorized' };
    }
    
    const update = JSON.parse(event.body);
    console.log('Webhook update:', update);
    
    // Process the update
    // Your processing logic here
    
    return {
        statusCode: 200,
        body: JSON.stringify({ success: true })
    };
};
```

## 🔧 Step 3: Set Up Webhook with Telegram

### 3.1 Set Webhook URL

Use curl or your preferred HTTP client:

```bash
curl -X POST "https://api.telegram.org/bot{YOUR_BOT_TOKEN}/setWebhook" \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://your-domain.com/webhook",
    "secret_token": "your-webhook-secret-here",
    "allowed_updates": ["message", "callback_query", "web_app_data"]
  }'
```

**Or via JavaScript:**
```javascript
const botToken = 'YOUR_BOT_TOKEN';
const webhookUrl = 'https://your-domain.com/webhook';
const secretToken = 'your-webhook-secret';

fetch(`https://api.telegram.org/bot${botToken}/setWebhook`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
        url: webhookUrl,
        secret_token: secretToken,
        allowed_updates: ['message', 'callback_query', 'web_app_data']
    })
});
```

### 3.2 Verify Webhook

Check if webhook is set correctly:

```bash
curl "https://api.telegram.org/bot{YOUR_BOT_TOKEN}/getWebhookInfo"
```

Expected response:
```json
{
  "ok": true,
  "result": {
    "url": "https://your-domain.com/webhook",
    "has_custom_certificate": false,
    "pending_update_count": 0,
    "last_error_date": 0,
    "max_connections": 40,
    "allowed_updates": ["message", "callback_query", "web_app_data"]
  }
}
```

## 🔔 Step 4: Test Push Notifications

### 4.1 Test Bot Commands

Message your bot directly on Telegram:

```
/start
/tasks  
/create Test notification task
/help
```

### 4.2 Test Task Notifications

1. **Open your mini app**
2. **Create a task** and assign it to someone
3. **Close the mini app** 
4. **Check if the assignee gets a Telegram notification**

### 4.3 Test Completion Notifications

1. **Mark a task as completed** in the app
2. **Check if team members get notified**

## 📱 Step 5: Native Notification Features

### Interactive Buttons

Your notifications now include action buttons:

```
📋 Task Assigned

🎯 Design new user interface

📝 Create mockups for the new dashboard layout

👤 Assigned to: John Doe
📅 Due: Jan 30, 2025  
🔥 Priority: HIGH

💡 Tap a button below to take action

[👀 View Task] [✅ Mark Done]
[📝 Edit Task]  [📋 All Tasks]
```

### Smart Delivery

- ✅ **Sends Telegram notification** when user is not in mini app
- ✅ **Shows in-app notification** when user is actively using app  
- ✅ **Rate limiting** prevents notification spam
- ✅ **Delivery tracking** monitors success rates

### Rich Formatting

- **Markdown formatting** for bold, italic text
- **Emoji indicators** for priority and status
- **Structured layout** with clear sections
- **Action buttons** for immediate response

## 🛠️ Step 6: Advanced Configuration

### 6.1 Customize Notification Templates

Edit `telegram-bot.js` to modify message templates:

```javascript
formatTaskAssignedMessage(task, assignee) {
    return `🎯 *Task Assigned*\n\n` +
           `📋 *${task.title}*\n\n` +
           `${task.description ? `📝 ${task.description}\n\n` : ''}` +
           `👤 *Assigned to:* ${assignee.first_name}\n` +
           `📅 *Due:* ${new Date(task.dueDate).toLocaleDateString()}\n` +
           `🔥 *Priority:* ${task.priority.toUpperCase()}\n\n` +
           `💡 _Tap a button below to take action_`;
}
```

### 6.2 Add More Bot Commands

```javascript
async handleCustomCommand(userId, args) {
    const message = `🚀 *Custom Feature*\n\nYour custom functionality here!`;
    
    const keyboard = {
        inline_keyboard: [
            [{ text: '🔗 Custom Action', callback_data: 'custom_action' }]
        ]
    };
    
    return await this.sendNotification(userId, message, keyboard);
}
```

### 6.3 Configure Rate Limiting

Adjust in `telegram-bot.js`:

```javascript
// Allow max 10 notifications per minute per user
if (limit.count >= 10 && (now - limit.resetTime) < oneMinute) {
    return true;
}
```

## 📊 Step 7: Monitoring & Analytics

### 7.1 Webhook Logs

Monitor your webhook endpoint:

```javascript
app.post('/webhook', (req, res) => {
    console.log('Webhook received:', {
        timestamp: new Date().toISOString(),
        update_id: req.body.update_id,
        user_id: req.body.message?.from?.id,
        message_type: req.body.message?.text ? 'text' : 'other'
    });
    
    // Process update...
});
```

### 7.2 Delivery Statistics

Check notification success rates:

```javascript
const stats = pushNotificationService.getDeliveryStats();
console.log('Notification Stats:', {
    total: stats.total,
    delivered: stats.delivered,
    failed: stats.failed,
    successRate: stats.successRate + '%'
});
```

### 7.3 Error Handling

```javascript
async sendNotification(userId, message) {
    try {
        const result = await this.makeRequest('sendMessage', {
            chat_id: userId,
            text: message,
            parse_mode: 'Markdown'
        });
        
        return { success: true, messageId: result.result.message_id };
    } catch (error) {
        // Log error details
        console.error('Notification failed:', {
            userId,
            error: error.message,
            timestamp: new Date().toISOString()
        });
        
        return { success: false, error: error.message };
    }
}
```

## 🚨 Troubleshooting

### Common Issues

**❌ Webhook not receiving updates**
- Verify webhook URL is HTTPS
- Check webhook secret token matches
- Confirm webhook is set: `/getWebhookInfo`

**❌ Notifications not sending**
- Verify bot token is correct
- Check user has started the bot (`/start`)
- Confirm user hasn't blocked the bot

**❌ Buttons not working**
- Ensure web app URL is correct
- Check callback data handlers are implemented
- Verify bot has proper permissions

### Debug Commands

```bash
# Check webhook status
curl "https://api.telegram.org/bot{TOKEN}/getWebhookInfo"

# Remove webhook (for testing)
curl -X POST "https://api.telegram.org/bot{TOKEN}/deleteWebhook"

# Test bot directly
curl -X POST "https://api.telegram.org/bot{TOKEN}/sendMessage" \
  -d "chat_id=USER_ID&text=Test message"
```

## ✅ Final Checklist

- [ ] Environment variables configured
- [ ] Webhook URL set and verified  
- [ ] Bot commands responding
- [ ] Task notifications working
- [ ] Interactive buttons functional
- [ ] Rate limiting active
- [ ] Error logging implemented
- [ ] Production deployment complete

## 🎉 You're Ready!

Your Task Manager now sends **native Telegram push notifications**! Users will receive:

- 📱 **Native alerts** with sound & vibration
- 🔔 **System badges** and notification previews
- ⚡ **Interactive buttons** for quick actions
- 🎯 **Smart delivery** only when not using the app

**Test it out**: Close the mini app, have someone assign you a task, and watch the native Telegram notification appear! 🚀
