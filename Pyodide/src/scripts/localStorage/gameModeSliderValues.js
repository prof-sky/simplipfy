class GameModeSliderValues extends LocalStorageWriter {
    constructor() {
        super("gameModeSliderValues");
    }

    readStateVals(){
        let sbt = state.simplifierBaseTime
        let sat = state.simplifierAddTime
        let kbt = state.kirchhoffBaseTime
        let kat = state.kirchhoffAddTime

        return [sbt, sat, kbt, kat]
    }

    toJSON(sbt, sat, kbt, kat){
        return `{"sbt": "${sbt.ms()}", "sat": "${sat.ms()}", "kbt": "${kbt.ms()}", "kat": "${kat.ms()}"}`
    }

    _writeJsonToStorage(jsonString){
        super._set(jsonString);
    }

    save(){
        let [sbt, sat, kbt, kat] = this.readStateVals()
        this._writeJsonToStorage(this.toJSON(sbt, sat, kbt, kat))
    }

    load(){
        let [success, data] = super._get()
        if (success) {
            let dataObj = JSON.parse(data)
            state.simplifierBaseTime = new TimeVal(dataObj.sbt)
            state.simplifierAddTime = new TimeVal(dataObj.sat)
            state.kirchhoffBaseTime = new TimeVal(dataObj.kbt)
            state.kirchhoffAddTime = new TimeVal(dataObj.kat)

            return 0
        }

        return -1

    }
}