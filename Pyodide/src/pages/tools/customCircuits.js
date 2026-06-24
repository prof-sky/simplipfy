class CustomCircuits extends Content{
    /** @type {HTMLDivElement} */
    selectorDivElement;
    /** @type {Selector | null} */
    selector;
    heading = languageManager.currentLang.toolsPage.customCircuitsHeading;

    constructor() {
        let idLangMap = new Map([
            ["custom-circuit-help-btn", () => languageManager.currentLang.toolsPage.helpBtn],
            ["description-label-custom-circuiterator", () => languageManager.currentLang.toolsPage.customCircuitsText],
            ["load-custom-circuits-btn-span", () => languageManager.currentLang.toolsPage.loadZip]
        ])
        super(idLangMap, "custom-circuit-accordion-item");
    }

    get html(){
        return `
        <button class="btn btn-outline-warning mx-auto my-1" style="color: ${colors.current.headingForeground}; cursor: pointer;" id="custom-circuit-help-btn">${languageManager.currentLang.toolsPage.helpBtn}</button>
        <p id="description-label-custom-circuiterator" >${languageManager.currentLang.toolsPage.customCircuitsText}</p>
        <input id="zip-dir-upload-input" type="file" accept=".zip" class="form-control mx-auto" style="
                    width: fit-content; max-width: 350px;
                    color: ${colors.current.foreground}; background-color: ${colors.current.bsBackground};"/>
        <button id="load-custom-circuits-btn" type="button" class="btn btn-warning circuitStartBtn my-3 disabled load-btn">
            <div class="fill-layer"></div>
            <div class="progress-stripes"></div>    
            <span id="load-custom-circuits-btn-span" class="button-text">${languageManager.currentLang.toolsPage.loadZip}</span>
        </button>
        `
    }

    setup() {
        if (this.isSetUp === true) return;

        let accCustomCircuitsItem = document.createElement("div");
        accCustomCircuitsItem.id = this.mainID;
        accCustomCircuitsItem.innerHTML = this.html;
        this.isSetUp = true;

        return accCustomCircuitsItem;
    }

    updateLang() {
        super.updateLang();
        if (this.selector) this.selector.updateLang();

        this.heading = languageManager.currentLang.toolsPage.customCircuitsHeading;
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
            if (state.backendReady) {
                btn.classList.remove("disabled");
            }
            document.getElementById("upload-note")?.remove();
        });

        helpBtn.addEventListener("click", () => {
            UserMessage.info(languageManager.currentLang.toolsPage.helpTexts.customCircuits, "", false);
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
            UserMessage.warning(languageManager.currentLang.alerts.noDirSelected);
            return;
        }

        try {
            // Clear accordion
            let accordion = document.getElementById(this.mainID).querySelector('.accordion');
            if (accordion) {
                accordion.remove();
            }
            customFiles = new CustomUserFiles();
            await customFiles.init();

            this.selector = new Selector(customFiles, ToolsPage);
            this.selectorDivElement = this.selector.setup();

            document.getElementById(this.mainID).appendChild(this.selectorDivElement);

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
