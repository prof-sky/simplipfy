class TrackingIDs extends LocalStorageWriter{
    #data = {}

    constructor() {
        super("trackingIDs");
        let success = this.load()
        if (!success) {
            this.#data = {};
            this.save()
        }
    }

    /** @returns {IterableIterator<QrTrackingData>} */
    *[Symbol.iterator]() {
        this.load();
        for (const [id, value] of Object.entries(this.#data)) {
            yield TrackingIDs.toQrTrackingData(id, value);
        }
    }

    /** returns {Array<QrTrackingData>} */
    sortedArray(fn){
        return Array.from(this).sort(fn);
    }


    get ascendingArray(){
        return this.sortedArray((/** @type QrTrackingData */ a, /** @type QrTrackingData */ b) => {
            if (a.timestamp > b.timestamp) return 1;
            else if (a.timestamp < b.timestamp) return -1;

            return 0;
        });
    }

    get descendingArray(){
        return this.sortedArray((/** @type QrTrackingData */ a, /** @type QrTrackingData */ b) => {
            if (a.timestamp > b.timestamp) return -1;
            else if (a.timestamp < b.timestamp) return 1;

            return 0;
        });
    }

    /**
     *
     * @param id {number | string}
     * @param data {QrTrackingStorageData}
     * @returns {QrTrackingData}
     */
    static toQrTrackingData(id, data) {
        const timestamp = data.timestamp ? data.timestamp : QrTrackingData.legacyDate;
        return new QrTrackingData(id.toString(), data.file_name, data.netlist, data.qrSelector, timestamp);
    }

    /**
     * @param id {number | string}
     * @returns {[boolean, QrTrackingData | EmptyQrTrackingData]} */
    loadValue(id){
        let success = this.load()
        if (success){
            try {
                let value = this.#data[id.toString()]
                return [true, new QrTrackingData(id, value.file_name, value.netlist, value.qrSelector)]
            }
            catch(e){
                console.warn(`tracking id ${id} not in storage`);
            }
        }
        return [false, new EmptyQrTrackingData()];
    }

    removeValue(id){
        let success = this.load()
        if (success && this.#data.hasOwnProperty(id)){
            delete this.#data[id];
            this.save();
            return true;
        }
        return false;
    }

    /** @typedef QrTrackingStorageData
     * @property {string} file_name
     * @property {string} netlist
     * @property {string} qrSelector
     * @property {string | undefined} key
     * @property {number | undefined} timestamp
     * */

    /** @returns {boolean} */
    load(){
        let [success, data] = super._get()

        if(success){
            this.#data = JSON.parse(data);
            return true;
        }
        this.#data = {}
        return false;
    }

    save(){
        // names follow definition in window.definitions.selectorIDs
        let data = JSON.stringify(this.#data)
        super._set(data)
    }

    /**
     *
     * @param data {QrTrackingData}
     */
    saveValue(data){
        this.load();
        if (this.#data.hasOwnProperty(data.randomSession.toString())){
            console.warn(`tracking id: ${data.randomSession}, overwritten`)
        }
        this.#data[data.randomSession.toString()] = {"file_name": data.filename, "netlist": data.netlist, "qrSelector": data.qrSelector, "timestamp": data.timestamp};
        this.save();
    }

    reset(){
        this.#data = {};
        this.save();
    }
}