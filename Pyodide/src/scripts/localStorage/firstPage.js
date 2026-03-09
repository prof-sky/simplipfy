class FirstPage extends LocalStorageWriter{

    /**
     *
     * @param pageName {PageName}
     */
    constructor(pageName="landingPage") {
        super("firstPage");
    }

    /**
     * saves the name of the page that is the first page that is displayed when simplipfy.org is accessed.
     * Names can be any key of pageManager.pages but some pages need further setup to make sense to display keep that in
     * mind. E.g. any Simplifier page only displays useful information if a circuit is selected first.
     * @param pageName {PageName}
     */
    save(pageName){
        this._set(pageName);
    }

    /**
     * will throw an error if loading fails, should always succeed
     * @returns {Array<boolean, string>}
     */
    load() {
        let [success, pageName] = super._get()
        if (!success) {
            this.save("landingPage");
        }
        return [true, pageName]
    }
}