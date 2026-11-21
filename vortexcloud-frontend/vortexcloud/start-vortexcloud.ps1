# VortexCloud Local Runner (Frontend :3000 + Backend :8001)
# Run from VS Code terminal:  powershell -ExecutionPolicy Bypass -File .\start-vortexcloud.ps1
$root = Split-Path -Parent $MyInvocation.MyCommand.Path

# First run: create backend\.env from the example, install packages if missing.
if (-not (Test-Path "$root\backend\.env")) { Copy-Item "$root\backend\.env.example" "$root\backend\.env" }
if (-not (Test-Path "$root\backend\.venv")) {
  Write-Host "Creating Python venv + installing backend packages..." -ForegroundColor Yellow
  python -m venv "$root\backend\.venv"
  & "$root\backend\.venv\Scripts\python.exe" -m pip install -r "$root\backend\requirements.txt"
}
if (-not (Test-Path "$root\frontend\node_modules")) {
  Write-Host "Installing frontend packages (npm install)..." -ForegroundColor Yellow
  Push-Location "$root\frontend"; npm install; Pop-Location
}

Write-Host "Starting VortexCloud Backend on http://localhost:8001 ..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$root\backend'; .\.venv\Scripts\python.exe -m uvicorn server:app --host 0.0.0.0 --port 8001 --reload"
Write-Host "Starting VortexCloud Frontend on http://localhost:3000 ..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$root\frontend'; npm run dev"
