import os
import hashlib
from pathlib import Path
from warnings import warn

def hash_folder(path: Path, include = "**/*") -> "hashlib._Hash":
    """
    Calculates the hash of a folder. Creates a sha256 hash object and updates it with each file path and file content.
    This results in a hash that changes if any file name or content changes or if files are added or removed.
    :returns: the hash object


    """

    if not os.path.isdir(path):
        raise NotADirectoryError(path)

    hashObj = hashlib.sha256()
    files = sorted([p.relative_to(path).as_posix() for p in path.glob(include)])
    #print("File count:", len(files))

    #print(f"Hashing files in {path}")
    for file in files:
        #print(f"updating with file: {file}")
        hashObj.update(file.encode("utf-8"))
        filePath = path.joinpath(file)
        if filePath.is_file():
            hashObj.update(open(filePath, "rb").read().replace(b"\r\n", b"\n"))

    if hashObj.hexdigest() == "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855":
        warn(f"This hash is known from an empty directory, hashed dir: {path}")

    return hashObj

if __name__ == "__main__":
    import argparse
    parser = argparse.ArgumentParser(description="-path, path to the folder to hash")
    parser.add_argument(
        '-p',
        '--path',
        type=str,
        required=False,
        help="the absolute path to the folder to hash"
    )
    parser.add_argument(
        '-i',
        '--include',
        type=str,
        required=False,
        default=None,
    )
    parser.add_argument(
        '-s',
        '--save',
        action='store_true',
        required=False,
        default=False,
    )

    args = parser.parse_args()
    if args.path:
        input_path = args.path
        abs_path = Path(os.path.abspath(os.path.normpath(input_path)))
        print(f"The provided path is: {abs_path}")
    else:
        # assumes to be in .../inskale/Pyodide/Scripts
        abs_path = Path(*Path(__file__).parts[:-3]).joinpath("Pyodide").joinpath("Circuits")
        print(f"No path provided, using ...{os.path.sep + str(Path(*abs_path.parts[-3::]))}")

    if not os.path.isdir(abs_path):
        print(f"The provided path is not a directory")
        exit(1)

    _hash = hash_folder(abs_path, args.include)

    if args.save:
        open(abs_path.parent.joinpath(".folderHash"), "w").write(_hash.hexdigest())
        print(f"Folder Hash is: {_hash.hexdigest()}")

    print(_hash.hexdigest())