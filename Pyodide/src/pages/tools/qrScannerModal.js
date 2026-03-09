class QrScannerModal extends InfoModal{
    get headerElement() {
        return this.parseHTML(`<h5 class="modal-title">${languageManager.currentLang.simplifier.infoGifHeading}</h5>`)
    }

    get bodyElement() {
        return this.parseHTML(`
        <p class="text-center">${languageManager.currentLang.toolsPage.helpTexts.qrCodeScan}</p>
        <img loading="lazy" class="img-fluid rounded mx-auto d-block" src="./src/resources/tools/qrScanner.gif" alt="click on two elements and then on check to simplify these two elements">`
        )
    }
}