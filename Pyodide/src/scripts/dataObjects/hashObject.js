/** On page load the value after the # in the page link is parsed to extract information. This Object represents the
 * parsed information. */
class HashObject {
    #qrSessionID;
    #qrSelector;
    #qrNetlist;
    #tracking;
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
            this.#qrNetlist = params.get("net") || false;
            if (this.#qrNetlist) this.#qrNetlist = new NetlistString(undefined, this.#qrNetlist);
            this.#tracking = params.has("tracking");
            this.#ccUser = params.get("ccUser") || false;
            this.#ccFile = params.get("ccFile") || false;
            this.#setPage = params.get("setPage") || false;

            HashObject.instance = this;
        }
        return HashObject.instance;
    }

    get hasQrInfo(){
        if (this.#qrSessionID) {
            if (this.#qrSelector && this.#qrNetlist && !this.#tracking) return true

            if (!this.#qrSelector) console.warn("SessionID found but no selector specified")
            if (!this.#qrNetlist) console.warn("SessionID found but no netlist specified")
        }

        return false;
    }

    /** @returns {QrTrackingData} */
    get qrInfo(){
        return new QrTrackingData(this.#qrSessionID, "QR-Code scan", this.#qrNetlist, this.#qrSelector);
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

    /** @returns {{user: string, file: string}} */
    get customCircuits(){
        return {user: this.#ccUser, file: this.#ccFile};
    }

    get hasSetPage(){
        return this.#setPage !== false;
    }

    get setPage() {
        if (this.hasSetPage){
            return this.#setPage;
        }
        else{
            let [_, firstPage] = storageManager.firstPage.load()
            return firstPage;
        }
    }

    get hasTracking(){
        return this.#qrSelector && this.#qrNetlist && this.#tracking;
    }

    /** @returns {QrTrackingData} */
    get tracking(){
        return new QrTrackingData(this.#qrSessionID, "Link Netlist", this.#qrNetlist.uncompressed, this.#qrSelector);
    }
}