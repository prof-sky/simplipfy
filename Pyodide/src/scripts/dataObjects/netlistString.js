class NetlistString {
    #uncompressedNetlist = "";
    #compressedNetlist = "";

    /**
     * Initialize a NetlistString with either a compressed or uncompressed netlist string. If both are provided,
     * the uncompressed netlist will be used. Uses LZString to compress and decompress the netlist string.
     * @param compressed {string} LZ compressed string that holds a netlist
     * @param uncompressed {string} string that holds a netlist
     */
    constructor(uncompressed=undefined,compressed=undefined, ) {
        if(uncompressed){
            this.#uncompressedNetlist = uncompressed;
        }
        else if (compressed){
            this.#compressedNetlist = compressed;
        }
        else {
            throw Error("NetlistString must be initialized with either a compressed or uncompressed netlist string")
        }
    }

    get netlist(){
        return this.uncompressed;
    }

    get uncompressed(){
        if (this.#uncompressedNetlist) return this.#uncompressedNetlist;
        else return LZString.decompressFromEncodedURIComponent(this.#compressedNetlist);
    }

    get compressed(){
        if (this.#compressedNetlist) return this.#compressedNetlist;
        else return LZString.compressToEncodedURIComponent(this.#uncompressedNetlist);
    }

    static uncompress(compressedString){
        return LZString.decompressFromEncodedURIComponent(compressedString);
    }

    static compress(uncompressedString){
        return LZString.compressToEncodedURIComponent(uncompressedString);
    }
}