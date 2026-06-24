class MagneticFooter extends Content {
    constructor() {
        let idLangMap = new Map([
            ["heading", () => languageManager.currentLang.magnetic.assignment],
        ])
        super(idLangMap, "magnetic-footer");
    }

    get html() {
        return `
        <button id="next-circuit-btn" class="btn btn-warning mt-3 mx-auto">${languageManager.currentLang.simplifier.nextCircuit}</button>
        `
    }

    setup() {
        let footerItem = document.createElement("div");
        footerItem.id = this.mainID;
        footerItem.innerHTML = this.html
        this.isSetUp = true;
        return footerItem;
    }
    addEventListeners() {
        let nextCBtn = document.getElementById("next-circuit-btn");

        // nextCBtn.addEventListener("click", () => {
        //
        // })
    }
}
