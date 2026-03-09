import os
import sys
from simpliPFyBuildTools.envVars import EnvVars
from pathlib import Path

HTACCESS_FILE = "dist/.htaccess"
def set_env_var(lines, var_name, var_value) -> list[str]:
    """
    Replace or append a SetEnv variable in the lines of .htaccess
    """
    new_line = f"SetEnv {var_name} {var_value}\n"
    replaced = False
    for i,line in enumerate(lines):
        if line.startswith(f"SetEnv {var_name}"):
            if replaced:
                print(f"Error: Duplicate SetEnv {var_name} found in .htaccess")
                sys.exit(1)
            lines[i] = new_line
            replaced = True
            print(f"Replaced {var_name} in .htcaccess")
    if not replaced:
        lines.append("\n" + new_line)
        print(f"Appended {var_name} to .htcaccess")
    return lines

def updateSecretsInHtaccess():
    envVar = EnvVars()

    api_secret = envVar.apiSecret
    db_name = envVar.dbName
    db_user = envVar.dbUser
    db_pass = envVar.dbPass

    # Check if API_SECRET is set
    if not api_secret:
        print("Error: API_SECRET is not set.")
        sys.exit(1)

    if not all([db_name, db_user, db_pass]):
        raise ValueError("Missing required DB configuration: DB_NAME, DB_USER, DB_PASS")

    dest = Path(__file__).parents[2].joinpath(HTACCESS_FILE)

    with open(dest, "r") as f:
        lines = f.readlines()
    lines = set_env_var(lines, "API_SECRET", api_secret)
    lines = set_env_var(lines, "DB_NAME", db_name)
    lines = set_env_var(lines, "DB_USER", db_user)
    lines = set_env_var(lines, "DB_PASSWORD", db_pass)

    #write back to file
    with open(dest, "w") as f:
        f.writelines(lines)

if __name__ == "__main__":
    updateSecretsInHtaccess()