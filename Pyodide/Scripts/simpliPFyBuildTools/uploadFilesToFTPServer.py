import ftp as simFtp

from getAbsPath import getAbsPath
from ftp import connect_ftp
from pathlib import Path
from envVars import EnvVars

if __name__ == "__main__":
    import argparse

    envVars = EnvVars()

    parser = argparse.ArgumentParser()
    parser.add_argument("--source")
    parser.add_argument("--dest")

    args = parser.parse_args()

    if args.source:
        source = getAbsPath(args.source)
    else:
        source = Path(__file__).parents[1].joinpath("dist")

    if args.dest:
        dest = getAbsPath(args.dest)
    else:
        dest = Path(envVars.devFolder, envVars.commitSHA)

    ftp = connect_ftp(
        envVars.server,
        envVars.user,
        envVars.password
    )
    simFtp.uploadFiles(ftp, source, dest)
