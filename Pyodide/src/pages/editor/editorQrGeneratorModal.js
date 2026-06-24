class EditorTrackingModal extends ModalContent {
    constructor() {
        let idLangMap = new Map([
            //["help-generate-qr-code", () => languageManager.currentLang.toolsPage.helpBtn],
            ["editor-modal-track-btn", () => languageManager.currentLang.toolsPage.generateQrCode],
            ["editor-modal-simplifier-option", () => languageManager.currentLang.toolsPage.qrSimplifierOption],
            ["editor-modal-symbolic-option", () => languageManager.currentLang.toolsPage.qrSymbolicOption],
            ["editor-modal-kirchhoff-option", () => languageManager.currentLang.toolsPage.qrKirchhoffOption],
        ])
        super(idLangMap);
    }

    get headerElement() {
        return this.parseHTML(`<h5>${languageManager.currentLang.editorPage.modalHeader}</h5>`)
    }

    get bodyElement() {
        let values = window.definitions.qrCodeSelectorIDs
        const body = this.parseHTML(`
            <select id="editor-modal-select" class="form-select mx-auto my-2" style="width: 200px;">
                <option id="editor-modal-simplifier-option"
                        value="${values.stepwise}" selected>${languageManager.currentLang.toolsPage.qrSimplifierOption}</option>
                <option id="editor-modal-symbolic-option"
                        value="${values.symbolic}">${languageManager.currentLang.toolsPage.qrSymbolicOption}</option>
                <option id="editor-modal-kirchhoff-option"
                        value="${values.kirchhoff}">${languageManager.currentLang.toolsPage.qrKirchhoffOption}</option>
            </select>
            <button id="editor-modal-track-btn" type="button" class="btn btn-warning d-block mx-auto my-3">
                ${languageManager.currentLang.editorPage.qrModalTrackBtn}
            </button>`
        )
        body.querySelector("button").addEventListener("click", (e) => {
            const sel = document.getElementById("editor-modal-select").value
            state.trackingData = QrTrackingData.generate("EditorTracking", state.netlistForQrCode, sel);
            pageManager.waitTillReady(
                pageManager.pages.trackingPage,
                pageManager.pages.loadingPyodidePage,
                () => state.backendReady && state.solversReady
            )
            modalXl.hide();
        })

        return body
    }

    get footerElement() {
        return this.parseHTML(`<button type="button" class="btn btn-secondary" data-bs-dismiss="modal">${languageManager.currentLang.editorPage.abortBtn}</button>`)
    }
}