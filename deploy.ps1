# Showcase Micro-Frontend Deployment Script (PowerShell)
# This script helps deploy the entire showcase application stack

param(
    [string]$Command = "help",
    [string]$Service = ""
)

# Colors for output
function Write-Info($message) {
    Write-Host "[INFO] $message" -ForegroundColor Blue
}

function Write-Success($message) {
    Write-Host "[SUCCESS] $message" -ForegroundColor Green
}

function Write-Warning($message) {
    Write-Host "[WARNING] $message" -ForegroundColor Yellow
}

function Write-Error($message) {
    Write-Host "[ERROR] $message" -ForegroundColor Red
}

# Check if Docker is running
function Test-Docker {
    try {
        $null = docker info 2>$null
        Write-Success "Docker is running"
        return $true
    }
    catch {
        Write-Error "Docker is not running. Please start Docker first."
        return $false
    }
}

# Check if docker-compose is available
function Test-Compose {
    $hasCompose = Get-Command docker-compose -ErrorAction SilentlyContinue
    $hasDockerCompose = try { docker compose version 2>$null; $true } catch { $false }
    
    if ($hasCompose -or $hasDockerCompose) {
        Write-Success "Docker Compose is available"
        return $true
    }
    else {
        Write-Error "docker-compose is not available. Please install docker-compose."
        return $false
    }
}

# Build all services
function Build-All {
    Write-Info "Building all services..."
    
    if (Get-Command docker-compose -ErrorAction SilentlyContinue) {
        docker-compose build --parallel
    } else {
        docker compose build --parallel
    }
    
    if ($LASTEXITCODE -eq 0) {
        Write-Success "All services built successfully"
    } else {
        Write-Error "Build failed"
        exit 1
    }
}

# Start all services
function Start-All {
    Write-Info "Starting all services..."
    
    if (Get-Command docker-compose -ErrorAction SilentlyContinue) {
        docker-compose up -d
    } else {
        docker compose up -d
    }
    
    if ($LASTEXITCODE -eq 0) {
        Write-Success "All services started"
    } else {
        Write-Error "Failed to start services"
        exit 1
    }
}

# Stop all services
function Stop-All {
    Write-Info "Stopping all services..."
    
    if (Get-Command docker-compose -ErrorAction SilentlyContinue) {
        docker-compose down
    } else {
        docker compose down
    }
    
    if ($LASTEXITCODE -eq 0) {
        Write-Success "All services stopped"
    } else {
        Write-Error "Failed to stop services"
    }
}

# Show service status
function Show-Status {
    Write-Info "Service Status:"
    
    if (Get-Command docker-compose -ErrorAction SilentlyContinue) {
        docker-compose ps
    } else {
        docker compose ps
    }
}

# Show logs for services
function Show-Logs {
    param([string]$ServiceName)
    
    if ($ServiceName) {
        Write-Info "Showing logs for service: $ServiceName"
        if (Get-Command docker-compose -ErrorAction SilentlyContinue) {
            docker-compose logs -f $ServiceName
        } else {
            docker compose logs -f $ServiceName
        }
    } else {
        Write-Info "Showing logs for all services:"
        if (Get-Command docker-compose -ErrorAction SilentlyContinue) {
            docker-compose logs -f
        } else {
            docker compose logs -f
        }
    }
}

# Clean up all containers, volumes, and images
function Start-Cleanup {
    $response = Read-Host "This will remove all containers, volumes, and images. Are you sure? (y/N)"
    if ($response -match "^[yY]") {
        Write-Info "Cleaning up..."
        
        if (Get-Command docker-compose -ErrorAction SilentlyContinue) {
            docker-compose down -v --remove-orphans
        } else {
            docker compose down -v --remove-orphans
        }
        
        # Remove all showcase related images
        $showcaseImages = docker images --format "table {{.Repository}}:{{.Tag}} {{.ID}}" | Where-Object { $_ -like "*showcase*" }
        if ($showcaseImages) {
            $imageIds = $showcaseImages | ForEach-Object { ($_ -split '\s+')[-1] }
            docker rmi -f $imageIds
        }
        
        Write-Success "Cleanup completed"
    } else {
        Write-Info "Cleanup cancelled"
    }
}

# Health check for all services
function Test-Health {
    Write-Info "Performing health checks..."
    
    # Wait a moment for services to start
    Start-Sleep -Seconds 10
    
    $services = @(
        @{ Url = "http://localhost:3000"; Name = "Shell Vue (Host)" },
        @{ Url = "http://localhost:3001"; Name = "React Remote" },
        @{ Url = "http://localhost:3002"; Name = "Vue Remote" },
        @{ Url = "http://localhost:3004"; Name = "Angular Remote" },
        @{ Url = "http://localhost:3005"; Name = "TypeScript Remote" },
        @{ Url = "http://localhost:3006"; Name = "JavaScript Remote" },
        @{ Url = "http://localhost:5000/health"; Name = "Express API" }
    )
    
    foreach ($service in $services) {
        try {
            $response = Invoke-WebRequest -Uri $service.Url -TimeoutSec 5 -UseBasicParsing
            if ($response.StatusCode -eq 200) {
                Write-Success "$($service.Name) is healthy"
            } else {
                Write-Error "$($service.Name) returned status code $($response.StatusCode)"
            }
        }
        catch {
            Write-Error "$($service.Name) is not responding"
        }
    }
}

# Show help
function Show-Help {
    Write-Host "Showcase Deployment Script (PowerShell)" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Usage: .\deploy.ps1 -Command <command> [-Service <service>]" -ForegroundColor White
    Write-Host ""
    Write-Host "Commands:" -ForegroundColor Yellow
    Write-Host "  build      Build all services"
    Write-Host "  start      Start all services"
    Write-Host "  stop       Stop all services"
    Write-Host "  restart    Restart all services"
    Write-Host "  status     Show service status"
    Write-Host "  logs       Show logs for all services"
    Write-Host "  health     Perform health checks"
    Write-Host "  cleanup    Clean up all containers and images"
    Write-Host "  help       Show this help message"
    Write-Host ""
    Write-Host "Examples:" -ForegroundColor Yellow
    Write-Host "  .\deploy.ps1 -Command build"
    Write-Host "  .\deploy.ps1 -Command logs -Service express"
    Write-Host "  .\deploy.ps1 -Command start"
    Write-Host ""
    Write-Host "Services:" -ForegroundColor Yellow
    Write-Host "  - shell-vue (Port 3000) - Vue Shell Host"
    Write-Host "  - react-remote (Port 3001) - React Remote App"
    Write-Host "  - vue-remote (Port 3002) - Vue Remote App"
    Write-Host "  - angular-remote (Port 3004) - Angular Remote App"
    Write-Host "  - ts-remote (Port 3005) - TypeScript Remote App"
    Write-Host "  - js-remote (Port 3006) - JavaScript Remote App"
    Write-Host "  - express (Port 5000) - Express API Server"
    Write-Host "  - mongodb (Port 27017) - MongoDB Database"
    Write-Host "  - nginx (Port 80/443) - Load Balancer"
}

# Main script logic
switch ($Command.ToLower()) {
    "build" {
        if (Test-Docker -and Test-Compose) {
            Build-All
        }
    }
    "start" {
        if (Test-Docker -and Test-Compose) {
            Start-All
        }
    }
    "stop" {
        Stop-All
    }
    "restart" {
        if (Test-Docker -and Test-Compose) {
            Stop-All
            Start-Sleep -Seconds 2
            Start-All
        }
    }
    "status" {
        Show-Status
    }
    "logs" {
        Show-Logs -ServiceName $Service
    }
    "health" {
        Test-Health
    }
    "cleanup" {
        Start-Cleanup
    }
    default {
        Show-Help
    }
}