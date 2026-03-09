import ftplib
from pathlib import Path
import os
from time import time

def connect_ftp(server: str, user: str, password: str) -> ftplib.FTP:
    """ Connect and login to FTP server"""
    ftp = ftplib.FTP(server)
    ftp.login(user, password)
    print(ftp.getwelcome())
    return ftp

def upload_file(ftp: ftplib.FTP, file: Path | str):
    ftp.storbinary(f"STOR {file}", open(file, "rb"))

def ftp_dir_exists(ftp: ftplib.FTP, dirname: str) -> bool:
    """Check if a directory exists on the FTP server."""
    current = ftp.pwd()  # save current directory
    try:
        ftp.cwd(dirname)
        ftp.cwd(current)  # go back
        return True
    except ftplib.error_perm:
        return False

def build_remove_commands(ftp: ftplib.FTP, path: str) -> list[str]:
    """ Recursively list all files and directories on the FTP server
    Returns a list of paths."""
    exclude = ["/dev/index.html"]
    commands = []
    for name, facts in ftp.mlsd(path, facts=["type"]): # ftpnlst lists names in given directory
        #name = entry.split("/")[-1] # last part of path
        if name in (".", ".."): #exclude current and parent dirs
            continue
        full_path = f"{path}/{name}"#.replace("//","/")
        if full_path in exclude: continue

        entry_type = facts.get("type")
        if entry_type == "dir":
            commands.extend(build_remove_commands(ftp, full_path))
            commands.append(f"rmdir {full_path}")
        else: # if not a directory, it's a file
            commands.append(f"rm {full_path}")
    return commands

def execute_commands(ftp: ftplib.FTP, commands: list[str]):
    "Execute FTP remove commands (remove files and dirs)"
    for cmd in commands:
        action, entry = cmd.split(maxsplit=1)
        try:
            if action == "rm":
                ftp.delete(entry)
                print(f"Deleted file: {entry}")
            elif action == "rmdir":
                ftp.rmd(entry)
                print(f"Deleted directory: {entry}")
        except Exception as e:
            print(f"Failed to delete entry: {e}")

def list_recursive(ftp, remotedir, dirFiles: dict[str, list[str]], typeFilter=["cdir", "pdir"], excludeFilter=True):
    ftp.cwd(remotedir)
    foundFiles = 0
    for entry in ftp.mlsd():
        if entry[1]['type'] == 'dir':
            remotepath = remotedir + "/" + entry[0]
            dirFiles[remotepath] = []
            list_recursive(ftp, remotepath, dirFiles)
        elif (entry[1]['type'] in typeFilter) != excludeFilter:
            dirFiles[remotedir].append(entry[0])
            foundFiles += 1
        else:
            continue

    print(f"found {foundFiles} files, in {remotedir}")

def rmdir(ftp: ftplib.FTP, dirName: str, navigateTo=None):
    if navigateTo is None:
        navigateTo = ftp.pwd()
    # assert correct seperator and dir starts with seperator
    dirName = dirName.replace("\\", "/")
    if dirName[0] != "/":
        dirName = f"/{dirName}"

    dirListing: dict[str, list[str]] = {dirName: []}
    list_recursive(ftp, dirName, dirListing)

    for dName in reversed(dirListing.keys()):
        ftp.cwd(dName)
        print(f"deleting {dName} ...")
        for file in dirListing[dName]:
            ftp.delete(file)
            print(f"\tdeleted file: {file}")
        ftp.rmd(dName)

    try:
        ftp.cwd(navigateTo)
    except ftplib.error_perm:
        ftp.cwd("/")

def clearFolder(ftp: ftplib.FTP, folder: str = "/dev"):
    print("Clearing dev folder on FTP server")
    commands = build_remove_commands(ftp, folder)
    with open("remCommands.txt", "w") as f:
        f.write("\n".join(commands))

    execute_commands(ftp, commands)

def uploadFiles(ftp: ftplib.FTP, source: Path, dest: Path):
    folders = [folder for folder in dest.as_posix().split("/") if folder != ""]
    # split parts to remove root and extract only folders from path
    for folder in folders:
        path = ftp.pwd() + "/" + folder
        if ftp_dir_exists(ftp, path):
            ftp.cwd(path)
        else:
            ftp.mkd(path)

    folderSize = sum([f.stat().st_size for f in [*source.rglob("*")] if f.is_file()])
    curSize = 0

    for root, dirs, files in os.walk(source):
        rel_path = Path(root).relative_to(source)
        ftp_path = Path(dest, rel_path).as_posix()
        try:
            ftp.cwd(ftp_path)
        except Exception:
            print(f"failed to change into {ftp_path}")
            pass
        for d in dirs:
            try:
                if not ftp_dir_exists(ftp, str(d)):
                    ftp.mkd(d)
                    print(f"created folder: {d} -> {ftp_path}")
                else:
                    print(f"folder already exists: {d} -> {ftp_path}")
            except Exception:
                print(f"failed to create {d}")
                pass


        for file in files:
            startTime = time()
            filePath = Path(root, file)
            with open(filePath, "rb") as f:
                ftp.storbinary("STOR "+file, f)
            curSize += filePath.stat().st_size

            percentage = curSize / folderSize
            print(f"{percentage*100:.2f}% || {file} -> {ftp_path}")