#!/bin/bash
set -e

service apache2 start
service proftpd start

# Make the aliases/functions available in this script
source /etc/bash.bashrc

install_pkg() {
    local pkg_name="$1"
    local pkg_dir="$2"

    if /usr/local/simplipfyVenv/bin/python -c "import $pkg_name" &>/dev/null; then
        echo "$pkg_name already installed"
    else
        echo "Installing $pkg_name from $SRC_DIR/$pkg_dir..."
        /usr/local/simplipfyVenv/bin/pip install -e "$SRC_DIR/$pkg_dir"
    fi
}

# Default project path
SRC_DIR="/src"

install_pkg "schemdrawInskale" "Schemdraw"
install_pkg "lcapyInskale" "lcapy-inskale"

pathToPackages="./Pyodide/Packages/"
generalizePkgName=$(find "$pathToPackages" -maxdepth 1 -type f -name "*generalizenetlistdrawing*" -printf "%f\n" | head -n 1)
/usr/local/simplipfyVenv/bin/pip install "$pathToPackages$generalizePkgName"

install_pkg "simplipfy" "simpliPFy"
install_pkg "simplipfyBuildTools" "/Pyodide/Scripts"

echo "installing typedoc"
npm install typedoc typescript --save-dev

# Run the main command (allows 'docker run myimage bash')
exec "$@"