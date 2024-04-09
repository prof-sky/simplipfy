import os
import micropip as mpip

async def install_emfs_packages(package_names):
    for package_name in package_names:
        await install_emfs_package(package_name)

async def install_emfs_package(package_name):
    # find packages in current folder that match requested package
    package = [i for i in os.listdir() if package_name in i and not i[-9::] == ".metadata"]
    
    # assert that only one package is found
    if len(package) == 0:
        raise ModuleNotFoundError(f"no package found for {package_name}")
    if len(package) > 1:
        raise AssertionError(f"Specifie package or remove redundent {package}\n to keep both packages use full package name eg. {package[0]}")
    
    print(f"installing {package[0]}")
    # install package with micropip
    await mpip.install("emfs:"+package[0])