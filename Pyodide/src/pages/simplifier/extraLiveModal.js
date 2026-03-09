/**
 * Modal that is shown when you lost all lives in the game mode
 * @extends Modal
 */
class ExtraLiveModal extends InfoModal{
    get headerElement() {
        return this.parseHTML(`<h5 class="modal-title">${languageManager.currentLang.kirchhoff.gameOverHeading}</h5>`)
    }

    get bodyElement() {
    return this.parseHTML(`
    <p class="text-center">${languageManager.currentLang.kirchhoff.extraLiveText}</p>
    <img loading="lazy" id="extra-live-mascot-img" style="margin-top: -100px; transform: rotate(6deg) translate(-5px, 30px) scale(0.5)" class="img-fluid rounded mx-auto d-block" src="./src/resources/mascot/sad.svg" alt="mascot_sad">
    <p id="extra-live-question" class="text-center"></p>
    <div class="container" style="text-align: center;">
        <div class="row">
            <div class="col-sm" id="saveLive1">
                1
            </div>
            <div class="col-sm" id="saveLive2">
                2
            </div>
        </div>
        <div class="row">
            <div class="col-sm" id="saveLive3">
                3
            </div>
            <div class="col-sm" id="saveLive4">
                4
            </div>
        </div>
    </div>`)
    }
}