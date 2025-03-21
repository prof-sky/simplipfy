param (
[string]$pythonPath
)
if($pythonPath){
    Set-Alias pythonPath $pythonPath
    $pytestFolder = Split-Path -Path $pythonPath
    $pytestPath = Join-Path -Path $pytestFolder -ChildPath "pytest.exe"
    Set-Alias pytest $pytestPath
}
else{
    Set-Alias pythonPath python
    Set-Alias pytest pytest
}

function adjustAndMoveSolvePy{

    $content = Get-Content -Path "solve.py"

    $versionLine = [string]::Concat("# for simplipfy version: ", $version, "`r`n")
    $line1 = "import warnings`r`n"
    $line2 = "warnings.filterwarnings('ignore')`r`n"
    $content = $versionLine + $line1 + $line2 + ($content -join "`r`n")
    Set-Content -Path "..\Pyodide\solve.py" -Value $content

    Write-Output "Copied solve.py to: ..\Pyodide\"
}

function adjustAndMoveGenerateSVGFilesPy{
    $content = Get-Content -Path "generateSVGFiles.py"

    $versionLine = [string]::Concat("# for simplipfy version: ", $version, "`r`n")
    $content = $versionLine + ($content -join "`r`n")
    Set-Content -Path "..\Pyodide\Scripts\generateSVGFiles.py" -Value $content

    Write-Output "Copied generateSVGFiles.py to: ..\Pyodide\Scripts"
}

$output = [string]::Concat("executing with: ", (Get-Alias pythonPath).Definition, "`npython refers to the standard python installation or the current aktiv venv")
Write-Output $output

$startDir = Get-Location

# build the python package
Set-Location $PSScriptRoot
Write-Host "Building package" -ForegroundColor Green

try{
    pythonPath -m build
}
catch{
    Write-Host "An error occured while building the package" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    Set-Location $startDir
    return
}

Set-Location $PSScriptRoot
$version = pythonPath setup.py --version

try{
    adjustAndMoveSolvePy
}
catch{
    Write-Host "An error occured while handling solve.py" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    Set-Location $startDir
    return
}

try{
    adjustAndMoveGenerateSVGFilesPy
}
catch{
    Write-Host "An error occured while handling GenerateSVGFiles.py" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    Set-Location $startDir
    return
}


Set-Location $PSScriptRoot
Write-Host ([string]::Concat("Version is: ", $version)) -ForegroundColor Green

$oldPackages = Get-ChildItem -Path "..\Pyodide\Packages" -Filter "*simplipfy*" -Recurse
foreach($item in $oldPackages){
    $path = [string]::Concat("..\Pyodide\Packages\", $item)
    Remove-Item -Path $path
    Write-Output ([string]::Concat("Removed: ", $path))
}

try{
    $newPackage = Get-ChildItem -Path "dist" -Filter "*.whl" -File | Sort-Object -Property LastWriteTime -Descending | Select-Object -First 1
}
catch {
    Write-Host "couldn't find new package in .\dist" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    Set-Location $startDir
    return
}


try{
    Copy-Item -Path ([string]::Concat("dist\", $newPackage)) -Destination "..\Pyodide\Packages\"
}
catch {
    Write-Host "could not copy new package" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    Set-Location $startDir
    return
}
Write-Output ([string]::Concat("Copied ", $newPackage, " to: ..\Pyodide\Packages\"))
Write-Output ([string]::Concat("Copied ", $newPackage, " to: ..\Pyodide\Packages\"))


Write-Host "Successfully updated solve.py, generateSVGFiles.py and simpliPFy package in Pyodide distribution" -ForegroundColor Green
Set-Location $startDir