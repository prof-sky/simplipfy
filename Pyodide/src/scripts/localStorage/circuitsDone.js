class CircuitsDone extends SaveBasedOnHash{
    constructor() {
        super("circuitsDone", () => [], Object.values(window.definitions.selectorIDs));
    }

    setValue(hash, key, value) {
        this.load();
        this._data[hash][key] ??= this._initialValue;
        this._data[hash][key].push(value);
        this.save();
    }
}