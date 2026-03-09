// this also is the order of the selectors in the accordions
window.definitions.selectorIDs = {
    quickstart: "quick",
    resistor: "res",
    symbolic: "sym",
    capacitor: "cap",
    inductor: "ind",
    mixed: "mixed",
    kirchhoff: "kirch",
    wheatstone: "wheat",
    magnetic: "mag",
}

//if a selector has no counter in the UI place it in this list
window.definitions.noCounter = [
    window.definitions.selectorIDs.quickstart,
];

window.definitions.qrCodeSelectorIDs = {
    stepwise: "si",
    kirchhoff: "kh",
    symbolic: "sy"
}

window.definitions.selectorGroup = {
    simplifier: "simplifier",
    kirchhoff: "kirch",
}