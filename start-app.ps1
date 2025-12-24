# Check and install frontend dependencies
Write-Host "Checking frontend dependencies..." -ForegroundColor Cyan
if (-not (Test-Path "node_modules")) {
    Write-Host "Installing frontend dependencies..." -ForegroundColor Yellow
    npm install
} else {
    Write-Host "Frontend dependencies already installed." -ForegroundColor Green
}

# Check and install backend dependencies
Write-Host "Checking backend dependencies..." -ForegroundColor Cyan
if (-not (Test-Path "backend\node_modules")) {
    Write-Host "Installing backend dependencies..." -ForegroundColor Yellow
    Push-Location backend
    npm install
    Pop-Location
} else {
    Write-Host "Backend dependencies already installed." -ForegroundColor Green
}

# Start Backend
Write-Host "Starting Backend..." -ForegroundColor Magenta
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd backend; npm start"

# Start Frontend
Write-Host "Starting Frontend..." -ForegroundColor Magenta
# We run this in the current window so the user can see the output and potential errors readily.
# If they want it in a separate window, they can change this to Start-Process as well.
npm start
