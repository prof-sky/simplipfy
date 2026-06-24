class QrCodeModal extends InfoModal{
    get bodyElement() {
        let link = QrCodeGenerator.getQRCodeLink(
            this.params.get("randomSession"),
            this.params.get("selector"),
            this.params.get("netlist")
        )

        if (!link) {
            throw Error("Link generation failed!")
        }

        let body = document.createElement("div");

        let container = QrCodeGenerator.paddedContainer

        let qrCode = document.createElement("div");
        QrCodeGenerator.generate(qrCode, link);
        container.appendChild(qrCode);
        body.appendChild(container);

        body.appendChild(pageManager.getPageDivider("qrCode-modal-divider"));

        let linkContainer = document.createElement("a");
        linkContainer.href = link;
        linkContainer.textContent = link;
        linkContainer.classList.add("mx-auto", "text-center", "d-block");
        linkContainer.style.maxWidth = "100%";
        linkContainer.style.whiteSpace = "nowrap";
        linkContainer.style.overflow = "hidden";
        linkContainer.style.textOverflow = "ellipsis";

        body.appendChild(linkContainer);

        return body;
    }

    get headerElement() {
        let heading = document.createElement("h5")
        heading.innerHTML = "Join Session";
        return heading;
    }

    /** @param data {QrTrackingData} */
    constructor(data) {
        let netlist = new NetlistString(data.netlist);
        let params = new Map([
            ["randomSession", data.randomSession],
            ["selector", data.qrSelector],
            ["netlist", netlist]
        ])
        super(params);
    }
}