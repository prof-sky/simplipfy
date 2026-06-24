class SimplifierStep extends Content {
    /** @type {Array<SimplifierStepContent>} */
    content;
    /** @type {HTMLDivElement} */
    element;

    /**
     * @param mainId {string}
     * @param [idLangMap=new Map()] {Map<string, function>} {@link Content.idLangMap} map of id and associated language string
     * @param args {Array<SimplifierStepContent>}
     */
    constructor(mainId, args, idLangMap = new Map()){
        super(idLangMap, mainId);
        this.content = args;
        this.element = document.createElement("div");
        this.element.setAttribute("id", mainId);

        for (let element of args){
            this.element.appendChild(element.setup());
        }
    }

    setup() {
        return this.element;
    }
}