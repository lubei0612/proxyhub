# ProxyHub Security Monitoring Script
# Monitors rate limiting, failed logins, and exceptions

Write-Host "================================================" -ForegroundColor Cyan
Write-Host "  ProxyHub Security Monitor" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Monitoring backend logs... (Press Ctrl+C to stop)" -ForegroundColor Yellow
Write-Host ""

# Check if Docker is running
try {
    docker ps | Out-Null
} catch {
    Write-Host "❌ Docker is not running!" -ForegroundColor Red
    exit 1
}

# Check if proxyhub containers are running
$containers = docker ps --filter "name=proxyhub" --format "{{.Names}}"
if (-not $containers) {
    Write-Host "❌ ProxyHub containers are not running!" -ForegroundColor Red
    Write-Host "Start with: docker-compose up -d" -ForegroundColor Yellow
    exit 1
}

Write-Host "Monitoring security events..." -ForegroundColor Green
Write-Host ""

# Monitor logs
docker-compose logs -f backend | ForEach-Object {
    $line = $_
    
    # Highlight rate limiting
    if ($line -match "ThrottlerException|429|Too Many Requests") {
        Write-Host $line -ForegroundColor Red
    }
    # Highlight authentication failures
    elseif ($line -match "UnauthorizedException|401|Unauthorized") {
        Write-Host $line -ForegroundColor Yellow
    }
    # Highlight validation errors
    elseif ($line -match "ValidationError|400|Bad Request") {
        Write-Host $line -ForegroundColor Magenta
    }
    # Highlight configuration errors
    elseif ($line -match "Configuration.*failed|JWT_SECRET.*required|PROXY_985") {
        Write-Host $line -ForegroundColor Red -BackgroundColor White
    }
    # Highlight successful starts
    elseif ($line -match "Environment configuration validated|ProxyHub Backend Started") {
        Write-Host $line -ForegroundColor Green
    }
    # Normal logs
    else {
        Write-Host $line -ForegroundColor Gray
    }
}

