class OverviewModal extends ModalContent {
    get headerElement(){
        return this.parseHTML(`<button type="button" class="btn btn-secondary btn-sm" data-bs-dismiss="modal" aria-label="Close">X</button>`)
    }

    get bodyElement(){
        let body = this.params.get("overviewModalBody");
        let btns = body.querySelectorAll(".circuitStartBtnModal")
        for (/** @type {HTMLButtonElement} */ let btn of btns){
            btn.disabled = !state.pyodideReady;
        }
        if (!body) {
            throw Error(`Could not find body with id "${body.id}"`);
        }
        return body
    }

    get footerElement(){
        return this.parseHTML(`
        <button id="$closeBtn" type="button" class="btn btn-secondary" data-bs-dismiss="modal">
            ${languageManager.currentLang.simplifier.closeBtn}
        </button>`)
    }
    /** @param overviewModalBody {HTMLDivElement} */
    constructor(overviewModalBody) {
        let params = new Map()
        params.set('overviewModalBody', overviewModalBody)
        super(params);
    }
}