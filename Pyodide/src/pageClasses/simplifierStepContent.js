class SimplifierStepContent extends Content{
    /**
     * @param name {string}
     * @param [idLangMap=new Map()] {IdLangMap} {@link Content.idLangMap} map of id and associated language string
     */
    constructor(name, idLangMap= new Map()) {
        super(idLangMap, name + state.currentStep.toString())
    }

    setup() {
        return undefined;
    }
}