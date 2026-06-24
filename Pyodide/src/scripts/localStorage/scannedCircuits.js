class ScannedCircuit {

    /**
     * creates a new scanned circuit object
     * @param identifier {window.definitions.qrCodeSelectorIDs | Scanner.identifier}
     * @param trackingId {string}
     * @param netlist {string}
     */
    constructor(identifier, trackingId, netlist) {
        this.identifier = identifier;
        this.trackingId = trackingId;
        this.netlist = netlist;
    }

    static parse(string){
        let split = string.split(":");
        return new ScannedCircuit(split[0], split[1], split[2]);
    }
}

class ScannedCircuits extends LocalStorageWriter {
    constructor() {
        super("scannedCircuits");
    }

    /**
     *
     * @returns {Promise<Map<string, ScannedCircuit>>}
     */
    async load(){
        const [success, storedData] = this._get()
        let data = new Map();
        if (!success) return data;

        for (let [key, value] of JSON.parse(storedData)) {
            data.set(key, new ScannedCircuit(value.identifier, value.trackingId, value.netlist));
        }
        return data;
    }

    /**
     * saves the netlist of a circuit to the local storage of the browser, value is appended to existing ones
     * @param netlist {string} the netlist of the circuit to save
     * @param trackingId {string} the id that the server usees for tracking
     * @param identifier {window.definitions.qrCodeSelectorIDs | Scanner.identifier} the identifier of the circuit from window.definitions.selectorIDs
     */
    async saveCircuit(netlist, trackingId, identifier= Scanner.identifier){
        let data = await this.load();

        data.set(await this.#getHash(netlist), new ScannedCircuit(identifier, trackingId, netlist));
        this._set(JSON.stringify([...data]));
    }

    /**
     * saves the netlists to the local storage of the browser, values are appended to existing onex
     * @param scannedCircuits {Array<ScannedCircuit>} the netlists of the circuits to save
     */
    async saveCircuits(scannedCircuits){
        let data = await this.load();
        for (let scannedCircuit of scannedCircuits){
            data.set(await this.#getHash(scannedCircuit.netlist), scannedCircuit);
        }
        this._set(JSON.stringify([...data]));
    }

    async remove(netlist=undefined, hash=undefined){
        if (netlist) hash = await this.#getHash(netlist);
        if (!hash) throw Error("Either netlist or hash must be provided");
        let data = await this.load();

        if (!data.delete(hash)) {
            console.warn(`Hash ${hash} not found in scanned circuits, cannot delete`);
        }
    }

    async #getHash(str){
        const encoder = new TextEncoder();
        const data = encoder.encode(str);           // string → Uint8Array
        const hashBuffer = await crypto.subtle.digest('SHA-256', data);

        const hashArray = Array.from(new Uint8Array(hashBuffer));
        const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

        return hashHex;
    }

    async reset(){
        this._delete()
    }
}