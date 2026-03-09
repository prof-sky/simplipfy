class SubstitutionFormula extends Content{
    constructor() {
        let idLangMap = new Map([
            ["substitutionTableHeading", () => languageManager.currentLang.cheatSheetPage.subTableHeading],
            ["seriesHeading", () => languageManager.currentLang.cheatSheetPage.subTableSeriesHeading],
            ["parallelHeading", () => languageManager.currentLang.cheatSheetPage.subTableParallelHeading],
            ["subTableResHeading", () => languageManager.currentLang.cheatSheetPage.resistorRowHeading],
            ["subTableCapHeading", () => languageManager.currentLang.cheatSheetPage.capacitorRowHeading],
            ["subTableIndHeading", () => languageManager.currentLang.cheatSheetPage.inductorRowHeading],
	        ["resistorHeading", () => languageManager.currentLang.cheatSheetPage.resistorHeading],
	        ["capacitorHeading", () => languageManager.currentLang.cheatSheetPage.capacitorHeading],
	        ["inductorHeading", () => languageManager.currentLang.cheatSheetPage.inductorHeading],
	        ["subResistorText", () => languageManager.currentLang.cheatSheetPage.subResistorText],
	        ["subCapacitorText", () => languageManager.currentLang.cheatSheetPage.subCapacitorText],
	        ["subInductorText", () => languageManager.currentLang.cheatSheetPage.subInductorText],
	        ["subHeading",()=>languageManager.currentLang.cheatSheetPage.explanationHeading],
        ])
        super(idLangMap, "cheatSheet-substitutionFormula");
    }

    get html() {
        return `
        <div id=${this.mainID} class="container-fluid pb-3 mb-3" style="max-width: 600px;">
            <p id="substitutionTableHeading" class="big-heading">${languageManager.currentLang.cheatSheetPage.subTableHeading}</p>
            <div class="table-responsive">
                <table class="table table-dark">
                    <thead>
                    <tr>
                        <th scope="col" id=""></th>
                        <th scope="col" id="seriesHeading">${languageManager.currentLang.cheatSheetPage.subTableSeriesHeading}</th>
                        <th scope="col" id="parallelHeading">${languageManager.currentLang.cheatSheetPage.subTableParallelHeading}</th>
                    </tr>
                    </thead>
                    <tbody>
                    <tr>
                        <th scope="row" id="subTableResHeading">${languageManager.currentLang.cheatSheetPage.resistorRowHeading}</th>
                        <td id="resistorSeries">$$R = R1 + R2 + \\dots$$</td>
                        <td id="resistorParallel">$$\\frac{1}{R} = \\frac{1}{R1} + \\frac{1}{R2} + \\dots$$</td>
                    </tr>
                    <tr>
                        <th scope="row" id="subTableCapHeading">${languageManager.currentLang.cheatSheetPage.capacitorRowHeading}</th>
                        <td id="capacitorSeries">$$\\frac{1}{C} = \\frac{1}{C1} + \\frac{1}{C2} + \\dots$$</td>
                        <td id="capacitorParallel">$$C = C1 + C2 + \\dots$$</td>
                    </tr>
                    <tr>
                        <th scope="row" id="subTableIndHeading">${languageManager.currentLang.cheatSheetPage.inductorRowHeading}</th>
                        <td id="inductorSeries">$$L = L1 + L2 + \\dots$$</td>
                        <td id="inductorParallel">$$\\frac{1}{L} = \\frac{1}{L1} + \\frac{1}{L2} + \\dots$$</td>
                    </tr>
                    </tbody>
                </table>
            </div>
            
            <div 
                class="accordion accordion-flush m-5 mx-auto" 
                style="width: 100%">
                <div class="accordion-item">
				    <h2 class="accordion-header" style="width: 100%">
				    <button 
				        id="subHeading" 
				        class="accordion-button collapsed" 
				        type="button" 
				        data-bs-toggle="collapse" 
				        data-bs-target="#subExpanation" 
				        aria-expanded="false" 
				        aria-controls="subExpanation"
				        style="
				            color: ${colors.current.foreground}; 
				            background-color: ${colors.current.bsBackground}; 
				            position: relative;
				            ">
				        ${languageManager.currentLang.cheatSheetPage.explanationHeading}
				    </button>
				    </h2>
				    <div 
				        id="subExpanation" 
				        class="accordion-collapse collapse" 
				        data-bs-parent="#subHeading">
                        <div 
                            class="accordion-body"  
                            style="
						        color: ${colors.current.foreground}; 
						        background-color: ${colors.current.bsBackground};
						        width: 100%;
						        text-align: left;">
	                        <h3 id="resistorHeading">${languageManager.currentLang.cheatSheetPage.resistorHeading}</h3>     
				            <p id="subResistorText">${languageManager.currentLang.cheatSheetPage.subResistorText}</p>
				            <h3 id="capacitorHeading">${languageManager.currentLang.cheatSheetPage.capacitorHeading}</h3>
				            <p id="subCapacitorText">${languageManager.currentLang.cheatSheetPage.subCapacitorText}</p>
				            <h3 id="inductorHeading">${languageManager.currentLang.cheatSheetPage.inductorHeading}</h3>
				            <p id="subInductorText">${languageManager.currentLang.cheatSheetPage.subInductorText}</p>
				        </div>
					</div>
				</div>
            </div>             
		</div>
	`}

    setup() {
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