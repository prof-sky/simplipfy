class AnimationShown extends SaveBasedOnHash{

    constructor() {
        super("animationShown", () => false, Object.values(window.definitions.selectorIDs));
    }

    setValue(hash, key, value) {
        this.load();
        this._data[hash][key] = value;
        this.save()
    }
}