function createTrackViewerItem() {
    let trackItem = document.createElement("div");
    trackItem.classList.add("accordion-item");
    trackItem.id = "qr-accordion-item";
    trackItem.innerHTML = getTrackViewerHTML();
    return trackItem;
}

function addTrackViewerEventlisteners() {
    let loadTrackBtn = document.getElementById("loadTrackBtn");
    let input = document.getElementById("trackIdInput");
    let list = document.getElementById("suggestions"); // stored trackingIds in localStorage

    loadTrackBtn.addEventListener("click", async () => {
        let trackId = input.value.trim();
        input.value = "";

        if (!trackId) {
            setTimeout(() => {
                showMessage(languageManager.currentLang.alertPleaseEnterValidID, "info");
            }, 0);
            return;
        }

        let [idStr, passkey] = trackId.split("-");
        let id = parseInt(idStr, 10);

        if (isNaN(id)) {
            setTimeout(() => {
                showMessage(languageManager.currentLang.alertPleaseEnterValidID, "info");
            }, 0);
            return;
        }

        if (!passkey) {
            setTimeout(() => {
                showMessage(languageManager.currentLang.alertPleaseEnterKey, "info");
            }, 0);
            return;
        }

        let generatedKey = getPassKeyForQRCode(id);
        if (generatedKey !== passkey) {
            setTimeout(() => {
                showMessage(languageManager.currentLang.alertKeyIsNotCorrect, "info");
            }, 0);
            return;
        }

        startTracking(idStr);
    });

    input.addEventListener("focus", () => {
        list.style.display = "block";

        // Fill list with localStorage data
        list.innerHTML = "";
        let trackingIds = JSON.parse(localStorage.getItem("trackIds")) || [];
        trackingIds.forEach(trackingId => updateListForTrackId(trackingId, list));

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
        setTimeout(() => {showMessage(languageManager.currentLang.helpTrackViewer, "info", false)},0);
    });
}

function updateListForTrackId(trackingId, list) {
    let input = document.getElementById("trackIdInput");
    // Example: 12345-123_01_testfile.txt -> 12345-123 and 01_testfile.txt
    let [sessionId, ...rest] = trackingId.split("_");
    let filename = rest.join("_");
    let li = document.createElement("li");
    li.className = "list-group-item list-group-item-action";
    li.style.cursor = "pointer";
    li.style.textAlign = "left";
    li.innerHTML = `${filename} (${sessionId}) <button id="x-btn-${sessionId}">X</button>`;
    li.onclick = () => {
        input.value = sessionId;
        // Hide the list after selection
        setTimeout(() => {
            list.style.display = "none";
        }, 100);
    };
    list.appendChild(li);
    // Add event listener to remove button
    let removeButton = li.querySelector(`#x-btn-${sessionId}`);
    removeButton.style.borderRadius = "5px";
    removeButton.style.background = "none";
    removeButton.style.float = "right";
    removeButton.style.marginLeft = "10px";
    removeButton.addEventListener("click", (event) => {
        removeTrackingIdFromStorage(event, sessionId, li);
        removeNetlistFromStorage(sessionId);
    });
}

function removeTrackingIdFromStorage(event, sessionId, li) {
    event.stopPropagation(); // Prevent the li click event
    // Remove from localStorage
    let trackIds = JSON.parse(localStorage.getItem("trackIds")) || [];
    // trackIds are stored like this: sessionId_filename
    // Search for the sessionId and delete this entry
    trackIds = trackIds.filter(id => !id.startsWith(`${sessionId}_`));
    localStorage.setItem("trackIds", JSON.stringify(trackIds));
    // Remove from list
    li.remove();
}

function removeNetlistFromStorage(sessionId) {
    // Remove netlist from localStorage
    // sessionId = 12345-123, stored in local storage as 12345
    let id = sessionId.split("-")[0]; // Remove passkey if present
    localStorage.removeItem(id);
}

function unselectActive(tabsDiv) {
    let activeTabLinks = tabsDiv.querySelectorAll(".tab-link.active");
    activeTabLinks.forEach(link => {
        link.classList.remove("active");
    });
    let activeTabContents = document.querySelectorAll(".tab-pane.active");
    activeTabContents.forEach(content => {
        content.classList.remove("active", "show");
    });
}

function cleanupOnExit(trackId) {
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

function closeBtnTabHandler(e, closeBtn, tabItem, tabsDiv, trackId) {
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

async function startTracking(trackId) {
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
        unselectActive(tabsDiv);
        // If it exists, activate it and return
        existingTab.classList.add("active");
        let activeContent = document.getElementById(trackId);
        if (activeContent) {
            activeContent.classList.add("active", "show");
        }
        return;
    }

    // Remove "active" class from all tab links and contents in the tabs
    unselectActive(tabsDiv);

    // Set new tab and content as active
    let tabItem = document.createElement("li");
    tabItem.classList.add("nav-item");
    tabItem.setAttribute("role", "presentation");
    let trackIdWithoutPassKey = trackId.split("-")[0]; // Remove passkey if present
    tabItem.innerHTML = `
          <div class="d-flex align-items-center" style="position:relative;">
            <button class="nav-link tab-link active flex-grow-1 text-start" style="color: ${colors.currentForeground}; padding-right: 35px;"
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
        closeBtnTabHandler(e, closeBtn, tabItem, tabsDiv, trackId);
    });

    // Get the netlist from localStorage with the trackID
    let svgData = "<p>No svg found</p>";
    let isValidSyntax = false;
    let errMsgs = [];
    let warnMsgs = [];
    let netlist = localStorage.getItem(trackId);
    if (netlist) {
        // Create the svg from the netlist and create the hover div for qr tracking
        let paramMap = createParamMap();
        let [optionsString, rawNetlist] = extractCommentsAndNetlist(netlist);
        [isValidSyntax, svgData, errMsgs, warnMsgs] = await state.pyodideAPI.forceDrawing(rawNetlist, paramMap, optionsString);
        svgData = setSvgWidthTo(svgData, "100%");
    }

    // Create hover div
    let hoverDiv = document.createElement("div");
    hoverDiv.id = `hover-div-${trackId}`;
    hoverDiv.style.backgroundColor = colors.currentBsBackground;
    hoverDiv.style.border = `1px solid ${colors.currentForeground}`;
    hoverDiv.style.width = "300px";
    hoverDiv.innerHTML = svgData;
    hoverDiv.style.display = "none";
    hoverDiv.style.pointerEvents = "none";
    hoverDiv.style.position = "fixed";
    document.body.appendChild(hoverDiv);
    hideSvgArrows(hoverDiv); // after added to document

    // Add hover event listener on button to show svg
    let tabButton = tabItem.querySelector(".tab-link");
    tabButton.addEventListener("mouseenter", () =>  {
        // Show hover div at mouse position
        hoverDiv.style.display = "block";
        hoverDiv.style.left = `${tabButton.getBoundingClientRect().left}px`;
        hoverDiv.style.top = `${tabButton.getBoundingClientRect().bottom}px`;
        hoverDiv.style.backgroundColor = colors.currentBsBackground;
        hoverDiv.style.color = colors.currentForeground;
        hoverDiv.style.border = `1px solid ${colors.currentForeground}`;
        svgData = adjustForceDrawingLabels(svgData);
        hoverDiv.innerHTML = setSvgColorMode(svgData);
        hideSvgArrows(hoverDiv);
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
        <table id="${trackId}-table" class="table table-striped table-dark">
            <tbody>
            </tbody>
        </table>`;
    tablesContentDiv.appendChild(tableContent);

    const intervalId = setInterval(() => {updateTable(trackId);}, 2000);
    state.trackerIntervalMap.set(trackId, intervalId);
    cleanupOnExit(trackId);
}

async function updateTable(trackId) {
    let events = await getEvents(trackId);
    let table = document.getElementById(`${trackId}-table`);
    // Make row for every participant and append all events in one row
    if (events && events.length > 0) {
        fillTableWithEvents(table, events);
    } else {
        table.innerHTML = `<tbody><tr><td colspan="2">Nothing yet</td></tr></tbody>`;
    }
}

function fillTableWithEvents(table, events) {
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
            <td style="text-align: left; cursor: pointer;">${participantEvents.map(e => mapEventToIcon(e.event)).join(" ")}</td>`;
        tbody.appendChild(row);
    }
}

const eventSymbols = {
    "Scanned": "▶️", // Circuit started
    "Finished": "✅",
    "Reset": "🔄️",
    "ErrCanNotSimpl": "⚠️", // or kirchhoff no valid loop
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

function mapEventToIcon(event) {
    // See "circuitActions" in matomoHelper.js for allowed circuitActions
    // Create spans to allow different tooltips for each event
    let symbol = "";
    let eventStr = "";
    if (event.startsWith("Scanned")) {
        // Check with "startsWith" because "Scanned" is followed by some other stuff
        symbol = eventSymbols.Scanned;
        eventStr = languageManager.currentLang.circuitScanned;
    } else if (event.startsWith(circuitActions.ErrCanNotSimpl)) {
        // Check with "startsWith" because "ErrCanNotSimpl" is followed by the elements e.g. (R1, R2)
        symbol = eventSymbols.ErrCanNotSimpl;
        eventStr = languageManager.currentLang.circuitErrCanNotSimpl;
        // Split event at "(" and take the second part (elements)
        let elements = event.split("(")[1];
        if (elements) {
            eventStr += " (" + elements
        }
    } else if (event === circuitActions.Finished) {
        symbol = eventSymbols.Finished;
        eventStr = languageManager.currentLang.circuitFinsihed;
    } else if (event === circuitActions.Reset) {
        symbol = eventSymbols.Reset;
        eventStr = languageManager.currentLang.circuitReset;
    } else if (event === circuitActions.Closing) {
        symbol = eventSymbols.Closing;
        eventStr = languageManager.currentLang.circuitClosing;
    } else if (event === circuitActions.ViewSolutions) {
        symbol = eventSymbols.View;
        eventStr = languageManager.currentLang.circuitViewSolutions;
    } else if (event === circuitActions.ViewZExplanation) {
        symbol = eventSymbols.View;
        eventStr = languageManager.currentLang.circuitViewZExplanation;
    } else if (event === circuitActions.ViewVcExplanation) {
        symbol = eventSymbols.View;
        eventStr = languageManager.currentLang.circuitViewVcExplanation;
    } else if (event === circuitActions.ViewTotalExplanation) {
        symbol = eventSymbols.View;
        eventStr = languageManager.currentLang.circuitViewTotalExplanation;
    } else if (event === circuitActions.Aborted) {
        symbol = eventSymbols.Abort;
        eventStr = languageManager.currentLang.circuitAborted;
    } else if (event === circuitActions.ToggleGeneralizeOn) {
        symbol = eventSymbols.ToggleGeneralizeOn;
        eventStr = languageManager.currentLang.TextToggleGeneralizeOn;
    } else if (event === circuitActions.ToggleGeneralizeOff) {
        symbol = eventSymbols.ToggleGeneralizeOff;
        eventStr = languageManager.currentLang.TextToggleGeneralizeOff;
    }
    // Kirchhoff
    else if (event === circuitActions.LoopAlreadyExists) {
        symbol = eventSymbols.LoopAlreadyExists;
        eventStr = languageManager.currentLang.kirchhoffLoopAlreadyExists;
    } else if (event.startsWith(circuitActions.InvalidVoltageLoop)) {
        symbol = eventSymbols.InvalidVoltageLoop;
        eventStr = languageManager.currentLang.kirchhoffInvalidVoltageLoop;
        // Split event at "(" and take the second part (elements)
        let elements = event.split("(")[1];
        if (elements) {
            eventStr += " (" + elements
        }
    } else if (event === circuitActions.FinishedVoltages) {
        symbol = eventSymbols.FinishedVoltages;
        eventStr = languageManager.currentLang.kirchhoffFinishedVoltages;
    } else if (event === circuitActions.WrongCurrentEquation) {
        symbol = eventSymbols.WrongCurrentEquation;
        eventStr = languageManager.currentLang.kirchhoffWrongCurrentEq;
    } else if (event === circuitActions.JunctionAlreadyExists) {
        symbol = eventSymbols.JunctionAlreadyExists;
        eventStr = languageManager.currentLang.kirchhoffJunctionAlreadyExists;
    } else if (event.startsWith(circuitActions.InvalidJunction)) {
        symbol = eventSymbols.InvalidJunction;
        eventStr = languageManager.currentLang.kirchhoffInvalidJunction;
        // Split event at "(" and take the second part (elements)
        let elements = event.split("(")[1];
        if (elements) {
            eventStr += " (" + elements
        }
    }
    else {
        symbol = eventSymbols.Default;
        eventStr = "Unknown event";
    }

    return `<span title="${eventStr}">${symbol}</span>`; // with event title as tool tip
}

function getTrackViewerHTML() {
    return `
            <h2 class="accordion-header" id="track-acc-heading">
                <button class="accordion-button collapsed" style="flex-direction: column; padding-bottom: 0;" type="button" data-bs-toggle="collapse" data-bs-target="#track-acc-collapse" aria-expanded="false" aria-controls="track-acc-collapse">
                    ${languageManager.currentLang.trackAccHeading}
                </button>
            </h2>
            <div id="track-acc-collapse" class="accordion-collapse collapse" aria-labelledby="track-acc-heading" data-bs-parent="#tool-accordion">
                <div id="trackViewerBody" class="accordion-body">
                    <p style="color: ${colors.currentHeadingsForeground}; cursor: pointer;" id="help-track-viewer">${languageManager.currentLang.helpBtn}</p>
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
            </div>`;
}

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
