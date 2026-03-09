class CircuitHash extends LocalStorageWriter{
    constructor() {
        super("circuitsHash");
    }

    loadValue(){
        let [success, hash] = super._get();
        if (success) {
            return hash;
        }
        else{
            return "";
        }
    }

    setValue(value){
        super._set(value);
    }
}