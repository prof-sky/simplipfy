# start the simple http server to serve simpliPFy on localhost.
param (
[string]$pathTo7Zip
)

$curDir = Get-Location
Set-Location $PSScriptRoot

Write-Host "Try to zip the Circuits Folder" -ForegroundColor Green
# try to rezip the folder using 7zip
if ($pathTo7Zip){
    .\zipWith7Zip.ps1 -pathTo7Zip $pathTo7Zip
}
else{
    .\zipWith7Zip.ps1
}

.\StartServer_wg_wz.ps1

Set-Location $curDir