/**
 * Page where Magnetic tasks are solved
 * @extends SimplifierPage
 */
class MagneticPage extends SimplifierPage{
    constructor() {
        let content = {
            "header": new MagneticHeading(),
            "circuitContainer": new MagneticCircuitContainer(),
            "explanation": new MagneticExplanation(),
            "nextElements": new MagneticNextElements(),
            "solution": new MagneticSolution(),
            "footer": new MagneticFooter(),
            "values": new MagneticValues(),
        }
        super(content, "MagneticPage");
    }

    setup() {
        if (!super.beforeSetup()) return;
        this.content.circuitContainer.changeElement = (classname) => this.changeElementOnList(classname);
        this.content.nextElements.onTranslate = (toTranslate) => this.translateElements(toTranslate);
        //after content is added to page
        super.afterSetup();
    }

    async initialize() {
        if (!super.beforeInit()) return;
        SimplifierPage.contentDiv.appendChild(this.content.header.setup());
        SimplifierPage.resetSolvers();
        // await state.solvers.magnetic.reset();
        // await state.solvers.magnetic.init(state.currentCircuitMap)
        SimplifierPage.contentDiv.appendChild(this.content.circuitContainer.setup());
        SimplifierPage.contentDiv.appendChild(this.content.nextElements.setup());

        super.afterInit();
    }

    reset() {
        this.initializationStarted = false;
        this.isInitialized = false;
    }

    changeElementOnList(classname) {
        this.content.nextElements.changeElementOnList(classname);
    }

    translateElements(toTranslate){
        //
        // let result = await state.solvers.magnetic.check(state.selectedElements);
        //
        // if (!result.success) {
        //     setTimeout(() => {
        //         showMessage(languageManager.currentLang.alerts.canNotSimplify, "error",)
        //     }, 0);
        //     return;
        // }

        this.addNextStep(toTranslate);
    }

    addNextStep(toTranslate) {
        this.content.circuitContainer.disable();

        let newExplanation = new MagneticExplanation();
        SimplifierPage.contentDiv.appendChild(newExplanation.setup());

        let newCircuit = new MagneticCircuitContainer();
        newCircuit.changeElement = (classname) => this.changeElementOnList(classname);
        SimplifierPage.contentDiv.appendChild(newCircuit.setup(toTranslate));
        this.content.circuitContainer = newCircuit; // update the reference

        SimplifierPage.contentDiv.appendChild(this.content.nextElements.root);

        this.content.nextElements.clearList();
    }

    resetBtn() {

    }

    afterPyodideLoaded() {

    }
}