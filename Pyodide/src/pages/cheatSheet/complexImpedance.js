class ComplexImpedance extends Content{
    constructor() {
        let idLangMap = new Map([
            ["resistanceReactanceTableHeading", () => languageManager.currentLang.cheatSheetPage.resReaTableHeading],
            ["resistance", () => languageManager.currentLang.cheatSheetPage.resistanceColHeading],
            ["reactance", () => languageManager.currentLang.cheatSheetPage.reactanceColHeading],
            ["resistor", () => languageManager.currentLang.cheatSheetPage.resistorRowHeading],
            ["capacitor", () => languageManager.currentLang.cheatSheetPage.capacitorRowHeading],
            ["inductor", () => languageManager.currentLang.cheatSheetPage.inductorRowHeading],
	        ["complexText", () => languageManager.currentLang.cheatSheetPage.complexText],
	        ["complexHeading",()=>languageManager.currentLang.cheatSheetPage.explanationHeading],

        ])
        super(idLangMap, "cheatSheet-complexImpedance");
    }

    get html(){
        return `
        <div id=${this.mainID} class="container-fluid pb-3 mb-3" style="max-width: 600px;">
            <p id="resistanceReactanceTableHeading" class="big-heading">${languageManager.currentLang.cheatSheetPage.resReaTableHeading}</p>
            <div class="table-responsive">
                <table class="table table-dark">
                    <thead>
                    <tr>
                        <th scope="col"></th>
                        <th scope="col" id="resistance">${languageManager.currentLang.cheatSheetPage.resistanceColHeading}</th>
                        <th scope="col" id="reactance">${languageManager.currentLang.cheatSheetPage.reactanceColHeading}</th>
                    </tr>
                    </thead>
                    <tbody>
                    <tr>
                        <th scope="row" id="resistor">${languageManager.currentLang.cheatSheetPage.resistorRowHeading}</th>
                        <td id="resistorResistance">$$R$$</td>
                        <td id="resistorReactance">$$0$$</td>
                    </tr>
                    <tr>
                        <th scope="row" id="capacitor">${languageManager.currentLang.cheatSheetPage.capacitorRowHeading}</th>
                        <td id="capacitorResistance">$$0$$</td>
                        <td id="capacitorReactance">$$-\\frac{1}{ \\omega \\cdot C}$$</td>
                    </tr>
                    <tr>
                        <th scope="row" id="inductor">${languageManager.currentLang.cheatSheetPage.inductorRowHeading}</th>
                        <td id="inductorResistance">$$0$$</td>
                        <td id="inductorReactance">$$ \\omega \\cdot L$$</td>
                    </tr>
                    </tbody>
                </table>
            </div>
            <p id="pRX" style="color:${colors.current.foreground}">$$\\underline{Z} = R + j \\cdot X$$$$\\underline{Z} = R + j \\cdot (X_L + X_C)$$</p>
           
            <div 
                class="accordion accordion-flush m-5 mx-auto" 
                style="width: 100%">
                <div class="accordion-item">
				    <h2 class="accordion-header" style="width: 100%">
					    <button 
					        id="complexHeading" 
					        class="accordion-button collapsed" 
					        type="button" 
					        data-bs-toggle="collapse" 
					        data-bs-target="#complexExpanation" 
					        aria-expanded="false" 
					        aria-controls="complexExpanation"
					        style="
					            color: ${colors.current.foreground}; 
					            background-color: ${colors.current.bsBackground}; 
					            position: relative;
					            ">
					        ${languageManager.currentLang.cheatSheetPage.explanationHeading}
					    </button>
				    </h2>
				    <div 
				        id="complexExpanation" 
				        class="accordion-collapse collapse" 
				        data-bs-parent="#complexHeading">
                        <div 
                            class="accordion-body"  
                            style="
						        color: ${colors.current.foreground}; 
						        background-color: ${colors.current.bsBackground};
						        width: 100%;
						        text-align: left;
						        ">
						        <p id="complexText">${languageManager.currentLang.cheatSheetPage.complexText}</p>
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
        return template.content.firstElementChild;
    }

    updateColor() {
        const table = document.getElementById(this.mainID).querySelector(".table");
        updateBsClassesTo(colors.current.bsColorScheme, "table", table);
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