# ProxyHub Security Verification Script
# Tests all security hardening features

Write-Host "================================================" -ForegroundColor Cyan
Write-Host "  ProxyHub Security Verification" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""

$baseUrl = "http://localhost:3000/api/v1"
$testEmail = "test-$(Get-Random)@example.com"

# Test 1: Security Headers
Write-Host "[Test 1/5] Checking Security Headers..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "$baseUrl/auth/login" -Method GET -ErrorAction SilentlyContinue
    $headers = $response.Headers
    
    $checks = @{
        "X-Frame-Options" = $headers["X-Frame-Options"]
        "X-Content-Type-Options" = $headers["X-Content-Type-Options"]
        "X-XSS-Protection" = $headers["X-XSS-Protection"]
    }
    
    foreach ($header in $checks.Keys) {
        if ($checks[$header]) {
            Write-Host "  ✅ $header`: $($checks[$header])" -ForegroundColor Green
        } else {
            Write-Host "  ❌ $header`: Missing" -ForegroundColor Red
        }
    }
} catch {
    Write-Host "  ⚠️  Could not check headers (server may not be running)" -ForegroundColor Yellow
}
Write-Host ""

# Test 2: Rate Limiting
Write-Host "[Test 2/5] Testing Rate Limiting..." -ForegroundColor Yellow
$rateLimit429 = $false
for ($i = 1; $i -le 6; $i++) {
    try {
        $body = @{
            email = $testEmail
            password = "WrongPassword123"
        } | ConvertTo-Json
        
        $response = Invoke-RestMethod -Uri "$baseUrl/auth/login" `
            -Method POST `
            -ContentType "application/json" `
            -Body $body `
            -ErrorAction SilentlyContinue
    } catch {
        $statusCode = $_.Exception.Response.StatusCode.value__
        if ($i -le 5) {
            Write-Host "  Attempt $i`: $statusCode (expected 401)" -ForegroundColor Gray
        } else {
            if ($statusCode -eq 429) {
                Write-Host "  ✅ Attempt $i`: 429 Too Many Requests (Rate limiting working!)" -ForegroundColor Green
                $rateLimit429 = $true
            } else {
                Write-Host "  ❌ Attempt $i`: $statusCode (expected 429)" -ForegroundColor Red
            }
        }
    }
}
Write-Host ""

# Test 3: Password Validation
Write-Host "[Test 3/5] Testing Password Validation..." -ForegroundColor Yellow
try {
    $weakBody = @{
        email = "weakpass@example.com"
        password = "weak"
        nickname = "Test"
    } | ConvertTo-Json
    
    $response = Invoke-RestMethod -Uri "$baseUrl/auth/register" `
        -Method POST `
        -ContentType "application/json" `
        -Body $weakBody `
        -ErrorAction SilentlyContinue
    
    Write-Host "  ❌ Weak password was accepted (should be rejected)" -ForegroundColor Red
} catch {
    $statusCode = $_.Exception.Response.StatusCode.value__
    if ($statusCode -eq 400) {
        Write-Host "  ✅ Weak password rejected (400 Bad Request)" -ForegroundColor Green
    } else {
        Write-Host "  ⚠️  Unexpected status: $statusCode" -ForegroundColor Yellow
    }
}
Write-Host ""

# Test 4: Input Length Validation
Write-Host "[Test 4/5] Testing Input Length Validation..." -ForegroundColor Yellow
try {
    $longEmail = "a" * 300 + "@example.com"
    $longBody = @{
        email = $longEmail
        password = "Password123"
    } | ConvertTo-Json
    
    $response = Invoke-RestMethod -Uri "$baseUrl/auth/login" `
        -Method POST `
        -ContentType "application/json" `
        -Body $longBody `
        -ErrorAction SilentlyContinue
    
    Write-Host "  ❌ Long email was accepted (should be rejected)" -ForegroundColor Red
} catch {
    $statusCode = $_.Exception.Response.StatusCode.value__
    if ($statusCode -eq 400) {
        Write-Host "  ✅ Long email rejected (400 Bad Request)" -ForegroundColor Green
    } else {
        Write-Host "  ⚠️  Unexpected status: $statusCode" -ForegroundColor Yellow
    }
}
Write-Host ""

# Test 5: Exception Handling
Write-Host "[Test 5/5] Testing Global Exception Handler..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/nonexistent" `
        -Method GET `
        -ErrorAction SilentlyContinue
} catch {
    $statusCode = $_.Exception.Response.StatusCode.value__
    if ($statusCode -eq 404) {
        Write-Host "  ✅ 404 Not Found handled correctly" -ForegroundColor Green
    } else {
        Write-Host "  ⚠️  Unexpected status: $statusCode" -ForegroundColor Yellow
    }
}
Write-Host ""

# Summary
Write-Host "================================================" -ForegroundColor Cyan
Write-Host "  Verification Complete" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "  1. Check backend logs: docker-compose logs -f backend" -ForegroundColor Gray
Write-Host "  2. Run unit tests: cd backend && npm test" -ForegroundColor Gray
Write-Host "  3. Monitor rate limiting: docker-compose logs backend | Select-String 'ThrottlerException'" -ForegroundColor Gray
Write-Host ""

