/** Converts different types of netlist depending on the intended use */
class Converter{
    constructor(){
        this.editorNetlist = state.currentEditorNetlist;
        this.editorArray = state.currentEditorElementList;
    }

    /**
     * Convert netlist format from editor to simplipfy
     * @returns netlist
     */
    convertNetlist(mode) {
        // prepare netlist from editor
        this.editorNetlist = JSON.parse(state.currentEditorNetlist);
        if(state.currentEditorNetlist.startsWith('[["view"')) {
            UserMessage.warning(i18n.undefined_netlist);
            return;
        }

        let compCount = 0;
        let CLCount = 0;
        let sourceCount = 0;
        let unnamedComp = 'all';
        let unnamedCompCount = 0;
        let noValueCount = 0;
        let positionComp = [];
        let positionSource = [];

        // get position and amount
        for (let i in this.editorArray) {
            if (['c', 'l', 'r'].includes(this.editorArray[i][0].toLowerCase())) {
                positionComp.push(i);
                compCount++;
            }
            if (['v'].includes(this.editorArray[i][0].toLowerCase())) {
                positionSource.push(i);
                sourceCount++;
            }
        }

        // check for unnamed and zero value components
        for (const i of positionComp){
            if (this.editorArray[i][2]['name'] === undefined || this.editorArray[i][2]['name'] === '') unnamedCompCount++;
            else unnamedComp = 'some';
            if (['c'].includes(this.editorArray[i][0].toLowerCase()) && (this.editorArray[i][2]["c"] === "0" || this.editorArray[i][2]["c"] === '')) noValueCount++;
            if (['l'].includes(this.editorArray[i][0].toLowerCase()) && (this.editorArray[i][2]["l"] === "0" || this.editorArray[i][2]["l"] === '')) noValueCount++;
            if (['r'].includes(this.editorArray[i][0].toLowerCase()) && (this.editorArray[i][2]["r"] === "0" || this.editorArray[i][2]["r"] === '')) noValueCount++;
        }

        // check for unnamed and zero value sources
        for (const j of positionSource){
            if (this.editorArray[j][2]['name'] === undefined || this.editorArray[j][2]['name'] === '') unnamedCompCount++;
            else unnamedComp = 'some';
            if (this.editorArray[j][2]["v"] === 'dc(0)' || this.editorArray[j][2]["v"] === 'sin(0,0,0)' || this.editorArray[j][2]["v"]=== '') noValueCount++;
        }

        if (noValueCount > 0){
            if(!confirm(i18n.null_value)){
                return;
            }
        }



        if (unnamedCompCount === 0) unnamedComp = 'none';

        let indexSourceL;
        let indexSourceD = sourceCount;
        let indexComp = 1;
        if (sourceCount > 1){
            indexSourceL = Array.from(
                { length: 26 },
                (_, i) => String.fromCharCode(i + 97));
        }
        // Netlist needs auto naming
        if (unnamedComp === 'all'){
            for (const i of positionComp){
                this.editorArray[i][2]['name'] = `${indexComp}`;
                indexComp++;
            }
            for (const j of positionSource){
                let newNameSource = `${indexSourceD}`;
                if (sourceCount > 1){
                    indexSourceD --;
                    newNameSource = `${indexSourceL[indexSourceD]}`;
                }
                this.editorArray[j][2]['name'] = newNameSource;
            }
        }

        // normalize coordinates
        for (let i in this.editorNetlist) {
            let limit = 0;
            // components have x1|y1
            if (['v', 'c', 'l', 'r'].includes(this.editorNetlist[i][0].toLowerCase()))
                limit = 2;
            // wires have x1|y1|x2|y2
            else if ('w' === this.editorNetlist[i][0].toLowerCase())
                limit = 4;
            // apply normalization
            for (let j = 0; j < limit; j++)
                this.editorNetlist[i][1][j] /= 48;
        }

        // prepare components & wire for node detection
        for (let i in this.editorNetlist) {
            // components get output coordinates & direction as text
            if (['v', 'c', 'l', 'r'].includes(this.editorNetlist[i][0].toLowerCase())) {
                // get x1|y1 & make x1|y1|x2|y2
                let newXYXYD = this.editorNetlist[i][1].slice(0, 2);
                newXYXYD = newXYXYD.concat(newXYXYD);
                // add direction
                newXYXYD.push(['down', 'left', 'up', 'right'][this.editorNetlist[i][1][2] % 4]);
                // modify x2 or y2 depending on direction
                switch (newXYXYD[4]) {
                    case 'down':
                        newXYXYD[3]++;
                        break;
                    case 'left':
                        newXYXYD[2]--;
                        break;
                    case 'up':
                        newXYXYD[3]--;
                        break;
                    case 'right':
                        newXYXYD[2]++;
                        break;
                }
                // override previous x1|y1|direction_number with new x1|y1|x2|y2|direction_text
                this.editorNetlist[i][1] = newXYXYD;
            }
            // make long wires into small wires
            else if ('w' === this.editorNetlist[i][0].toLowerCase())
                // X loop means 0 & Y loop means 1
                for (let xy = 0; xy <= 1; xy++) {
                    // get directional wire length between x2 -> x1 or y2 -> y1
                    let difference = this.editorNetlist[i][1][2 + xy] - this.editorNetlist[i][1][xy];
                    // when wire length greater than 1, get normalized & directional step length for each sub wire
                    if (Math.abs(difference) > 1) {
                        let step = difference / Math.abs(difference);
                        // override x2 or y2 of long wire
                        this.editorNetlist[i][1][2 + xy] = this.editorNetlist[i][1][xy] + step;
                        // add small wires until previous long wire is filled
                        for (let n = 1; n < Math.abs(difference); n++)
                            this.editorNetlist.push(['w', [
                                // only apply changed x2|y2 if loop means X or Y, else use default values from long wire
                                xy !== 0 ? this.editorNetlist[i][1][0] : this.editorNetlist[i][1][0] + step * n,
                                xy !== 1 ? this.editorNetlist[i][1][1] : this.editorNetlist[i][1][1] + step * n,
                                xy !== 0 ? this.editorNetlist[i][1][2] : this.editorNetlist[i][1][0] + step * (n + 1),
                                xy !== 1 ? this.editorNetlist[i][1][3] : this.editorNetlist[i][1][1] + step * (n + 1)
                            ]]);
                    }
                }
        }

        // get nodes based on coordinates
        let nodes = {};
        for (let i in this.editorNetlist){
            // for each component & wire (ignores i.e. 'view')
            if (['v', 'c', 'l', 'r', 'w'].includes(this.editorNetlist[i][0].toLowerCase())){
                // for x1|y1 than x2|y2
                for (let xy = 0; xy <= 2; xy += 2) {
                    // get x|y and make string for key
                    let key = this.editorNetlist[i][1].slice(xy, 2 + xy).join(',');
                    // save id in editor netlist & component x1|y1 -> in or x2|y2 -> out
                    let data = [i, ['in', 'out'][xy / 2]];
                    // add to nodes
                    if (key in nodes)
                        nodes[key].push(data);
                    else
                        nodes[key] = [data];
                }
            }
        }

        // build final
        let result = [];
        for (let i in this.editorNetlist) {
            // get connected node id's
            let nodeIDs = [null, null];
            let idNodes = 0;
            // get normalized node id's that are connected by component / wire for current id in editor netlist
            for (let j in nodes) {
                // each item in array of current node
                for (let k in nodes[j])
                    // item has current id in netlist
                    if (nodes[j][k][0] === i)
                        // for in & out
                        for (let l = 0; l <= 1; l++)
                            if (nodes[j][k][1] === ['in', 'out'][l])
                                // save node id in tupple
                                nodeIDs[l] = idNodes;
                idNodes++;
            }
            // if nodeIDs got in & out of a component / wire, it's valid
            if (nodeIDs[0] != null && nodeIDs[1] != null) {
                // add line for condensator, loop or resistor
                if (['c', 'l', 'r'].includes(this.editorNetlist[i][0].toLowerCase())) {
                    // prepare
                    let tag = `${this.editorArray[i][0].toUpperCase()}`+`${this.editorArray[i][2]['name']}`;
                    let nodeIn = nodeIDs[0];
                    let nodeOut = nodeIDs[1];

                    let value;
                    if (mode === 'sym'){
                        value = this.editorArray[i][0].toUpperCase() + this.editorArray[i][2]["name"];
                    }
                    else value = this.convertSI2value(this.editorNetlist[i][2][this.editorNetlist[i][0].toLowerCase()]);
                    let direction = this.editorNetlist[i][1][4];
                    // add line
                    result.push(`${tag} ${nodeIn} ${nodeOut} {${value}}; ${direction}`);
                    // add line for source
                } else if ('v' === this.editorNetlist[i][0].toLowerCase()) {
                    // prepare
                    let tag = `${this.editorArray[i][0].toUpperCase()}` + `${this.editorArray[i][2]['name']}`;
                    let nodeIn = nodeIDs[0];
                    let nodeOut = nodeIDs[1];
                    let direction = this.editorNetlist[i][1][4];
                    let info = this.editorNetlist[i][2]['v'].split('(');
                    let type = info[0];
                    let data = '';
                    if (mode === 'sym'){
                        data = `{${this.editorArray[i][0].toUpperCase() + this.editorArray[i][2]["name"]}}`;
                    }
                    // make data for dc
                    else if (type === 'dc')
                        data = `{${this.convertSI2value(this.editorNetlist[i][2]['v'].split('(')[1].split(')')[0])}}`;
                    // make data for sin
                    else if (type === 'sin') {
                        info = info[1].split(')')[0].split(',');
                        // get amplitude, offset & frequency
                        data = `{${this.convertSI2value(info[1])}} {${this.convertSI2value(info[0])}} {2*pi*${this.convertSI2value(info[2])}}`;
                        type = 'ac';
                    }
                    // add line if supported voltage source type
                    if (data !== '')
                        result.push(`${tag} ${nodeIn} ${nodeOut} ${type} ${data}; ${direction}`);
                    // add line for wire
                } else if ('w' === this.editorNetlist[i][0].toLowerCase()) {
                    let nodeIn = nodeIDs[0];
                    let nodeOut = nodeIDs[1];
                    let direction = null;
                    // get direction as text
                    if (this.editorNetlist[i][1][0] !== this.editorNetlist[i][1][2])
                        direction = this.editorNetlist[i][1][0] < this.editorNetlist[i][1][2] ? 'right' : 'left';
                    else if (this.editorNetlist[i][1][1] !== this.editorNetlist[i][1][3])
                        direction = this.editorNetlist[i][1][1] < this.editorNetlist[i][1][3] ? 'down' : 'up';
                    // add line if direction determined
                    if (direction != null)
                        result.push(`W ${nodeIn} ${nodeOut}; ${direction}`);
                }
            }
        }

        // prepare netlist for simpliPFy
        let foundBlindComponent = true;
        let userAcknowledged = false;
        let userNotified = false;

        // detect blind component
        while (foundBlindComponent) {
            foundBlindComponent = false;

            // count how often a node is used
            let counterNodes = {};
            for (let line of result) {
                // get nodes id
                let nodeIds = line.split(';')[0].split(' ');
                // lookup/add first and second node id
                for (let i = 1; i <= 2; i++)
                    if (nodeIds[i] in counterNodes)
                        counterNodes[nodeIds[i]]++;
                    else
                        counterNodes[nodeIds[i]] = 1;
            }

            // is a node used once?
            for (let i in counterNodes)
                if (counterNodes[i] === 1) {
                    foundBlindComponent = true;
                    if (!userNotified) {
                        userNotified = true;
                        if (!userAcknowledged) {
                            if (confirm(i18n.blind_Components)) userAcknowledged = true;
                            else {
                                UserMessage.warning(i18n.convert_Abort);
                                return;
                            }
                        }
                    }
                }

            // remove blind nodes
            let newResult = [];
            for (let line of result) {
                // get nodes id
                let nodeIds = line.split(';')[0].split(' ');
                // check if both nodeIds are used more than once
                if (counterNodes[nodeIds[1]] > 1 && counterNodes[nodeIds[2]] > 1)
                    newResult.push(line);
            }

            result = newResult;
        }

        // remove disconnected components
        let connectedNodeIds = [];
        let addedNodeId = true;
        let newResult = [];

        // get first voltage V0
        for (let i in result){
            if (result[i].startsWith('V')) {
                newResult.push(result[i]);
                let nodeIds = result[i].split(';')[0].split(' ');
                connectedNodeIds.push(nodeIds[1], nodeIds[2]);
            }
        }

        // add each line if node is connected to circuit containing V0
        while (addedNodeId) {
            addedNodeId = false;

            for (const line of result) {
                let nodeIds = line.split(';')[0].split(' ');

                if (nodeIds[1] in connectedNodeIds || nodeIds[2] in connectedNodeIds) {
                    // push both node ids into list if not exist yet
                    for (let i = 1; i <= 2; i++)
                        if (!connectedNodeIds.includes(nodeIds[i])) {
                            addedNodeId = true;
                            connectedNodeIds.push(nodeIds[i]);
                        }
                    // add line to new result if not in yet
                    if (!newResult.includes(line)){
                        newResult.push(line);
                    }
                }
            }
        }

        if(newResult.length === 0){
            UserMessage.warning(i18n.undefined_netlist);
            return;
        }

        // netlist isn't completely named
        if(unnamedComp === 'some'){
            UserMessage.warning(i18n.not_named);
            return;
        }

        if ((this.editorArray[positionSource[0]][2]['v'].split('(')[0] === 'dc' || sourceCount > 1) && CLCount >= 1) {
            if(!confirm(i18n.potential_Errors)){
                UserMessage.warning(i18n.convert_Abort);
                return;
            }
        }

        result = newResult;

        // result
        if (result.length === 0)
            return;
        result.sort();
        result = result.join('\r\n');
        if (window.activeSchematic.has_short_circuit(result)){
            if(!confirm(i18n.short_Circuit)){
                UserMessage.warning(i18n.convert_Abort);
                return;
            }
        }
        if (window.activeSchematic.has_one_comp(result)) {
            if(!confirm(i18n.potential_Errors)){
                UserMessage.warning(i18n.convert_Abort);
                return;
            }
        }
        return result;
    }

    // convert mixed value with si to only value
    convertSI2value(input) {
        // abort if too many decimal dots
        if (input.match(/\./g) != null && input.match(/\./g).length > 1) {
            UserMessage.warning(i18n.too_many_deci + `${input}`);
            return;
        }
        // get value & suffix
        let value = parseFloat(input.replace(/[^0-9.e-]/g, ""));
        let suffix = input.match(/.*(\d)/);
        if (!suffix)
            suffix = input;
        suffix = input.lastIndexOf(suffix[1]);
        suffix = input.substring(suffix + 1);
        // check suffix & apply on value
        switch (suffix) {
            case '':
                break;
            case 'T':
            case 'tera':
                value += 'e12';
                break;
            case 'G':
            case 'giga':
                value += 'e9';
                break;
            case 'M':
            case 'mega':
                value += 'e6';
                break;
            case 'k':
            case 'kilo':
                value += 'e3';
                break;
            case 'm':
            case 'milli':
                value += 'e-3';
                break;
            case 'μ':
            case 'micro':
                value += 'e-6';
                break;
            case 'n':
            case 'nano':
                value += 'e-9';
                break;
            case 'p':
            case 'pico':
                value += 'e-12';
                break;
            default:
                UserMessage.warning(i18n.unknown_SI + `${input}`);
                return 'error';
        }
        // return value
        return value;
    }

    /**
     * Convert netlist format from simplipfy to editor
     * @param {string} netlist
     * @returns netlist
     */
    netlist2Editor(netlist) {

        // get only netlist components from file, ignore else
        let cleanNetlist = netlist.slice();
        for (const line of netlist) {
            let words = line.split(' ');
            if (['c', 'l', 'r', 'v', 'w'].includes(line.charAt(0).toLowerCase()) && !isNaN(words[1]) && !isNaN(words[2]) && line.includes(';'))
                cleanNetlist.push(line);
        }
        netlist = cleanNetlist;

        // variables init
        const netlistEditor = [];
        let nodeXY = [];
        let i = 0;
        let newNodeInCycle = true;
        let lines = netlist.split('\r\n');

        // work through each line to determine node coordinates
        while (lines.length > 0 && !(++i >= lines.length && !newNodeInCycle)) {
            if (i >= lines.length) {
                newNodeInCycle = false;
                i = 0;
            }

            let line = lines[i];
            let nodeIn, nodeOut;
            [nodeIn, nodeOut] = line.split(';')[0].split(' ').slice(1, 3);

            // first node id in list, determine second node id
            if (nodeXY.length === 0 || nodeIn in nodeXY && !(nodeOut in nodeXY)) {
                if (nodeXY.length === 0)
                    nodeXY[nodeIn] = [0, 0];
                let xy = nodeXY[nodeIn].slice();
                switch (line.split(' ').at(-1)) {
                    case 'up':
                        xy[1]--;
                        break;
                    case 'down':
                        xy[1]++;
                        break;
                    case 'left':
                        xy[0]--;
                        break;
                    default:
                        xy[0]++;
                }
                nodeXY[nodeOut] = xy;
                newNodeInCycle = true;
                lines.splice(i, 1);

                // second node id in list, determine first node id
            } else if (nodeOut in nodeXY && !(nodeIn in nodeXY)) {
                let xy = nodeXY[nodeOut].slice();
                switch (line.split(' ').at(-1)) {
                    case 'up':
                        xy[1]++;
                        break;
                    case 'down':
                        xy[1]--;
                        break;
                    case 'left':
                        xy[0]++;
                        break;
                    default:
                        xy[0]--;
                }
                nodeXY[nodeIn] = xy;
                newNodeInCycle = true;
                lines.splice(i, 1);
            }
        }

        // expand coordinates to grid
        for (const i in nodeXY) {
            nodeXY[i][0] *= 48;
            nodeXY[i][1] *= 48;
        }

        // rebuild editor formatted line of components
        let iJson = 0;
        for (let line of netlist.split('\r\n')) {
            let name = line.toString().split(' ')[0];
            name = name.slice(1);
            line = line.toLowerCase();
            let component = line.charAt(0);
            let words = line.split(';')[0].split(' ');
            let direction = line.split('; ')[1];

            switch (direction) {
                case 'down':
                    direction = 0;
                    break;
                case 'left':
                    direction = 1;
                    break;
                case 'up':
                    direction = 2;
                    break;
                default:
                    direction = 3;
            }

            switch (component) {
                case 'c':
                case 'l':
                case 'r':
                    netlistEditor.push(
                        [
                            component,
                            [...nodeXY[words[1]], ...[direction]],
                            {'name': name, [component]: this.value2SI(words[3].replace(/[{}]/g, '')), '_json_': iJson++ },
                            [null, null]
                        ]
                    );
                    break;
                case 'v':
                    let data;
                    if (words[3] === 'dc')
                        data = { 'name': name, 'v': `${words[3]}(${words[4].replace(/[{}]/g, '')})`, '_json_': iJson++ };
                    else {
                        data = { 'name': name, 'v': `sin(${this.value2SI(words[5].replace(/[{}]/g, ''))},${this.value2SI(words[4].replace(/[{}]/g, ''))},${this.value2SI(words[6].replace(/[{}]/g, '').split('*').at(-1))})`, '_json_': iJson++ };
                    }
                    netlistEditor.push(
                        [
                            component,
                            [...nodeXY[words[1]], ...[direction]],
                            data,
                            [null, null]
                        ]
                    );
                    break;
                case 'w':
                    netlistEditor.push(
                        [
                            component,
                            [...nodeXY[words[1]], ...nodeXY[words[2]]]
                        ]
                    );
                    break;
            }
        }

        // add viewport
        netlistEditor.push([
            "view", 0, 0, 2, "50", "10", "1G", null, "100", "0.01", "1000"
        ]);

        // return editor formatted netlist
        return JSON.stringify(netlistEditor);
    }

    /**
     * Convert value to value with SI unit
     * @param {string} input
     * @returns
     */
    value2SI(input) {
        if (input.includes('e')) {
            let half = input.split('e');
            switch (half[1]) {
                case '12':
                    input = `${half[0]}T`
                    break;
                case '9':
                    input = `${half[0]}G`
                    break;
                case '6':
                    input = `${half[0]}M`
                    break;
                case '3':
                    input = `${half[0]}k`
                    break;
                case '-3':
                    input = `${half[0]}m`
                    break;
                case '-6':
                    input = `${half[0]}µ`
                    break;
                case '-9':
                    input = `${half[0]}n`
                    break;
                case '-12':
                    input = `${half[0]}p`
                    break;
            }
        }
        return input;
    }

}