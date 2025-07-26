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