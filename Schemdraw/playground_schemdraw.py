import schemdraw
import schemdraw.elements as elm
schemdraw.use(backend='svg')


d = schemdraw.Drawing()
R = elm.Resistor(id_="R1", class_="123 OhmFarrads", d="down").label("R1", class_='na')
d.add(R)
d.add(elm.CurrentLabelInline(direction='in', class_="testArrow").at(R).label("I" + "1", class_="testLabel"))
d.add(elm.CurrentLabel(top=True, class_="testArrow", ofst=0.3).at(R).label("V" + "1", loc='bottom', class_="testLabel").reverse())
d.draw()

print("Schemdraw example created successfully.")
