/**
 * This class simplifies the usage for an info modal. We interpret a Modal as an InfoModal if it only has a close
 * button and some information that is presented to the user. That means there won't be any event listeners on buttons
 * and the footer always is identical.
 *
 * @abstract */
class InfoModal extends ModalContent{
    get footerElement(){
        return this.parseHTML(`<button type="button" class="btn btn-secondary" data-bs-dismiss="modal">${languageManager.currentLang.simplifier.closeBtn}</button>`)
    }
}