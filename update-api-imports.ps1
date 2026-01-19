# PowerShell script to update all components to use api utility
# Run this from the project root directory

$componentsPath = "frontend\src\components"

$filesToUpdate = @(
    "EmployeeList.jsx",
    "EmployeeForm.jsx",
    "EmployeeDetails.jsx",
    "ProjectDetails.jsx",
    "AttendanceManagement.jsx",
    "Dashboard.jsx"
)

Write-Host "Updating components to use centralized API utility..." -ForegroundColor Cyan

foreach ($file in $filesToUpdate) {
    $filePath = Join-Path $componentsPath $file
    
    if (Test-Path $filePath) {
        Write-Host "Processing: $file" -ForegroundColor Yellow
        
        $content = Get-Content $filePath -Raw
        
        # Replace axios import with api import
        $content = $content -replace "import axios from 'axios';", "import api from '../utils/api';"
        
        # Replace axios.get with api.get and remove token headers
        $content = $content -replace "const token = localStorage\.getItem\('token'\);[\r\n\s]+const response = await axios\.get\('http://localhost:5000(/api/[^']+)', \{[\r\n\s]+headers: \{ Authorization: ``Bearer \`\$\{token\}`` \},[\r\n\s]+\}\);", "const response = await api.get('`$1');"
        
        $content = $content -replace "const token = localStorage\.getItem\('token'\);[\r\n\s]+await axios\.(get|post|put|delete)\('http://localhost:5000(/api/[^']+)'", "await api.`$1('`$2')"
        
        $content = $content -replace "await axios\.(get|post|put|delete)\(``http://localhost:5000(/api/[^``]+)``", "await api.`$1(```$2``"
        
        # Save the file
        Set-Content $filePath -Value $content -NoNewline
        
        Write-Host "✓ Updated: $file" -ForegroundColor Green
    } else {
        Write-Host "✗ Not found: $file" -ForegroundColor Red
    }
}

Write-Host "`nAll components updated successfully!" -ForegroundColor Green
Write-Host "Please review the changes and test the application." -ForegroundColor Cyan
