class MagneticExplanation extends ReusableContent {
    constructor() {
        let idLangMap = new Map([])
        super(idLangMap, "magnetic-explanation");
    }

    get html(){
        return `
        <div>
        
        </div>
        `
    }

    setup() {
        let bodyItem = document.createElement("div");
        bodyItem.id = this.mainID;
        bodyItem.innerHTML = this.html
        this.isSetUp = true;
        return bodyItem;
    }
    addEventListeners() {}

}