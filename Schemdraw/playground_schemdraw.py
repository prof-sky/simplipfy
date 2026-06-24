import schemdrawInskale
import schemdrawInskale.elements as elm
schemdrawInskale.use(backend='svg')

d1 = schemdrawInskale.Drawing()
d1.add(elm.MagneticSource().down().at((0,0)))
d1.add(elm.StdMagnetCore().right().at((0,0)))
d1.add(elm.MagnetCore().down().at((3,0)))
d1.add(elm.MagnetCore().down().at((3,-3)))
d1.add(elm.MagnetCore().left().at((3,-6)))
"""
d1.add(elm.MagneticSource().left().at((6,0)))
d1.add(elm.AirGap().down().at((6,0)))
d1.add(elm.MagnetCore().left().at((6,-3)))
d1.add(elm.MagnetCore().left().at((3,-3)))
d1.add(elm.StdMagnetCore().down().at((3,-3)))
d1.add(elm.MagnetCore().down().at((3,-6)))
d1.add(elm.StdMagnetCore().up().at((0,-6)))
d1.add(elm.MagnetCore().up().at((0,-9)))
d1.add(elm.StdMagnetCore().left().at((3,-6)))
d1.add(elm.StdMagnetCore().down().at((6,-3)))
d1.add(elm.MagnetCore().down().at((6,-6)))
d1.add(elm.StdMagnetCore().left().at((6,-9)))
d1.add(elm.AirGap().left().at((3,-9)))"""
#d1.draw()
d1.save('test.svg', True)

print("Schemdraw example created successfully.")