/**
 * Page where Kirchhoff tasks are solved
 * @extends SimplifierPage
 */
class KirchhoffPage extends SimplifierPage{
    constructor() {
        let content = {
        }
        // <pageName>-page-container (id of div on index.htlm)
        super(content, "KirchhoffPage");
    }

    reset(calledFromResetBtn){
        this.invalidate(); // isInitialized = false
        SimplifierPage.clear();
        state.valuesShown = new Map();
        state.selectedElements = [];
        state.pictureCounter = 0;
        state.allValuesMap = new Map();
        state.doneVoltages = [];
        state.doneCurrents = [];
        state.voltEquations = [];
        state.extraLiveUsed = false;
        //resetExtraLiveModal();
        scrollBodyToTop();
        if (calledFromResetBtn) {
            pageManager.changePage(pageManager.pages.kirchhoffPage, true); // Draw the first picture again
        }
    }

    setup(){
        //todo see if base impl does this
        if (!super.beforeSetup()) return;
        super.afterSetup();
    }

    async initialize(){
        //setup of content
        if(!super.beforeInit()) return;

        try {
            this.reset()
            await initSolverObjects(state.currentCircuitMap);
            await solveFirstStep();  // to generate SVG and data
            if (this.checkForError()) return;
            await nextKirchhoffVoltStep();
        } catch (error) {
            console.trace(error)
            console.error("Error starting Kirchhoff: " + error);
            setTimeout(() => {
                showMessage(error, "error", false);
            }, 0);
            pushErrorEventMatomo(errorActions.kirchhoffStartError, error);
        }
        super.afterInit();
    }
}