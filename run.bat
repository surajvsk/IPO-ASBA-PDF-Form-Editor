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

call :ensure_maven
if errorlevel 1 exit /b 1

if not exist "backend\target\asba-print.war" (
  echo Building the print service...
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
exit /b 0

:ensure_maven
if defined MAVEN_HOME if exist "%MAVEN_HOME%\bin\mvn.cmd" (
  set "PATH=%MAVEN_HOME%\bin;%PATH%"
)
where mvn >nul 2>&1
if not errorlevel 1 exit /b 0

set "MAVEN_VERSION=3.9.16"
set "MAVEN_HOME=%LOCALAPPDATA%\Apache\apache-maven-%MAVEN_VERSION%"
if exist "%MAVEN_HOME%\bin\mvn.cmd" (
  set "PATH=%MAVEN_HOME%\bin;%PATH%"
  exit /b 0
)

echo Maven was not found. Installing Maven %MAVEN_VERSION%...
"%SystemRoot%\System32\WindowsPowerShell\v1.0\powershell.exe" -NoProfile -ExecutionPolicy Bypass -Command "$ErrorActionPreference='Stop'; $zip=Join-Path $env:TEMP 'apache-maven-3.9.16-bin.zip'; $dest=Join-Path $env:LOCALAPPDATA 'Apache'; Invoke-WebRequest -Uri 'https://repo.maven.apache.org/maven2/org/apache/maven/apache-maven/3.9.16/apache-maven-3.9.16-bin.zip' -OutFile $zip -UseBasicParsing; New-Item -ItemType Directory -Force -Path $dest | Out-Null; Expand-Archive -LiteralPath $zip -DestinationPath $dest -Force; Remove-Item $zip -Force"
if errorlevel 1 (
  echo Could not install Maven. Check the network connection and run this script again.
  exit /b 1
)
if not exist "%MAVEN_HOME%\bin\mvn.cmd" (
  echo Maven install did not create %MAVEN_HOME%\bin\mvn.cmd
  exit /b 1
)
set "PATH=%MAVEN_HOME%\bin;%PATH%"
echo Maven %MAVEN_VERSION% installed.
exit /b 0
