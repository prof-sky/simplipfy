/** @abstract */
class SaveBasedOnHash extends LocalStorageWriter {
    _data = {};
    _keys = [];
    _initialValue;

    /**
     *
     * @param key {string} the value is saved with this key to the local storage
     * @param initialValue {Function} this function is called to assign the initial value of a saved value
     * @param keys {Array<string>} the keys that are put under each hash value
     */
    constructor(key, initialValue, keys) {
        super(key);
        this._initialValue = initialValue;
        this._keys = keys;
        let [success, data] = this.load()
        if (!success) {
            this.save()
        }
    }

    resetHash(hash){
        this.load();
        if (this._data.hasOwnProperty(hash)){
            this._data[hash] = {}
            this.addKeysToHash(hash);
            this.save();
        }
        else{
            console.warn(`hash ${hash} does not exist`);
        }
    }

    addKeysToHash(hash){
        for (let key of this._keys) {
            this._data[hash][key] = this._initialValue();
        }
    }

    /**
     *
     * @param hash {string} adds the hash to the saved object and creates all keys in the
     * @returns {int} returns 1 if the hash was added, 0 if it already existed
     */
    addHash(hash){
        this.load();
        if (!this._data.hasOwnProperty(hash)){
            this._data[hash] = {}
            this.addKeysToHash(hash);
            this.save();
            return 1;
        }
        return 0;
    }

    save(){
        // names follow definition in window.definitions.selectorIDs
        let data = JSON.stringify(this._data)
        super._set(data)
    }

    load(){
        let [success, data] = super._get()
        if(success){
            this._data = JSON.parse(data)
            return [true, this._data]
        }
        return [false, null];
    }

    /** @virtual */
    setValue(hash, key, value){
    }

    loadValue(hash, key){
        this.load();
        this._data[hash][key] ??= this._initialValue();
        return this._data[hash][key];
    }

    /**
     * deletes all data, resets the object in local storage to an empty object
     */
    reset(){
        this._data = {};
        this.save();
    }
}