class Spinner extends Content {
    constructor() {
        let idLangMap = new Map([
            ["loading-page-spinner-text", () => languageManager.currentLang.loadingPage.note]
        ])
        super(idLangMap, "loading-page-spinner");
    }

    get html(){
        return `
        <div id="${this.mainID}" class="mt-2">
            <div class="spinner-border text-warning" role="status">
                <span class="visually-hidden">Loading...</span>
            </div>
            <p id="loading-page-spinner-text" style="color: ${colors.current.foreground}">${languageManager.currentLang.loadingPage.note}</p>
        </div>
        `;
    }

    updateColor() {
        document.getElementById('loading-page-spinner-text').style.color = colors.current.foreground
    }

    setup() {
        let template = document.createElement("template");
        template.innerHTML = this.html.trim();

        return template.content.firstElementChild;
    }
}
