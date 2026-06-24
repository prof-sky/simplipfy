class TaskAccordeon extends Content{
    /** @type {Selector} */
    selector = null
    /** @type {SelectEasterEggs} */
    easterEggs = null

    constructor() {
        let idLangMap = new Map([

        ])
        super(idLangMap, "selector-accordion");
        this.selector = new Selector(serverFiles, SelectPage)
        this.easterEggs = new SelectEasterEggs()
    }

    setup() {
        return this.selector.setup();
    }

    async init(){
        await this.selector.init();
    }

    updateLang() {
        let accordionHeadings = serverFiles.circuitSets;
        this.selector.updateLang(accordionHeadings);
    }

    updateColor() {
        this.selector.updateColor();
    }

    setupEasterEggs(touchScreen) {
        let ids = window.definitions.selectorIDs
        this.easterEggs.addResHeadingEasterEgg(this.selector.items.get(ids.resistor).querySelector(".accordion-header"));
        this.easterEggs.addCapHeadingEasterEgg(this.selector.items.get(ids.capacitor).querySelector(".accordion-header"));
        this.easterEggs.addIndHeadingEasterEgg(this.selector.items.get(ids.inductor).querySelector(".accordion-header"));
    }
}

class SelectEasterEggs {
    addResHeadingEasterEgg(resHeading) {
        if (!resHeading) return;
        let pressStart = 0;
        const holdTime = 3000;

        resHeading.addEventListener("mousedown", () => {
            pressStart = setTimeout(() => {
                ragingThor("./src/resources/eastereggs/resisthor.png");
            }, holdTime);
        });

        resHeading.addEventListener("mouseup", () => {
            clearTimeout(pressStart);
        });

        resHeading.addEventListener("touchstart",  () =>{
            pressStart = setTimeout(() =>{
                ragingThor("./src/resources/eastereggs/resisthor.png");
            },holdTime)
        });
        resHeading.addEventListener("touchmove",  () => {
            clearTimeout(pressStart);
        });

        document.addEventListener("touchend",  () => {
            clearTimeout(pressStart);
        });

        document.addEventListener("touchcancel",  () => {
            clearTimeout(pressStart);
        });
    }

    addCapHeadingEasterEgg(capHeading) {
        if (!capHeading) return;
        let pressStart = 0;
        const holdTime = 3000;

        capHeading.addEventListener("mousedown", () => {
            pressStart = setTimeout(() => {
                ragingThor("./src/resources/eastereggs/capacithor.png");
            }, holdTime);
        })

        capHeading.addEventListener("mouseup", () => {
            clearTimeout(pressStart);
        })

        capHeading.addEventListener("touchstart",  () =>{
            pressStart = setTimeout(() =>{
                ragingThor("./src/resources/eastereggs/capacithor.png");
            },holdTime)
        })

        capHeading.addEventListener("touchmove",  () => {
            clearTimeout(pressStart);
        });

        document.addEventListener("touchend",  () => {
            clearTimeout(pressStart);
        });

        document.addEventListener("touchcancel",  () => {
            clearTimeout(pressStart);
        });
    }

    addIndHeadingEasterEgg(indHeading) {
        if (!indHeading) return;
        let pressStart = 0;
        const holdTime = 3000;

        indHeading.addEventListener("mousedown", () => {
            pressStart = setTimeout(() => {
                ragingThor("./src/resources/eastereggs/inducthor.png");
            }, holdTime);
        })

        indHeading.addEventListener("mouseup", () => {
            clearTimeout(pressStart);
        })

        indHeading.addEventListener("touchstart",() =>{
            pressStart = setTimeout(() =>{
                ragingThor("./src/resources/eastereggs/inducthor.png");
            },holdTime)
        })

        indHeading.addEventListener("touchmove",() => {
            clearTimeout(pressStart);
        });

        document.addEventListener("touchend", () => {
            clearTimeout(pressStart);
        });

        document.addEventListener("touchcancel", () => {
            clearTimeout(pressStart);
        });
    }
}