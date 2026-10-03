@echo off
setlocal
cd /d "%~dp0"

if defined JAVA_HOME if exist "%JAVA_HOME%\bin\java.exe" (
  set "PATH=%JAVA_HOME%\bin;%PATH%"
)

where java >nul 2>&1
if errorlevel 1 (
  echo Java 17 or newer is required.
  exit /b 1
)

set "JAVA_VER="
for /f "tokens=3" %%v in ('java -version 2^>^&1 ^| findstr /i "version"') do set "JAVA_VER=%%~v"
for /f "tokens=1,2 delims=." %%a in ("%JAVA_VER%") do (
  set "JAVA_MAJOR=%%a"
  set "JAVA_MINOR=%%b"
)
if "%JAVA_MAJOR%"=="1" set "JAVA_MAJOR=%JAVA_MINOR%"
if %JAVA_MAJOR% LSS 17 (
  echo Java 17 or newer is required. Found Java %JAVA_VER%.
  echo Set JAVA_HOME to a JDK 17 or newer install and run this script again.
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
