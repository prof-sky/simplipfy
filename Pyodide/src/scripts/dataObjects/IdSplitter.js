/**
 * Extract information from {@link HTMLElement.id}
 * @abstract
 */
class IdSplitter {
    /** @type {string} */
    static type;
    /** @type {string} */
    id;
    /** @type {Array<string>} */
    found;
    /** @type {int | null} */
    typeIndex;
    /** @type {string | null} */
    identifier;
    /** @type {int | null} */
    index;


    /** @param id {string}
     */
    constructor(id) {
        if(!id){
            throw new Error(`Id seems to be empty; ${id}`);
        }
        this.id = id

        this.found = this.id.split("-");
        if (this.found.length <= 1) throw new Error(`id was not seperated by "-", ${id}`)
    }

    setVals(typeIndex, identifier, index){
        this.typeIndex = Number(typeIndex);
        this.identifier = identifier;
        this.index = Number(index);
    }

    /** @virtual */
    static generate(){}
}

/** class to extract information from an Accordion generated with {@link Selector} */
class AccordionID extends IdSplitter {
    static type = "acc";
    constructor(id) {
        super(id);
        let [type,typeIndex, _2, identifier, index] = this.found
        if (type !== AccordionID.type) throw new Error(`type ${type} not supported`);

        this.setVals(typeIndex, identifier, index);
    }

    static generate(){
        return ""
    }
}

/** class to extract information from an overview modal generated with {@link Selector} */
class OverviewModalID extends IdSplitter {
    static type = "overviewModal";
    constructor(id) {
        super(id);
        let [type,identifier, index] = this.found
        if (type !== OverviewModalID.type) throw new Error(`type ${type} not supported`);

        this.setVals(null, identifier, index);
    }

    static generate(){
        return ""
    }
}

/** class to extract information from a Tutorial generated with {@link TutorialSelector} */
class TutorialID extends IdSplitter {
    static type = "quick";

    constructor(id) {
        super(id);
        let [type,_1, _2, _3, index] = this.found
        if (type !== TutorialID.type) throw new Error(`type ${type} not supported`);

        this.setVals(null, "quick", index);
    }

    static generate(){
        return "";
    }
}

/** Return the correct splitter-sub-class to extract information from a {@link HTMLElement.id}*/
class IdFactory{
    /** @returns {OverviewModalID | AccordionID | TutorialID} */
    constructor(id) {
        let type = id.split("-")[0];
        if (type === OverviewModalID.type) return new OverviewModalID(id);
        else if (type === AccordionID.type) return new AccordionID(id);
        else if (type === TutorialID.type) return new TutorialID(id);
    }
}