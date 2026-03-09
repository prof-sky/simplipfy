/** On page load the value after the # in the page link is parsed to extract information. This Object represents the
 * parsed information. */
class HashObject {
    #qrSessionID;
    #qrSelector;
    #qrCompressedNetlist;
    #ccUser;
    #ccFile;
    #setPage;

    customCircuitsValid = true;

    constructor() {
        if (!HashObject.instance) {
            let hash = window.location.hash;
            console.log(hash);

            const cleanHash = hash.startsWith("#") ? hash.slice(1) : hash;
            const params = new URLSearchParams(cleanHash);

            this.#qrSessionID = params.get("id") || false;
            this.#qrSelector = params.get("sel") || false;
            this.#qrCompressedNetlist = params.get("net") || false;
            this.#ccUser = params.get("ccUser") || false;
            this.#ccFile = params.get("ccFile") || false;
            this.#setPage = params.get("setPage") || false;

            HashObject.instance = this;
        }
        return HashObject.instance;
    }

    get hasQrInfo(){
        if (this.#qrSessionID) {
            if (this.#qrSelector && this.#qrCompressedNetlist) {return true};

            if (!this.#qrSelector) {console.warn("SessionID found but no selector specified")}
            if (!this.#qrCompressedNetlist) {console.warn("SessionID found but no netlist specified")};
        }

        return false;
    }

    get qrInfo(){
        return {id: this.#qrSessionID, sel: this.#qrSelector, net: this.#qrCompressedNetlist};
    }

    get hasCustomCircuits(){
        if (this.#ccUser && this.customCircuitsValid) {
            if (this.#ccFile) {
                return true
            }
            console.warn("missing ccFile param to use custom circuits")
        }
        return false;
    }

    get customCircuits(){
        return {user: this.#ccUser, file: this.#ccFile};
    }

    get hasSetPage(){
        return this.#setPage !== false;
    }

    get setPage() {
        if (this.hasSetPage)
            return this.#setPage;
        else{
            let [_, firstPage] = storageManager.firstPage.load()
            return firstPage;
        }
    }
}