$startDir = Get-Location
Set-Location $PSScriptRoot

$existsPython = Test-Path .\.venv\Scripts\python.exe
if (-not $existsPython) {
    $exists = Test-Path .\.venv
    if ($exists) {
        Write-Host "Removing existing .venv" -ForegroundColor Yellow
        Remove-Item -Path .\.venv -Recurse -Force
    }

    Write-Host "Creating .venv" -ForegroundColor Green
    # check if python is in the system PATH and python is a valid command in PS
    try {
        $null = Get-Command python -ErrorAction Stop
    }
    catch {
        Write-Host "Python is not set in the system PATH or not installed. Best Google how to add Python to system PATH. Or visit https://www.python.org/downloads/ to downlaod Python" -ForegroundColor Red
        exit 1
    }
    # Create a virtual environment in .venv directory
    python -m venv .\.venv
    Write-Host "Created interpreter in .venv" -ForegroundColor Green
    .\.venv\Scripts\Activate.ps1

    # install packages for development
    pip install pytest
    pip install build

    pip install -e ..\lcapy-inskale\
    pip install -e ..\Schemdraw\

} else {
    Write-Host "Checking existing .venv" -ForegroundColor Green
    .\.venv\Scripts\Activate.ps1
}

python -m pip install --upgrade pip

# update generalize package
$pathToPackages = "..\Pyodide\Packages\"
$generalizePkgName = (Get-ChildItem -Path $pathToPackages -Filter "*generalizenetlistdrawing*").Name
pip install  (Join-Path -Path $pathToPackages -ChildPath $generalizePkgName)

# This package can only be installed after all the other packages are installed
if (-not $exists){
    pip install -e ..\simpliPFy\
}

Write-Host "Development Interpreter was setup in .venv" -ForegroundColor Green
Write-Host "The development interpreter has the packages [lcapyInskale, schemdrawInskale, simplipfy] installed in editable mode to try new development features without rebuilding the packages."

Set-Location $startDir