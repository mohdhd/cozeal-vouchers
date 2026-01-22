#!/bin/bash

# ===========================================
# Cozeal Vouchers - Docker Deployment Script
# ===========================================

set -e

echo "🚀 Cozeal Vouchers - Docker Deployment"
echo "======================================="

# Check if .env file exists
if [ ! -f .env ]; then
    echo "❌ Error: .env file not found!"
    echo "   Copy env.example to .env and configure your environment variables."
    echo "   Run: cp env.example .env"
    exit 1
fi

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Error: Docker is not running!"
    echo "   Please start Docker and try again."
    exit 1
fi

# Determine which compose file to use
COMPOSE_FILE="docker compose.yml"
if [ "$2" == "prod" ]; then
    COMPOSE_FILE="docker compose.prod.yml"
    echo "📦 Using production configuration"
fi

# Parse command line arguments
case "$1" in
    build)
        echo "📦 Building Docker image..."
        docker compose -f $COMPOSE_FILE build --no-cache
        echo "✅ Build complete!"
        ;;
    start)
        echo "🚀 Starting containers..."
        docker compose -f $COMPOSE_FILE up -d
        echo "✅ Containers started!"
        echo ""
        echo "   App running at: http://localhost:3000"
        echo "   MongoDB running at: localhost:27017"
        ;;
    stop)
        echo "🛑 Stopping containers..."
        docker compose -f $COMPOSE_FILE down
        echo "✅ Containers stopped!"
        ;;
    restart)
        echo "🔄 Restarting containers..."
        docker compose -f $COMPOSE_FILE down
        docker compose -f $COMPOSE_FILE up -d
        echo "✅ Containers restarted!"
        ;;
    logs)
        echo "📋 Showing logs (Ctrl+C to exit)..."
        docker compose -f $COMPOSE_FILE logs -f
        ;;
    logs-app)
        echo "📋 Showing app logs..."
        docker compose -f $COMPOSE_FILE logs -f app
        ;;
    logs-mongo)
        echo "📋 Showing MongoDB logs..."
        docker compose -f $COMPOSE_FILE logs -f mongo
        ;;
    status)
        echo "📊 Container status:"
        docker compose -f $COMPOSE_FILE ps
        ;;
    seed)
        echo "🌱 Running database seed..."
        echo "   This will create the admin account and default settings."
        echo ""
        docker compose -f $COMPOSE_FILE exec app npx tsx scripts/seed.ts
        echo ""
        echo "✅ Seed complete!"
        ;;
    init)
        echo "🏁 Initializing Cozeal Vouchers for first-time setup..."
        echo ""
        
        # Build if needed
        if ! docker compose -f $COMPOSE_FILE images -q app 2>/dev/null | grep -q .; then
            echo "📦 Building Docker image..."
            docker compose -f $COMPOSE_FILE build
        fi
        
        # Start containers
        echo "🚀 Starting containers..."
        docker compose -f $COMPOSE_FILE up -d
        
        # Wait for MongoDB to be ready
        echo "⏳ Waiting for MongoDB to be ready..."
        sleep 5
        
        # Run seed
        echo "🌱 Seeding database..."
        docker compose -f $COMPOSE_FILE exec app npx tsx scripts/seed.ts
        
        echo ""
        echo "=============================================="
        echo "✅ Initialization complete!"
        echo ""
        echo "🌐 App running at: http://localhost:3000"
        echo "🔐 Admin panel at: http://localhost:3000/admin"
        echo ""
        echo "Admin credentials:"
        echo "   Email: admin@cozeal.ai"
        echo "   Password: Cz@Admin#2026!Secure"
        echo ""
        echo "⚠️  IMPORTANT: Change the admin password after first login!"
        echo "=============================================="
        ;;
    shell)
        echo "🐚 Opening shell in app container..."
        docker compose -f $COMPOSE_FILE exec app sh
        ;;
    mongo-shell)
        echo "🐚 Opening MongoDB shell..."
        if [ "$COMPOSE_FILE" == "docker compose.prod.yml" ]; then
            source .env
            docker compose -f $COMPOSE_FILE exec mongo mongosh -u ${MONGO_USERNAME:-admin} -p ${MONGO_PASSWORD:-password} --authenticationDatabase admin cozeal
        else
            docker compose -f $COMPOSE_FILE exec mongo mongosh cozeal
        fi
        ;;
    backup)
        echo "💾 Creating MongoDB backup..."
        BACKUP_FILE="backup_$(date +%Y%m%d_%H%M%S).gz"
        if [ "$COMPOSE_FILE" == "docker compose.prod.yml" ]; then
            source .env
            docker compose -f $COMPOSE_FILE exec mongo mongodump --uri="mongodb://${MONGO_USERNAME:-admin}:${MONGO_PASSWORD:-password}@localhost:27017/cozeal?authSource=admin" --archive --gzip | cat > $BACKUP_FILE
        else
            docker compose -f $COMPOSE_FILE exec mongo mongodump --uri="mongodb://localhost:27017/cozeal" --archive --gzip | cat > $BACKUP_FILE
        fi
        echo "✅ Backup created: $BACKUP_FILE"
        ;;
    clean)
        echo "🧹 Cleaning up (this will delete all data!)..."
        read -p "Are you sure? (y/N) " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            docker compose -f $COMPOSE_FILE down -v --rmi local
            echo "✅ Cleanup complete!"
        else
            echo "❌ Cancelled"
        fi
        ;;
    *)
        echo "Usage: $0 {command} [prod]"
        echo ""
        echo "Commands:"
        echo "  init        - First-time setup (build, start, seed)"
        echo "  build       - Build Docker image"
        echo "  start       - Start containers"
        echo "  stop        - Stop containers"
        echo "  restart     - Restart containers"
        echo "  logs        - View all logs"
        echo "  logs-app    - View app logs only"
        echo "  logs-mongo  - View MongoDB logs only"
        echo "  status      - Show container status"
        echo "  seed        - Run database seed script"
        echo "  shell       - Open shell in app container"
        echo "  mongo-shell - Open MongoDB shell"
        echo "  backup      - Create MongoDB backup"
        echo "  clean       - Remove containers, volumes, and images"
        echo ""
        echo "Options:"
        echo "  prod        - Use production config (docker compose.prod.yml)"
        echo ""
        echo "Examples:"
        echo "  $0 init            # First-time setup (recommended)"
        echo "  $0 init prod       # First-time production setup"
        echo "  $0 start           # Start with development config"
        echo "  $0 start prod      # Start with production config"
        echo "  $0 logs prod       # View logs in production"
        exit 1
        ;;
esac
