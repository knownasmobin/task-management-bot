#!/bin/bash

# Task Manager Docker Setup Script
# This script helps set up the environment and deploy the application

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if Docker is installed
check_docker() {
    if ! command -v docker &> /dev/null; then
        print_error "Docker is not installed. Please install Docker first."
        exit 1
    fi
    
    if ! command -v docker-compose &> /dev/null; then
        print_error "Docker Compose is not installed. Please install Docker Compose first."
        exit 1
    fi
    
    print_status "Docker and Docker Compose are installed"
}

# Create necessary directories
create_directories() {
    print_status "Creating necessary directories..."
    mkdir -p logs/nginx
    mkdir -p data
    mkdir -p nginx/ssl
    print_status "Directories created successfully"
}

# Generate SSL certificates (self-signed for development)
generate_ssl_certs() {
    if [ ! -f "nginx/ssl/cert.pem" ] || [ ! -f "nginx/ssl/key.pem" ]; then
        print_status "Generating self-signed SSL certificates..."
        openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
            -keyout nginx/ssl/key.pem \
            -out nginx/ssl/cert.pem \
            -subj "/C=US/ST=State/L=City/O=Organization/CN=localhost"
        print_status "SSL certificates generated"
    else
        print_status "SSL certificates already exist"
    fi
}

# Check environment file
check_env_file() {
    if [ ! -f ".env" ]; then
        if [ -f ".env.docker" ]; then
            print_status "Copying .env.docker to .env"
            cp .env.docker .env
        else
            print_error "No .env file found. Please create one from .env.docker template"
            exit 1
        fi
    fi
    
    # Check for required environment variables
    required_vars=("TELEGRAM_BOT_TOKEN" "ADMIN_TELEGRAM_ID" "JWT_SECRET" "ENCRYPTION_KEY")
    
    for var in "${required_vars[@]}"; do
        if ! grep -q "^${var}=" .env || grep -q "^${var}=.*_here" .env; then
            print_warning "Please set ${var} in your .env file"
        fi
    done
}

# Build and start services
start_services() {
    local profile=${1:-""}
    local services=${2:-""}
    
    print_status "Building and starting services..."
    
    if [ -n "$profile" ]; then
        if [ -n "$services" ]; then
            docker-compose --profile "$profile" up -d --build $services
        else
            docker-compose --profile "$profile" up -d --build
        fi
    else
        if [ -n "$services" ]; then
            docker-compose up -d --build $services
        else
            docker-compose up -d --build
        fi
    fi
    
    print_status "Services started successfully"
}

# Show service status
show_status() {
    print_status "Service status:"
    docker-compose ps
    
    echo ""
    print_status "Service logs (last 10 lines):"
    docker-compose logs --tail=10
}

# Setup webhook with Telegram
setup_webhook() {
    print_status "Setting up Telegram webhook..."
    
    # Read bot token and webhook URL from .env
    BOT_TOKEN=$(grep "^TELEGRAM_BOT_TOKEN=" .env | cut -d'=' -f2)
    WEBHOOK_URL=$(grep "^WEBHOOK_URL=" .env | cut -d'=' -f2)
    
    if [ -z "$BOT_TOKEN" ] || [ "$BOT_TOKEN" = "your_bot_token_here" ]; then
        print_error "Please set TELEGRAM_BOT_TOKEN in your .env file"
        return 1
    fi
    
    if [ -z "$WEBHOOK_URL" ] || [ "$WEBHOOK_URL" = "https://your-domain.com/webhook" ]; then
        print_error "Please set WEBHOOK_URL in your .env file"
        return 1
    fi
    
    # Set webhook
    curl -X POST "https://api.telegram.org/bot${BOT_TOKEN}/setWebhook" \
        -H "Content-Type: application/json" \
        -d "{\"url\":\"${WEBHOOK_URL}\"}"
    
    print_status "Webhook setup completed"
}

# Main function
main() {
    case "$1" in
        "start")
            check_docker
            create_directories
            generate_ssl_certs
            check_env_file
            start_services "" "$2"
            show_status
            ;;
        "start-dev")
            check_docker
            create_directories
            check_env_file
            start_services "development" "$2"
            show_status
            ;;
        "start-monitoring")
            check_docker
            create_directories
            check_env_file
            start_services "monitoring" "$2"
            show_status
            ;;
        "stop")
            print_status "Stopping services..."
            docker-compose down "$2"
            ;;
        "restart")
            print_status "Restarting services..."
            docker-compose restart "$2"
            ;;
        "logs")
            docker-compose logs -f "$2"
            ;;
        "status")
            show_status
            ;;
        "setup-webhook")
            setup_webhook
            ;;
        "clean")
            print_status "Cleaning up Docker resources..."
            docker-compose down -v --remove-orphans
            docker system prune -f
            print_status "Cleanup completed"
            ;;
        "backup")
            print_status "Creating backup..."
            mkdir -p backups
            docker-compose exec -T postgres pg_dump -U taskmanager task_manager > "backups/db_backup_$(date +%Y%m%d_%H%M%S).sql"
            tar -czf "backups/app_backup_$(date +%Y%m%d_%H%M%S).tar.gz" data/ logs/ .env
            print_status "Backup created in backups/ directory"
            ;;
        *)
            echo "Usage: $0 {start|start-dev|start-monitoring|stop|restart|logs|status|setup-webhook|clean|backup} [service_name]"
            echo ""
            echo "Commands:"
            echo "  start              - Start production services"
            echo "  start-dev          - Start development services with hot reload"
            echo "  start-monitoring   - Start with monitoring (Prometheus + Grafana)"
            echo "  stop               - Stop all services"
            echo "  restart            - Restart services"
            echo "  logs               - Show service logs"
            echo "  status             - Show service status"
            echo "  setup-webhook      - Configure Telegram webhook"
            echo "  clean              - Clean up Docker resources"
            echo "  backup             - Create database and app backup"
            echo ""
            echo "Examples:"
            echo "  $0 start                    # Start all production services"
            echo "  $0 start task-manager       # Start only the main app"
            echo "  $0 start-dev                # Start development environment"
            echo "  $0 logs task-manager        # Show logs for main app"
            echo "  $0 stop postgres            # Stop only PostgreSQL"
            exit 1
            ;;
    esac
}

# Run main function with all arguments
main "$@"