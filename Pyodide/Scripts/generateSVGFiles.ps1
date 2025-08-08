param (
[string]$pythonPath
)

$curDir = Get-Location
Set-Location $PSScriptRoot

if($pythonPath){
    Write-Host "Using venv from script argument" -ForegroundColor Green
    Set-Alias pythonPath $pythonPath
}
else{

    $existsVenv = Test-Path ..\..\simpliPFy\.venv\Scripts\python.exe
    if ($existsVenv){
        Write-Host "Using existing dev environment in ..\..\simpliPFy\.venv" -ForegroundColor Green
        Set-Alias pythonPath (Resolve-Path '..\..\simpliPFy\.venv\Scripts\python.exe').Path
    } else {
        Write-Host "No virtual environment found, using system Python" -ForegroundColor Yellow
        Set-Alias pythonPath python
    }
}

pythonPath .\generateSVGFiles.py -path ../Circuits

Set-Location $curDir