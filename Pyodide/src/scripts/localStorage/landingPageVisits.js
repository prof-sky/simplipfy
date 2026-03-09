class LandingPageVisits extends LocalStorageWriter{

    /**
     *
     * @param checkFn {Function}
     * @param callback {Function}
     */
    constructor(
        checkFn = (visits, message) => { return visits === 2 && message},
        callback = (/** @type {LandingPageVisits} */ lpv) => {
            lpv.save(2, false)
            lpv.checkFn = () => {
                return false
            }
            modalSm.show(new SkipLandingModal())
        }
    ) {
        super("landingPageVisits");
        this.checkFn = checkFn;
        this.callback = callback;
    }

    /**
     * save the values as json to the local storage
     * @param num {int} number of page visits
     * @param message {boolean} if a message is shown or not
     */
    save(num, message){
        super._set(JSON.stringify({"visits": num, "message": message}));
    }

    /**
     * @returns {Array<int, string>} [int, str]
     */
    load() {
        let [success, data] = super._get()
        if (!success) {
            data = {"visits": 0, "message": true}
            this.save(0, true);
        }
        else{
            data = JSON.parse(data);
        }

        return [data.visits, data.message];
    }

    increment(){
        let [visits, message] = this.load()
        visits += 1

        if (this.checkFn(visits, message)) {
            this.callback(this)
        }
        else{
            this.save(visits, true)
        }
    }
}