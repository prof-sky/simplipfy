import lcapy
from sympy import latex
from lcapy.unitPrefixer import SIUnitPrefixer
from lcapy import omega0
from lcapy import resistance

lcapy.state.show_units = True

prefixer = SIUnitPrefixer()
print(latex(prefixer.getSIPrefixedValue(10)))
print(latex(prefixer.getSIPrefixedValue(100)))
print(latex(prefixer.getSIPrefixedValue(1000)))
print(latex(prefixer.getSIPrefixedValue(100.0)))
print(latex(prefixer.getSIPrefixedValue(1000.0)))
print(latex(prefixer.getSIPrefixedValue(100*omega0)))
print(latex(prefixer.getSIPrefixedValue(1000*omega0)))
print(latex(prefixer.getSIPrefixedValue(1000000*omega0)))
print(latex(prefixer.getSIPrefixedValue(100000*omega0)))
print(latex(prefixer.getSIPrefixedValue(100.0*omega0)))
print(latex(prefixer.getSIPrefixedValue(1000.0*omega0)))
value = resistance(1000)
print(latex(prefixer.getSIPrefixedValue(value)))
