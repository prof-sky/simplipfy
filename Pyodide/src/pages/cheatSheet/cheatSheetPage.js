/**
 * Displays formulas and explanations to the topics needed on the simplipfy.org page
 * @extends Page
 */
class CheatSheetPage extends Page{
    constructor() {
        let content = {
            substitutionFormula: new SubstitutionFormula(),
            complexImpedance: new ComplexImpedance(),
            wheatstoneBridge: new WheatstoneBridge(),
	        kirchhoffLaw: new KirchhoffLaw(),
        }
        // <pageName>-page-container (id of div on index.htlm)
        super(content, "cheat-sheet-container", "CheatSheetPage");
    }

    setup() {
        if (!super.beforeSetup()) return;
        let cheatSheetPage = document.getElementById(this.id);
        cheatSheetPage.appendChild(this.content.substitutionFormula.setup());
        cheatSheetPage.appendChild(this.content.complexImpedance.setup());
        cheatSheetPage.appendChild(this.content.wheatstoneBridge.setup());
	    cheatSheetPage.appendChild(this.content.kirchhoffLaw.setup());

        super.afterSetup();
        this.initialize();
    }

    updateLang() {
        super.updateLang();
        MathJax.typesetPromise();
    }

    setupEasterEggs() {
        addIDeclareMeme();
    }
}