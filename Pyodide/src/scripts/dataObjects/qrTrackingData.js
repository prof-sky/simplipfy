class QrTrackingData {
    randomSession;
    filename;
    netlist;
    qrSelector;

    static legacyDate = new Date("2026-04-22T08:00:00").getTime()

    get canTrack(){
        return Boolean(this.randomSession);
    }

    get canDisplay(){
        return Boolean(this.netlist);
    }

    get canParticipate(){
        return this.randomSession && this.qrSelector;
    }

    /** @returns {string} */
    get passkey() {
        console.warn("legacy property remove usage");
        return "000";
    }

    /**
     *
     * @param randomSession {string}
     * @param filename {string}
     * @param netlist {string}
     * @param selector {string}
     * @param [timestamp=Date.now()] {number}
     */
    constructor(randomSession, filename, netlist, selector, timestamp= undefined) {
        this.randomSession = randomSession;
        this.filename = filename;
        this.netlist = netlist;
        this.qrSelector = selector;
        this.timestamp = timestamp ? timestamp : Date.now();
    }

    static genRandomSession(length = 5){
        const chars = '0123456789';
        let result = '';
        for (let i = 0; i < length; i++) {
            result += chars[Math.floor(Math.random() * chars.length)];
        }
        return result;
    }

    static generate(filename, netlist, selector){
        const randomSession = QrTrackingData.genRandomSession();

        return new QrTrackingData(randomSession, filename, netlist, selector);
    }
}

class EmptyQrTrackingData extends QrTrackingData {
    constructor() {
        super(undefined, undefined, undefined, undefined);
    }
}