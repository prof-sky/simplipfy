@echo off
REM Usage: run_python.bat filename_without_extension

SET "file=%~1"

REM Get the directory of this batch script
SET "scriptDir=%~dp0"

REM Run Python with the specified file
python "%scriptDir%%file%.py"