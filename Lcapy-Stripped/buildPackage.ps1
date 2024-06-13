$curDir = Get-Location
Set-Location $PSScriptRoot
python setup.py sdist bdist_wheel
Set-Location $curDir