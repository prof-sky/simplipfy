class SelectModeModal extends ModalContent {

    get headerElement() {
        return this.parseHTML(`<h5>${languageManager.currentLang.editorPage.modalHeader}</h5>`)
    }

    get bodyElement() {
        let body = this.parseHTML(`
        <div class="px-1 simplifier" style="cursor: pointer;">
            <p>${languageManager.currentLang.editorPage.modeStepwise}</p>
            <button type="button" class="btn btn-warning d-block mx-auto mb-3">${languageManager.currentLang.editorPage.startBtn}</button>
        </div>
        <hr class="my-2">
        <div class="px-1 symbolic" style="cursor: pointer;">
            <p>${languageManager.currentLang.editorPage.modeSymbolic}</p>
            <button type="button" class="btn btn-warning d-block mx-auto mb-3">${languageManager.currentLang.editorPage.startBtn}</button>
        </div>
        <hr class="my-2">
        <div class="px-1 kirchhoff" style="cursor: pointer;">
            <p>${languageManager.currentLang.editorPage.modeKirchhoff}</p>
            <button type="button" class="btn btn-warning d-block mx-auto mb-3">${languageManager.currentLang.editorPage.startBtn}</button>
        </div>
        `)

        let comp = window.activeSchematic.components;

        let converter = new Converter();

        function returnErrors(components, solver){
            // specific errors for stepwise
            if (solver === 'stepwise'){
                if(components.filter(c => c.type === 'v').length >= 2) {
                    UserMessage.warning(i18n.double_source);
                    return true;
                }

            }
            // specific errors for kirchhoff
            else if (solver === 'kirchhoff'){
                if (components.filter(c => c.type === 'c' || c.type === 'l').length > 0) {
                    UserMessage.warning(i18n.wrong_component)
                    return true;
                }
            }

            // errors for null value
            let nullMsg = `null_value_${solver}`
            for (let c of components){
                if(c.type === 'v' && (c.properties['value'] === 'dc(0)' || c.properties['value'] === 'sin(0,0,0)' || c.properties['value'] === '')) {
                    UserMessage.warning(i18n[nullMsg])
                    return true;
                }
                if(c.type !== 'v' && c.properties[c.type] === "0" || c.properties[c.type] === '') {
                    UserMessage.warning(i18n.null_value_stepwise)
                    return true;
                }
            }
        }

        body.querySelector(".simplifier").addEventListener("click", async () => {
            let netlist = converter.convertNetlist('');
            if (netlist === undefined ){
                UserMessage.warning(i18n.undefined_netlist)
                return;
            }
            await startFromEditor(netlist);
            state.currentCircuitMap.selectorGroup = ScannedCircuitMap.getSelectorGroup(netlist);

            if(returnErrors(comp, 'stepwise')) return;
            pageManager.pages.stepwisePage.reset()
            await pageManager.changePage(pageManager.pages.stepwisePage)
            modalXl.hide()
        })

        body.querySelector(".symbolic").addEventListener("click", async () => {
            let netlist = converter.convertNetlist('sym');
            if (netlist === undefined ){
                UserMessage.warning(i18n.undefined_netlist)
                return;
            }
            await startFromEditor(netlist);
            state.currentCircuitMap.selectorGroup = window.definitions.selectorIDs.symbolic;
            pageManager.pages.stepwisePage.reset()
            await pageManager.changePage(pageManager.pages.stepwisePage)
            modalXl.hide()
        })

        body.querySelector(".kirchhoff").addEventListener("click", async () => {
            let netlist = converter.convertNetlist('');
            if (netlist === undefined ){
                UserMessage.warning(i18n.undefined_netlist);
                return;
            }
            await startFromEditor(netlist);
            state.currentCircuitMap.selectorGroup = window.definitions.selectorIDs.kirchhoff;
            if(returnErrors(comp, 'kirchhoff')) return;
            pageManager.pages.kirchhoffPage.reset()
            await pageManager.changePage(pageManager.pages.kirchhoffPage)
            modalXl.hide()
        })
        return body
    }

    get footerElement() {
        return this.parseHTML(`<button type="button" class="btn btn-secondary" data-bs-dismiss="modal">${languageManager.currentLang.editorPage.abortBtn}</button>`)
    }
}