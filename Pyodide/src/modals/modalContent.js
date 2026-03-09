class ModalContent {
    /** @type {HTMLElement} */
    header
    /** @type {HTMLElement} */
    body
    /** @type {HTMLElement} */
    footer
    id = ConfigurableModal.id;
    /** @type {string} */
    name

    /** @type {Map<string, *>} */
    params = new Map()

    /** @virtual */
    get headerElement() {

    }

    /** @virtual */
    get bodyElement() {

    }

    /** @virtual */
    get footerElement() {

    }

    /**
     * @param html {string}
     * @returns {DocumentFragment} */
    parseHTML(html){
        const tpl = document.createElement("template");
        tpl.innerHTML = html.trim();
        return tpl.content;
    }

    get name(){
        return this.constructor.name;
    }

    /**
     * @param params {Map<string, *> | undefined} saved to this.params
     * */
    constructor(params = undefined) {
        this.params = params;
        this.header = this.headerElement;
        this.body = this.bodyElement;
        this.footer = this.footerElement;
    }
}