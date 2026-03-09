from pathlib import Path
from zipfile import ZipFile, ZIP_DEFLATED

def zip_folder(folder_path: Path, zip_path: Path | None = None):
    if not folder_path.is_dir():
        raise NotADirectoryError(folder_path)
    if zip_path is None:
        zip_path = Path(str(folder_path) + ".zip")
    else:
        zip_path = Path(str(zip_path) + ".zip")

    with ZipFile(zip_path, 'w', ZIP_DEFLATED, allowZip64=True) as zipf:
        for file_path in folder_path.rglob('*'):  # recursively go through all files/subfolders
            if file_path.is_file():
                # store relative path inside the zip to preserve structure
                arcname = file_path.relative_to(folder_path.parent).as_posix()
                zipf.write(file_path, arcname)

    print(f"Zipped '{folder_path}' → '{zip_path}'")