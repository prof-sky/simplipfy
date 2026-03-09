class ExplainGeneralizeModal extends InfoModal{
    get headerElement() {
        return this.parseHTML(`<h5>${languageManager.currentLang.simplifier.explanationHeading}</h5>`)
    }

    get bodyElement() {
        return this.parseHTML(`<p class="text-center">${languageManager.currentLang.simplifier.explanationGeneralized}</p>`)
    }
}