# Kill processes on ports 5000 and 3000
# Use this if you get "EADDRINUSE" errors

Write-Host "Checking for processes on ports 5000 and 3000..." -ForegroundColor Yellow

# Find and kill process on port 5000
$port5000 = netstat -ano | findstr :5000 | Select-String -Pattern "LISTENING" | ForEach-Object {
    $_ -match '\s+(\d+)\s*$' | Out-Null
    $matches[1]
} | Select-Object -First 1

if ($port5000) {
    Write-Host "Killing process on port 5000 (PID: $port5000)..." -ForegroundColor Red
    taskkill /PID $port5000 /F
}
else {
    Write-Host "No process found on port 5000" -ForegroundColor Green
}

# Find and kill process on port 3000
$port3000 = netstat -ano | findstr :3000 | Select-String -Pattern "LISTENING" | ForEach-Object {
    $_ -match '\s+(\d+)\s*$' | Out-Null
    $matches[1]
} | Select-Object -First 1

if ($port3000) {
    Write-Host "Killing process on port 3000 (PID: $port3000)..." -ForegroundColor Red
    taskkill /PID $port3000 /F
}
else {
    Write-Host "No process found on port 3000" -ForegroundColor Green
}

Write-Host "`nPorts cleared! You can now run 'npm run dev'" -ForegroundColor Green
