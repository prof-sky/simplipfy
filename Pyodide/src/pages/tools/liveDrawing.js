class LiveDrawing extends Content {
    // on page named as Custom Netlist

    editor = null
    checkboxGeneralize = null;
    checkboxOptimizeMobile = null;
    checkboxOptimizeDesktop = null;
    checkboxExample = null;
    checkBoxShownodes = null;
    pyodideReady = false;

    constructor() {
        let idLangMap = new Map([
            ["label-load-example", () => this.currentLang.toolsPage.example],
            ["label-comments-switch-generalize", () => this.currentLang.toolsPage.generalize],
            ["label-comments-switch-optimize-mobile", () => this.currentLang.toolsPage.optimizeMobile],
            ["label-comments-switch-optimize-desktop", () => this.currentLang.toolsPage.optimizeDesktop],
            ["label-comments-switch-shownodes", () => this.currentLang.toolsPage.showNodes],
            ["help-track-viewer", () => languageManager.currentLang.toolsPage.helpBtn]
        ])
        super(idLangMap, "live-drawing-accordion-item");
    }

    get html(){
        return `
            <h2 class="accordion-header" id="live-drawing-acc-heading">
                <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#live-drawing-acc-collapse" aria-expanded="false" aria-controls="live-drawing-acc-collapse">
                    ${languageManager.currentLang.toolsPage.liveDrawingAccHeading}
                </button>
            </h2>
            <div id="live-drawing-acc-collapse" class="accordion-collapse collapse" aria-labelledby="live-drawing-acc-heading" data-bs-parent="#tool-accordion">
                <div class="accordion-body">
                    <button class="btn btn-outline-warning mx-auto my-1" style="color: ${colors.current.headingForeground}; cursor: pointer;" id="help-live-drawing">${languageManager.currentLang.toolsPage.helpBtn}</button>
                    <div id="drawing-field-div" class="my-3" style="color: ${colors.current.foreground};">
                        <div class="circuitStartBtn mx-auto" style="height: 10px;">
                            <div class="fill-layer"></div>
                            <div class="progress-stripes"></div>
                        </div>
                    </div>
                    <div id="comments-switch-div" class="d-flex align-items-center mx-auto" style="max-width: 800px;">
                        <!-- Checkboxes aligned in the middle on desktop or listed on mobile -->
                        <div id="checkbox-group" class="d-flex justify-content-center flex-grow-1">
                            <div class="me-4 d-flex mb-2 mb-lg-0">
                                <label id="label-load-example" for="load-example" class="form-label me-2" style="color: ${colors.current.foreground}">${languageManager.currentLang.toolsPage.example}</label>
                                <input type="checkbox" id="load-example" class="form-check-input netlist-comment" disabled>
                            </div>
                            <div class="me-4 d-flex mb-2 mb-lg-0">
                                <label id="label-comments-switch-generalize" for="comments-switch-generalize" class="form-label me-2" style="color: ${colors.current.foreground}">${languageManager.currentLang.toolsPage.generalize}</label>
                                <input type="checkbox" id="comments-switch-generalize" class="form-check-input netlist-comment" disabled>
                            </div>
                            <div class="me-4 d-flex mb-2 mb-lg-0">
                                <label id="label-comments-switch-optimize-mobile" for="comments-switch-optimize-mobile" class="form-label me-2" style="color: ${colors.current.foreground}">${languageManager.currentLang.toolsPage.optimizeMobile}</label>
                                <input type="checkbox" id="comments-switch-optimize-mobile" class="form-check-input netlist-comment" disabled>
                            </div>
                            <div class="me-4 d-flex mb-2 mb-lg-0">
                                <label id="label-comments-switch-optimize-desktop" for="comments-switch-optimize-desktop" class="form-label me-2" style="color: ${colors.current.foreground}">${languageManager.currentLang.toolsPage.optimizeDesktop}</label>
                                <input type="checkbox" id="comments-switch-optimize-desktop" class="form-check-input netlist-comment" disabled>
                            </div>
                            <div class="me-4 d-flex mb-2 mb-lg-0">
                                <label id="label-comments-switch-shownodes" for="comments-switch-shownodes" class="form-label me-2" style="color: ${colors.current.foreground}">${languageManager.currentLang.toolsPage.showNodes}</label>
                                <input type="checkbox" id="comments-switch-shownodes" class="form-check-input netlist-comment" disabled>
                            </div>
                        </div>
                    </div>
                    <div id="input-live-drawing" class="form-group">
                        <textarea class="form-control" id="live-drawing-input-area" rows="3"></textarea>
                    </div>
                    <ul id="live-drawing-error-list" class="mt-3 p-0"></ul>
                    <div>
                        <input type="text" id="file-name" placeholder=${languageManager.currentLang.toolsPage.filename}>
                        <input type="button" class="btn btn-warning my-3" id="download-btn" value=${languageManager.currentLang.toolsPage.download} />
                    </div>     
                    <div class="d-flex align-items-center justify-content-center">
                        <label id="label-form-check-input" for="form-check-input" class="form-label me-2 mb-0" style="color: ${colors.current.foreground}">${languageManager.currentLang.toolsPage.downloadSvg}</label>
                        <input type="checkbox" id="download-svg-check" class="form-check-input">
                    </div>   
                </div>
            </div>
        `
    }

    setup() {
        if (this.isSetUp === true) return;

        let accLiveDrawItem = document.createElement("div");
        accLiveDrawItem.classList.add("accordion-item");
        accLiveDrawItem.id = this.mainID;
        accLiveDrawItem.innerHTML = this.html;
        this.isSetUp = true;

        return accLiveDrawItem;
    }

    updateLang() {
        let liveDrawingAccHeading = document.getElementById('live-drawing-acc-heading');
        liveDrawingAccHeading.querySelector("button").innerHTML = languageManager.currentLang.toolsPage.liveDrawingAccHeading;

        let example = document.getElementById('label-load-example');
        example.innerHTML = languageManager.currentLang.toolsPage.example;

        let generalize = document.getElementById('label-comments-switch-generalize');
        generalize.innerHTML = languageManager.currentLang.toolsPage.generalize;

        let optiMobile = document.getElementById('label-comments-switch-optimize-mobile');
        optiMobile.innerHTML = languageManager.currentLang.toolsPage.optimizeMobile;

        let optiDesktop = document.getElementById('label-comments-switch-optimize-desktop');
        optiDesktop.innerHTML = languageManager.currentLang.toolsPage.optimizeDesktop;

        let showNodes = document.getElementById('label-comments-switch-shownodes');
        showNodes.innerHTML = languageManager.currentLang.toolsPage.showNodes;

        let drawingFieldDiv = document.getElementById("drawing-field-div");
        if (drawingFieldDiv && state.pyodideReady) {
            drawingFieldDiv.innerHTML = languageManager.currentLang.toolsPage.startTyping;
        }
        let fileNameDiv = document.getElementById("file-name");
        fileNameDiv.placeholder = languageManager.currentLang.toolsPage.filename;

        let downloadBtn = document.getElementById("download-btn");
        downloadBtn.value = languageManager.currentLang.toolsPage.download;

        let svgCheck = document.getElementById("label-form-check-input");
        svgCheck.innerHTML = languageManager.currentLang.toolsPage.downloadSvg;

    }

    updateColor() {
        const elements = [
            "drawing-field-div",
            "input-live-drawing",
            "comments-switch-div",
            "label-comments-switch-generalize",
            "label-comments-switch-optimize-desktop",
            "label-comments-switch-optimize-mobile",
            "label-load-example",
            "label-comments-switch-shownodes",
        ];
        elements.forEach(id => {
            const el = document.getElementById(id);
            if (el) {
                el.style.color = colors.current.foreground;
                el.style.backgroundColor = colors.current.bsBackground;
            }
        });

        let liveDrawingField = document.getElementById("drawing-field-div");
        let svgData = liveDrawingField.querySelector('svg');
        if (svgData) {
            svgData = new SvgMagician(svgData).onlyElementLabels();
            svgData.setSvgWidthTo(90);
            svgData._setColor(colors.last.svgStrokeColor, colors.current.svgStrokeColor);
            liveDrawingField.querySelector('svg').replaceWith(svgData.element);
        }
        // Editor border
        let editorHtmlElement = document.getElementsByClassName("CodeMirror")[0];
        if (editorHtmlElement) {
            editorHtmlElement.style.border = `1px solid ${colors.current.foreground}`;
        }
        let helpNote = document.getElementById("help-live-drawing");
        if (helpNote) {
            helpNote.style.color = colors.current.foreground;
        }
        let svgCheck = document.getElementById("label-form-check-input");
        svgCheck.style.color = colors.current.foreground;
    }

    addEventListeners() {
        this.#setupCodeMirrorEditor()

        this.checkboxGeneralize = document.getElementById("comments-switch-generalize");
        this.checkboxOptimizeMobile = document.getElementById("comments-switch-optimize-mobile");
        this.checkboxOptimizeDesktop = document.getElementById("comments-switch-optimize-desktop");
        this.checkboxExample = document.getElementById("load-example");
        this.checkBoxShownodes = document.getElementById("comments-switch-shownodes");
        this.downloadBtn = document.getElementById("download-btn");

        let editor = this.editor;

        // Generalize toggled
        this.checkboxGeneralize.addEventListener("change", () => {
            if( editor.getValue()===""||
                editor.getValue()==="# --generalize" ||
                editor.getValue()==="# --generalize --optimize-mobile" ||
                editor.getValue()==="# --generalize --optimize-mobile --shownodes-true" ||
                editor.getValue()==="# --generalize --optimize-desktop" ||
                editor.getValue()==="# --generalize --optimize-desktop --shownodes-true" ||
                editor.getValue()==="# --generalize --shownodes-true" ||
                editor.getValue()==="# --shownodes-true"
            ){
                this.checkboxGeneralize.checked = false;
                return;
            }
            if (!this.checkboxGeneralize.checked) {
                // If generalize is turned off, remove both optimize options
                this.checkboxOptimizeMobile.checked = false;
                this.checkboxOptimizeDesktop.checked = false;
            }
            this.#updateOptionLine();
        });

        // Optimize mobile toggled
        this.checkboxOptimizeMobile.addEventListener("change", () => {
            if( editor.getValue()===""||
                editor.getValue()==="# --generalize" ||
                editor.getValue()==="# --generalize --optimize-mobile" ||
                editor.getValue()==="# --generalize --optimize-mobile --shownodes-true" ||
                editor.getValue()==="# --generalize --optimize-desktop" ||
                editor.getValue()==="# --generalize --optimize-desktop --shownodes-true" ||
                editor.getValue()==="# --generalize --shownodes-true" ||
                editor.getValue()==="# --shownodes-true"
            ){
                this.checkboxOptimizeMobile.checked = false;
                return;
            }
            if (this.checkboxOptimizeMobile.checked) {
                this.checkboxGeneralize.checked = true;
                this.checkboxOptimizeDesktop.checked = false; // mutually exclusive
            }
            this.#updateOptionLine();
        });

        // Optimize desktop toggled
        this.checkboxOptimizeDesktop.addEventListener("change", () => {
            if( editor.getValue()===""||
                editor.getValue()==="# --generalize" ||
                editor.getValue()==="# --generalize --optimize-mobile" ||
                editor.getValue()==="# --generalize --optimize-mobile --shownodes-true" ||
                editor.getValue()==="# --generalize --optimize-desktop" ||
                editor.getValue()==="# --generalize --optimize-desktop --shownodes-true" ||
                editor.getValue()==="# --generalize --shownodes-true" ||
                editor.getValue()==="# --shownodes-true"
            ){
                this.checkboxOptimizeDesktop.checked = false;
                return;
            }
            if (this.checkboxOptimizeDesktop.checked) {
                this.checkboxGeneralize.checked = true;
                this.checkboxOptimizeMobile.checked = false; // mutually exclusive
            }
            this.#updateOptionLine();
        });

        // Show nodes toggled
        this.checkBoxShownodes.addEventListener("change", () => {
            if( editor.getValue()===""||
                editor.getValue()==="# --generalize" ||
                editor.getValue()==="# --generalize --optimize-mobile" ||
                editor.getValue()==="# --generalize --optimize-mobile --shownodes-true" ||
                editor.getValue()==="# --generalize --optimize-desktop" ||
                editor.getValue()==="# --generalize --optimize-desktop --shownodes-true" ||
                editor.getValue()==="# --generalize --shownodes-true" ||
                editor.getValue()==="# --shownodes-true"
                ){
                this.checkBoxShownodes.checked = false;
                return;
            }
            this.#updateOptionLine();
        });

        // Example toggled
        this.checkboxExample.addEventListener("change", () => {
            let forceDrawingExample =
                "V1 1 0 dc {4}; down\n" +
                "R1 1 2 {2}; right\n" +
                "R2 2 3 {1}; right\n" +
                "R3 2 4 {4}; down\n" +
                "R4 3 5 {3}; down\n" +
                "W 5 4; left\n" +
                "W 4 0; left";
            if (this.checkboxExample.checked) {
                // Load example circuit
                editor.setValue(forceDrawingExample);
            } else {
                // Clear editor
                editor.setValue("");
                this.checkboxGeneralize.checked = false;
                this.checkboxOptimizeMobile.checked = false;
                this.checkboxOptimizeDesktop.checked = false;
                this.checkBoxShownodes.checked = false;
            }
        });

        // Download .txt file of netlist and png
        this.downloadBtn.addEventListener("click", () => {
            if (this.pyodideReady){
                let fileName = document.getElementById('file-name').value;
                let netlist = editor.getValue();

                let liveDrawingField = document.getElementById("drawing-field-div");
                let svg = liveDrawingField.children[0].outerHTML;
                svg = 'data:image/svg+xml;base64,'+ btoa(svg);
                // let svgCanvas = document.createElement('canvas');
                // svgCanvas.width = liveDrawingField.clientWidth;
                // svgCanvas.height = liveDrawingField.clientHeight;
                // let context = svgCanvas.getContext("2d");
                //
                // let image = new Image;
                // image.src = svg;
                // context.drawImage(image, 0, 0);
                //
                // let canvasdata = svgCanvas.toDataURL("image/png");

                // no download possible if netlist is empty or if there are syntax errors
                if (netlist === "") {
                    return;
                }

                // console.log(netlist);
                let link = document.createElement('a');
                link.setAttribute('href', 'data:text/plain;charset=utf-8,'
                    + encodeURIComponent(netlist));
                link.setAttribute('download', fileName);
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);

                if(document.getElementById("download-svg-check").checked){
                    let link = document.createElement('a');
                    link.setAttribute('href', svg)
                    link.setAttribute('download', fileName);
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                }
            }
        })

        let helpLiveDrawing = document.getElementById("help-live-drawing");
        helpLiveDrawing.addEventListener("click", () => {
            setTimeout(() => {showMessage(languageManager.currentLang.toolsPage.helpTexts.netlistComments, "info", false)},0);
        });
    }

    #updateOptionLine() {
        const doc = this.editor.getDoc();
        const firstLine = doc.getLine(0);

        const options = [];
        if (this.checkboxGeneralize.checked) options.push("--generalize");
        if (this.checkboxOptimizeMobile.checked) options.push("--optimize-mobile");
        if (this.checkboxOptimizeDesktop.checked) options.push("--optimize-desktop");
        if (this.checkBoxShownodes.checked) options.push("--shownodes-true");

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

    #setupCodeMirrorEditor() {
        // Create code mirror editor from text area, doesn't need to be appended or anything else, replaces textarea
        this.editor = CodeMirror.fromTextArea(document.getElementById("live-drawing-input-area"), {
            lineNumbers: true
        });
        let editor = this.editor;

        setupKeystrokeCounter(editor);

        // Disable editor while pyodide not loaded
        editor.setOption("readOnly", "nocursor");
        let editorHtmlElement = document.getElementsByClassName("CodeMirror")[0];
        editorHtmlElement.style.backgroundColor = "lightgray"; // is set to white on enableNetlistEditor()
        editorHtmlElement.style.border = `1px solid ${colors.current.foreground}`;

        // Additionally to CSS settings
        let codeMirror = document.getElementsByClassName("CodeMirror")[0];
        codeMirror.classList.add("mx-auto");

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
                let [isValidSyntax, svgData, errMsgs, warnMsgs] = await state.apis.pyodide.forceDrawing(input, paramMap, optionsString);

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
                        li.style.color = colors.definitions.syntaxErrorRed;
                        let lineNumber = parseInt(msg.split("line ")[1].split(":")[0]); // line number without comments
                        let lineNumberWithComment = lineNumber + commentOffset; // line number with comments
                        // Careful, line number is 1 based, but editor is 0 based, so -1
                        editor.addLineClass(lineNumberWithComment - 1, "background", "error-line-highlight");
                        let msgWithAdaptedLineNumer = msg.replace(/line \d+/, `line ${lineNumberWithComment}`);
                        li.innerHTML = msgWithAdaptedLineNumer;
                    } else if (msg.includes("warning, drawing hint missing on line")) {
                        li.style.color = colors.definitions.warningOrange;
                        let lineNumber = parseInt(msg.split("line ")[1].split(":")[0]);
                        let lineNumberWithComment = lineNumber + commentOffset;
                        // Careful, line number is 1 based, but editor is 0 based, so -1
                        editor.addLineClass(lineNumberWithComment - 1, "background", "warning-line-highlight");
                        let msgWithAdaptedLineNumer = msg.replace(/line \d+/, `line ${lineNumberWithComment}`);
                        li.innerHTML = msgWithAdaptedLineNumer;
                    } else {
                        li.style.color = colors.current.foreground;
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
                drawingFieldDiv.innerHTML = "";
                svgData = new SvgMagician(svgData).onlyElementLabels();
                svgData.setSvgWidthTo(90);
                let svg = drawingFieldDiv.querySelector("svg");
                if (svg){
                    svg.replaceWith(svgData.element);
                }
                else{
                    drawingFieldDiv.appendChild(svgData.element);
                }

            }, timeout);
        });
    }

    afterPyodideLoaded() {
        // Netlist progress bar
        let div = document.getElementById("drawing-field-div");
        if (div) {
            div.innerHTML = languageManager.currentLang.toolsPage.startTyping; // Replace pgr bar with text
        }
        let editor = document.getElementsByClassName("CodeMirror")[0];
        if (editor) {
            editor.style.backgroundColor = "white";
            editor.CodeMirror.setOption("readOnly", false);
        }
        // Enable checkboxes
        let checkboxes = document.querySelectorAll(".form-check-input.netlist-comment");
        checkboxes.forEach(checkbox => {
            checkbox.disabled = false;
        });
        this.pyodideReady = true;
    }
}

