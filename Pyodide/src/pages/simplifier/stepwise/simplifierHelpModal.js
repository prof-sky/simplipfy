class SimplifierInfoModal extends InfoModal {
    get headerElement(){
        return this.parseHTML(`<h5 class="modal-title">${languageManager.currentLang.simplifier.infoGifHeading}</h5>`)
    }

    get bodyElement(){
        return this.parseHTML(`
        <img loading="lazy" class="img-fluid rounded mx-auto d-block" src="./src/resources/simplifier/simplifier.gif" alt="click on two elements and then on check to simplify these two elements">
        <p id="info-gif-text" class="text-center">${languageManager.currentLang.simplifier.infoGifText}</p>`
        )
    }
}