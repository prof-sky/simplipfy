class ProgressBar extends Content {
    constructor() {
        let idLangMap = new Map([

        ])
        super(idLangMap, "pgr-bar-container");
    }

    get html(){
        return `
        <div id="${this.mainID}" class="circuitStartBtn mx-auto mt-3" style="height: 10px; width: 75%">
            <div class="fill-layer"></div>
            <div class="progress-stripes"></div>
        </div>
        `;
    }

    setup() {
        let template = document.createElement("template");
        template.innerHTML = this.html.trim();

        return template.content.firstElementChild;
    }
}