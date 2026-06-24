class LiveTrackerEditor extends LiveTracker{
    /** @type {QrTrackingData} */
    trackingData = new EmptyQrTrackingData();
    #updateKey = "trackingPage";

    constructor() {
        super(undefined, "qr-live-track-editor");
        this.idLangMap = new Map([
            [this.id("actionsHeading"), () => languageManager.currentLang.toolsPage.actions],
            [this.id("joinSession"), () => languageManager.currentLang.toolsPage.joinSession],
        ])

    }

    get html(){
        return `       
        <div id="${this.id("trackingTable")}" class="mt-3">
            <button id="${this.id("joinSession")}" class="btn btn-warning mb-3">${languageManager.currentLang.toolsPage.joinSession}</button>
            <svg></svg>
            <table class="table table-dark" style="color: white;">
                <thead>
                    <tr>
                      <th style="width: 10%" scope="col">#</th>
                      <th id="${this.id("actionsHeading")}" scope="col" class="text-start">${languageManager.currentLang.toolsPage.actions}</th>
                    </tr>
                </thead>
                <tbody>
                </tbody>
            </table>
        </div>
        `;
    }

    get table(){
        return document.getElementById(this.mainID).querySelector("table")
    }

    setup() {
        if (this.isSetUp === true) return;

        let trackItem = document.createElement("div");
        trackItem.id = this.mainID;
        trackItem.innerHTML = this.html;
        this.root = trackItem;
        this.isSetUp = true;

        const qrBtn = trackItem.querySelector("button");
        qrBtn.addEventListener("click",() => modalXl.show(new QrCodeModal(state.trackingData)));

        return trackItem;
    }

    get emptyTable(){
        let body = document.createElement("tbody");
        body.innerHTML = "<tr><td colspan=\"2\">Nothing yet</td></tr>"
        return body;
    }

    /** @param events {Array<TrackingEvent>} */
    mapEventsToUser(events){

    }

    async #updateTable(){
        let events = await TrackingDB.fetchAllEvents(this.trackingData.randomSession);

        if(!events.length){
            this.table.querySelector("tbody").replaceWith(this.emptyTable);
            return;
        }

        this.table.querySelector("tbody").replaceWith(this.createTableBodyWithUserData(this.userEventMap(events)));
    }

    async _startTracking() {
        const content = document.getElementById(this.mainID);

        let hashTrackingInfo = hashObject.tracking
        if (hashTrackingInfo.canTrack) state.trackingData = hashTrackingInfo;

        if (state.trackingData instanceof EmptyQrTrackingData){
            UserMessage.error(languageManager.currentLang.toolsPage.errorCantStart);
            console.error("Can't start tracking without QrTrackingData")
            return;
        }

        this.trackingData = state.trackingData;

        console.log("Start tracking with: ", this.trackingData);
        try {
            await TrackingDB.activateTracking(this.trackingData.randomSession, participantName);
        }
        catch(e) {
            console.error("Tracking can't be used without active session on server ", e);
            UserMessage.error(languageManager.currentLang.toolsPage.errorSessionLimitExceeded);
            pageManager.changePage(pageHistory.lastPage());
            return;
        }

        let netlist = this.trackingData.netlist || "";
        let svg = await this.getSvgForNetlist(netlist);
        content.querySelector("svg").replaceWith(svg);

        this.addPeriodicTask(this.#updateKey, this.#updateTable.bind(this))
        this._cleanupOnExit(this.trackingData.randomSession);
    }

    addEventListeners() {
    }

    updateLang() {
        super.updateLang();
        this.heading = languageManager.currentLang.toolsPage.liveTrackerHeading;
    }

    updateColor() {
        this._updateTableColor();
    }
}
