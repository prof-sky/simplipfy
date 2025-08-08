import schemdrawInskale
import schemdrawInskale.elements as elm
schemdrawInskale.use(backend='svg')

d1 = schemdrawInskale.Drawing()
d1.add(elm.Resistor(color='transparent').at((0,0)))
d1.add(elm.Capacitor().at((0,0)))
d1.draw()
combElm = elm.ElementDrawing(d1)

d2 = schemdrawInskale.Drawing()
d2.add(elm.Resistor().at((0,0)).label('L1'))
d2.add(combElm.at((3, 0)).label('Comb1'))


d2.draw()

print("Schemdraw example created successfully.")