/**
 * Template how to implement a Page
 * @extends Page
 */
class pageTemplate extends Page{
    constructor() {
        let content = {
            content1: "new Content1()",
            content2: "new Content2()",
        }
        // <pageName>-page-container (id of div on index.htlm)
        super(content, "<pageName>-page-container");
    }

    setup() {
        if (!super.beforeSetup()) return;

        //class specific setup of content

        super.afterSetup();
    }

    async initialize() {
        if (!super.beforeInit()) return awaitVal(() => this.isInitialized, () => {}); //this could create an endless wait if a class is not setup and the init is not called again

        // class specific init of content

        super.afterInit();
    }

    updateLang() {
        //remove if no class specific code is needed, you may want to extend your own code with the base implementation
    }

    updateColor() {
        //remove if no class specific code is needed, you may want to extend your own code with the base implementation
    }

    addEventListeners() {
        //remove if no class specific code is needed, you may want to extend your own code with the base implementation
    }

    afterPyodideLoaded() {
        //remove if no class specific code is needed, you may want to extend your own code with the base implementation
    }

}