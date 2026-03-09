/**
 * Modal that is shown if you lost in the game mode
 * @extends Modal
 */
class GameOverModal extends InfoModal {
    get headerElement(){
        return this.parseHTML(`<h5 class="modal-title">Game Over</h5>`)
    }

    get bodyElement() {
        return this.parseHTML(`
            <p id="game-over-text" class="text-center"></p>
            <img loading="lazy" id="game-over-mascot-img" style="margin-top: -100px; transform: rotate(6deg) translate(-5px, 30px) scale(0.5)" class="img-fluid rounded mx-auto d-block" src="./src/resources/mascot/sad.svg" alt="mascot_sad">`
        )
    }
}