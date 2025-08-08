# Does not generate and zip the circutis folder
# use StartServer.ps1 if you dont know what the generating and zipping porcess does or is.
# wg = without generation
# wz = without zip creation
$curDir = Get-Location
Set-Location $PSScriptRoot
Set-Location "..\"

$exists = Test-Path Circuits.zip
if (-not $exists){
    Write-Host "Circuits.zip folder not found local hosting won't work. Server startup cancled." -ForegroundColor Red
    Write-Host -NoNewLine 'Press any key to continue...';
    $null = $Host.UI.RawUI.ReadKey('NoEcho,IncludeKeyDown');
    exit 1
}

Write-Host "--- Pyodide-Core server with GZIP compression ---" -ForegroundColor Green
python GzipSimplePythonHttpServer.py

Set-Location $curDir