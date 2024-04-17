Write-Output "--- Pyodide-Core server ---"
Set-Location $(Split-Path -Path $MyInvocation.MyCommand.Path -Parent)
python -m http.server