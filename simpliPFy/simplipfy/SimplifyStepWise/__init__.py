"""
Module used to solve a circuit using analitic method where the circuit is simplified to a total resistance using
series and parallel relationships of the components. The module always simplifies two components which it determines by
itself. It produces a <simplipfy.Solution> object that has (NumComponentsInCircit - 1) steps. The module is implemented
with lcapy. The project uses a slightly modified version named lcapyInskale to support stepwise solving of the circuit
and extract solutions.
"""