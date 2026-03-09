from simpliPFyBuildTools.hashFolder import hash_folder
from simpliPFyBuildTools.bumpVersion import project_root

def test_hash():
    path = project_root.joinpath('test')
    print(f"Test hash: {hash_folder(path, "*.py").hexdigest()}")