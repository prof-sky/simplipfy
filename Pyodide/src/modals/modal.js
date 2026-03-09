class ConfigurableModal extends FunctionsInterface{
    bootstrapModal
    modalDiv
    #id
    #size

    constructor(id, size="sm") {
        super();
        this.#size = size
        this.#id = id

        let modal = document.createElement("template");
        modal.innerHTML = this.html.trim();
        this.modalDiv = document.body.appendChild(modal.content.firstElementChild);

        this.bootstrapModal = new bootstrap.Modal(this.modalDiv)
    }

    get html()
    {
        return `
        <div class="modal modal-${this.#size} fade" id=${this.#id} tabindex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true">
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header justify-content-center">test</div>
                    <div class="modal-body">test</div>
                    <div class="modal-footer justify-content-center">test</div> 
                </div>
            </div>
        </div>
        `;
    }

    /** @returns HTMLDivElement */
    get header(){
        return this.modalDiv.querySelector(".modal-header");
    }

    /** @returns HTMLDivElement */
    get body(){
        return this.modalDiv.querySelector(".modal-body");
    }

    /** @returns HTMLDivElement */
    get footer(){
        return this.modalDiv.querySelector(".modal-footer");
    }

    resetModal(){
        this.header.replaceChildren();
        this.body.replaceChildren();
        this.footer.replaceChildren();
    }

    /** @param content {ModalContent} */
    show(content) {
        this.resetModal();
        this.header.appendChild(content.header)
        this.body.appendChild(content.body);
        this.footer.appendChild(content.footer);
        this.updateColor();
        this.bootstrapModal.show();
    }

    hide() {
        this.bootstrapModal.hide();
    }

    //interface implementation

    updateColor() {
        /** @type HTMLElement */
        let content = this.modalDiv.querySelector(".modal-content");
        content.style.color = colors.current.foreground;
        content.style.backgroundColor = colors.current.bsBackground;
        content.style.border = `1px solid ${colors.current.foreground}`;
    }

    updateLang() {

    }

    afterPyodideLoaded() {
        this.body.querySelectorAll(".circuitStartBtnModal").forEach(btn => btn.disabled = false);
    }

    addEventListeners() {

    }

    setupEasterEggs() {

    }

    setup(){
        return new DocumentFragment()
    }
}