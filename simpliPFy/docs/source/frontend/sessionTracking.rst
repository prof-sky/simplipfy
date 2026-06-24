Session Tracking
===================

This page should explain how the session tracking via QR Codes is implemented and what the use case is.

Work flow
---------------

The idea behind session tracking is the following use case:
- a teacher creates a QR code from a circuit file, the tracking id with name is cached in the local storage
- the QR code can be shared with students
- when the teacher navigates to the QR Track Viewer and selects this tracking id, all live events are shown in a table
- only the live events will be shown there, not any events that happened before this time
- when the teacher leaves the website, all events for this session are deleted from the server database

Implementation
-----------------

On the server, a php script ``src/session.php`` is used to handle the database requests.
The script allowes the following actions:
- ``addSessionId``: Adds a session id to the list of valid session ids
- ``deleteSessionId``: Deletes a session id from the list of valid session ids
- ``send``: Posts an event to the database with a session id
- ``read``: Reads all events for a session id from the database

Only when a session id is added to the valid list of session ids, it can be used to post events to the database.
When a session id is deleted, all events for this session id are deleted from the database.

Setup
------

The session tracking needs the following installations to work:
    - a web server with php support (e.g. apache)
    - a mysql database (e.g. mysql, mariadb), we currently use mariadb

Install the following packages on your server:
    - php
    - mariadb-server
    - mariadb-client

Then create a database and a user for the session tracking and add the credentials to the .env file in ``.../inskale/Pyodide/Scripts``:
    - DB_NAME="some-db-name"
    - DB_USER="some-db-user"
    - DB_PASSWORD="some-db-password"

Creating the user can look like this for mariadb::

    mysql -u root <<MYSQL_SCRIPT
    CREATE DATABASE IF NOT EXISTS ${DB_NAME};
    CREATE USER IF NOT EXISTS '${DB_USER}'@'localhost' IDENTIFIED BY '${DB_PASSWORD}';
    GRANT ALL PRIVILEGES ON ${DB_NAME}.* TO '${DB_USER}'@'localhost';
    FLUSH PRIVILEGES;
    MYSQL_SCRIPT

You will need to export the .env variables to your server so they are available with getevn() for php. Use the
envvars file e.g. /etc/apache2/envvars. Add the following lines ::

    export DB_NAME="some-db-name"
    export DB_USER="some-db-user"
    export DB_PASSWORD="some-db-password"

To test if your apache server provides the environment variables correctly you can use this script::

    <?php
    echo "DB_NAME = " . getenv('DB_NAME') . "<br>";
    echo "DB_USER = " . getenv('DB_USER') . "<br>";
    echo "DB_PASSWORD = " . getenv('DB_PASSWORD') . "<br>";
    ?>

The output should look like this ::

    DB_NAME = testTrackingDB
    DB_USER = test-user
    DB_PASSWORD = test-user-password

The values should be the ones you set in the .env file. If you dont see anything behind the ``=`` sings
your server does not provide the environment variables to php and you need to check your server configuration.
After that you can test the session tracking with the QR code tracking viewer and the QR code generator in the learn page.
You should see events appearing in the tracking viewer when you scan a QR code and interact with the circuit.