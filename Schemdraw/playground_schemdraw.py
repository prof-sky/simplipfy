import schemdrawInskale
import schemdrawInskale.elements as elm
schemdrawInskale.use(backend='svg')

d = schemdrawInskale.Drawing()
d.add(elm.Resistor().down())
d.add(elm.Line().right())
d.add(elm.Line().right())
d.add(elm.Resistor().down())
d.add(elm.Line().right())
source = elm.StabilizedSource().up()
d.add(source)
d.add(elm.InductorIEC())
a = elm.ResistorIEC()
d.add(a)
d.add(elm.lines.EncircleBox(elm_list=[a], id_="TestID", class_="TestClass", padx=0.1, pady=0.1))
d.add(elm.lines.EncircleBox(elm_list=[source], id_="TestID", class_="TestClass", padx=0.1, pady=0.1))

d.draw()

print("Schemdraw example created successfully.")
