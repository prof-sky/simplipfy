class KirchhoffIModal extends InfoModal {
    get headerElement() {
        return this.parseHTML(`<h5>${languageManager.currentLang.kirchhoff.IInfoGifHeading}</h5>`)
    }

    get bodyElement() {
        return this.parseHTML(`
        <p class="text-center">${languageManager.currentLang.kirchhoff.IInfoGifText}</p>
        <img loading="lazy" class="img-fluid rounded mx-auto d-block" src="./src/resources/simplifier/kirchhoff_i.gif" alt="select currents at nodes">`
        )
    }
}