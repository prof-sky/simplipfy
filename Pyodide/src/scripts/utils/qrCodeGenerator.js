class QrCodeGenerator {
    static correctLevel = {
        high: QRCode.CorrectLevel.Q,
        quality: QRCode.CorrectLevel.H,
        medium: QRCode.CorrectLevel.L,
        low: QRCode.CorrectLevel.M
    };

    static getLinkURL(){
        let url = window.location.origin;
        if (url.includes("localhost")) {
            // don't use href generally to use redirect to the newest versions in releases
            // use href at localhost to work for docker
            url = window.location.href.split("#")[0]
            console.log(`Running in development mode, using href: ${url}`);
        }
        else{
            console.log("Using origin: " + url);
        }
        if(!url.endsWith("/")) url += "/";
        return url;
    }

    /**
     *
     * @param randomSession {string}
     * @param selector {window.definitions.qrCodeSelectorIDs}
     * @param netlist {NetlistString} netlist
     * @returns {string} the generated link
     */
    static getQRCodeLink(randomSession, selector, netlist){
        let url = QrCodeGenerator.getLinkURL();
        return `${url}#id=${randomSession}&sel=${selector}&net=${netlist.compressed}`;
    }

    /**
     * generates a link that redirects to the tracking page
     * @param randomSession {string}
     * @param selector {window.definitions.qrCodeSelectorIDs}
     * @param netlist {NetlistString} netlist
     * @returns {string} the generated link
     */
    static getTrackingLink(randomSession, selector, netlist){
        const url = QrCodeGenerator.getLinkURL();
        return `${url}#tracking&id=${randomSession}&sel=${selector}&net=${netlist.compressed}`;
    }

    /**
     * the qr code scans better if it is placed in a container with white outline around the qr code, this method returns such a container
     * just put the qr code div inside to enhance the scanning experience
     * @returns {HTMLDivElement}
     */
    static get paddedContainer(){
        let container = document.createElement("div");
        container.classList.add("d-block", "mx-auto", "p-5");
        container.style.width = "fit-content";
        container.style.backgroundColor = "white";
        container.style.borderRadius = "20px";

        return container;
    }

    /** returns 0 if the QR code was generated successfully, otherwise returns 1 */
    static _generate(div, content, correctLevel){
        let qrCode;
        try {
            qrCode = new QRCode(div, {
                text: content,
                width: 250,
                height: 250,
                colorDark: "#000000",
                colorLight: "#ffffff",
                correctLevel: correctLevel,
            });
            return 0;
        }
        catch (e) {
            return 1;
        }
    }

    /** returns 0 if the QR code was generated successfully, otherwise returns 1 */
    static generate(div, content){
        let qrCodeGenerated = false;
        for (let corLevel of Object.values(QrCodeGenerator.correctLevel)) {
            qrCodeGenerated = QrCodeGenerator._generate(div, content, corLevel)
            if (!qrCodeGenerated) break;
        }
        return qrCodeGenerated;
    }
}