@echo off
setlocal
cd /d "%~dp0"

where java >nul 2>&1
if errorlevel 1 (
  echo Java 17 or newer is required.
  exit /b 1
)

if not exist "backend\target\asba-print.war" (
  echo Building the print service...
  where mvn >nul 2>&1
  if errorlevel 1 (
    echo Maven is required to create backend\target\asba-print.war
    exit /b 1
  )
  pushd backend
  call mvn -q package
  if errorlevel 1 (
    popd
    exit /b 1
  )
  popd
)

echo Starting the print service at http://localhost:8080
start "ASBA Print Service" /D "%~dp0backend" cmd /k java -jar target\asba-print.war

if not exist "frontend\node_modules\" (
  echo Installing frontend dependencies...
  pushd frontend
  call npm install
  if errorlevel 1 (
    popd
    exit /b 1
  )
  popd
)

echo Starting the editor at http://localhost:3000
pushd frontend
call npm start
popd
