@echo off
title Decision Intelligence Platform Starter
echo ===================================================
echo Starting Decision Intelligence Platform Services...
echo ===================================================

:: Start FastAPI Backend
echo [1/2] Launching Backend API on http://localhost:8001 ...
start "Decision Intelligence Backend" cmd /k "cd backend && venv\Scripts\python main.py"

:: Start Next.js Frontend
echo [2/2] Launching Frontend Server on http://localhost:3000 ...
start "Decision Intelligence Frontend" cmd /k "cd frontend && npm run dev"

echo ===================================================
echo Both services have been launched in separate windows!
echo Keep those command windows open to keep the servers running.
echo ===================================================
pause
