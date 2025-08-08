param (
[string]$pathTo7Zip
)

$curDir = Get-Location
Set-Location $PSScriptRoot

if ($pathTo7Zip){
    $userPath = "${pathTo7Zip}" + "\7z.exe"
    $exists = Test-Path $userPath
    Write-Host Path is: $userPath
    if ($exists){
       Write-Host "Using 7zip Path argument" -ForegroundColor Green
       Set-Alias zipTool $userPath
    }
}
else{
    $standardPath = "${env:ProgramFiles}\7-Zip\7z.exe"
    $exists = Test-Path $standardPath
    Write-Host Path is: $standardPath
    if ($exists){
       Write-Host "Using 7zip standard Path" -ForegroundColor Green
       Set-Alias zipTool $standardPath
    }
}

if (Get-Alias zipTool -ErrorAction SilentlyContinue){
    #Generate preview images
    Write-Host "Generating preview images:" -ForegroundColor Green
    .\generateSVGFiles.ps1

    $exists = Test-Path ..\Circuits.zip
    if ($exists) {
        Remove-Item "..\Circuits.zip" -Force
    }

    Write-Host "creating zip-archive" -ForegroundColor Green
    zipTool a -tzip ..\Circuits.zip ..\Circuits\
}
else{
    Write-Host "7zip path not passed nor found at standard location, skipping zip generation and creation of preview images" -ForegroundColor Yellow
    Write-Host "Remember to create preview images and zip the Circuits folder if you made changes" -ForegroundColor Yellow
}

Set-Location $curDir