class TaskManager extends FunctionsInterface {
    /** @type {Array<SimplifierStep>} */
    steps

    /**
     *
     * @param args {Array<Content>}
     */
    constructor(args){
        super()
    }

    /** @param step {SimplifierStep} */
    addStep(step){
        this.steps.push(step)
        SimplifierPage.contentDiv.appendChild(step.element)
    }

    addEventListeners() {
    }

    setup() {
        return SimplifierPage.contentDiv;
    }

    setupEasterEggs() {
    }

    updateColor() {
    }

    updateLang() {
    }

    afterPyodideLoaded() {
    }
}