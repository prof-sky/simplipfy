class MagneticValues extends Content {
    mFlux =[];
    mmf=[];
    mResistance=[];
    mFluxDensity=[];


    constructor() {
        let idLangMap = new Map([
            ["heading", () => languageManager.currentLang.magnetic.assignment],
        ])
        super(idLangMap, "magnetic-footer");
    }

    setup() {
        let footerItem = document.createElement("div");
        footerItem.id = this.mainID;
        footerItem.innerHTML = this.html
        this.isSetUp = true;
        return footerItem;
    }

}
