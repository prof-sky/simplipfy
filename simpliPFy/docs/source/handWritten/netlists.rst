Netlists
========

Netlists are a textual representation of a circuit and used to define circuits for simpliPFy.

A Netlist could look like this ::

    V1 1 0 dc {10}, down
    W 1 2, right
    R1 2 3 {100}, down
    W 3 0; left

In general the structure is like ::

    <componentType><identifier> <positive Node> <negative Node> {<value>}, <drawing hint>

Nodes that have the same identifier/Number are connected.

Component Types
~~~~~~~~~~~~~~~
- V: Voltage source
- I: Current source
- R: Resistor
- C: Capacitor
- L: Inductor
- Z: Impedance
- W: Wire

Sources
~~~~~~~
- V: Voltage source
- I: Current source

A DC source gets the additional parameter ``dc`` ::

    <componentType><identifier> <posNode> <nedNode> dc {<value>}, <drawing hint>

A AC source gets the additional parameter ``ac``, phase and omega_0 ::

    <componentType><identifier> <posNode> <nedNode> ac {<value>} {<phase>} {<omega_0>}, <drawing hint>

for easier use omega_0 can be written as 2*pi*<value in Hz> ::

    <componentType><identifier> <posNode> <nedNode> ac {<value>} {<phase>} {2*pi*<value in Hz>}, <drawing hint>

e.g. ::

    V1 1 0 ac {10} {0} {100}; up
    V1 1 0 ac {10} {0} {2*pi*30}; up
    V1 1 0 ac {10} {0} {omega_0}; up


Components R, L, C, Z
~~~~~~~~~~~~~~~~~~~~~
A netlist line with `R, L, C or Z` always contains ::

    <component typy><identifier> <start node> <end node> {<value>}; <drawing hint>

e.g. ::

    R1 1 2 {1000}; left

the value is encapsulated in ``{}`` to ensure that it is parsed correctly there are situations where the brackets can be
ignored, but it is easiest to always use brackets to avoid parsing errors. The pos- and neg node always have to be
an integer. The identifier has to be unique across the components R, L, C, Z because they are transformed internally
into impedances e.g. R1, C2, L3, L4 not R1, C1, L1, L2.


Component W
~~~~~~~~~~~

A netlist line with the component ``W`` contains ::

    W<identifier> <start node> <end node>; <drawing hint>

the identifier is optional so it could  be ::

    W1 1 2; left
    or
    W 1 2; left

The length of a wire is always one unit and therefore the same as a Resistor or any other element. If you want to close
the circuit the number of wires has to be adjusted to fit the length of elements.


Drawing hints
~~~~~~~~~~~~~~
possible drawing hints are

- right
- left
- up
- down

And describe the direction the next component is placed based of the position of the positive node.
Drawing hints and Wires can be neglected if you add ::

    # --generalize

at the top of the netlist. Then only describe which components are connected the generalizeNetlistDrawing package will
figure out the lines and positions of the componentes. Won't work for Wheatstone.


Convert a circuit into a netlist
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
Start by finding the start and end nodes for components. The easiest way is to draw the circuit on paper and then
mark the start and end point of each component. Enumerate the points. Now you can see the start and end nodes for
each component.

.. image:: /_static/FindStartEndNode.png

Represented as a netlist the circuit in the picture would be ::

    V1 1 9 dc {10}; up
    W 1 2; up
    W 2 3; right
    R 3 4 {100}; down
    R 4 7 {100}; down
    W 4 5; right
    R 5 6 {100}; down
    W 6 7; left
    W 7 8; left
    W 8 9; up

the values of the components are chosen randomly.
The netlist structure is adapted from lcapy and has great documentation. There are two limitations introduced by our implementation.
- no auto naming of components
- component values have to be enclosed in {}
Examples can be found in Pyodide/Circuits
