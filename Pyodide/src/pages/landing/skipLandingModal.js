class SkipLandingModal extends ModalContent{
    get headerElement(){
        return this.parseHTML(`<h5>Skip Landing Page</h5>`)
    }

    get bodyElement(){
        return this.parseHTML(`<p>${languageManager.currentLang.landingPage.modalBody}</p>`)
    }

    get footerElement(){
        let footer = this.parseHTML(`<button type="button" class="btn btn-primary okBtn" data-bs-dismiss="modal">${languageManager.currentLang.landingPage.modalOk}</button>
                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal" data-dismiss="modal">${languageManager.currentLang.landingPage.modalAbort}</button>
                <button type="button" class="btn btn-secondary remindBtn" data-bs-dismiss="modal" data-dismiss="modal">${languageManager.currentLang.landingPage.modalRemindMeLater}</button>`)
        footer.querySelector(`.okBtn`).addEventListener("click", this.okBtn)
        footer.querySelector(`.remindBtn`).addEventListener("click", this.remindBtn)
        return footer
    }

    okBtn() {
        pageManager.pages.settingsPage.content.setLandingPage.setSelectPage()
    }

    remindBtn() {
        storageManager.landingPageVisits.save(-3, true)
    }
}