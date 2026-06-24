/**
 * Base class for Modals
 * @abstract
 * @extends Content
 */
class Modal extends Content{
    updateColor() {
        /** @type HTMLElement */
        let content = document.getElementById(this.mainID).querySelector(".modal-content");
        content.style.color = colors.current.foreground;
        content.style.backgroundColor = colors.current.bsBackground;
        content.style.border = `1px solid ${colors.current.foreground}`;
    }
}