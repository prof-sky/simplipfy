$startDir = Get-Location
Set-Location $PSScriptRoot

$existsPython = Test-Path .\.testVenv\Scripts\python.exe
if (-not $existsPython) {
    $exists = Test-Path .\.testVenv
    if ($exists) {
        Write-Host "Removing existing .testVenv" -ForegroundColor Yellow
        Remove-Item -Path .\.testVenv -Recurse -Force
    }
    python -m venv .\.testVenv
    .\.TestVenv\Scripts\Activate.ps1
    pip install pytest
    pip install pytest-xdist
}
else{
    Write-Host "Using existing .testVenv" -ForegroundColor Green
    .\.TestVenv\Scripts\Activate.ps1
}

$coreCount = (Get-CimInstance Win32_Processor | Measure-Object -Property NumberOfCores -Sum).Sum
if (-not $coreCount) {
    $coreCount = 1
}
Write-Output "Using $coreCount cores for testing."

$pathToPackages = "..\Pyodide\Packages\"

$lcapyPkgName = (Get-ChildItem -Path $pathToPackages -Filter "*lcapyinskale*").Name
$schemdrawPkgName = (Get-ChildItem -Path $pathToPackages -Filter "*schemdraw*").Name
$generalizePkgName = (Get-ChildItem -Path $pathToPackages -Filter "*generalizenetlistdrawing*").Name
$simplipfyPkgName = (Get-ChildItem -Path $pathToPackages -Filter "*simplipfy*").Name

pip install (Join-Path -Path $pathToPackages -ChildPath $lcapyPkgName)
pip install (Join-Path -Path $pathToPackages -ChildPath $schemdrawPkgName)
pip install (Join-Path -Path $pathToPackages -ChildPath $generalizePkgName)
pip install (Join-Path -Path $pathToPackages -ChildPath $simplipfyPkgName)

Set-Location "..\simpliPFy\tests"
pytest -v -n $coreCount

Set-Location $startDir