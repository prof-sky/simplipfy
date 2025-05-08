// #####################################################################################
// ########################## Pyodide API Class ########################################
// #####################################################################################

class PyodideAPI {
    constructor(worker) {
        this.worker = worker;
    }

    unpackArchive(pkgArrBuff, packageExtension) {
        return requestResponse(this.worker, {
            action: "unpackArchive",
            data: { buffer: pkgArrBuff, extension: packageExtension }
        });
    }

    readDir(path) {
        return requestResponse(this.worker, {
            action: "readdir",
            data: { path: path }
        });
    }

    writeFile(path, content) {
        return requestResponse(this.worker, {
            action: "writeFile",
            data: {
                path: path,
                content: content,
            }
        });
    }

    loadSolver() {
        return requestResponse(this.worker, {
            action: "loadSolve",
            data: {}
        });
    }

    readFile(path, encoding="utf8") {
        return requestResponse(this.worker, {
            action: "readFile",
            data: { path: path, encoding: encoding }
        });
    }

    runPython(code) {
        return requestResponse(this.worker, {
            action: "runPython",
            data: { code: code}
        });
    }

    importPackage(packageName) {
        return this.runPython("import " + packageName);
    }

    pyimport(moduleName) {
        return requestResponse(this.worker, {
            action: "pyimport",
            data: { module: moduleName }
        });
    }
}
