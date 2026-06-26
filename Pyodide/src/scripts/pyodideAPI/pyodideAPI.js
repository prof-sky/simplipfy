// #####################################################################################
// ########################## Pyodide API Class ########################################
// #####################################################################################

class PyodideAPI extends APIBase{
    /** @returns {Promise<WorkerResponse<PyodideAPIMap["unpackArchive"]["output"]>>} */
    unpackArchive(pkgArrBuff, packageExtension, options) {
        return this.getDataPromise(
            "unpackArchive",
            { buffer: pkgArrBuff, extension: packageExtension, options }
        );
    }

    /** @returns {Promise<WorkerResponse<PyodideAPIMap["readdir"]["output"]>>} */
    readDir(path) {
        return this.getDataPromise("readdir", { path });
    }

    /** @returns {Promise<WorkerResponse<PyodideAPIMap["writeFile"]["output"]>>} */
    writeFile(path, content, encoding = "utf8") {
        return this.getDataPromise("writeFile", {
            path,
            content,
            encoding
        });
    }

    /** @returns {Promise<WorkerResponse<PyodideAPIMap["exists"]["output"]>>} */
    exists(path) {
        return this.getDataPromise( "exists", { path });
    }

    /** @returns {Promise<WorkerResponse<PyodideAPIMap["rename"]["output"]>>} */
    rename(from, to) {
        return this.getDataPromise( "rename", { from, to });
    }

    /** @returns {Promise<WorkerResponse<PyodideAPIMap["unlink"]["output"]>>} */
    deleteFile(path) {
        return this.getDataPromise( "unlink", { path });
    }

    /** @returns {Promise<WorkerResponse<PyodideAPIMap["loadSolve"]["output"]>>} */
    loadSolver() {
        return this.getDataPromise( "loadSolve");
    }

    /** @returns {Promise<WorkerResponse<PyodideAPIMap["readFile"]["output"]>>} */
    readFile(path, encoding = "utf8") {
        return this.getDataPromise( "readFile", { path, encoding });
    }

    /** @returns {Promise<WorkerResponse<PyodideAPIMap["runPython"]["output"]>>} */
    runPython(code) {
        return this.getDataPromise("runPython", { code });
    }

    /**
     * Convenience wrapper (still typed via runPython)
     * @returns {Promise<WorkerResponse<any>>}
     */
    importPackage(packageName) {
        return this.runPython("import " + packageName);
    }

    /** @returns {Promise<WorkerResponse<PyodideAPIMap["pyimport"]["output"]>>} */
    pyimport(moduleName) {
        return this.getDataPromise("pyimport", { pythonModuleName: moduleName });
    }

    /** @returns {Promise<WorkerResponse<PyodideAPIMap["recursiveRmDir"]["output"]>>} */
    recursiveRmdir(path) {
        return this.getDataPromise("recursiveRmDir", { path });
    }

    /** @returns {Promise<WorkerResponse<PyodideAPIMap["mkdir"]["output"]>>} */
    mkdir(path) {
        return this.getDataPromise("mkdir", { path });
    }

    /** @returns {Promise<WorkerResponse<PyodideAPIMap["isValidCircuitFile"]["output"]>>} */
    isValidCircuitFile(filename, filepath) {
        return this.getDataPromise("isValidCircuitFile", {
            circuitFile: filename,
            circuitPath: filepath
        });
    }

    /** @returns {Promise<WorkerResponse<PyodideAPIMap["isValidCircuitString"]["output"]>>} */
    isValidCircuitString(circuitString) {
        return this.getDataPromise("isValidCircuitString", {
            fileString: circuitString
        });
    }

    /** @returns {Promise<WorkerResponse<PyodideAPIMap["forceDrawing"]["output"]>>} */
    forceDrawing(circuitString, paramMap, optionsString) {
        return this.getDataPromise("forceDrawing", {
            circuitString,
            paramMap,
            optionsString
        });
    }

    /** @returns {Promise<WorkerResponse<PyodideAPIMap["zipFiles"]["output"]>>} */
    zipFiles(path) {
        return this.getDataPromise("zipFiles", { path });
    }

    async ready(){
        let response = await this.getDataPromise("pyodideReady", {}, 10e3);
        if (response.success) return true;

        UserMessage.info(languageManager.currentLang.selector.slowInternetConnectionInfo, "", false);
        console.warn(`Pyodide ready request timed out. Retrying ...`);

        const timeOutInMs = 90e3; //ms
        response = await this.getDataPromise("pyodideReady", {}, timeOutInMs);

        if(!response.success){
            UserMessage.error(languageManager.currentLang.selector.internetToSlowError);
            throw Error("Loading pyodide took to long");
        }

        return true;
    }
}