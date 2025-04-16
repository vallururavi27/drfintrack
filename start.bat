@echo off
echo ===================================================
echo drFinTrack - Personal Finance Web App
echo ===================================================
echo.

echo Starting backend server...
start cmd /k "call venv\Scripts\activate & cd backend & python app.py"

echo Waiting for backend to initialize...
timeout /t 10 /nobreak > nul

echo Starting frontend development server...
start cmd /k "cd frontend & npx vite"

echo.
echo ===================================================
echo drFinTrack is now running!
echo.
echo Backend: http://localhost:5000
echo Frontend: http://localhost:5173 (or another port if 5173 is in use)
echo.
echo Demo account:
echo Username: demo
echo Password: password
echo.
echo Press any key to open the application in your browser...
echo ===================================================
echo.
pause > nul

start http://localhost:5173
