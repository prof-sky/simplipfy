import schemdrawInskale
import schemdrawInskale.elements as elm
schemdrawInskale.use(backend='svg')

d1 = schemdrawInskale.Drawing()
d1.add(elm.MagneticSource().down().at((0,0)))
d1.add(elm.MagnetCore().right().at((0,-0.25)))
d1.add(elm.MagnetCore().down().at((3,0)))
d1.add(elm.MagnetCore().right().at((3,-0.25)))
d1.add(elm.AirGap().down().at((6,0)))
d1.add(elm.MagnetCore().left().at((6,-2.75)))
d1.add(elm.MagnetCore().left().at((3,-2.75)))
d1.draw()
d1.save('test.svg', True)

print("Schemdraw example created successfully.")