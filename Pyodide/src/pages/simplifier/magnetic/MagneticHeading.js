class MagneticHeading extends Content {
    constructor() {
        let idLangMap = new Map([
            ["heading", () => languageManager.currentLang.magnetic.assignment],
        ])
        super(idLangMap, "magnetic-heading");
    }

    get html(){
        return `
        <h5 id="heading" style="color: ${colors.current.svgStrokeColor}">${languageManager.currentLang.magnetic.assignment}</h5>
        `
    }

    setup() {
        let headingItem = document.createElement("div");
        headingItem.id = this.mainID;
        headingItem.innerHTML = this.html
        this.isSetUp = true;
        return headingItem;
    }
}