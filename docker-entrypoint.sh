#!/bin/sh

# SwellScope Docker Entrypoint Script
# Manages startup of both frontend and backend services

set -e

echo "🚀 Starting SwellScope application..."

# Environment validation
echo "📋 Validating environment configuration..."

# Check required environment variables
required_vars="DATABASE_URL REDIS_URL SWELLCHAIN_RPC_URL"
for var in $required_vars; do
    if [ -z "$(eval echo \$$var)" ]; then
        echo "❌ Error: Required environment variable $var is not set"
        exit 1
    fi
done

echo "✅ Environment validation complete"

# Wait for dependencies
echo "⏳ Waiting for dependencies..."

# Wait for PostgreSQL
if [ "$DATABASE_URL" ]; then
    echo "🐘 Waiting for PostgreSQL..."
    until pg_isready -h "$(echo $DATABASE_URL | sed 's/.*@\([^:]*\).*/\1/')" > /dev/null 2>&1; do
        echo "  PostgreSQL is unavailable - sleeping..."
        sleep 2
    done
    echo "✅ PostgreSQL is ready"
fi

# Wait for Redis
if [ "$REDIS_URL" ]; then
    echo "🔴 Waiting for Redis..."
    redis_host=$(echo $REDIS_URL | sed 's/redis:\/\/\([^:]*\).*/\1/')
    redis_port=$(echo $REDIS_URL | sed 's/.*:\([0-9]*\).*/\1/')
    
    until nc -z "$redis_host" "$redis_port" > /dev/null 2>&1; do
        echo "  Redis is unavailable - sleeping..."
        sleep 2
    done
    echo "✅ Redis is ready"
fi

# Database migrations
if [ "$NODE_ENV" = "production" ]; then
    echo "🔄 Running database migrations..."
    cd /app/backend && npx prisma migrate deploy
    echo "✅ Database migrations complete"
fi

# Function to start backend
start_backend() {
    echo "🖥️  Starting backend server on port ${BACKEND_PORT:-3001}..."
    cd /app/backend
    
    # Set backend-specific environment variables
    export PORT=${BACKEND_PORT:-3001}
    
    # Start backend server
    node dist/index.js &
    BACKEND_PID=$!
    
    # Wait for backend to be ready
    echo "⏳ Waiting for backend to be ready..."
    for i in $(seq 1 30); do
        if curl -f "http://localhost:${BACKEND_PORT:-3001}/health" > /dev/null 2>&1; then
            echo "✅ Backend server is ready"
            break
        fi
        
        if [ $i -eq 30 ]; then
            echo "❌ Backend server failed to start within 30 seconds"
            exit 1
        fi
        
        sleep 1
    done
}

# Function to start frontend
start_frontend() {
    echo "🌐 Starting frontend server on port ${PORT:-3000}..."
    cd /app
    
    # Set frontend-specific environment variables
    export PORT=${PORT:-3000}
    export HOSTNAME=0.0.0.0
    
    # Start frontend server
    node server.js &
    FRONTEND_PID=$!
    
    # Wait for frontend to be ready
    echo "⏳ Waiting for frontend to be ready..."
    for i in $(seq 1 30); do
        if curl -f "http://localhost:${PORT:-3000}" > /dev/null 2>&1; then
            echo "✅ Frontend server is ready"
            break
        fi
        
        if [ $i -eq 30 ]; then
            echo "❌ Frontend server failed to start within 30 seconds"
            exit 1
        fi
        
        sleep 1
    done
}

# Function to handle shutdown
shutdown() {
    echo "🔄 Shutting down services..."
    
    if [ ! -z "$BACKEND_PID" ]; then
        echo "🛑 Stopping backend server..."
        kill -TERM "$BACKEND_PID" 2>/dev/null || true
        wait "$BACKEND_PID" 2>/dev/null || true
    fi
    
    if [ ! -z "$FRONTEND_PID" ]; then
        echo "🛑 Stopping frontend server..."
        kill -TERM "$FRONTEND_PID" 2>/dev/null || true
        wait "$FRONTEND_PID" 2>/dev/null || true
    fi
    
    echo "✅ Shutdown complete"
    exit 0
}

# Set up signal handlers
trap shutdown SIGTERM SIGINT

# Health check endpoint setup
setup_health_check() {
    echo "🏥 Setting up health check endpoint..."
    
    # Create a simple health check script
    cat > /tmp/health-check.sh << 'EOF'
#!/bin/sh
# Check if both frontend and backend are healthy

# Check backend
if ! curl -f "http://localhost:${BACKEND_PORT:-3001}/health" > /dev/null 2>&1; then
    echo "Backend health check failed"
    exit 1
fi

# Check frontend
if ! curl -f "http://localhost:${PORT:-3000}" > /dev/null 2>&1; then
    echo "Frontend health check failed"
    exit 1
fi

echo "All services healthy"
exit 0
EOF
    
    chmod +x /tmp/health-check.sh
}

# Log startup information
log_startup_info() {
    echo ""
    echo "🎉 SwellScope application started successfully!"
    echo ""
    echo "📊 Service Information:"
    echo "  Frontend URL: http://localhost:${PORT:-3000}"
    echo "  Backend API:  http://localhost:${BACKEND_PORT:-3001}"
    echo "  Environment:  ${NODE_ENV:-development}"
    echo "  Chain ID:     ${NEXT_PUBLIC_SWELLCHAIN_CHAIN_ID:-1923}"
    echo ""
    echo "🔗 Swellchain Integration:"
    echo "  RPC URL:      ${SWELLCHAIN_RPC_URL}"
    echo "  Explorer:     ${NEXT_PUBLIC_SWELLCHAIN_EXPLORER:-https://explorer.swellnetwork.io}"
    echo ""
    echo "📡 Monitoring:"
    echo "  Health Check: curl http://localhost:${PORT:-3000}/api/health"
    echo "  Backend API:  curl http://localhost:${BACKEND_PORT:-3001}/health"
    echo ""
    echo "🔧 Process IDs:"
    echo "  Backend PID:  ${BACKEND_PID}"
    echo "  Frontend PID: ${FRONTEND_PID}"
    echo ""
}

# Performance monitoring
monitor_performance() {
    if [ "$ENABLE_PERFORMANCE_MONITORING" = "true" ]; then
        echo "📈 Starting performance monitoring..."
        
        # Monitor memory usage
        (
            while true; do
                memory_usage=$(ps -o pid,ppid,cmd,%mem,%cpu --sort=-%mem -p $BACKEND_PID,$FRONTEND_PID 2>/dev/null || true)
                if [ ! -z "$memory_usage" ]; then
                    echo "$(date): Memory usage:"
                    echo "$memory_usage"
                fi
                sleep 60
            done
        ) &
        MONITOR_PID=$!
    fi
}

# Main execution
main() {
    echo "🔧 Setting up services..."
    
    # Setup health check
    setup_health_check
    
    # Start services in order
    start_backend
    start_frontend
    
    # Setup monitoring
    monitor_performance
    
    # Log startup information
    log_startup_info
    
    # Keep the script running and wait for signals
    echo "🏃 Services are running. Waiting for shutdown signal..."
    
    # Wait for any child process to exit
    wait
}

# Handle different startup modes
case "${1:-start}" in
    "start")
        main
        ;;
    "backend-only")
        echo "🖥️  Starting backend service only..."
        start_backend
        wait $BACKEND_PID
        ;;
    "frontend-only")
        echo "🌐 Starting frontend service only..."
        start_frontend
        wait $FRONTEND_PID
        ;;
    "health-check")
        echo "🏥 Running health check..."
        setup_health_check
        exec /tmp/health-check.sh
        ;;
    "migrate")
        echo "🔄 Running database migrations only..."
        cd /app/backend && npx prisma migrate deploy
        echo "✅ Migrations complete"
        ;;
    *)
        echo "❌ Unknown command: $1"
        echo "Available commands: start, backend-only, frontend-only, health-check, migrate"
        exit 1
        ;;
esac 