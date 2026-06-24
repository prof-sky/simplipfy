/**
 * Page where tasks are solved that involve simplifying a circuit stepwise (with series and parallel relations).
 * Those circuits can consist of resistors, capacitors, inductors or a mixture of those. The circuits could be
 * symbolic but that get pretty ugly fast (unreadable)
 * @extends SimplifierPage
 */
class StepwisePage extends SimplifierPage{
    constructor() {
        let content = {
        }
        // <pageName>-page-container (id of div on index.htlm)
        super(content, "Stepwise", "");
    }

    /** @returns {Promise<boolean>} */
    static async lastStep(){
        return !(await state.solvers.stepwise.canSimplifyCpts())
    }

    setup() {
        //todo see if base implementation does exactly this
        if (!super.beforeSetup()) return;
        super.afterSetup();
    }

    async reset(calledFromResetBtn = false){
        this.invalidate();
        SimplifierPage.clear();
        state.valuesShown = new Map();
        state.selectedElements = [];
        state.pictureCounter = 0;
        state.allValuesMap = new Map();
        scrollBodyToTop();
        await state.apis.drawingConfig.unlock("# --generalize-false");
    }

    async initialize(){
        if (!super.beforeInit) return
        //setup of content
        try{
            if (!state.backendReady &&
                !(state.currentCircuitMap.selectorGroup === window.definitions.selectorIDs.quickstart)) {
                console.warn("stepwise solver called before init")
                return;
            }
            this.reset()

            await createAndShowStep0(state.currentCircuitMap);
            //The div element that contains the SVG representation of the circuit diagram.
            const svgDiv = document.querySelector('.svg-container');
            //The div element that contains the list of elements that have been clicked or selected in the circuit diagram.
            const nextElementsContainer = document.querySelector('.next-elements-container');
            if (svgDiv && nextElementsContainer) {
                resetNextElements(svgDiv, nextElementsContainer);
            }
            super.afterInit();
        }
        catch (error) {
            console.trace(error)
            UserMessage.error(error);
        }
    }
}