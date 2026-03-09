class LiveTracker extends Content{
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

    constructor() {
        let idLangMap = new Map([
            ["help-track-viewer", () => languageManager.currentLang.toolsPage.helpBtn]
        ])
        super(idLangMap, "qr-live-track-accordion-item");
    }

    get html(){
        return `
            <h2 class="accordion-header" id="track-acc-heading">
                <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#track-acc-collapse" aria-expanded="false" aria-controls="track-acc-collapse">
                    ${languageManager.currentLang.toolsPage.trackAccHeading}
                </button>
            </h2>
            <div id="track-acc-collapse" class="accordion-collapse collapse" aria-labelledby="track-acc-heading" data-bs-parent="#tool-accordion">
                <div id="trackViewerBody" class="accordion-body">
                    <button class="btn btn-outline-warning mx-auto my-1" style="color: ${colors.current.headingForeground}; cursor: pointer;" id="help-track-viewer">${languageManager.currentLang.toolsPage.helpBtn}</button>
                    <p>Input: trackingID-key</p>
                    <input id="trackIdInput" class="form-control mx-auto" placeholder="12345-123" type="text" style="max-width: 110px; text-align: center">
                    <ul id="suggestions" class="list-group" style="display: none; z-index: 1000; max-height: 500px; overflow-y: scroll; position: fixed;"></ul>
                    <button id="loadTrackBtn" type="button" class="btn btn-warning my-3 circuitStartBtn" disabled>
                        <div class="fill-layer"></div>
                        <div class="progress-stripes"></div>
                        <span class="button-text">Track</span>
                    </button>
                    <div id="trackingTables" class="mt-3">
                        <ul class="nav nav-tabs" id="tables-tabs" role="tablist">
                        </ul>
                        <div class="tab-content" id="tables-tabs-content">
                        </div>
                    </div>
                </div>
            </div>
            `;
    }

    setup() {
        if (this.isSetUp === true) return;

        let trackItem = document.createElement("div");
        trackItem.classList.add("accordion-item");
        trackItem.id = this.mainID;
        trackItem.innerHTML = this.html;
        this.isSetUp = true;

        return trackItem;
    }

    updateLang() {
        super.updateLang();
        let trackAccHeading = document.getElementById('track-acc-heading');
        trackAccHeading.querySelector("button").innerHTML = languageManager.currentLang.toolsPage.trackAccHeading;
        let helpNote = document.getElementById("help-track-viewer");
        helpNote.innerHTML = languageManager.currentLang.toolsPage.helpBtn;
    }

    updateColor() {
        let trackIdDiv = document.getElementById("trackIdDiv");
        if (trackIdDiv) {
            trackIdDiv.style.color = colors.current.foreground;
        }
        let trackTable = document.getElementById("trackingTables");
        if (trackTable) {
            trackTable.style.color = colors.current.foreground;
            trackTable.style.backgroundColor = colors.current.bsBackground;
            const table = document.getElementById(this.mainID).querySelector("table");
            updateBsClassesTo(colors.current.bsColorScheme, "table", table);
        }
        let helpNote = document.getElementById("help-track-viewer");
        if (helpNote) {
            helpNote.style.color = colors.current.foreground;
        }
    }

    addEventListeners() {
        let loadTrackBtn = document.getElementById("loadTrackBtn");
        let input = document.getElementById("trackIdInput");
        let list = document.getElementById("suggestions"); // stored trackingIds in localStorage

        let alerts = languageManager.currentLang.alerts


        loadTrackBtn.addEventListener("click", async () => {
            let trackId = input.value.trim();
            input.value = "";

            if (!trackId) {
                setTimeout(() => {
                    showMessage(alerts.pleaseEnterValidID, "info");
                }, 0);
                return;
            }

            let [idStr, passkey] = trackId.split("-");
            let id = parseInt(idStr, 10);

            if (isNaN(id)) {
                setTimeout(() => {
                    showMessage(alerts.pleaseEnterValidID, "info");
                }, 0);
                return;
            }

            if (!passkey) {
                setTimeout(() => {
                    showMessage(alerts.pleaseEnterKey, "info");
                }, 0);
                return;
            }

            let generatedKey = getPassKeyForQRCode(id);
            if (generatedKey !== passkey) {
                setTimeout(() => {
                    showMessage(alerts.keyIsNotCorrect, "info");
                }, 0);
                return;
            }

            this.#startTracking(idStr);
        });

        input.addEventListener("focus", () => {
            list.style.display = "block";

            // Fill list with localStorage data
            list.innerHTML = "";
            let [success, trackingIds] = storageManager.trackingIDs.load()
            for (let [key, data] of Object.entries(trackingIds)) {
                this.#updateListForTrackId(key, data, list)
            }

            // Set mid of suggestions to mid of input field
            let rect = input.getBoundingClientRect();
            const left = rect.left + rect.width / 2 - list.offsetWidth / 2;
            const top = rect.bottom;

            list.style.left = `${left}px`;
            list.style.top = `${top}px`;
        });

        // Add a mousedown event listener to hide the list when clicking outside
        document.addEventListener("mousedown", (e) => {
            if (!input.contains(e.target) && !list.contains(e.target)) {
                list.style.display = "none";
            }
        });

        let helpTrackViewer = document.getElementById("help-track-viewer");
        helpTrackViewer.addEventListener("click", () => {
            setTimeout(() => {showMessage(languageManager.currentLang.toolsPage.helpTexts.trackViewer, "info", false)},0);
        });
    }

    #updateListForTrackId(trackingId, data, list) {
        let input = document.getElementById("trackIdInput");
        // Example: 12345-123_01_testfile.txt -> 12345-123 and 01_testfile.txt
        let filename = data.file_name;
        let passCode = data.key;
        let inputVal = `${trackingId}-${passCode}`;

        let li = document.createElement("li");
        li.className = "list-group-item list-group-item-action";
        li.style.cursor = "pointer";
        li.style.textAlign = "left";
        li.innerHTML = `${filename} (${trackingId}) <button id="x-btn-${trackingId}">X</button>`;
        li.onclick = () => {
            input.value = inputVal;
            // Hide the list after selection
            setTimeout(() => {
                list.style.display = "none";
            }, 100);
        };
        list.appendChild(li);
        // Add event listener to remove button
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

    #unselectActive(tabsDiv) {
        let activeTabLinks = tabsDiv.querySelectorAll(".tab-link.active");
        activeTabLinks.forEach(link => {
            link.classList.remove("active");
        });
        let activeTabContents = document.querySelectorAll(".tab-pane.active");
        activeTabContents.forEach(content => {
            content.classList.remove("active", "show");
        });
    }

    #cleanupOnExit(trackId) {
        // Cleanup when user leaves website
        window.addEventListener('beforeunload', function () {
            // Remove all events with this tracking id
            const url = `src/session.php?action=clear&sessionId=${trackId}`;
            navigator.sendBeacon(url);
            // Remove the tracking from valid ids -> no more events will be stored with this tracking id
            const removeSessionUrl = `src/session.php?action=deleteSessionId&sessionId=${trackId}`;
            navigator.sendBeacon(removeSessionUrl);
        });
    }

    #closeBtnTabHandler(e, closeBtn, tabItem, tabsDiv, trackId) {
        e.stopPropagation();

        const closingTrackId = closeBtn.getAttribute("data-track-id");
        tabItem.remove();

        const contentToRemove = document.getElementById(closingTrackId);
        if (contentToRemove) {
            contentToRemove.remove();
        }

        const hoverDivToRemove = document.getElementById(`hover-div-${closingTrackId}`);
        if (hoverDivToRemove) {
            hoverDivToRemove.remove();
        }

        const remainingTabs = tabsDiv.querySelectorAll(".tab-link");
        if (remainingTabs.length > 0) {
            const lastTab = remainingTabs[remainingTabs.length - 1];
            lastTab.classList.add("active");
            const lastContentId = lastTab.getAttribute("data-bs-target").substring(1);
            const lastContent = document.getElementById(lastContentId);
            if (lastContent) {
                lastContent.classList.add("active", "show");
            }
        }

        // Stop interval
        const intervalId = state.trackerIntervalMap.get(closingTrackId);
        if (intervalId) {
            clearInterval(intervalId);
            state.trackerIntervalMap.delete(closingTrackId);
        } else {
            console.error(`No interval found for trackId: ${closingTrackId}`);
        }

        // Remove all events with this tracking id, could be done here, but not necessary
        // const url = `src/session.php?action=clear&sessionId=${trackId}`;
        // navigator.sendBeacon(url);

        // Remove the tracking id from valid ids -> no more events will be stored with this tracking id
        const removeSessionUrl = `src/session.php?action=deleteSessionId&sessionId=${trackId}`;
        navigator.sendBeacon(removeSessionUrl);
    }

    async #startTracking(trackId) {
        // Add trackingId to valid ids on server
        try {
            let response = await fetch(`src/session.php?action=addSessionId&sessionId=${trackId}`, {method: "POST"});
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
        } catch (error) {
            console.error("Error adding track ID: ", error);
        }

        let tabsDiv = document.getElementById("tables-tabs");
        // Check if tab already exists
        let existingTab = tabsDiv.querySelector(`.tab-link[data-bs-target="#${trackId}"]`);
        if (existingTab) {
            // Remove "active" class from all tab links and contents in the tabs
            this.#unselectActive(tabsDiv);
            // If it exists, activate it and return
            existingTab.classList.add("active");
            let activeContent = document.getElementById(trackId);
            if (activeContent) {
                activeContent.classList.add("active", "show");
            }
            return;
        }

        // Remove "active" class from all tab links and contents in the tabs
        this.#unselectActive(tabsDiv);

        // Set new tab and content as active
        let tabItem = document.createElement("li");
        tabItem.classList.add("nav-item");
        tabItem.setAttribute("role", "presentation");
        let trackIdWithoutPassKey = trackId.split("-")[0]; // Remove passkey if present
        tabItem.innerHTML = `
          <div class="d-flex align-items-center" style="position:relative;">
            <button class="nav-link tab-link active flex-grow-1 text-start" style="color: ${colors.current.foreground}; padding-right: 35px;"
              id="${trackId}-tab" data-bs-toggle="tab" data-bs-target="#${trackId}" type="button" role="tab"
              aria-controls="${trackId}" aria-selected="true">
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
            this.#closeBtnTabHandler(e, closeBtn, tabItem, tabsDiv, trackId);
        });

        // Get the netlist from localStorage with the trackID
        let svgData = new SvgMagician("<svg><p>No svg found</p></svg>");
        let isValidSyntax = false;
        let errMsgs = [];
        let warnMsgs = [];
        let netlist = (storageManager.trackingIDs.loadValue(trackId)).netlist;
        if (netlist) {
            // Create the svg from the netlist and create the hover div for qr tracking
            let paramMap = createParamMap();
            let [optionsString, rawNetlist] = extractCommentsAndNetlist(netlist);
            [isValidSyntax, svgData, errMsgs, warnMsgs] = await state.apis.pyodide.forceDrawing(rawNetlist, paramMap, optionsString);
            svgData = new SvgMagician(svgData).hideSvgArrows();
        }

        // Create hover div
        let hoverDiv = document.createElement("div");
        hoverDiv.id = `hover-div-${trackId}`;
        hoverDiv.style.backgroundColor = colors.current.bsBackground;
        hoverDiv.style.border = `1px solid ${colors.current.foreground}`;
        hoverDiv.style.width = "300px";
        hoverDiv.appendChild(svgData.element);
        hoverDiv.style.display = "none";
        hoverDiv.style.pointerEvents = "none";
        hoverDiv.style.position = "fixed";
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
            hoverDiv.appendChild(new SvgMagician(svgData).onlyElementLabels().element)
        });
        tabButton.addEventListener("mouseleave", () => {
            // Hide hover div
            hoverDiv.style.display = "none";
        });

        let tablesContentDiv = document.getElementById("tables-tabs-content");
        let tableContent = document.createElement("div");
        tableContent.classList.add("tab-pane", "fade", "show", "active");
        tableContent.id = trackId;
        tableContent.setAttribute("role", "tabpanel");
        tableContent.setAttribute("aria-labelledby", `${trackId}-tab`);
        // Empty table with 2 columns
        tableContent.innerHTML = `
        <table id="${trackId}-table" class="table table-striped">
            <tbody>
            </tbody>
        </table>`;
        tablesContentDiv.appendChild(tableContent);

        const intervalId = setInterval(() => {this.#updateTable(trackId);}, 2000);
        state.trackerIntervalMap.set(trackId, intervalId);
        this.#cleanupOnExit(trackId);
    }

    async #updateTable(trackId) {
        let events = await getEvents(trackId);
        let table = document.getElementById(`${trackId}-table`);
        updateBsClassesTo(colors.current.bsColorScheme, "table", table);
        // Make row for every participant and append all events in one row
        if (events && events.length > 0) {
            this.#fillTableWithEvents(table, events);
        } else {
            table.innerHTML = `<tbody><tr><td colspan="2">Nothing yet</td></tr></tbody>`;
        }
    }

    #fillTableWithEvents(table, events) {
        let tbody = table.querySelector("tbody");
        tbody.innerHTML = ""; // Clear

        // Create a map to group events by participant
        let eventMap = new Map();
        for (const event of events) {
            if (!eventMap.has(event.name)) {
                eventMap.set(event.name, []);
            }
            eventMap.get(event.name).push(event);
        }

        // Create a row for each participant
        for (const [participant, participantEvents] of eventMap.entries()) {
            let row = document.createElement("tr");
            row.innerHTML = `
            <td style="width: 25px; text-align: left">👤</td>
            <td style="text-align: left; cursor: pointer;">${participantEvents.map(e => this.#mapEventToIcon(e.event)).join(" ")}</td>`;
            tbody.appendChild(row);
        }
    }

    #mapEventToIcon(event) {
        // See "circuitActions" in matomoHelper.js for allowed circuitActions
        // Create spans to allow different tooltips for each event
        let symbol = "";
        let eventStr = "";

        let liveTrackingEvents = languageManager.currentLang.toolsPage.liveTrackingEvents
        let kirchhoffEvent = languageManager.currentLang.kirchhoff;

        if (event.startsWith("Scanned")) {
            // Check with "startsWith" because "Scanned" is followed by some other stuff
            symbol = this.eventSymbols.Scanned;
            eventStr = liveTrackingEvents.circuitScanned;
        } else if (event.startsWith(circuitActions.ErrCanNotSimpl)) {
            // Check with "startsWith" because "ErrCanNotSimpl" is followed by the elements e.g. (R1, R2)
            symbol = this.eventSymbols.ErrCanNotSimpl;
            eventStr = liveTrackingEvents.circuitErrCanNotSimpl;
            // Split event at "(" and take the second part (elements)
            let elements = event.split("(")[1];
            if (elements) {
                eventStr += " (" + elements
            }
        } else if (event === circuitActions.ErrIsNotSeries) {
            symbol = this.eventSymbols.IsNotSeries;
            eventStr = liveTrackingEvents.circuitIsNotSeries;
        } else if (event === circuitActions.ErrIsNotParallel) {
            symbol = this.eventSymbols.IsNotParallel;
            eventStr = liveTrackingEvents.circuitIsNotParallel;
        } else if (event === circuitActions.Finished) {
            symbol = this.eventSymbols.Finished;
            eventStr = liveTrackingEvents.circuitFinsihed;
        } else if (event === circuitActions.Reset) {
            symbol = this.eventSymbols.Reset;
            eventStr = liveTrackingEvents.circuitReset;
        } else if (event === circuitActions.Closing) {
            symbol = this.eventSymbols.Closing;
            eventStr = liveTrackingEvents.circuitClosing;
        } else if (event === circuitActions.ViewSolutions) {
            symbol = this.eventSymbols.View;
            eventStr = liveTrackingEvents.circuitViewSolutions;
        } else if (event === circuitActions.ViewZExplanation) {
            symbol = this.eventSymbols.View;
            eventStr = liveTrackingEvents.circuitViewZExplanation;
        } else if (event === circuitActions.ViewVcExplanation) {
            symbol = this.eventSymbols.View;
            eventStr = liveTrackingEvents.circuitViewVcExplanation;
        } else if (event === circuitActions.ViewTotalExplanation) {
            symbol = this.eventSymbols.View;
            eventStr = liveTrackingEvents.circuitViewTotalExplanation;
        } else if (event === circuitActions.Aborted) {
            symbol = this.eventSymbols.Abort;
            eventStr = liveTrackingEvents.circuitAborted;
        } else if (event === circuitActions.ToggleGeneralizeOn) {
            symbol = this.eventSymbols.ToggleGeneralizeOn;
            eventStr = liveTrackingEvents.generalizeOn;
        } else if (event === circuitActions.ToggleGeneralizeOff) {
            symbol = this.eventSymbols.ToggleGeneralizeOff;
            eventStr = liveTrackingEvents.generalizeOff;
        }
        // Kirchhoff
        else if (event === circuitActions.LoopAlreadyExists) {
            symbol = this.eventSymbols.LoopAlreadyExists;
            eventStr = kirchhoffEvent.loopAlreadyExists;
        } else if (event.startsWith(circuitActions.InvalidVoltageLoop)) {
            symbol = this.eventSymbols.InvalidVoltageLoop;
            eventStr = kirchhoffEvent.invalidVoltageLoop;
            // Split event at "(" and take the second part (elements)
            let elements = event.split("(")[1];
            if (elements) {
                eventStr += " (" + elements
            }
        } else if (event === circuitActions.FinishedVoltages) {
            symbol = this.eventSymbols.FinishedVoltages;
            eventStr = kirchhoffEvent.finishedVoltages;
        } else if (event === circuitActions.WrongCurrentEquation) {
            symbol = this.eventSymbols.WrongCurrentEquation;
            eventStr = kirchhoffEvent.wrongCurrentEq;
        } else if (event === circuitActions.JunctionAlreadyExists) {
            symbol = this.eventSymbols.JunctionAlreadyExists;
            eventStr = kirchhoffEvent.junctionAlreadyExists;
        } else if (event.startsWith(circuitActions.InvalidJunction)) {
            symbol = this.eventSymbols.InvalidJunction;
            eventStr = kirchhoffEvent.invalidJunction;
            // Split event at "(" and take the second part (elements)
            let elements = event.split("(")[1];
            if (elements) {
                eventStr += " (" + elements
            }
        }
        else {
            symbol = this.eventSymbols.Default;
            eventStr = "Unknown event";
        }

        return `<span title="${eventStr}">${symbol}</span>`; // with event title as tool tip
    }

}


// ToDo move into db class
// #############################################################################################################

async function sendEventToDB(eventStr) {
    let sessId = state.sessionId;
    try {
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
            if (response.status === 403) {
                console.warn("Tracking for session ID not active (403 Forbidden)");
            } else {
                console.error(`Server responded with status: ${response.status}`);
            }
        }
    } catch (error) {
        console.error("Network or other fetch error:", error);
    }
}

async function getEvents(id) {
    let ret = [];
    // with &t=Date.now to prevent caching issues in addition to cache settings in session.php
    await fetch(`src/session.php?action=read&sessionId=${id}&lastId=0&t=${Date.now()}`)
        .then(res => res.json())
        .then(events => {
            for (const e of events) {
                ret.push(e);
            }
        });
    return ret;
}

async function getLiveDBSessions() {
    let sessionList;
    await fetch("src/session.php?action=sessions")
        .then(response => response.json())
        .then(sessions => {
            sessionList = sessions;
        })
        .catch(error => console.error("Error fetching sessions:", error));
    return sessionList;
}

function getPassKeyForQRCode(trackId) {
    // Takes the trackId with 5 characters and generates a passkey with 3 digits
    let num = parseInt(trackId);
    let x = ((num >> 3) ^ (num << 5)) & 0xFFFFF;
    return String(x % 1000).padStart(3, "0");
}
