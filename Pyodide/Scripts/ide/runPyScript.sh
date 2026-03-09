#!/bin/bash
# Usage: ./run_python.sh filename_without_extension

file="$1"

# Get the directory of this script
script_dir="$(dirname "$(readlink -f "$0")")"

# Run Python with the specified file
python "$script_dir/$file.py"