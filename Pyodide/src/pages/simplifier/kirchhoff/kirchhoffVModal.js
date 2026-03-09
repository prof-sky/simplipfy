class KirchhoffVModal extends InfoModal{
    get headerElement() {
        return this.parseHTML(`<h5>${languageManager.currentLang.kirchhoff.VInfoGifHeading}</h5>`)
    }

    get bodyElement() {
        return this.parseHTML(`
        <p class="text-center">${languageManager.currentLang.kirchhoff.VInfoGifText}</p>
        <img loading="lazy" class="img-fluid rounded mx-auto d-block" src="./src/resources/simplifier/kirchhoff_v.gif" alt="select voltages in loops">`)
    }
}