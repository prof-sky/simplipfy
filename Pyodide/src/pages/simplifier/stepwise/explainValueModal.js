/**
 * Template how to implement a Modal
 * @extends Modal
 */
class ExplainValueModal extends InfoModal {
    get headerElement(){
        return this.parseHTML(`<h5>${languageManager.currentLang.simplifier.explanationHeading}</h5>`)
    }

    get bodyElement(){
        return this.parseHTML(`<p class="text-center">${languageManager.currentLang.simplifier.explanationValue}</p>`)
    }
}