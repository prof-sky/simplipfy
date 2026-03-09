class TrackingIDs extends LocalStorageWriter{
    #data = {}

    constructor() {
        super("trackingIDs");
        let [success, data] = this.load()
        if (!success) {
            this.#data = {};
            this.save()
        }
    }

    loadValue(id){
        let [success, savedData] = this.load()
        if (success){
            for (let [savedID, data] of Object.entries(savedData)){
                if(id == savedID){
                    return data;
                }
            }
        }
        return [false, {}]
    }

    removeValue(id){
        let [success, savedData] = this.load()
        if (success && savedData.hasOwnProperty(id)){
            delete this.#data[id];
            this.save();
            return true;
        }
        return false;
    }

    load(){
        let [success, data] = super._get()

        if(success){
            let dataObj = JSON.parse(data)
            this.#data = dataObj
            return [true, dataObj]
        }
        return [false, {}]
    }

    save(){
        // names follow definition in window.definitions.selectorIDs
        let data = JSON.stringify(this.#data)
        super._set(data)
    }

    saveValue(id, key, file_name, netlist=null){
        this.load();
        if (this.#data.hasOwnProperty(id.toString())){
            console.warn(`tracking id: ${id}, overwritten`)
        }
        this.#data[id.toString()] = {"key": key.toString(), "file_name": file_name, "netlist": netlist};
        this.save();
    }

    reset(){
        this.#data = {};
        this.save();
    }
}