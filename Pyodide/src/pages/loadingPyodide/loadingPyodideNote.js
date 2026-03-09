class LoadingPyodideNote extends Content{
    constructor() {
        let idLangMap = new Map([
            ["loading-pyodide-note-text", () => languageManager.currentLang.loadingPyodidePage.note]
        ])
        super(idLangMap, "loading-pyodide-note");
    }

    get html(){
        return `
        <div id="${this.mainID}" class="mt-3">
            <p id="loading-pyodide-note-text">!! undefined - set with setContent method !!</p>
        </div>
        `;
    }

    setup() {
        let template = document.createElement("template");
        template.innerHTML = this.html.trim();

        return template.content.firstElementChild;
    }

    updateColor() {
        /** @type {HTMLDivElement} */
        let content = document.getElementById(this.mainID)
        content.style.color = colors.current.foreground
    }

    /** @param {LanguageString} languageString */
    setContent(languageString) {
        this.idLangMap.set("loading-pyodide-note-text", languageString)
        document.getElementById("loading-pyodide-note-text").innerHTML = languageString();
    }
}