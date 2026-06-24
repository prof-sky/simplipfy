// #####################################################################################
// ########################## Drawing Config API Class #################################
// #####################################################################################

class DrawingConfigAPI extends APIBase {
    /**
     * @param {string} onStr
     * @returns {Promise<WorkerResponse<PyodideAPIMap["lock"]["output"]>>}
     */
    async lock(onStr) {
        return this.getDataPromise("lock", { onStr });
    }

    /**
     * @param {string} setTo
     * @returns {Promise<WorkerResponse<PyodideAPIMap["unlock"]["output"]>>}
     */
    async unlock(setTo) {
        return this.getDataPromise("unlock", { setTo });
    }

    /** @returns {Promise<WorkerResponse<PyodideAPIMap["setToDefault"]["output"]>>} */
    async setToDefault() {
        return this.getDataPromise("setToDefault", {});
    }

    /**
     * @param {Object} options
     * @returns {Promise<WorkerResponse<PyodideAPIMap["setOptions"]["output"]>>}
     */
    async setOptions(options) {
        return this.getDataPromise("setOptions", { options });
    }

    /** @returns {Promise<WorkerResponse<PyodideAPIMap["isLocked"]["output"]>>} */
    async isLocked() {
        return this.getDataPromise("isLocked", {});
    }
}