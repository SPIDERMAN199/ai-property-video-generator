# ========================================================
# Launch AI Property Video Studio by Realty Assistant
# ========================================================

Write-Host "Starting AI Property Video Studio by Realty Assistant..." -ForegroundColor Cyan

$backendPath = Join-Path $PSScriptRoot "backend"
$frontendPath = Join-Path $PSScriptRoot "frontend"

Write-Host "[1/2] Launching Backend on http://127.0.0.1:8000..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$backendPath'; python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload"

Write-Host "[2/2] Launching Frontend on http://localhost:5173..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$frontendPath'; npm run dev"

Write-Host "Both servers started successfully!" -ForegroundColor Yellow
Write-Host "Backend Docs:  http://127.0.0.1:8000/docs"
Write-Host "Studio UI:     http://localhost:5173"
