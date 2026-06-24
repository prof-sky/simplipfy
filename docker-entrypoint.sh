#!/bin/bash
set -e

export DB_NAME
export DB_USER
export DB_PASSWORD
export API_SECRET
export SESSION_LIMIT
export ENTRY_LIMIT

echo "export DB_NAME=${DB_NAME}" >> /etc/apache2/envvars
echo "export DB_USER=${DB_USER}" >> /etc/apache2/envvars
echo "export DB_PASSWORD=${DB_PASSWORD}" >> /etc/apache2/envvars
echo "export API_SECRET=${API_SECRET}" >> /etc/apache2/envvars
echo "export SESSION_LIMIT=${SESSION_LIMIT}" >> /etc/apache2/envvars
echo "export ENTRY_LIMIT=${ENTRY_LIMIT}" >> /etc/apache2/envvars

useradd -d /var/www/html -s /usr/sbin/nologin $FTP_USER && echo "$FTP_USER:$FTP_PASS" | chpasswd

mkdir -p /var/www/html/dev /var/www/html/docs /var/www/html/simplipfy
chown -R "$FTP_USER:$FTP_USER" /var/www/html
chmod -R u+rw /var/www/html

service mariadb start
mysql -u root <<MYSQL_SCRIPT
CREATE DATABASE IF NOT EXISTS ${DB_NAME};
CREATE USER IF NOT EXISTS '${DB_USER}'@'localhost' IDENTIFIED BY '${DB_PASSWORD}';
GRANT ALL PRIVILEGES ON ${DB_NAME}.* TO '${DB_USER}'@'localhost';
FLUSH PRIVILEGES;
MYSQL_SCRIPT

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