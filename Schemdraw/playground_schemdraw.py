import schemdraw
import schemdraw.elements as elm
schemdraw.use(backend='svg')


d = schemdraw.Drawing()
source = elm.StabilizedSource()
d.add(source)
d.draw()

print("Schemdraw example created successfully.")
