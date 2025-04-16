@echo off
echo ===================================================
echo FinTrack - Personal Finance Web App Setup
echo ===================================================
echo.

echo Setting up the frontend...
cd frontend
call npm install
cd ..

echo.
echo Creating Python virtual environment...
python -m venv venv
call venv\Scripts\activate

echo.
echo Setting up the backend...
cd backend
pip install flask flask-cors flask-restful flask-jwt-extended
cd ..

echo.
echo ===================================================
echo Setup complete!
echo.
echo To start the application, run start.bat
echo ===================================================
echo.
pause
