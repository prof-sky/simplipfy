import schemdrawInskale.elements as elm


class MagneticDrawingElement:

    element_map = {
        "V": elm.MagneticSource,
        "C": elm.MagnetCore,
        "G": elm.AirGap,
    }

    def __init__(self, cpt, position):
        self.cpt = cpt
        self.position = position

    def build(self):
        elm_class = self.element_map[self.cpt.type]

        id_ = f"{self.cpt.type}{self.cpt.identifier}"
        class_ = f"{self.cpt.type}{self.cpt.identifier}"

        element = elm_class(
            id_=id_,
            class_=class_
        )
        label = class_
        labelClass = 'element-label ' + id_
        # Richtung setzen
        dir = self.cpt.drawingDirection
        element = getattr(element, self.cpt.drawingDirection)()
        labelOfst = {"up": (0.046, 0.1), "down": (-0.128, -0.4), "left": (0, -0.48), "right": (0, 0.48)}

        # Position setzen
        element = element.label(label, class_=labelClass, ofst = labelOfst[self.cpt.drawingDirection]).at(self.position)

        # Label falls vorhanden
        if hasattr(self.cpt, "label") and self.cpt.label:
            element = element.label(self.cpt.label)

        return element