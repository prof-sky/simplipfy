#!/bin/bash

# Check if the environment variable is defined
if [ -z "$API_SECRET" ]; then
  echo "Error: API_SECRET is not set."
  exit 1
fi

# Define the line to be inserted
NEW_LINE="SetEnv API_SECRET $API_SECRET"

# Define the file to edit
HTACCESS_FILE=".htaccess"

# Check if the file exists
if [ ! -f "$HTACCESS_FILE" ]; then
  echo "Error: $HTACCESS_FILE not found."
  exit 1
fi

# Replace the existing line or append if not found
if grep -q '^SetEnv API_SECRET ' "$HTACCESS_FILE"; then
  # Replace the line
  sed -i "s|^SetEnv API_SECRET .*|$NEW_LINE|" "$HTACCESS_FILE"
  echo "Replaced API_SECRET in $HTACCESS_FILE"
else
  # Append the line
  echo -e "\n\n$NEW_LINE" >> "$HTACCESS_FILE"
  echo "Appended API_SECRET to $HTACCESS_FILE"
fi

# Replace DB variables
# ===== DB_NAME =======
if grep -q '^SetEnv DB_NAME' "$HTACCESS_FILE"; then
  sed -i "s|^SetEnv DB_NAME .*|SetEnv DB_NAME $DB_NAME|" "$HTACCESS_FILE"
  echo "Replaced DB_NAME in $HTACCESS_FILE"
else
  echo -e "\n\nSetEnv DB_NAME $DB_NAME" >> "$HTACCESS_FILE"
  echo "Appended DB_NAME to $HTACCESS_FILE"
fi
# ===== DB_USER =======
if grep -q '^SetEnv DB_USER' "$HTACCESS_FILE"; then
  sed -i "s|^SetEnv DB_USER .*|SetEnv DB_USER $DB_USER|" "$HTACCESS_FILE"
  echo "Replaced DB_USER in $HTACCESS_FILE"
else
  echo -e "\n\nSetEnv DB_USER $DB_USER" >> "$HTACCESS_FILE"
  echo "Appended DB_USER to $HTACCESS_FILE"
fi
# ===== DB_PASSWORD =======
if grep -q '^SetEnv DB_PASSWORD' "$HTACCESS_FILE"; then
  sed -i "s|^SetEnv DB_PASSWORD .*|SetEnv DB_PASSWORD $DB_PASSWORD|" "$HTACCESS_FILE"
  echo "Replaced DB_PASSWORD in $HTACCESS_FILE"
else
  echo -e "\n\nSetEnv DB_PASSWORD $DB_PASSWORD" >> "$HTACCESS_FILE"
  echo "Appended DB_PASSWORD to $HTACCESS_FILE"
fi
