function createLiveDrawingItem() {
    let accLiveDrawItem = document.createElement("div");
    accLiveDrawItem.classList.add("accordion-item");
    accLiveDrawItem.id = "live-drawing-accordion-item";
    accLiveDrawItem.innerHTML = getLiveDrawingHTML();
    return accLiveDrawItem;
}

function addLiveDrawingEventlisteners() {
    const editor = setupCodeMirrorEditor(); // live drawing
    addCheckBoxEventlisteners(editor);  // for netlist comments
}

function addCheckBoxEventlisteners(editor) {
    const checkboxGeneralize = document.getElementById("comments-switch-generalize");
    const checkboxOptimizeMobile = document.getElementById("comments-switch-optimize-mobile");
    const checkboxOptimizeDesktop = document.getElementById("comments-switch-optimize-desktop");
    const checkboxExample = document.getElementById("load-example");
    const checkBoxShownodes = document.getElementById("comments-switch-shownodes");

    function updateOptionLine() {
        const doc = editor.getDoc();
        const firstLine = doc.getLine(0);

        const options = [];
        if (checkboxGeneralize.checked) options.push("--generalize");
        if (checkboxOptimizeMobile.checked) options.push("--optimize-mobile");
        if (checkboxOptimizeDesktop.checked) options.push("--optimize-desktop");
        if (checkBoxShownodes.checked) options.push("--shownodes-true");

        const newLine = options.length > 0 ? "# " + options.join(" ") : "";

        if (firstLine.startsWith("# --")) {
            // First line in editor already contains options
            if (newLine) {
                doc.replaceRange(newLine, {line: 0, ch: 0}, {line: 0, ch: firstLine.length});
            } else {
                doc.replaceRange("", {line: 0, ch: 0}, {line: 1, ch: 0});
            }
        } else if (newLine) {
            // First line does not contain options, add new line
            doc.replaceRange(newLine + "\n", {line: 0, ch: 0});
        }
    }

    // Generalize toggled
    checkboxGeneralize.addEventListener("change", () => {
        if (!checkboxGeneralize.checked) {
            // If generalize is turned off, remove both optimize options
            checkboxOptimizeMobile.checked = false;
            checkboxOptimizeDesktop.checked = false;
        }
        updateOptionLine();
    });

    // Optimize mobile toggled
    checkboxOptimizeMobile.addEventListener("change", () => {
        if (checkboxOptimizeMobile.checked) {
            checkboxGeneralize.checked = true;
            checkboxOptimizeDesktop.checked = false; // mutually exclusive
        }
        updateOptionLine();
    });

    // Optimize desktop toggled
    checkboxOptimizeDesktop.addEventListener("change", () => {
        if (checkboxOptimizeDesktop.checked) {
            checkboxGeneralize.checked = true;
            checkboxOptimizeMobile.checked = false; // mutually exclusive
        }
        updateOptionLine();
    });

    // Show nodes toggled
    checkBoxShownodes.addEventListener("change", () => {
        updateOptionLine();
    });

    // Example toggled
    checkboxExample.addEventListener("change", () => {
        let forceDrawingExample =
            "V1 1 0 dc {4}; down\n" +
            "R1 1 2 {2}; right\n" +
            "R2 2 3 {1}; right\n" +
            "R3 2 4 {4}; down\n" +
            "R4 3 5 {3}; down\n" +
            "W 5 4; left\n" +
            "W 4 0; left";
        if (checkboxExample.checked) {
            // Load example circuit
            editor.setValue(forceDrawingExample);
        } else {
            // Clear editor
            editor.setValue("");
        }
    });
}

function setupCodeMirrorEditor() {
    // Create code mirror editor from text area, doesn't need to be appended or anything else, replaces textarea
    const editor = CodeMirror.fromTextArea(document.getElementById("live-drawing-input-area"), {
        lineNumbers: true
    });
    setupKeystrokeCounter(editor);

    // Disable editor while pyodide not loaded
    editor.setOption("readOnly", "nocursor");
    let editorHtmlElement = document.getElementsByClassName("CodeMirror")[0];
    editorHtmlElement.style.backgroundColor = "lightgray"; // is set to white on enableNetlistEditor()
    editorHtmlElement.style.border = `1px solid ${colors.currentForeground}`;

    // Additionally to CSS settings
    let codeMirror = document.getElementsByClassName("CodeMirror")[0];
    codeMirror.classList.add("mx-auto");

    let questionTooltip = document.getElementById("question-tooltip");
    questionTooltip.addEventListener("click", () => {
        setTimeout(() => {
            showMessage(languageManager.currentLang.netlistCommentTooltips, "info", false);
        });
    });

    let debounceTimer;
    let timeout = 500;
    // Set eventlistener on editor not textarea!
    editor.on('change', (instance, _) => {
        editor.refresh(); // To adjust codeMirror-rendering when setup while element not visible (hidden in accordion)
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(async () => {
            let input = instance.getValue();
            if (input === "" || input === null || input === undefined) {
                return;
            }

            // get all lines that start with #
            let lines = input.split("\n");
            // Trim each line
            lines = lines.map(line => line.trim());
            let comments = lines.filter(line => line.startsWith("#"));
            // Error if comments is more than 1, for now
            if (comments.length > 1) {
                console.error("Too many comments in input");
                return;
            }
            let optionsString;
            if (comments.length > 0) {
                optionsString = comments[0].trim();
                lines = lines.filter(line => !line.trim().startsWith("#"));
                if (input === "") {
                    // Only comments
                    return;
                }
            }
            input = lines.join("\n");

            checkNetlistEasterEgg(input); // without comments and trimmed input
            let paramMap = createParamMap();
            if (optionsString === undefined || optionsString === null) {
                optionsString = "";
            }
            let [isValidSyntax, svgData, errMsgs, warnMsgs] = await state.pyodideAPI.forceDrawing(input, paramMap, optionsString);

            // Split errMsgs and warnMsgs into lines
            let errMsgsList = errMsgs?.split("\n");
            let warnMsgsList = warnMsgs?.split("\n");
            // Add both lists together
            let allMsgs = errMsgsList?.concat(warnMsgsList);
            let errorList = document.getElementById("live-drawing-error-list");
            errorList.innerHTML = "";
            // Make all lines white and after that color the errors
            for (let i = 0; i < editor.lineCount(); i++) {
                editor.removeLineClass(i, "background", "error-line-highlight");
                editor.removeLineClass(i, "background", "warning-line-highlight");
            }

            // If comment in line 1, first line in circuit is actually line 2 since comments are stripped
            // Todo: Only works if comment is in line 1 for now
            let commentOffset = comments.length;

            // Color the error lines
            allMsgs?.forEach(msg => {
                // Add errors to list
                let li = document.createElement("li");

                if (msg.includes("Syntax error on line")) {
                    li.style.color = colors.syntaxErrorRed;
                    let lineNumber = parseInt(msg.split("line ")[1].split(":")[0]); // line number without comments
                    let lineNumberWithComment = lineNumber + commentOffset; // line number with comments
                    // Careful, line number is 1 based, but editor is 0 based, so -1
                    editor.addLineClass(lineNumberWithComment - 1, "background", "error-line-highlight");
                    let msgWithAdaptedLineNumer = msg.replace(/line \d+/, `line ${lineNumberWithComment}`);
                    li.innerHTML = msgWithAdaptedLineNumer;
                } else if (msg.includes("warning, drawing hint missing on line")) {
                    li.style.color = colors.warningOrange;
                    let lineNumber = parseInt(msg.split("line ")[1].split(":")[0]);
                    let lineNumberWithComment = lineNumber + commentOffset;
                    // Careful, line number is 1 based, but editor is 0 based, so -1
                    editor.addLineClass(lineNumberWithComment - 1, "background", "warning-line-highlight");
                    let msgWithAdaptedLineNumer = msg.replace(/line \d+/, `line ${lineNumberWithComment}`);
                    li.innerHTML = msgWithAdaptedLineNumer;
                } else {
                    li.style.color = colors.currentForeground;
                    li.innerHTML = msg;
                }
                errorList.appendChild(li);
            });

            // After writing errors and warnings, return if syntax is not valid
            if (!isValidSyntax) {
                return;
            }

            // Syntax ok, draw the circuit
            let drawingFieldDiv = document.getElementById("drawing-field-div");
            svgData = setSvgColorMode(svgData);
            svgData = adjustForceDrawingLabelsAndWidth(svgData); // e.g. ##.### ## to R1
            drawingFieldDiv.innerHTML = svgData;
            hideSvgArrows(drawingFieldDiv); // after added to div
        }, timeout);
    });
    return editor;
}

function getLiveDrawingHTML() {
    return `
            <h2 class="accordion-header" id="live-drawing-acc-heading">
                <button class="accordion-button collapsed" style="flex-direction: column; padding-bottom: 0;" type="button" data-bs-toggle="collapse" data-bs-target="#live-drawing-acc-collapse" aria-expanded="false" aria-controls="live-drawing-acc-collapse">
                    ${languageManager.currentLang.liveDrawingHeading}
                </button>
            </h2>
            <div id="live-drawing-acc-collapse" class="accordion-collapse collapse" aria-labelledby="live-drawing-acc-heading" data-bs-parent="#tool-accordion">
                <div class="accordion-body">
                    <div id="drawing-field-div" class="my-3" style="color: ${colors.currentForeground};">
                        <div class="circuitStartBtn mx-auto" style="height: 10px;">
                            <div class="fill-layer"></div>
                            <div class="progress-stripes"></div>
                        </div>
                    </div>
                    <div id="comments-switch-div" class="d-flex align-items-center mx-auto" style="max-width: 800px;">
                        <!-- Checkboxes aligned in the middle on desktop or listed on mobile -->
                        <div id="checkbox-group" class="d-flex justify-content-center flex-grow-1">
                            <div class="me-4 d-flex mb-2 mb-lg-0">
                                <label id="label-load-example" for="load-example" class="form-label me-2" style="color: ${colors.currentForeground}">${languageManager.currentLang.example}</label>
                                <input type="checkbox" id="load-example" class="form-check-input netlist-comment" disabled>
                            </div>
                            <div class="me-4 d-flex mb-2 mb-lg-0">
                                <label id="label-comments-switch-generalize" for="comments-switch-generalize" class="form-label me-2" style="color: ${colors.currentForeground}">Generalize</label>
                                <input type="checkbox" id="comments-switch-generalize" class="form-check-input netlist-comment" disabled>
                            </div>
                            <div class="me-4 d-flex mb-2 mb-lg-0">
                                <label id="label-comments-switch-optimize-mobile" for="comments-switch-optimize-mobile" class="form-label me-2" style="color: ${colors.currentForeground}">Optimize mobile</label>
                                <input type="checkbox" id="comments-switch-optimize-mobile" class="form-check-input netlist-comment" disabled>
                            </div>
                            <div class="me-4 d-flex mb-2 mb-lg-0">
                                <label id="label-comments-switch-optimize-desktop" for="comments-switch-optimize-desktop" class="form-label me-2" style="color: ${colors.currentForeground}">Optimize desktop</label>
                                <input type="checkbox" id="comments-switch-optimize-desktop" class="form-check-input netlist-comment" disabled>
                            </div>
                            <div class="me-4 d-flex mb-2 mb-lg-0">
                                <label id="label-comments-switch-shownodes" for="comments-switch-shownodes" class="form-label me-2" style="color: ${colors.currentForeground}">Show nodes</label>
                                <input type="checkbox" id="comments-switch-shownodes" class="form-check-input netlist-comment" disabled>
                            </div>
                        </div>
                        <!-- Info Icon to the right -->
                        <div id="question-tooltip" class="d-flex ms-auto" style="color: ${colors.keyYellow}; cursor: pointer;">
                            <b>?</b>
                        </div>
                    </div>
                    <div id="input-live-drawing" class="form-group">
                        <textarea class="form-control" id="live-drawing-input-area" rows="3"></textarea>
                    </div>
                    <ul id="live-drawing-error-list" class="mt-3 p-0"></ul>  
                </div>
            </div>`;
}

function adjustForceDrawingLabelsAndWidth(svgData) {
    // Seach for '###.### ##' and replace it with class value in the above <text> tag
    const parser = new DOMParser();
    const doc = parser.parseFromString(svgData, "image/svg+xml");
    const elementPlaceHolder = "#E#.### ##";
    const tspans = [...doc.querySelectorAll("tspan")].filter(el => el.textContent.trim() === elementPlaceHolder)
    for (let tspan of tspans) {
        const parentText = tspan.closest("text");
        tspan.textContent = parentText.classList[1]; // Directly set the replacement in DOM, otherwise all occurences of ###.### ## are overwritten
    }
    // Set width of svg
    const svg = doc.querySelector("svg");
    svg.setAttribute("width", "90%");
    // Serialize the modified SVG back to a string
    const updatedSvgData = new XMLSerializer().serializeToString(doc);
    return updatedSvgData;
}

function adjustForceDrawingLabels(svgData) {
    // Search for '###.### ##' and replace it with class value in the above <text> tag
    const parser = new DOMParser();
    const doc = parser.parseFromString(svgData, "image/svg+xml");
    const elementPlaceHolder = "#E#.### ##";
    const tspans = [...doc.querySelectorAll("tspan")].filter(el => el.textContent.trim() === elementPlaceHolder);
    for (let tspan of tspans) {
        const parentText = tspan.closest("text");
        tspan.textContent = parentText.classList[1]; // Directly set the replacement in DOM, otherwise all occurrences of ###.### ## are overwritten
    }
    // Serialize the modified SVG back to a string
    return new XMLSerializer().serializeToString(doc);
}

