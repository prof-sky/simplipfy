/** @abstract */
class OverviewImgInfoOverlay{
    /** @type {CircuitMap | WheatstoneCircuitMap} */
    circuitMap

    /**
     *
     * @param circuitMap {CircuitMap | WheatstoneCircuitMap}
     */
    constructor(circuitMap) {
        this.circuitMap = circuitMap;
    }

    /**
     * @virtual
     * @returns {HTMLDivElement}
    * */
    get overlay(){

    }
}

class EmptyOverlay extends OverviewImgInfoOverlay{
    get overlay(){
        let div = document.createElement("div");
        div.classList.add("inheritColors");
        div.classList.add("volt-freq-overlay");
        return div;
    }
}

class VoltageOverlay extends OverviewImgInfoOverlay{
    get overlay(){
        let div = document.createElement("div");
        div.classList.add("inheritColors");
        div.classList.add("volt-freq-overlay");
        div.innerHTML = `<p class="m-0 text-end inheritColors">${this.circuitMap.voltage}</p>`;
        return div;
    }
}

class VoltFreqOverlay extends OverviewImgInfoOverlay{
    get overlay(){
        let div = document.createElement("div");
        div.classList.add("volt-freq-overlay");
        div.innerHTML = `<p class="m-0 text-end inheritColors">${this.circuitMap.voltage}</p>
                         <p class="m-0 text-end inheritColors">${this.circuitMap.frequency}</p>`;
        return div;
    }
}

class WheatstoneOverlay extends OverviewImgInfoOverlay{
    get overlay(){
        let voltSymbol = languageManager.currentLang.simplifier.voltageSymbol
        let wheatOption = this.circuitMap.option
        let div = document.createElement("div");
        div.classList.add("volt-freq-overlay");
        div.innerHTML = `<div class="d-flex gap-3">
                            <div class="inheritColors">
                                <p class="m-0 text-end inheritColors">${voltSymbol}q = ${wheatOption.Uq} V</p>
                                <p class="m-0 text-end inheritColors">${voltSymbol}m = ${wheatOption.Um} V</p>
                            </div>
                            <div class="inheritColors">
                                <p class="m-0 text-end inheritColors">R1 = ${wheatOption.R1} Ω</p>
                                <p class="m-0 text-end inheritColors">R2 = ${wheatOption.R2} Ω</p>
                            </div>
                            <div class="inheritColors">
                                <p class="m-0 text-end inheritColors">R3 = ${wheatOption.R3} Ω</p>
                                <p class="m-0 text-end inheritColors">R4 = ${wheatOption.R4} Ω</p>
                            </div>
                        </div>`;
        return div;
    }
}

class OverlayFactory {
    /**
     * @param circuitMap  {CircuitMap | WheatstoneCircuitMap}
     */
    noOverlay = [window.definitions.selectorIDs.quickstart, window.definitions.selectorIDs.symbolic,
        window.definitions.selectorIDs.kirchhoff];
    voltOverlay = [window.definitions.selectorIDs.resistor];
    voltFreqOverlay = [window.definitions.selectorIDs.inductor,
        window.definitions.selectorIDs.capacitor, window.definitions.selectorIDs.mixed];

    /**
     *
     * @param circuitMap
     * @returns {HTMLDivElement}
     */
    overlay(circuitMap){
        let identifier = circuitMap.selectorGroup;
        if (this.noOverlay.includes(identifier)) return new EmptyOverlay(circuitMap).overlay;
        else if (this.voltOverlay.includes(identifier)) return new VoltageOverlay(circuitMap).overlay;
        else if (this.voltFreqOverlay.includes(identifier)) return new VoltFreqOverlay(circuitMap).overlay;
        else if (identifier === window.definitions.selectorIDs.wheatstone) return new WheatstoneOverlay(circuitMap).overlay;
        else {
            console.warn(`unhandled overlay request for identifier: ${identifier}`);
            return new EmptyOverlay(circuitMap).overlay;
        }
    }
}