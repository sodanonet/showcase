#!/bin/bash

# Showcase Micro-Frontend Deployment Script
# This script helps deploy the entire showcase application stack

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if Docker is running
check_docker() {
    if ! docker info &>/dev/null; then
        print_error "Docker is not running. Please start Docker first."
        exit 1
    fi
    print_success "Docker is running"
}

# Check if docker-compose is available
check_compose() {
    if ! command -v docker-compose &>/dev/null && ! docker compose version &>/dev/null; then
        print_error "docker-compose is not available. Please install docker-compose."
        exit 1
    fi
    print_success "Docker Compose is available"
}

# Build all services
build_all() {
    print_status "Building all services..."
    
    # Build with docker-compose
    if command -v docker-compose &>/dev/null; then
        docker-compose build --parallel
    else
        docker compose build --parallel
    fi
    
    print_success "All services built successfully"
}

# Start all services
start_all() {
    print_status "Starting all services..."
    
    # Start with docker-compose
    if command -v docker-compose &>/dev/null; then
        docker-compose up -d
    else
        docker compose up -d
    fi
    
    print_success "All services started"
}

# Stop all services
stop_all() {
    print_status "Stopping all services..."
    
    if command -v docker-compose &>/dev/null; then
        docker-compose down
    else
        docker compose down
    fi
    
    print_success "All services stopped"
}

# Show service status
status() {
    print_status "Service Status:"
    
    if command -v docker-compose &>/dev/null; then
        docker-compose ps
    else
        docker compose ps
    fi
}

# Show logs for all services
logs() {
    if [ -n "$1" ]; then
        print_status "Showing logs for service: $1"
        if command -v docker-compose &>/dev/null; then
            docker-compose logs -f "$1"
        else
            docker compose logs -f "$1"
        fi
    else
        print_status "Showing logs for all services:"
        if command -v docker-compose &>/dev/null; then
            docker-compose logs -f
        else
            docker compose logs -f
        fi
    fi
}

# Clean up all containers, volumes, and images
cleanup() {
    print_warning "This will remove all containers, volumes, and images. Are you sure? (y/N)"
    read -r response
    if [[ "$response" =~ ^([yY][eE][sS]|[yY])$ ]]; then
        print_status "Cleaning up..."
        
        if command -v docker-compose &>/dev/null; then
            docker-compose down -v --remove-orphans
        else
            docker compose down -v --remove-orphans
        fi
        
        # Remove all showcase related images
        docker images | grep showcase | awk '{print $3}' | xargs -r docker rmi -f
        
        print_success "Cleanup completed"
    else
        print_status "Cleanup cancelled"
    fi
}

# Health check for all services
health_check() {
    print_status "Performing health checks..."
    
    # Wait a moment for services to start
    sleep 10
    
    # Check each service
    services=(
        "http://localhost:3000:Shell Vue (Host)"
        "http://localhost:3001:React Remote"
        "http://localhost:3002:Vue Remote"
        "http://localhost:3004:Angular Remote"
        "http://localhost:3005:TypeScript Remote"
        "http://localhost:3006:JavaScript Remote"
        "http://localhost:5000/health:Express API"
    )
    
    for service in "${services[@]}"; do
        IFS=':' read -r url name <<< "$service"
        if curl -f -s "$url" > /dev/null; then
            print_success "$name is healthy"
        else
            print_error "$name is not responding"
        fi
    done
}

# Show help
show_help() {
    echo "Showcase Deployment Script"
    echo ""
    echo "Usage: $0 [command]"
    echo ""
    echo "Commands:"
    echo "  build      Build all services"
    echo "  start      Start all services"
    echo "  stop       Stop all services"
    echo "  restart    Restart all services"
    echo "  status     Show service status"
    echo "  logs       Show logs for all services"
    echo "  logs <service>  Show logs for specific service"
    echo "  health     Perform health checks"
    echo "  cleanup    Clean up all containers and images"
    echo "  help       Show this help message"
    echo ""
    echo "Services:"
    echo "  - shell-vue (Port 3000) - Vue Shell Host"
    echo "  - react-remote (Port 3001) - React Remote App"
    echo "  - vue-remote (Port 3002) - Vue Remote App"
    echo "  - angular-remote (Port 3004) - Angular Remote App"
    echo "  - ts-remote (Port 3005) - TypeScript Remote App"
    echo "  - js-remote (Port 3006) - JavaScript Remote App"
    echo "  - express (Port 5000) - Express API Server"
    echo "  - mongodb (Port 27017) - MongoDB Database"
    echo "  - nginx (Port 80/443) - Load Balancer"
}

# Main script logic
case "${1:-help}" in
    "build")
        check_docker
        check_compose
        build_all
        ;;
    "start")
        check_docker
        check_compose
        start_all
        ;;
    "stop")
        stop_all
        ;;
    "restart")
        check_docker
        check_compose
        stop_all
        sleep 2
        start_all
        ;;
    "status")
        status
        ;;
    "logs")
        logs "$2"
        ;;
    "health")
        health_check
        ;;
    "cleanup")
        cleanup
        ;;
    "help"|*)
        show_help
        ;;
esac