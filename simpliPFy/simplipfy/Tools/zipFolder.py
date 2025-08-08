import os
import shutil
import zipfile


def zip_folder(folderPath: str, zipPath: str=None, zipFolderName: str = None, deleteSource: bool=True):
    """
    :param folderPath: The path to the folder to zip.
    :param zipPath: The path where the zip file will be created. If None, the zip file will be created in the same directory as the folder.
    :param zipFolderName: The name of the zipped folder. If None, the basename of folderPath is used.
    :param deleteSource: If True, the source folder will be deleted after zipping. Default is True.

    Compresses the contents of a folder into a zip file.
    """
    path = os.path.abspath(os.path.normpath(folderPath))
    if zipFolderName is None:
        zipFolderName = os.path.basename(path)
    if zipPath is None:
        zipPath = os.path.join(os.path.split(folderPath)[0], zipFolderName + ".zip")
    else:
        zipPath = os.path.join(zipPath, zipFolderName + ".zip")

    if not os.path.isdir(folderPath):
        print(f"Error: Folder '{folderPath}' not found.")
        return


    with zipfile.ZipFile(zipPath, 'w', zipfile.ZIP_DEFLATED) as zipf:
        for root, _, files in os.walk(folderPath):
            for file in files:
                file_path = os.path.join(root, file)
                archive_name = os.path.relpath(file_path, folderPath)

                print(f"Adding {file_path} as {archive_name}")
                zipf.write(file_path, arcname=archive_name)

    print(f"\nSuccessfully created zip file: test.zip")

    if deleteSource:
        shutil.rmtree(folderPath)

if __name__ == "__main__":
    testPath = "..\\..\\Circuits"
    zip_folder(testPath)