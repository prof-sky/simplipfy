/**
 * Page where Magnetic tasks are solved
 * @extends SimplifierPage
 */
class MagneticPage extends SimplifierPage{
    constructor() {
        let content = {
        }
        super(content, "MagneticPage");
    }

    setup() {
        if (!super.beforeSetup()) return;
        //class specific setup of content

        //after content is added to page
        super.afterSetup();
    }

    get step0(){
        /** @type {string} */
        //todo here should be the generated one
        //let svgData = state.step0Data.svgData;
        let svgData = state.step0Data.svgData;
        let simplifierSVG = new SimplifierPageSVG(svgData, "Mag");

        // First svg, set valuesShown to false
        // Also set to zero if labels contain Z because they can't be toggled
        state.valuesShown.set(simplifierSVG.div.id, false);

        // SVG Data written, now add eventListeners, only afterward because they would be removed on rewrite of svgData
        // Add button on first voltage and first current svg
        addKirchhoffInfoHelpButton(simplifierSVG.div);

        return simplifierSVG.div;
    }

    async initialize() {
        if (!super.beforeInit()) return;

        SimplifierPage.resetSolvers();
        await state.solvers.stepwise.init(state.currentCircuitMap);
        //class specific code
        state.step0Data = await state.solvers.stepwise.createStep0();
        state.currentStep = 0;

        const firstStep = Containers.Circuit
        /* todo remove this when the svg is generated correctly in backend */
        state.step0Data.svgData = await state.currentCircuitMap.svgData();
        firstStep.appendChild(this.step0);

        this.contentDiv.appendChild(firstStep);

        //let electricalElements= getElementsFromSvgContainer(document.getElementById('svgDivMag0'));
        const nextElementsContainer = Containers.NextElements

        /** @type {HTMLDivElement} */
        // The order of function-calls is important
        //makeElementsClickable(electricalElements, nextElementsContainer);
        prepareNextElementsContainer(this.contentDiv, nextElementsContainer);

        super.afterInit();
    }

    reset() {
        this.initializationStarted = false;
        this.isInitialized = false;
    }

    resetBtn() {

    }

    updateLang() {
        super.updateLang();
    }

    updateColor() {
        super.updateColor();
    }

    addEventListeners() {
        super.addEventListeners();
    }

    afterPyodideLoaded() {

    }

}