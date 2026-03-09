/**
 * Object that combines multiple {@link CircuitMap} Objects into one set. A set represents a carousel on the
 * learn page or the "Custom Circuit Collection" on the tools page. Used by {@link CircuitFilesManager}.
 */

class CircuitSet {
    /** @type {window.definitions.selectorIDs} */
    identifier
    /** @type {Array<CircuitMap>} */
    circuitMaps

    static ids = window.definitions.selectorIDs;

    /**
     *
     * @param files {Array<string>} file names of the circuit files that belong to this set
     * @param dir {string} directory where the circuit files are located
     * @param mode {window.definitions.mode} where a circuit is started from (changes paths in circuit map)
     * @returns {Promise<CircuitSet>}
     */
    async initFromFiles(files, dir, mode){
        let identifier = CircuitSet.ids[dir];
        if (!identifier) {
            console.error("Unknown dir name: " + dir);
            console.error("Allowed dir names: " + Object.keys(window.definitions.selectorIDs));
        }

        /** @type {Array<CircuitMap>} */
        this.circuitMaps = [];
        this.identifier = identifier;

        let fkt = (new CircuitMapFactory()).getCircuitMap;

        files.sort()

        let idx = 0;
        for (let circuitFileName of files) {
            await fkt(identifier).init(circuitFileName, dir, identifier, this.circuitMaps,
                idx, mode)
            idx++;
        }

        return this;
    }

    /**
     * @param identifier {window.definitions.selectorIDs}
     * @param circuitMaps {Array<CircuitMap>}
     * */
    initFromCircuitMaps(circuitMaps, identifier) {
        if (!Object.values(window.definitions.selectorIDs).includes(identifier)) {
            console.error("Unknown identifier: " + identifier);
            console.error("Allowed Identifiers: " + Object.values(window.definitions.selectorIDs));
        }
        this.identifier = identifier;
        this.circuitMaps = circuitMaps;

        return this;
    }
}