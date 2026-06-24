class NetlistToSelector{
    comps = new Map(["R", "C", "L", "V", "I", "W"].map(x => [x, []]));

    constructor(netlist){
        for (let line of netlist.split("\n")){
            if (line[0] === "#") continue;
            this.comps.get(line[0]).push(line);
        }
    }

    _hasElements(type){
        return this.comps.get(type).length > 0;
    }

    get isDC(){
        let isDC = false;
        let sources = this.comps.get("V").concat(this.comps.get("I"));
        for (let source of sources){
            if (source.includes(" dc ")) isDC = true;
        }
        return isDC;
    }

    get isAC(){
        let isDC = false;
        let sources = this.comps.get("V").concat(this.comps.get("I"));
        for (let source of sources){
            if (source.includes(" ac ")) isDC = true;
        }
        return isDC;
    }

    get onlyR(){
        let check = (type) => this._hasElements(type);
        return check("R") && !check("C") && !check("L")
    }

    get onlyL(){
        let check = (type) => this._hasElements(type);
        return !check("R") && !check("C") && check("L")
    }

    get onlyC(){
        let check = (type) => this._hasElements(type);
        return !check("R") && check("C") && !check("L")
    }

    get hasWires(){
        return this._hasElements("W");
    }
}