/**
 * Object that holds information of a single circuit. Is used in {@link CircuitSet}.
 */

class CircuitMap {
    /** @type {string} */
    circuitFile;
    /** @type {string} */
    sourceDir;
    /** @type {string} */
    svgFile;
    /** @type {window.definitions.selectorIDs} */
    selectorGroup;
    /** @type {string} */
    voltage;
    /** @type {string} */
    frequency;
    /** @type {window.definitions.mode} */
    mode;
    /** @type {int} */
    index;

    /**
     *
     * @param circuitFileName {string} name of the file
     * @param dir {window.definitions.allowedDirNames} the directory the circuit is saved in
     * @param id {window.definitions.selectorIDs} the id of the circuit
     * @param parent {Array<CircuitMap>} the list in which this CircuitMap is saved
     * @param index {int} at wich index this element is in the parent
     * @param mode {window.definitions.mode} the mode for wich this circuit map is used (changes paths)
     * @returns {CircuitMap} the circuit map for the passed arguments
     */
    //createCircuitMap
    async _init(circuitFileName, dir, id, parent, index,
                mode = window.definitions.mode.learn){
        this.sourceDir = dir;
        this.selectorGroup = id;
        this.circuitFile = circuitFileName;
        this.parent = parent; //can be used to navigate through the list this circuit map is part of
        this.mode = mode;

        let path = this.circuitPath + "/" + this.circuitFile;
        let result = await this.#readVoltageAndFreq(path);
        this.voltage = result.voltage;
        this.frequency = result.frequency;
        this.index = index;
    }

    async init(circuitFileName, dir, id, parent, index,
               mode = window.definitions.mode.learn) {

        await this._init(circuitFileName, dir, id, parent, index, mode);
        parent.push(this);
        return this;
    }

    get circuitId(){
        return this.circuitFile.split(".")[0]
    }

    get circuitName(){
        let idx = this.circuitId.indexOf("_");
        let name = this.circuitId.substring(idx + 1)
        name = name.replaceAll("_", " ");

        return name;
    }

    get standardCircuitName(){
        return languageManager.currentLang.selector.taskStandardName + " " + this.index;
    }

    get paramMap() {
        return createParamMap();
    }

    get solutionPath(){
        return conf.pyodide.paths.solutions;
    }

    // those paths may change at runtime
    get circuitPath(){
        if (this.mode === window.definitions.mode.qr) {
            // scanned QR circuits
            return this.qrCircuitsPath
        } else if (this.mode === window.definitions.mode.custom) {
            // Own uploaded zip circuits
            return this.customCircuitsPath
        }
        else if (this.mode === window.definitions.mode.editor){
            return this.editorCircuitsPath
        }
        else {
            // "normal" circuits
            return this.standardCircuitsPath
        }
    }

    get qrCircuitsPath(){
        return conf.pyodide.paths.workingDir;
    }

    get customCircuitsPath(){
        return conf.tools.customCircuits.paths.dir + `/${state.selectedZipDirName}/${this.sourceDir}`
    }

    get editorCircuitsPath(){
        return conf.editor.paths.dir
    }

    get standardCircuitsPath(){
        return `${conf.pyodide.paths.circuits}/${this.sourceDir}`
    }

    /** @returns {string} the path to the location of the overview svg file for the selector under learn */
    get overViewSvgFile(){
        return this.standardCircuitsPath+`/${this.circuitId}_step0.svg`;
    }

    /** @returns {string} the path to the location of the overview svg file for the custom circuits */
    get customOverViewSvgFile(){
        return this.customCircuitsPath+`/${this.circuitId}_step0.svg`;
    }

    get editorOverViewSvgFile(){
        return this.editorCircuitsPath+`/${this.circuitId}_step0.svg`;
    }

    get saveName(){
        return this.circuitFile
    }

    /**
     * @returns {Promise<{voltage: string, frequency: string}>}
     */
    async #readVoltageAndFreq(path) {
        let file = await state.apis.pyodide.readFile(path, "utf8");
        const lines = file.split('\n');

        for (let line of lines) {
            const matchDC = line.match(/^V\d+ \d+ \d+ dc \{(.*?)\}/);
            const matchAC = line.match(/^V\d+ \d+ \d+ ac \{(.*?)\} \{.*?\} \{(.*?)\}/);

            if (matchDC) {
                return {voltage: matchDC[1] + "V", frequency: ""};
            } else if (matchAC) {
                let omegaStr = matchAC[2].trim();
                let frequency;
                if (omegaStr.includes("2*pi")) {
                    omegaStr = omegaStr.replace(/pi/g, "Math.PI");
                }
                frequency = eval(omegaStr.replace(/pi/g, "Math.PI")) / (2 * Math.PI);
                return {voltage: matchAC[1] + "V", frequency: this.#formatFrequency(Math.round(frequency))};
            }
        }

        return {voltage: "", frequency: ""};
    }

    #formatFrequency(frequency) {
        if (frequency >= 1e9) {
            return (frequency / 1e9).toFixed(1) + 'GHz';
        } else if (frequency >= 1e6) {
            return (frequency / 1e6).toFixed(1) + 'MHz';
        } else if (frequency >= 1e3) {
            return (frequency / 1e3).toFixed(1) + 'kHz';
        } else {
            return frequency + 'Hz';
        }
    }

    /** uses the parent filed of the CircuitMap to determine the next element in the list
     * this way we don't need to keep which CircuitFilesManager is handling this right now because the circuits
     * know what list they are part of and the next element can be found by getting their index in their parent list and
     * incrementing the index
     * */
    nextCircuitMap(circuitMap) {
        let newIdx = this.parent.indexOf(state.currentCircuitMap)
        if (newIdx < this.parent.length - 1){
            return this.parent[newIdx+1];
        }
        else{
            let currentSourceDir = this.sourceDir;
            let currentDirIdx = state.currentSelector.circuitFiles.circuitDirs.indexOf(currentSourceDir);

            if (currentDirIdx < state.currentSelector.circuitFiles.circuitDirs.length-1){
                setTimeout(() => {showMessage(languageManager.currentLang.alerts.finishedLastCircuit, "success", false)},0);
                return state.currentSelector.circuitFiles.circuitSets[currentDirIdx+1].circuitMaps[0];
            }
            else{
                return state.currentSelector.circuitFiles.circuitSets[0].circuitMaps[0];
            }
        }
    }

    async svgData(recursion=true){
        let svgData;
        if (this.mode === window.definitions.mode.custom) {
            svgData = this.#getSvgDataCustomCircuits()
        }
        else if (this.mode === window.definitions.mode.editor) {
            svgData = this.#getSvgDataEditor()
        }
        else svgData = this.#getSvgDataServerCircuits()

        /* todo on some devices the svgs where empty, cant reproduce and should be avoided by this line in worker
            self.pyodide = await self.pyodideReadyPromise;
            the worker should only return null or undefined when it is not initialized otherwise an error should occur
            this retries after 1 second and hopes the worker is initialized then
        */
        if (!svgData && recursion) {
            console.warn("expected svg data but empty, retry in 1s");
            await new Promise(resolve => setTimeout(resolve, 1000));
            svgData = this.svgData(false);
            if (!svgData) throw Error("no svg data found");
        }

        return svgData;
    }

    /**
     * [bar description]
     * @return {string} svg-data
     */
    async #getSvgDataCustomCircuits(){
        /**
         * @param
         * returns the svg-Data as string
         * cathces a potential file read error internally
         * file will be generated if not found or read error occures
         * read error is printed to the console
         **/
        let isValidSyntax, svgData, errMsgs, warnMsgs;
        let path = this.customOverViewSvgFile
        let isFile = await state.apis.pyodide.exists(path);

        if (isFile){
            svgData = await state.apis.pyodide.readFile(path);
            return svgData;
        }

        let netlist = await state.apis.pyodide.readFile(conf.tools.customCircuits.paths.dir + `/${state.selectedZipDirName}/${this.sourceDir}/${this.circuitFile}`);
        let paramMap = createParamMap();
        let [optionsString, rawNetlist] = extractCommentsAndNetlist(netlist);
        [isValidSyntax, svgData, errMsgs, warnMsgs] = await state.apis.pyodide.forceDrawing(rawNetlist, paramMap, optionsString);
        return svgData;
    }

    /**
     * @return {string} svg-data
     */
    async #getSvgDataServerCircuits(){
        let svgData = await state.apis.pyodide.readFile(this.overViewSvgFile, "utf8");
        return svgData;
    }

    async #getSvgDataEditor(){
        let svgData = await state.apis.pyodide.readFile(this.editorOverViewSvgFile, "utf8");
        return svgData;
    }

}

class WheatstoneCircuitMap extends CircuitMap{
    /** @type {WheatstoneOption} */
    option
    /** @type {string} */
    optionName


    /** @param circuitMap {CircuitMap} */
    async fromCircuitMap(circuitMap){
        for (let key of Object.keys(circuitMap)){
            this[key] = circuitMap[key];
        }
        this.options = await parseWheatstoneOptionFile(this.optionsFilePath);
    }

    #init(circuitFileName, dir, id, parent, index, mode, option, optionName){
        super._init(circuitFileName, dir, id, parent, index, mode);
        this.option = option;
        this.optionName = optionName;
        return this;
    }

    async init(circuitFileName, dir, id, parent, index,
         mode = window.definitions.mode.learn){
        super._init(circuitFileName, dir, id, parent, index, mode);

        let idx = 0;
        let options = await parseWheatstoneOptionFile(this.optionsFilePath)
        for (let wheatOption of options){
            parent.push(new WheatstoneCircuitMap().#init(circuitFileName, dir, id, parent, index, mode, wheatOption, String(idx+1)))
            idx++;
        }

        return this;
    }

    get optionsFilePath(){
        return this.circuitPath + "/" + this.circuitId + conf.wheatstone.names.optionsExtension;
    }

    get circuitName(){
        let name = this.circuitId + "_" + this.optionName
        let idx = name.indexOf("_");
        name = name.substring(idx + 1)
        name = name.replaceAll("_", " ");
        return name;
    }

    get saveName(){
        return this.circuitId + "_" + this.optionName + ".txt"
    }
}

class ExternalCircuitMap extends CircuitMap{
    /**
     * @param netlist {string} the netlist of the scanned circuit
     * @returns {CircuitMap} the circuit map for the created netlist
     * saves the scanned netlist into conf.tools.svgScan.path.dir to load it with a SimplifierPage and
     * returns the according CircuitMap
     * */
    async initForScan(netlist){
        let _conf = conf.tools.svgScan
        await state.apis.pyodide.writeFile(_conf.paths.dir + _conf.names.file, netlist);

        this.circuitFile = conf.tools.svgScan.names.file;
        this.sourceDir = "";
        this.selectorGroup = "qr";
        this.voltage = "";
        this.frequency = "";
        this.parent = [this]; //if this.nextCircuitMap is called return this element again
        this.mode = window.definitions.mode.qr
        this.index = 0;

        return this;
    }

    /**
     * @param netlist {string} the netlist of the circuit created in the editor
     * @returns {CircuitMap} the circuit map for the created netlist
     * saves the scanned netlist into conf.tools.svgScan.path.dir to load it with a SimplifierPage and
     * returns the according CircuitMap
     * */
    async initForEditor(netlist){
        await state.apis.pyodide.writeFile(conf.editor.paths.dir + conf.editor.names.file, netlist);

        this.circuitFile = conf.editor.names.file;
        this.sourceDir = "";
        this.selectorGroup = "editor";
        this.voltage = "";
        this.frequency = "";
        this.parent = [this]; //if this.nextCircuitMap is called return this element again
        this.mode = window.definitions.mode.editor
        this.index = 0;

        return this;
    }

}

class CircuitMapFactory {
    getCircuitMap(id){
        if (id === window.definitions.selectorIDs.wheatstone){
            return new WheatstoneCircuitMap();
        }
        else {
            return new CircuitMap();
        }
    }
}