/** @abstract */
class ReusableContent extends Content {
    static #counter = 0;
    idPrefix;
    /**
     * Creates a new ReusableContent object. This creates a unique prefix (rcc + count) and appends it before ids to
     * make them unique and therefore the content reusable.
     * @param idLangMap {IdLangMap}
     * @param mainID {string} the id of the content div, does not have to be unique
     */
    constructor(idLangMap, mainID) {
        let idPrefix = "rcc" + ReusableContent.#counter;
        super(idLangMap, idPrefix + "-" + mainID);
        this.idPrefix = idPrefix;
        ReusableContent.#counter++;
    }

    /**
     * use this function for each id set in this class to make sure ids stay unique when reusing this content.
     * @param id {string} the id of an element, is prefixed with (rcc + count) e.g. for instance 1 rcc0-<id>
     * @returns {string}
     */
    id(id){
        return this.idPrefix + "-" +id;
    }
}