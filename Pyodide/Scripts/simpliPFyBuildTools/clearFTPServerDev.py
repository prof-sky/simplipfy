import ftp as simFtp
from envVars import EnvVars

if __name__ == "__main__":
    envVars = EnvVars()
    ftp = simFtp.connect_ftp(
        envVars.server,
        envVars.user,
        envVars.password,
    )
    simFtp.clearFolder(ftp)

