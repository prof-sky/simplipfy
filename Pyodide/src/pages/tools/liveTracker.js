class LiveTracker extends  ReusableContent{
    // the values are initialized in add Event listener because they have to be in the dom at that time.
    /** @type {HTMLButtonElement} */
    loadTrackBtn;
    /** @type {HTMLInputElement} */
    input;
    /** @type {HTMLUListElement} */
    list;
    /** @type {HTMLButtonElement} */
    joinBtn;

    // Map to store interval ids for tracking qr codes
    /** @type {int | null} */
    intervalID = null;

    /** @type {Map<string, () => void | Promise<void>>} */
    _updateTasks = new Map();

    eventSymbols = {
        "Scanned": "▶️", // Circuit started
        "Finished": "✅",
        "Reset": "🔄️",
        "ErrCanNotSimpl": "⚠️", // or kirchhoff no valid loop
        "IsNotSeries": "⚠️",
        "IsNotParallel": "⚠️",
        "View": "🔢",
        "Abort": "❌",
        "Closing": "🛑",
        "ToggleGeneralizeOn": "↔️",
        "ToggleGeneralizeOff": "↔️",
        "LoopAlreadyExists": "⚠️", // Kirchhoff
        "InvalidVoltageLoop": "⚠️",
        "WrongCurrentEquation": "⚠️",
        "FinishedVoltages": "✅",
        "JunctionAlreadyExists": "⚠️",
        "InvalidJunction": "⚠️",
        "Default": "❓" // Unknown event
    }
    heading = languageManager.currentLang.toolsPage.liveTrackerHeading;

    constructor(idLangMap = undefined, mainID = undefined) {
        mainID = mainID || "qr-live-track-accordion-item";
        super(idLangMap, mainID);
        this.idLangMap = idLangMap || new Map([
            [this.id("help-track-viewer"), () => languageManager.currentLang.toolsPage.helpBtn]
        ])
    }

    /**
     *
     * @param idx {int}
     * @param name {string}
     * @param events {Array<TrackingEvent>}
     * @returns {HTMLTableRowElement}
     */
    getRow(idx, name, events){
        const tr = document.createElement("tr");
        const th = document.createElement("th");
        th.style.width = "10%";
        th.innerHTML = idx.toString();
        th.dataset.name = name;
        const td = document.createElement("td");
        td.classList.add("text-start");
        td.style.cursor = "pointer";

        events.forEach(e => {
            if(e.name === name) td.appendChild(e.eventSymbolItem)
        });

        tr.appendChild(th);
        tr.appendChild(td);

        return tr;
    }

    executeUpdateTasks(){
        this._updateTasks.forEach((callBack) => callBack())
    }

    /** @returns {int} returns 0 if started, 1 otherwise */
    get startUpdatingTables(){
        if(!this.intervalID && this._updateTasks.size) {
            console.log("Periodic table updates active");
            this.executeUpdateTasks();
            this.intervalID = setInterval(this.executeUpdateTasks.bind(this), 2000);
            return 0;
        }
    }

    /** @returns {int} returns 1 if stopped, 0 otherwise */
    get stopUpdatingTables(){
        if(this.intervalID){
            console.log("Periodic table updates inactive");
            clearInterval(this.intervalID);
            this.intervalID = null;
            return 0;
        }
        return 1;
    }

    /**
     *
     * @param id {string} identifer to remove the task later if needed, e.g. the trackId for the tracking tables
     * @param task {() => void | Promise<void>} the function that should be called every interval
     */
    addPeriodicTask(id, task){
        this._updateTasks.set(id, task);
        if (!this.intervalID && this._updateTasks.size) this.startUpdatingTables;
    }

    /**
     *
     * @param id {string} identifier of the task to remove
     */
    removePeriodicTask(id){
        this._updateTasks.delete(id);
        if (this.intervalID && !this._updateTasks.size) this.stopUpdatingTables;
    }

    get html(){
        return `
        <button class="btn btn-outline-warning mx-auto my-1" style="color: ${colors.current.headingForeground}; cursor: pointer;" id="${this.id("help-track-viewer")}">${languageManager.currentLang.toolsPage.helpBtn}</button>
        <p>Input: trackingID</p>
        <input id="${this.id("trackIdInput")}" class="form-control mx-auto" placeholder="12345" type="text" style="max-width: 110px; text-align: center">
        <ul id="${this.id("suggestions")}" class="list-group" style="display: none; z-index: 1000; max-height: 500px; overflow-y: scroll; position: fixed;"></ul>
        <button id="${this.id("loadTrackBtn")}" type="button" class="btn btn-warning my-3 circuitStartBtn disabled">
            <div class="fill-layer"></div>
            <div class="progress-stripes"></div>
            <span class="button-text">Track</span>
        </button>
        <div id="${this.id("trackingTables")}" class="mt-3">
            <ul class="nav nav-tabs" id="${this.id("tables-tabs")}" role="tablist">
            </ul>
            <div class="tab-content" id="${this.id("tables-tabs-content")}">
            </div>
        </div>
        <button id="${this.id("join-tracking")}" type="button" class="btn btn-warning my-3" style="background-color: ${colors.definitions.keyYellow}; z-index: 0; border-radius: 40px; min-width: 200px;">${languageManager.currentLang.toolsPage.join}</button>
        `;
    }

    setup() {
        if (this.isSetUp === true) return;

        let trackItem = document.createElement("div");
        trackItem.id = this.mainID;
        trackItem.innerHTML = this.html;

        this.loadTrackBtn = trackItem.querySelector("#"+this.id("loadTrackBtn"))
        this.input = trackItem.querySelector("#"+this.id("trackIdInput"));
        this.list = trackItem.querySelector("#"+this.id("suggestions")); // stored trackingIds in localStorage
        this.joinBtn = trackItem.querySelector("#"+this.id("join-tracking"));
        this.joinBtn.disabled = true;

        this.isSetUp = true;

        return trackItem;
    }

    updateLang() {
        super.updateLang();
        this.heading = languageManager.currentLang.toolsPage.liveTrackerHeading;
    }

    _updateTableColor(){
        let tables = document.getElementById(this.mainID).querySelectorAll("table");
        for (let table of tables) {
            updateBsClassesTo(colors.current.bsColorScheme, "table", table);
        }
    }

    updateColor() {
        let trackIdDiv = document.getElementById(this.id("trackIdDiv"));
        if (trackIdDiv) {
            trackIdDiv.style.color = colors.current.foreground;
        }

        this._updateTableColor();

        let helpNote = document.getElementById(this.id("help-track-viewer"));
        if (helpNote) {
            helpNote.style.color = colors.current.foreground;
        }
    }

    _updateJoinBtnText(trackId){
        this.joinBtn.innerText = languageManager.currentLang.toolsPage.join + " " + trackId;
    }

    addEventListeners() {
        let alerts = languageManager.currentLang.alerts


        this.loadTrackBtn.addEventListener("click", async () => {
            let trackId = this.input.value.trim();
            this.input.value = "";

            if (!trackId) {
                UserMessage.warning(alerts.pleaseEnterValidID);
                return;
            }

            let [success, data] = storageManager.trackingIDs.loadValue(trackId);
            if (!success) {
                console.warn("created minimalist QRTrackingData for ", trackId);
                data = new QrTrackingData(trackId, undefined, undefined, undefined);
            }

            state.trackingData = data;
            this._startTracking();
        });

        this.input.addEventListener("focus", () => {
            this.list.style.display = "block";

            // Fill list with localStorage data
            this.list.innerHTML = "";

            for (let data of storageManager.trackingIDs.descendingArray) {
                this.#addIdToListElement(data, this.list)
            }

            // Set mid of suggestions to mid of input field
            let rect = this.input.getBoundingClientRect();
            const left = rect.left + rect.width / 2 - this.list.offsetWidth / 2;
            const top = rect.bottom;

            this.list.style.left = `${left}px`;
            this.list.style.top = `${top}px`;
        });

        // Add a mousedown event listener to hide the list when clicking outside
        document.addEventListener("mousedown", (e) => {
            if (!this.input.contains(e.target) && !this.list.contains(e.target)) {
                this.list.style.display = "none";
            }
        });

        let helpTrackViewer = document.getElementById(this.id("help-track-viewer"));
        helpTrackViewer.addEventListener("click", () => {
            UserMessage.info(languageManager.currentLang.toolsPage.helpTexts.trackViewer, "", false);
        });

        this.joinBtn.addEventListener("click", async (e) => {
            if (!document.getElementById(this.id("tables-tabs")).querySelector("li")) return;
            let trackId = document.getElementById(this.id("tables-tabs")).querySelector(".active")?.parentElement.querySelectorAll("button")[1].dataset.trackId
            let [success, data] = await storageManager.trackingIDs.loadValue(trackId)
            if(!success) {
                console.log("No tracking data found for trackId: ", trackId);
                return;
            }
            modalXl.show(new QrCodeModal(data));
        })
    }

    /**
     *
     * @param data {QrTrackingData}
     * @param list {HTMLUListElement}
     */
    #addIdToListElement(data, list) {
        let input = this.input;
        // Example: 12345-123_01_testfile.txt -> 12345-123 and 01_testfile.txt
        let filename = data.filename;
        let trackingId = data.randomSession;

        let li = document.createElement("li");
        li.className = "list-group-item list-group-item-action";
        li.style.cursor = "pointer";
        li.style.textAlign = "left";
        li.innerHTML = `${filename} (${trackingId}) <button id="x-btn-${trackingId}">X</button>`;
        li.onclick = () => {
            input.value = trackingId;
            // Hide the list after selection
            setTimeout(() => {
                list.style.display = "none";
            }, 100);
        };
        list.appendChild(li);
        // Add event listener to remove button
        /** @type{HTMLButtonElement} */
        let removeButton = li.querySelector(`#x-btn-${trackingId}`);
        removeButton.style.borderRadius = "5px";
        removeButton.style.background = "none";
        removeButton.style.float = "right";
        removeButton.style.marginLeft = "10px";
        removeButton.addEventListener("click", (event) => {
            this.#removeTrackingIdFromStorage(event, trackingId, li);
        });
    }

    #removeTrackingIdFromStorage(event, sessionId, li) {
        event.stopPropagation(); // Prevent the li click event
        // Remove from localStorage
        storageManager.trackingIDs.removeValue(sessionId);
        // Remove from list
        li.remove();
    }

    _unselectActive(tabsDiv) {
        let activeTabLinks = tabsDiv.querySelectorAll(".tab-link.active");
        activeTabLinks.forEach(link => {
            link.classList.remove("active");
        });
        let activeTabContents = document.querySelectorAll(".tab-pane.active");
        activeTabContents.forEach(content => {
            content.classList.remove("active", "show");
        });
    }

    _cleanupOnExit(trackId) {
        // Cleanup when user leaves website
        window.addEventListener('beforeunload', function () {
            TrackingDB.deactivateTracking(trackId, participantName);
        });
    }

    _closeBtnTabHandler(e, closeBtn, tabItem, tabsDiv, trackId) {
        e.stopPropagation();
        let content = document.getElementById(this.mainID);

        const closingTrackId = closeBtn.getAttribute("data-track-id");
        this.removePeriodicTask(closingTrackId);

        // Remove the tracking id from valid ids -> no more events will be stored with this tracking id
        TrackingDB.deactivateTracking(trackId, participantName);

        tabItem.remove();

        const contentToRemove = content.querySelector("#content-"+closingTrackId);
        if (contentToRemove) {
            contentToRemove.remove();
        }

        const hoverDivToRemove = content.querySelector(`#hover-div-${closingTrackId}`);
        if (hoverDivToRemove) {
            hoverDivToRemove.remove();
        }

        const remainingTabs = tabsDiv.querySelectorAll(".tab-link");
        if (remainingTabs.length > 0) {
            const lastTab = remainingTabs[remainingTabs.length - 1];
            lastTab.classList.add("active");
            const lastContentId = lastTab.getAttribute("data-bs-target").substring(1);
            const lastContent = content.querySelector("#"+lastContentId);
            if (lastContent) {
                lastContent.classList.add("active", "show");
                trackId = lastContentId.split("-")[1];
                this._updateJoinBtnText(trackId);
            }
            else {
                console.warn("Couldn't find content for tab: ", lastTab);
            }
        }
        else{
            this._updateJoinBtnText("");
            this.joinBtn.disabled = true;
        }
    }

    async getSvgForNetlist(netlist) {
        let svg;
        if (!netlist){
            let noSvg = document.createElement("svg");
            noSvg.innerHTML = "<p>No svg found</p>"
            svg = noSvg;
        }
        else {
            // Create the svg from the netlist and create the hover div for qr tracking
            let paramMap = new ParamMap();
            let [optionsString, rawNetlist] = extractCommentsAndNetlist(netlist);
            let svgData = (await state.apis.pyodide.forceDrawing(rawNetlist, paramMap, optionsString)).data.svgData;

            svg = new SvgMagician(svgData).hideSvgArrows().element
        }

        svg.style.maxWidth = "350px";
        svg.style.height = "auto";
        svg.classList.add("d-block", "mx-auto", "mb-3");
        return svg;
    }

    async _startTracking() {
        let hashTrackingInfo = hashObject.tracking
        if (hashTrackingInfo.canTrack) state.trackingData = hashTrackingInfo;

        if (state.trackingData instanceof EmptyQrTrackingData){
            throw Error("Can't start tracking without sessionID, key and netlist.");
        }

        const trackId = state.trackingData.randomSession

        // Add trackingId to valid ids on server
        try {
            await TrackingDB.activateTracking(trackId, participantName);
        }
        catch(e) {
            console.error("Tracking can't be used without active session on server ", e);
            UserMessage.error(languageManager.currentLang.toolsPage.errorSessionLimitExceeded);
            return;
        }


        let tabsDiv = document.getElementById(this.id("tables-tabs"));
        // Check if tab already exists
        let existingTab = tabsDiv.querySelector(`.tab-link[data-bs-target="#content-${trackId}"]`);
        if (existingTab) {
            // Remove "active" class from all tab links and contents in the tabs
            this._unselectActive(tabsDiv);
            // If it exists, activate it and return
            existingTab.classList.add("active");
            let activeContent = document.getElementById(trackId);
            if (activeContent) {
                activeContent.classList.add("active", "show");
            }
            return;
        }

        // Remove "active" class from all tab links and contents in the tabs
        this._unselectActive(tabsDiv);

        // Set new tab and content as active
        let tabItem = document.createElement("li");
        tabItem.classList.add("nav-item");
        tabItem.setAttribute("role", "presentation");
        let trackIdWithoutPassKey = trackId.split("-")[0]; // Remove passkey if present
        tabItem.innerHTML = `
          <div class="d-flex align-items-center" style="position:relative;">
            <button class="nav-link tab-link active flex-grow-1 text-start" style="color: ${colors.current.foreground}; padding-right: 35px;"
              id="tab-${trackId}" data-bs-toggle="tab" data-bs-target="#content-${trackId}" type="button" role="tab"
              aria-controls="content-${trackId}" aria-selected="true">
              ${trackIdWithoutPassKey}
            </button>
                <button class="position-absolute translate-middle
                   btn btn-sm rounded-circle bg-white border border-dark p-0 btn-close"
            style="width: 20px; height: 20px; z-index: 10;top:20px;right:-5px;"
            data-track-id="${trackId}"
            aria-label="Close"></button>
          </div>`;
        tabsDiv.appendChild(tabItem);

        let closeBtn = tabItem.querySelector(".btn-close");
        closeBtn.addEventListener("click", (e) => {
            this._closeBtnTabHandler(e, closeBtn, tabItem, tabsDiv, trackId);
        });

        let netlist = state.trackingData.netlist || "";
        let svg = await this.getSvgForNetlist(netlist);

        // Create hover div
        let hoverDiv = document.createElement("div");
        hoverDiv.id = `hover-div-${trackId}`;
        hoverDiv.style.backgroundColor = colors.current.bsBackground;
        hoverDiv.style.border = `1px solid ${colors.current.foreground}`;
        hoverDiv.style.width = "300px";
        hoverDiv.appendChild(svg);
        hoverDiv.style.display = "none";
        hoverDiv.style.pointerEvents = "none";
        hoverDiv.style.position = "fixed";
        hoverDiv.querySelector("svg").replaceWith(svg)
        document.body.appendChild(hoverDiv);

        // Add hover event listener on button to show svg
        let tabButton = tabItem.querySelector(".tab-link");
        tabButton.addEventListener("mouseenter", () =>  {
            // Show hover div at mouse position
            hoverDiv.style.display = "block";
            hoverDiv.style.left = `${tabButton.getBoundingClientRect().left}px`;
            hoverDiv.style.top = `${tabButton.getBoundingClientRect().bottom}px`;
            hoverDiv.style.backgroundColor = colors.current.bsBackground;
            hoverDiv.style.color = colors.current.foreground;
            hoverDiv.style.border = `1px solid ${colors.current.foreground}`;
        });
        tabButton.addEventListener("mouseleave", () => {
            // Hide hover div
            hoverDiv.style.display = "none";
        });

        let tablesContentDiv = document.getElementById(this.id("tables-tabs-content"));
        let tableContent = document.createElement("div");
        tableContent.classList.add("tab-pane", "fade", "show", "active");
        tableContent.id = "content-"+trackId;
        tableContent.setAttribute("role", "tabpanel");
        tableContent.setAttribute("aria-labelledby", `tab-${trackId}`);
        // Empty table with 2 columns
        tableContent.innerHTML = `
        <table id="table-${trackId}" class="table table-striped">
            <tbody>
            </tbody>
        </table>`;
        tablesContentDiv.appendChild(tableContent);

        this._updateJoinBtnText(trackId)
        tabItem.querySelector(".nav-link").addEventListener("click", (e) => {
            this._updateJoinBtnText(trackId);
        })

        await this.#updateTable(trackId);
        this.addPeriodicTask(trackId, () => this.#updateTable(trackId));
        this._cleanupOnExit(trackId);

        this.joinBtn.disabled = false;
    }

    async #updateTable(trackId) {
        let events = await TrackingDB.fetchAllEvents(trackId);
        let table = document.getElementById(`table-${trackId}`);
        updateBsClassesTo(colors.current.bsColorScheme, "table", table);
        // Make row for every participant and append all events in one row
        if (events && events.length > 0) {
            this._fillTableWithEvents(table, events);
        } else {
            table.innerHTML = `<tbody><tr><td colspan="2">Nothing yet</td></tr></tbody>`;
        }
    }

    /**
     * mpas the usernames to a list of their actions
     * @returns {Map<string, Array<TrackingEvent>>}
     * @param events {Array<TrackingEvent>}
     */
    userEventMap(events){
        let userData = new Map()
        for (let event of events){
            if (!userData.has(event.name)){
                userData.set(event.name, []);
            }
            userData.get(event.name).push(event);
        }
        return userData;
    }

    /**
     * @param userData {Map<string, Array<TrackingEvent>>}
     */
    createTableBodyWithUserData(userData){
        let tableBody = document.createElement("tbody");
        let idx = 1;
        for (let [userName, events] of userData){
            tableBody.appendChild(this.getRow(idx, userName, events));
            idx++;
        }
        return tableBody;
    }

    /**
     *
     * @param table {HTMLDivElement}
     * @param events {Array<TrackingEvent>}
     * @private
     */
    _fillTableWithEvents(table, events) {
        table.querySelector("tbody").replaceWith(this.createTableBodyWithUserData(this.userEventMap(events)));
    }
}


// ToDo move into db class
// #############################################################################################################
class TrackingEvent {
    static eventSymbols = {
        "Scanned": "▶️", // Circuit started
        "Finished": "✅",
        "Reset": "🔄️",
        "ErrCanNotSimpl": "⚠️", // or kirchhoff no valid loop
        "IsNotSeries": "⚠️",
        "IsNotParallel": "⚠️",
        "View": "🔢",
        "Abort": "❌",
        "Closing": "🛑",
        "ToggleGeneralizeOn": "↔️",
        "ToggleGeneralizeOff": "↔️",
        "LoopAlreadyExists": "⚠️", // Kirchhoff
        "InvalidVoltageLoop": "⚠️",
        "WrongCurrentEquation": "⚠️",
        "FinishedVoltages": "✅",
        "JunctionAlreadyExists": "⚠️",
        "InvalidJunction": "⚠️",
        "Default": "❓" // Unknown event
    }

    /**
     *
     * @param id {int}
     * @param session_id {string}
     * @param name {string}
     * @param event {string}
     * @param timestamp {int}
     */
    constructor(id, session_id, name, event, timestamp) {
        this.id = id;
        this.session_id = session_id;
        this.name = name;
        this.event = event;
        this.timestamp = timestamp;
    }

    /** @returns {HTMLSpanElement} */
    get eventSymbolItem(){
        let span = document.createElement("span");
        let [symbol, eventStr] = this.symbolAndEventString;
        span.innerHTML = symbol;
        span.title = eventStr

        return span;
    }

    get elementsFromEvent(){
        let elements = this.event.split("(")[1].replace(")", "");
        if (elements) return elements;
        return "";
    }
    /**
     * @returns {[string, string]} HTML string with symbol and tooltip for the event
     */
    get symbolAndEventString(){
        let liveTrackingEvents = languageManager.currentLang.toolsPage.liveTrackingEvents;
        let kirchhoffEvent = languageManager.currentLang.kirchhoff;

        let eventStr = "Unknown event"
        let symbol = TrackingEvent.eventSymbols.Default;

        if (this.event.startsWith("Scanned")) {
            // Check with "startsWith" because "Scanned" is followed by some other stuff
            symbol = TrackingEvent.eventSymbols.Scanned;
            eventStr = liveTrackingEvents.circuitScanned;
        } else if (this.event.startsWith(circuitActions.ErrCanNotSimpl)) {
            // Check with "startsWith" because "ErrCanNotSimpl" is followed by the elements e.g. (R1, R2)
            symbol = TrackingEvent.eventSymbols.ErrCanNotSimpl;
            eventStr = `${liveTrackingEvents.circuitErrCanNotSimpl} (${this.elementsFromEvent})`;
        } else if (this.event.startsWith(circuitActions.ErrIsNotSeries)) {
            symbol = TrackingEvent.eventSymbols.IsNotSeries;
            eventStr = `${liveTrackingEvents.circuitIsNotSeries} (${this.elementsFromEvent})`;
        } else if (this.event.startsWith(circuitActions.ErrIsNotParallel)) {
            symbol = TrackingEvent.eventSymbols.IsNotParallel;
            eventStr = `${liveTrackingEvents.circuitIsNotParallel} (${this.elementsFromEvent})`;
        } else if (this.event === circuitActions.Finished) {
            symbol = TrackingEvent.eventSymbols.Finished;
            eventStr = liveTrackingEvents.circuitFinsihed;
        } else if (this.event === circuitActions.Reset) {
            symbol = TrackingEvent.eventSymbols.Reset;
            eventStr = liveTrackingEvents.circuitReset;
        } else if (this.event === circuitActions.Closing) {
            symbol = TrackingEvent.eventSymbols.Closing;
            eventStr = liveTrackingEvents.circuitClosing;
        } else if (this.event === circuitActions.ViewSolutions) {
            symbol = TrackingEvent.eventSymbols.View;
            eventStr = liveTrackingEvents.circuitViewSolutions;
        } else if (this.event === circuitActions.ViewZExplanation) {
            symbol = TrackingEvent.eventSymbols.View;
            eventStr = liveTrackingEvents.circuitViewZExplanation;
        } else if (this.event === circuitActions.ViewVcExplanation) {
            symbol = TrackingEvent.eventSymbols.View;
            eventStr = liveTrackingEvents.circuitViewVcExplanation;
        } else if (this.event === circuitActions.ViewTotalExplanation) {
            symbol = TrackingEvent.eventSymbols.View;
            eventStr = liveTrackingEvents.circuitViewTotalExplanation;
        } else if (this.event === circuitActions.Aborted) {
            symbol = TrackingEvent.eventSymbols.Abort;
            eventStr = liveTrackingEvents.circuitAborted;
        } else if (this.event === circuitActions.ToggleGeneralizeOn) {
            symbol = TrackingEvent.eventSymbols.ToggleGeneralizeOn;
            eventStr = liveTrackingEvents.generalizeOn;
        } else if (this.event === circuitActions.ToggleGeneralizeOff) {
            symbol = TrackingEvent.eventSymbols.ToggleGeneralizeOff;
            eventStr = liveTrackingEvents.generalizeOff;
        }
        // Kirchhoff
        else if (this.event === circuitActions.LoopAlreadyExists) {
            symbol = TrackingEvent.eventSymbols.LoopAlreadyExists;
            eventStr = kirchhoffEvent.loopAlreadyExists;
        } else if (this.event.startsWith(circuitActions.InvalidVoltageLoop)) {
            symbol = TrackingEvent.eventSymbols.InvalidVoltageLoop;
            eventStr = `${kirchhoffEvent.invalidVoltageLoop} (${this.elementsFromEvent})`;
        } else if (this.event === circuitActions.FinishedVoltages) {
            symbol = TrackingEvent.eventSymbols.FinishedVoltages;
            eventStr = kirchhoffEvent.finishedVoltages;
        } else if (this.event === circuitActions.WrongCurrentEquation) {
            symbol = TrackingEvent.eventSymbols.WrongCurrentEquation;
            eventStr = kirchhoffEvent.wrongCurrentEq;
        } else if (this.event === circuitActions.JunctionAlreadyExists) {
            symbol = TrackingEvent.eventSymbols.JunctionAlreadyExists;
            eventStr = kirchhoffEvent.junctionAlreadyExists;
        } else if (this.event.startsWith(circuitActions.InvalidJunction)) {
            symbol = TrackingEvent.eventSymbols.InvalidJunction;
            eventStr = `${kirchhoffEvent.invalidJunction} (${this.elementsFromEvent})`;
        } else {
            console.warn("Unknown event: ", this.event);
            console.warn("Using default symbol for unknown event: ", this.event);
        }

        return [symbol, eventStr];
    }
}


class TrackingDB {
    static actionErrorTexts = {
        default: (action) => action,
        listElements: (action) => {
            let text = action + " (";
            state.selectedElements.forEach((el) => {
                text += el + ", ";
            });
            // Remove the last comma and space
            text = text.slice(0, -2);
            text += ")";
            return text;
        },
        [circuitActions.ErrCanNotSimpl]: (action) => {return TrackingDB.actionErrorTexts["listElements"](action)},
        [circuitActions.ErrIsNotParallel]: (action) => {return TrackingDB.actionErrorTexts["listElements"](action)},
        [circuitActions.ErrIsNotSeries]: (action) => {return TrackingDB.actionErrorTexts["listElements"](action)},
        [circuitActions.InvalidVoltageLoop]: (action) => {
            let text = action + " ("
            state.selectedElements.forEach((el) => {
                // Extract the number from the element name
                const match = el.match(/\d+/);
                el = "U" + `${parseInt(match[0], 10)}`;
                text += el + ", ";
            });
            // Remove the last comma and space
            text = text.slice(0, -2);
            text += ")";
        },
        [circuitActions.InvalidJunction]: (action) => {
            let text = " ("
            state.selectedElements.forEach((el) => {
                // Extract the number from the element name
                const match = el.match(/\d+/);
                el = "I" + `${parseInt(match[0], 10)}`;
                text += el + ", ";

                // Remove the last comma and space
                text = text.slice(0, -2);
                text += ")";
            });
        }
    }

    static async send(eventStr, sessId) {
        const response = await fetch("src/session.php", {
            method: "POST",
            headers: {"Content-Type": "application/x-www-form-urlencoded"},
            body: new URLSearchParams({
                action: "send",
                sessionId: sessId,
                name: participantName,
                event: eventStr
            })
        });
        if (!response.ok) {
            const respData = await response.json();
            LiveTrackerErrors.warn(respData.errorCode)
        }
    }

    /** @returns {Promise<Array<TrackingEvent>>} */
    static async fetchAllEvents(id) {
        let ret = [];
        // with &t=Date.now to prevent caching issues in addition to cache settings in session.php
        await fetch(`src/session.php?action=read&sessionId=${id}&lastId=0&t=${Date.now()}`)
            .then(res => res.json())
            .then(events => {
                /** this is a plain object but holds the same properties as TrackingEvent */
                for (/**@type {TrackingEvent} */ const e of events) {
                    ret.push(new TrackingEvent(e.id, e.session_id, e.name, e.event, e.timestamp));
                }
            });
        return ret;
    }

    static async activeSessions(){
        let sessionList;
        await fetch("src/session.php?action=sessions")
            .then(response => response.json())
            .then(sessions => {
                sessionList = sessions;
            })
            .catch(error => console.error("Error fetching sessions:", error));
        return sessionList;
    }

    static async activateTracking(trackId, removeKey){
        let response = await fetch(`src/session.php?action=addSessionId&sessionId=${trackId.toString()}&removeKey=${removeKey.toString()}`, {method: "POST"});
        let answer = await response.json();
        if (answer.errorCode){
            if (answer.errorCode === LiveTrackerErrors.errors.TRACKING_ALREADY_ACTIVE.code){
                LiveTrackerErrors.warn(answer.errorCode);
            }
            else {
                LiveTrackerErrors.except(answer.errorCode);
            }
        }
    }

    /**
     *
     * @param trackId {number | string} the id you want to deactivate tracking for
     * @param [removeKey=participantName] {number | string} the removeKey given to startTracking for this trackId
     * @returns {Promise<void>}
     */
    static async deactivateTracking(trackId, removeKey=participantName){
        // Remove the tracking from valid ids -> no more events will be stored with this tracking id
        const removeSessionUrl = `src/session.php?action=deleteSessionId&sessionId=${trackId.toString()}&removeKey=${removeKey.toString()}`;
        navigator.sendBeacon(removeSessionUrl);
    }

    static async sendCircuitAction(action, trackId = state.trackingData.randomSession){
        if (!trackId) return

        const textGenerator = this.actionErrorTexts[action] ? this.actionErrorTexts[action] : this.actionErrorTexts["default"];
        TrackingDB.send(textGenerator(action), trackId);
    }

}

class LiveTrackerErrors {
    static errors = {
        NO_ERROR: { code: 0, message: "No Error" },
        UNKNOWN_ERROR: { code: 1, message: "Unknown error" },
        ENTRY_LIMIT_EXCEEDED: { code: 2, message: "Entry limit exceeded" },
        SESSION_LIMIT_EXCEEDED: { code: 3, message: "Session limit exceeded" },
        DB_CONNECTION_ERROR: { code: 4, message: "DB connection error" },
        VALIDATION_FAILED: { code: 5, message: "Validation failed" },
        INVALID_SESSION_ID: { code: 6, message: "Invalid session ID" },
        TRACKING_ALREADY_ACTIVE: { code: 7, message: "Tracking already active" },
        MISSING_ID_OR_REMOVE_KEY: { code: 8, message: "Missing session ID or remove key" }
    };

    /**
     * @type {Map<number, string>}
     */
    static errorMsgs = new Map(
        Object.values(this.errors).map(e => [e.code, e.message])
    );

    static warn(errorCode){
        if (errorCode === 0) return;
        console.warn(LiveTrackerErrors.errorMsgs.get(errorCode));
    }

    static except(errorCode){
        if (errorCode === 0) return;
        throw Error(LiveTrackerErrors.errorMsgs.get(errorCode));
    }
}