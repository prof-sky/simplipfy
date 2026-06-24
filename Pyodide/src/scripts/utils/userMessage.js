/** @typedef {"primary"|"secondary"|"success"|"danger"|"warning"|"info"} BootstrapAlertKey */

class UserMessage {
    /**
     * this sometimes does not work because of rerendering in the dom use show
     * @param message {string} message to display
     * @param heading {string} optional, shown above the message
     * @param prio {BootstrapAlertKey} priority, severity
     * @param autoHide {boolean} true by default, if false message has to be discarded by the user
     * @param id {string} id of the element to use, default is alert-msg
     * */
    static create(message, heading="", prio = "warning", autoHide = true, id = "alert-msg") {
        let body = document.getElementsByTagName("body")[0];
        let msg = UserMessage.createAlert(prio, id);

        if (heading !== "") {
            /** @type {HTMLSpanElement} */
            let emojiSpan = document.createElement('span');
            emojiSpan.style.fontSize = '1.66em';
            emojiSpan.innerHTML = heading;
            msg.appendChild(emojiSpan);
            msg.appendChild(document.createElement('br'));
        }

        /** @type {HTMLSpanElement} */
        let msgSpan = document.createElement('span');
        if (prio === "error" || prio === "danger") {
            msgSpan.innerHTML = languageManager.currentLang.alerts.error + message;
        } else {
            msgSpan.innerHTML = message;
        }
        msgSpan.style.whiteSpace = "pre-line";
        msg.appendChild(msgSpan);
        body.appendChild(msg);

        // Remove the message when the user clicks anywhere
        if (autoHide) {
            document.addEventListener("click", UserMessage.removeMsgHandler, { once: true });
            // Remove the message after 3 seconds if not clicked already
            setTimeout(() => {
                if (body.contains(msg)) {
                    body.removeChild(msg);
                }
            }, 3000);

        } else {
            msg.classList.add("alert-dismissible", "fade", "show");
            const closeButton = document.createElement('button');
            closeButton.classList.add("btn-close");
            closeButton.setAttribute("data-bs-dismiss", "alert");
            closeButton.setAttribute("aria-label", "Close");
            msg.appendChild(closeButton);
        }
    }

    /**
     * @param message {string} message to display
     * @param [heading=""] {string} A heading displayed above the message, optional
     * @param prio {BootstrapAlertKey} priority, severity
     * @param [autoHide=true] {boolean} if false message has to be discarded by the user
     * */
    static show(message, heading, prio = "warning", autoHide = true){
        setTimeout(() => UserMessage.create(message, heading, prio, autoHide, "alert-msg"), 0)
    }

    /**
     * @param message {string} message to display
     * @param [heading=""] {string} A heading displayed above the message, optional
     * @param [autoHide=true] {boolean} if false message has to be discarded by the user
     * */
    static primary(message,heading, autoHide=true){
        UserMessage.show(message, heading, "primary", autoHide);
    }

    /**
     * @param message {string} message to display
     * @param [heading=""] {string} A heading displayed above the message, optional
     * @param [autoHide=true] {boolean} if false message has to be discarded by the user
     * */
    static secondary(message, heading, autoHide=true){
        UserMessage.show(message, heading, "secondary", autoHide);
    }

    /**
     * @param message {string} message to display
     * @param [heading=""] {string} A heading displayed above the message, optional
     * @param [autoHide=true] {boolean} if false message has to be discarded by the user
     * */
    static success(message, heading, autoHide=true){
        UserMessage.show(message, heading,"success", autoHide);
    }

    /**
     * @param message {string} message to display
     * @param [heading=""] {string} A heading displayed above the message, optional
     * @param [autoHide=false] {boolean} if false message has to be discarded by the user
     * */
    static error(message, heading, autoHide=false){
        UserMessage.show(message, heading, "danger", autoHide);
    }

    /**
     * @param message {string} message to display
     * @param [heading=""] {string} A heading displayed above the message, optional
     * @param [autoHide=false] {boolean} if false message has to be discarded by the user
     * */
    static danger(message, heading, autoHide=false){
        UserMessage.show(message, heading, "danger", autoHide);
    }

    /**
     * @param message {string} message to display
     * @param [heading=""] {string} A heading displayed above the message, optional
     * @param [autoHide=false] {boolean} if false message has to be discarded by the user
     * */
    static warning(message, heading, autoHide=false){
        UserMessage.show(message, heading, "warning", autoHide);
    }

    /**
     * @param message {string} message to display
     * @param [heading=""] {string} A heading displayed above the message, optional
     * @param [autoHide=true] {boolean} if false message has to be discarded by the user
     * */
    static info(message, heading, autoHide=true){
        UserMessage.secondary(message, heading, autoHide);
    }

    /**
     * @param bootstrapAlert {BootstrapAlertKey}
     * @param [id="aler-msg"] {string} id of the element to use, default is alert-msg
     * */
    static createAlert(bootstrapAlert, id = "alert-msg") {
        const msg = document.createElement('div');
        msg.id = id;
        msg.classList.add("alert", `alert-${bootstrapAlert}`);
        msg.style.position = "fixed";
        msg.style.zIndex = "2000";
        msg.style.top = "50%";
        msg.style.left = "50%";
        msg.style.transform = "translate(-50%, -50%)";
        msg.style.width = "90%";
        msg.style.maxWidth = "400px";
        msg.style.textAlign = "center";
        msg.style.maxHeight = "80vh";
        msg.style.overflow = "auto";
        return msg;
    }

    static removeMsgHandler() {
        let body = document.getElementsByTagName("body")[0];
        let msg = document.getElementById("alert-msg");
        if (document.contains(msg)) {
            body.removeChild(msg);
        }
    }
}

class UserEmojiMessage {
    static get errorEmoji(){
        return window.definitions.badEmojis[Math.floor(Math.random() * window.definitions.badEmojis.length)];
    }

    static get successEmoji(){
        return window.definitions.goodEmojis[Math.floor(Math.random() * window.definitions.goodEmojis.length)];
    }

    static get infoEmoji(){
        return window.definitions.onlyChoose2Emojis[Math.floor(Math.random() * window.definitions.onlyChoose2Emojis.length)];
    }

    /**
     * @param message {string} message to display
     * @param [autoHide=false] {boolean} false by default, if false message has to be discarded by the user
     * */
    static error(message, autoHide){
        UserMessage.error(message, UserEmojiMessage.errorEmoji, autoHide);
    }

    /**
     * @param message {string} message to display
     * @param [autoHide=true] {boolean} false by default, if false message has to be discarded by the user
     * */
    static warning(message, autoHide = true){
        UserMessage.warning(message, UserEmojiMessage.errorEmoji, autoHide);
    }

    /**
     * @param message {string} message to display
     * @param [autoHide=true] {boolean} false by default, if false message has to be discarded by the user
     * */
    static success(message, autoHide){
        UserMessage.success(message, UserEmojiMessage.successEmoji, autoHide);
    }

    /**
     * @param message {string} message to display
     * @param [autoHide=true] {boolean} false by default, if false message has to be discarded by the user
     * */
    static info(message, autoHide){
        UserMessage.info(message, UserEmojiMessage.infoEmoji, autoHide);
    }
}