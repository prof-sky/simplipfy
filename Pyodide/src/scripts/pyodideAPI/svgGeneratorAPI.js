class SVGGeneratorAPI extends APIBase {
    /**
     * @param {string} path
     * @returns {Promise<WorkerResponse<any>>}
     */
    generateSvgFiles(path) {
        return this.getDataPromise("generateSvgFiles", { path });
    }

    /** @returns {Promise<WorkerResponse<any>>} */
    getGeneratorProgress() {
        return this.getDataPromise("getGeneratorProgress");
    }

    /**
     * @param {string} path
     * @returns {Promise<WorkerResponse<PyodideAPIMap["initSVGGenerator"]["output"]>>}
     */
    init(path) {
        return this.getDataPromise("initSVGGenerator", { path });
    }

    /** @returns {Promise<WorkerResponse<PyodideAPIMap["getCircuitFiles"]["output"]>>} */
    getCircuitFiles() {
        return this.getDataPromise("getCircuitFiles");
    }

    /**
     * @param {string} file
     * @returns {Promise<WorkerResponse<PyodideAPIMap["generateSvgFile"]["output"]>>}
     */
    generateFile(file) {
        return this.getDataPromise("generateSvgFile", { file });
    }
}