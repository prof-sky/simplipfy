// #####################################################################################
// ########################## Pyodide API Class ########################################
// #####################################################################################

class PyodideAPI {
    constructor(worker) {
        this.worker = worker;
    }

    unpackArchive(pkgArrBuff, packageExtension, options) {
        return requestResponse(this.worker, {
            action: "unpackArchive",
            data: { buffer: pkgArrBuff, extension: packageExtension, options: options}
        });
    }

    readDir(path) {
        return requestResponse(this.worker, {
            action: "readdir",
            data: { path: path }
        });
    }

    writeFile(path, content, encoding="utf8") {
        return requestResponse(this.worker, {
            action: "writeFile",
            data: {
                path: path,
                content: content,
                encoding: encoding
            }
        });
    }

    exists(path) {
        return requestResponse(this.worker, {
            action: "exists",
            data: {
                path: path
            }
        });
    }

    rename(from, to){
        return requestResponse(this.worker, {
            action: "rename",
            data: {
                from: from,
                to: to
            }
        });
    }

    deleteFile(path) {
        return requestResponse(this.worker, {
            action: "unlink",
            data: { path: path }
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

    recursiveRmdir(path) {
        return requestResponse(this.worker, {
            action: "recursiveRmdir",
            data: {path: path}
        });
    }

    mkdir(path) {
        return requestResponse(this.worker, {
            action: "mkdir",
            data: { path: path }
        });
    }

    isValidCircuitFile(filename, filepath) {
        return requestResponse(this.worker, {
            action: "isValidCircuitFile",
            data: {
                circuitFile: filename,
                circuitPath: filepath
            }
        });
    }

    isValidCircuitString(circuitString) {
        return requestResponse(this.worker, {
            action: "isValidCircuitString",
            data: {
                fileString: circuitString
            }
        });
    }

    forceDrawing(circuitString, paramMap, optionsString) {
        return requestResponse(this.worker, {
            action: "forceDrawing",
            data: {
                circuitString: circuitString,
                paramMap: paramMap,
                optionsString: optionsString
            }
        });
    }

    // TODO move to SVGGeneratorAPI
    generateSvgFiles(path) {
        return requestResponse(this.worker, {
            action: "generateSvgFiles",
            data: { path: path }
        });
    }

    getGeneratorProgress() {
        return requestResponse(this.worker, {
            action: "getGeneratorProgress",
            data: {}
        });
    }

    initSVGGenerator(path) {
        return requestResponse(this.worker, {
            action: "initSVGGenerator",
            data: { path: path }
        });
    }

    getCircuitFiles() {
        return requestResponse(this.worker, {
            action: "getCircuitFiles",
            data: {}
        });
    }

    generateSvgFile(file) {
        return requestResponse(this.worker, {
            action: "generateSvgFile",
            data: { file: file }
        });
    }

    zipFiles(path) {
        return requestResponse(this.worker, {
            action: "zipFiles",
            data: { path: path }
        });
    }
}
