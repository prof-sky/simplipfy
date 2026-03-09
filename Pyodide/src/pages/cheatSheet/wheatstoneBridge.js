class WheatstoneBridge extends Content{
    constructor() {
        let idLangMap = new Map([
            ["wheatstoneFormulaHeading", () => languageManager.currentLang.cheatSheetPage.wheatstoneFormulaHeading],
            ["wheatstoneFormula", () => `$$${languageManager.currentLang.simplifier.voltageSymbol}q \\cdot \\left(\\frac{R2}{R1 + R2} - \\frac{R4}{R3 + R4}\\right) = ${languageManager.currentLang.simplifier.voltageSymbol}m$$`],
	        ["wheatstoneText",()=>languageManager.currentLang.cheatSheetPage.wheatstoneText],
	        ["wheatHeading",()=>languageManager.currentLang.cheatSheetPage.explanationHeading],
        ])
        super(idLangMap, "cheatSheet-wheatstoneBridge");
    }
	currentVoltage = languageManager.currentLang.simplifier.voltageSymbol;
    get html(){
        return `
        <div id=${this.mainID} class="container-fluid pb-3 mb-3" style="max-width: 600px;">
            <p id="wheatstoneFormulaHeading" class="big-heading">${languageManager.currentLang.cheatSheetPage.wheatstoneFormulaHeading}</p>
            <p id="wheatstoneFormula" style="color:${colors.current.foreground}">$$${this.currentVoltage}q \\cdot \\left(\\frac{R2}{R1 + R2} - \\frac{R4}{R3 + R4}\\right) = ${this.currentVoltage}m$$</p>
			
			<div 
                class="accordion accordion-flush m-5 mx-auto" 
                style="width: 100%">
                <div class="accordion-item">
				    <h2 class="accordion-header" style="width: 100%">
				    <button 
				        id="wheatHeading" 
				        class="accordion-button collapsed" 
				        type="button" 
				        data-bs-toggle="collapse" 
				        data-bs-target="#wheatExpanation" 
				        aria-expanded="false" 
				        aria-controls="wheatExpanation"
				        style="
				            color: ${colors.current.foreground}; 
				            background-color: ${colors.current.bsBackground}; 
				            position: relative;
				            ">
				        ${languageManager.currentLang.cheatSheetPage.explanationHeading}
				    </button>
				    </h2>
				    <div 
				        id="wheatExpanation" 
				        class="accordion-collapse collapse" 
				        data-bs-parent="#wheatHeading">
                        <div 
                            class="accordion-body"  
                            style="
						        color: ${colors.current.foreground}; 
						        background-color: ${colors.current.bsBackground};
						        width: 100%;
						        text-align: left;">
						        <p id="wheatstoneText"> ${languageManager.currentLang.cheatSheetPage.wheatstoneText} </p>
	                        </div>
					</div>
				</div>
            </div> 
        </div>
         `
    }

    setup() {
        /** @type {HTMLTemplateElement} */
        let template = document.createElement("template");
        template.innerHTML = this.html.trim();

        return template.content.firstElementChild
    }

    updateColor() {
        const formula = document.getElementById("pRX");
        formula.style.color = colors.current.foreground;
        const wheatFormula = document.getElementById("wheatstoneFormula");
        wheatFormula.style.color = colors.current.foreground;
        const button = document.getElementById(this.mainID).querySelector(".accordion-button");
        if (button) {
            button.style.color = colors.current.foreground;
            button.style.backgroundColor = colors.current.bsBackground;
        }
        const body = document.getElementById(this.mainID).querySelector(".accordion-body");
        if (body) {
            body.style.color = colors.current.foreground;
            body.style.backgroundColor = colors.current.bsBackground;
        }
    }
}