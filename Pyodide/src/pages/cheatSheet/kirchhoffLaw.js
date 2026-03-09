class KirchhoffLaw extends Content{
	constructor() {
		let idLangMap = new Map([
			["kirchhoffLawHeading", () => languageManager.currentLang.cheatSheetPage.kirchhoffLawHeading],
			["kirchhoffLawLoopHeading", () => languageManager.currentLang.cheatSheetPage.kirchhoffLawLoopHeading],
			["kirchhoffLawLoopText", () => languageManager.currentLang.cheatSheetPage.kirchhoffLawLoopText],
			["kirchhoffLawNodeHeading", () => languageManager.currentLang.cheatSheetPage.kirchhoffLawNodeHeading],
			["kirchhoffLawNodeText", () => languageManager.currentLang.cheatSheetPage.kirchhoffLawNodeText],
			["kirchHeading",()=>languageManager.currentLang.cheatSheetPage.explanationHeading],
		])
		super(idLangMap, "cheatSheet-kirchhoffLaw");
	}

	get html(){
		return `
        <div id=${this.mainID} class="container-fluid pb-3 mb-3" style="max-width: 600px;">
	        <p id="kirchhoffLawHeading" class="big-heading">${languageManager.currentLang.cheatSheetPage.kirchhoffLawHeading}</p>
			<div class="table-responsive">
		        <table class="table table-dark">
		            <thead>
		                <tr>
		                    <th scope="col" id="kirchhoffLawLoopHeading">${languageManager.currentLang.cheatSheetPage.kirchhoffLawLoopHeading}</th>
		                    <th scope="col" id="kirchhoffLawNodeHeading">${languageManager.currentLang.cheatSheetPage.kirchhoffLawNodeHeading}</th>
		                </tr>
		                </thead>
		                <tbody>
		                <tr>
		                    <td id="loopLawFormula">$$\\sum_{k=1}^{n} ${languageManager.currentLang.simplifier.voltageSymbol}_k\\ =0= -${languageManager.currentLang.simplifier.voltageSymbol}_1+${languageManager.currentLang.simplifier.voltageSymbol}_2+${languageManager.currentLang.simplifier.voltageSymbol}_3+\\dots $$</td>
		                    <td id="nodeLawFormula">$$ \\sum_{k=1}^{n} I_k\\ =0= I_{\\text{in}} - I_{\\text{out}_1} -I_{\\text{out}_2}-\\dots $$</td>
		                </tr>
		                </tbody>
		        </table>
		    </div>
	       
	        <div 
	            class="accordion accordion-flush mx-auto m-5" 
	            style="width: 100%">
	            <div class="accordion-item">
	                <h2 class="accordion-header" style="width: 100%">
	                    <button 
	                        id="kirchHeading" 
	                        class="accordion-button collapsed" 
	                        type="button" 
	                        data-bs-toggle="collapse" 
	                        data-bs-target="#kirchhoffExpanation" 
	                        aria-expanded="false" 
	                        aria-controls="kirchhoffExplanation" 
	                        style="
	                            color: ${colors.current.foreground}; 
	                            background-color: ${colors.current.bsBackground};
	                            position: relative;
	                            ">
	                        ${languageManager.currentLang.cheatSheetPage.explanationHeading}
						</button>
					</h2>
	                <div 
	                    id="kirchhoffExpanation" 
	                    class="accordion-collapse collapse" 
	                    data-bs-parent="explanationAccordion"> 
	                    <div
	                        class="accordion-body"  
                            style="
						        color: ${colors.current.foreground}; 
						        background-color: ${colors.current.bsBackground};
						        width: 100%;
						        text-align: left;
						        ">
	                        <h3 id="kirchhoffLawLoopHeading">${languageManager.currentLang.cheatSheetPage.kirchhoffLawLoopHeading}</h3>     
				            <p id="kirchhoffLawLoopText">${languageManager.currentLang.cheatSheetPage.kirchhoffLawLoopText}</p>
				            <h3 id="kirchhoffLawNodeHeading">${languageManager.currentLang.cheatSheetPage.kirchhoffLawNodeHeading}</h3>
				            <p id="kirchhoffLawNodeText">${languageManager.currentLang.cheatSheetPage.kirchhoffLawNodeText}</p>
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

	updateLang() {
		super.updateLang();
	}

	updateColor() {
		const table = document.getElementById(this.mainID).querySelector(".table");
		updateBsClassesTo(colors.current.bsColorScheme, "table", table);
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

	addEventListeners() {

	}

	afterPyodideLoaded() {

	}





}