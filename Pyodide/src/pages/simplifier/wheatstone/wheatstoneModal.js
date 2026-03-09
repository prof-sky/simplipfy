class WheatstoneModal extends InfoModal{
    get headerElement() {
        return this.parseHTML(`<h5>${languageManager.currentLang.wheatstone.infoGifHeading}</h5>`)
    }

    get bodyElement() {
        return this.parseHTML(`<p class="text-center">${languageManager.currentLang.wheatstone.infoGifText}</p>`)
    }
}