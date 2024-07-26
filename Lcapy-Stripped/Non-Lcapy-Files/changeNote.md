## 1.22+InskaLE.0.7
The step0-json now contains all components of the circuit in its initial state (without) simplifications
and the frequency omega_0 in Hz if it is an AC circuit. If it is a DC circuit omega_0 is equal to 0.

## 1.22+InskaLE.0.6
show dots on branch knots, when there are more than two occurrences of the same node in the circuit.

## 1.22+InskaLE.0.5
Fix error that the inverse sum is not used when needed.

## 1.22+InskaLE.0.4
return filenames from draw and export functions. Add function to draw a standalone step.

## 1.22+InskaLE.0.3
removed unnecessary print of latex expression

## 1.22+InskaLE.0.2
The json-File is extended by latexEquation. The calculation from the simplification of two
elements. The expression is converted from sympy to a latex string

## V1.22+inskale.0.1
Creates a step-by-step Solution where only to Elements are simplified
in one step and exports the Steps into a json-File. The Circuits
(more specific the Netlists) can be drawn with the additional package
Schemdraw and don't need LaTeX installation. Only Supported Elements are
Resistors, Inductors, Wires, Voltage Sources, Impedances (special form of Resistors)