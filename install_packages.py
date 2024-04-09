import os
import micropip as mpip

def install_emfs_package(package_name):
    # find packages in current folder that match requested package
    package = [i for i in os.listdir() if package_name in i]
    # assert that only one package is found
    if len(package) > 1:
        raise AssertionError(f"Specifie package or remove redundent {package}\n 
                             to keep both packages use full package name eg. {package[0]}")
    
    print(f"installing {package_name}")
    # install package with micropip
    await mpip.install("emfs:"+package[0])