#!/usr/bin/env pwsh
# Start Frontend and Backend for TradePass

Write-Host "🚀 Starting TradePass System..." -ForegroundColor Cyan

# Check prerequisites
$pythonVersion = python --version 2>&1
$nodeVersion = node --version 2>&1

Write-Host "Python: $pythonVersion" -ForegroundColor Green
Write-Host "Node: $nodeVersion" -ForegroundColor Green

# Start Backend
Write-Host "`n📡 Starting Backend..." -ForegroundColor Yellow
$backendPath = "$PSScriptRoot"
$backendJob = Start-Job -ScriptBlock {
    Set-Location $using:backendPath
    .\venv\Scripts\Activate.ps1
    python app/main.py
}

Write-Host "Backend job started (PID: $($backendJob.Id))" -ForegroundColor Green
Write-Host "⏳ Waiting 3 seconds for backend to initialize..." -ForegroundColor Yellow
Start-Sleep -Seconds 3

# Start Frontend
Write-Host "`n🎨 Starting Frontend..." -ForegroundColor Yellow
$frontendPath = "$PSScriptRoot\frontend"
$frontendJob = Start-Job -ScriptBlock {
    Set-Location $using:frontendPath
    npm run dev
}

Write-Host "Frontend job started (PID: $($frontendJob.Id))" -ForegroundColor Green

Write-Host "`n✅ TradePass System is Starting!" -ForegroundColor Green
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host "📡 Backend API: http://localhost:8000" -ForegroundColor Cyan
Write-Host "📡 API Docs:    http://localhost:8000/docs" -ForegroundColor Cyan
Write-Host "🎨 Frontend:    http://localhost:5173 (or 3000)" -ForegroundColor Cyan
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan

Write-Host "`nℹ️  To stop the services:" -ForegroundColor Yellow
Write-Host "Stop-Job -Job `$backendJob, `$frontendJob" -ForegroundColor Gray

# Keep script running
while ($true) {
    $backendState = (Get-Job -Id $backendJob.Id).State
    $frontendState = (Get-Job -Id $frontendJob.Id).State
    
    if ($backendState -ne "Running" -or $frontendState -ne "Running") {
        Write-Host "`n⚠️  One of the services has stopped!" -ForegroundColor Red
        Write-Host "Backend state: $backendState" -ForegroundColor Yellow
        Write-Host "Frontend state: $frontendState" -ForegroundColor Yellow
        break
    }
    
    Start-Sleep -Seconds 5
}

# Cleanup
Write-Host "`nCleaning up..." -ForegroundColor Yellow
Stop-Job -Job $backendJob, $frontendJob
Remove-Job -Job $backendJob, $frontendJob
Write-Host "✅ Services stopped" -ForegroundColor Green
