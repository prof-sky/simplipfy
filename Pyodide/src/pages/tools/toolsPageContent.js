class ToolsPageContent extends Content{
    /** @type {string} */
    heading;
    constructor(heading, idLangMap, mainID) {
        super(idLangMap, mainID);
        this.heading = heading;
    }
}