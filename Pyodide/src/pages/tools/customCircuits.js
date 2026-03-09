class CustomCircuits extends Content{
    /** @type {HTMLDivElement} */
    selectorDivElement;
    /** @type {Selector | null} */
    selector;

    constructor() {
        let idLangMap = new Map([
            ["custom-circuit-help-btn", () => languageManager.currentLang.toolsPage.helpBtn],
            ["description-label-custom-circuiterator", () => languageManager.currentLang.toolsPage.customCircuitsText],
        ])
        super(idLangMap, "custom-circuit-accordion-item");
    }

    get html(){
        return `
        <h2 class="accordion-header" id="custom-circuit-acc-heading">
            <button id="custom-circuit-heading-btn" class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#custom-circuit-acc-collapse" aria-expanded="false" aria-controls="custom-circuit-acc-collapse">
                ${languageManager.currentLang.toolsPage.customCircuitsAccHeading}
            </button>
        </h2>
        <div id="custom-circuit-acc-collapse" class="accordion-collapse collapse" aria-labelledby="custom-circuit-acc-heading" data-bs-parent="#tool-accordion">
                <div class="accordion-body user-select-none">
                    <button class="btn btn-outline-warning mx-auto my-1" style="color: ${colors.current.headingForeground}; cursor: pointer;" id="custom-circuit-help-btn">${languageManager.currentLang.toolsPage.helpBtn}</button>
                    <p id="description-label-custom-circuiterator" >${languageManager.currentLang.toolsPage.customCircuitsText}</p>
                    <input id="zip-dir-upload-input" type="file" accept=".zip" class="form-control mx-auto" style="
                    width: fit-content; max-width: 350px;
                    color: ${colors.current.foreground}; background-color: ${colors.current.bsBackground};"/>
                    <button id="load-custom-circuits-btn" type="button" class="btn btn-warning circuitStartBtn my-3 disabled">
                        <div class="fill-layer"></div>
                        <div class="progress-stripes"></div>    
                        <span id="load-custom-circuits-btn-span" class="button-text">${languageManager.currentLang.toolsPage.loadZip}</span>
                    </button>
                </div>
        </div>
        `
    }

    setup() {
        if (this.isSetUp === true) return;

        let accCustomCircuitsItem = document.createElement("div");
        accCustomCircuitsItem.classList.add("accordion-item");
        accCustomCircuitsItem.id = this.mainID;
        accCustomCircuitsItem.innerHTML = this.html;
        this.isSetUp = true;

        return accCustomCircuitsItem;
    }

    updateLang() {
        super.updateLang();
        if (this.selector) this.selector.updateLang();

        let header = document.getElementById("custom-circuit-heading-btn");
        header.innerHTML = languageManager.currentLang.toolsPage.customCircuitsAccHeading;

        let loadBtn = document.getElementById("load-custom-circuits-btn-span");
        loadBtn.innerHTML = languageManager.currentLang.toolsPage.loadZip
    }

    updateColor() {
        if (this.selector) this.selector.updateColor();
        SvgMagician.updateSvgStrokeColor(document.getElementById(this.mainID));

        let helpBtn = document.getElementById("custom-circuit-help-btn");
        helpBtn.style.color = colors.current.foreground

        let fileInput = document.getElementById("zip-dir-upload-input");
        if (fileInput) {
            fileInput.style.backgroundColor = colors.current.bsBackground;
            fileInput.style.color = colors.current.foreground;
        }
    }

    addEventListeners() {
        let input = document.getElementById("zip-dir-upload-input")
        let btn = document.getElementById("load-custom-circuits-btn")
        let helpBtn = document.getElementById("custom-circuit-help-btn");

        btn.addEventListener("click",  async () => {
            btn.classList.add("disabled");
            await this.#uploadBtnClickedHandler();
            input.value = "";
        })

        input.addEventListener("change", (event) => {
            state.selectedZipDir = event.target.files[0];
            if (state.pyodideReady) {
                btn.classList.remove("disabled");
            }
            document.getElementById("upload-note")?.remove();
        });

        helpBtn.addEventListener("click", () => {
            setTimeout(() => {
                showMessage(languageManager.currentLang.toolsPage.helpTexts.customCircuits, "info", false);
            });
        });
    }

    enableStartBtns(){
        this.selectorDivElement.querySelectorAll(".circuitStartBtn").forEach(button => {
            button.classList.remove("disabled");
            button.style.backgroundColor = colors.definitions.keyYellow;
        })
    }

    async #uploadBtnClickedHandler() {
        if (!state.selectedZipDir) {
            setTimeout(() => {
                showMessage(languageManager.currentLang.alerts.noDirSelected, "info");
            }, 0);
            return;
        }

        try {
            // Clear accordion
            let accordion = document.getElementById(this.mainID).querySelector('.accordion');
            if (accordion) {
                accordion.remove();
            }
            customFiles = new CircuitFilesManager();
            await customFiles.initToolsPageCustomCircuits();

            this.selector = new Selector(customFiles, ToolsPage);
            this.selectorDivElement = this.selector.setup();

            let accordionDiv = document.getElementById(this.mainID);
            accordionDiv.querySelector(".accordion-body").appendChild(this.selectorDivElement);

            await this.selector.init();

            //no need to wait for pyodide loaded, button to load zip only available if pyodide is loaded
            this.enableStartBtns()

            this.updateColor();
            this.updateLang();
        } catch (err) {
            console.trace(err)
            console.error(languageManager.currentLang.alerts.errorSettingUpOwnCircuits, err);
        }
    }
}
