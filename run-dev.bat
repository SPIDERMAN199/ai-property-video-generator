@echo off
echo ========================================================
echo Starting AI Property Video Studio by Realty Assistant
echo ========================================================

echo [1/2] Starting Backend Server (FastAPI on http://127.0.0.1:8000)...
start "Realty Assistant Backend" cmd /k "cd backend && python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload"

echo [2/2] Starting Frontend Server (Vite on http://localhost:5173)...
start "Realty Assistant Frontend" cmd /k "cd frontend && npm run dev"

echo.
echo Both servers are launching!
echo Backend API Docs: http://127.0.0.1:8000/docs
echo Frontend Studio:  http://localhost:5173
echo ========================================================
pause
