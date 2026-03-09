What we can do
===============

- Stepwise simplification of resistor networks
- Stepwise simplification of capacitor networks
- Stepwise simplification of inductor networks
- Stepwise simplification of a combination of the above
- Wheatstone tasks
- Guided process to a linear equation system with Kirchhoff's laws

What the Page offers to educators
----------------------------------
- Custom netlists to define networks for simplification or kirchhoff
- Editing Wheatstone tasks
- Generating QR-Codes
- Scanning QR-Codes
- Tracking students that solve a scanned QR-Code
- Using a set of Circuits provided by you, server side or client side
- Set the starting page

Custom netlists to define networks for simplification or kirchhoff
--------------------------------------------------------------------
Our circuits are not presolved. Each circuit is solved life on the users computer locally.
We use netlists to define our circuits. On the simplipfy.org page under tools ``Custom Netlist``
generates a drawing of the netlist you entered. This updates after 1 second of no input and may help you
write netlists.

.. seealso::
    :ref:`netlists`

Editing Wheatstone tasks
-------------------------
It is possible to edit Wheatstone tasks. Therefore you have to self host simplipfy and edit the file at::

    .../inskale/Pyodide/Circuits/wheatstone/00_wheat_options.json

In this file is a json array::

    [
        {
            "Uq": "25",
            "Um": "0",
            "R1": "3.3",
            "R2": "3.3",
            "R3": "1.2",
            "R4": "1.2"
        },
        ...
    ]

Remove one of the values above to ask for this value in the task. You may also remove two resistors, one of each group
(R1, R2) and (R3, R4), if you remove two of one group there are infinit solutions which is not handled.

.. seealso::

    :ref:`host`

Generating QR-Codes
---------------------
You can generate QR-Codes with the tool ``QR-Code Generator`` on the simplipfy.org page. To
generate a QR-Code you need a netlist file. You can see an example of a simple netlist below::

    V1 1 0 dc {4}; down
    R1 1 2 {2}; right
    R2 2 3 {1}; right
    R3 2 4 {4}; down
    R4 3 5 {3}; down
    W 5 4; left
    W 4 0; left

Copy this and save it in a .txt-file. You now can load this and it is embedded into the QR-Code.
Select which category the circuit should be.

    - stepwise: Circuit that shall be solved analytically, currents and voltages calculated
    - Kirchhoff: Circuit that is used to find a linear equation system with Kirchhoff's laws

When someone scans this QR-Code it automatically switches into the solving process.

Scanning QR-Codes
-------------------
If you are already on simplipfy.org and someone asks you to scan a QR-Code do it with ``QR-Code Scanner`` on the tools
page to avoid reloading the page which takes some time (definitely longer than 10s).

Tracking students that solve a scanned QR-Code
-----------------------------------------------
When generating a QR-Code you get an id and a key. The id is embedded into the QR-Code. The id-key combination is saved
locally on your computer. To track someone you can enter the id-key pair into the tool ``QR-Code live tracking``. The
key is used to avoid others tracking your QR-Code, if they leaf their tracking session this would cause problems with
your tracking session. So don't share your key. When students solve the circuit you get anonymous information where
errors occur and who reads detailed solutions.

Using a set of Circuits provided by you
----------------------------------------

Server side
~~~~~~~~~~~~

If you send us a circuit set you want to have on simplipfy.org we will add it under a user name and circuit name for you.
e.g.::

    user = ff88ff
    fileName = test

To redirect simplipfy.org to your circuits you then use::

    www.simplipfy.org/#ccUser=<user>&&ccFile=<fileName>
    ->
    www.simplipfy.org/#ccUser=ff88ff&&ccFile=test

We will send you your link after request. A custom upload brings technical challenges we avoid for now.

Client side
~~~~~~~~~~~~
Use the burger menu and navigate to tools. Open the ``custom circuit collection`` section and upload a zip file
with circuits you want to use.

.. seealso::

    :ref:`CircuitsZipStructure`

Set the starting page
-----------------------
If you want your students to start at the page where they select a circuit edit the link to::

    www.simplipfy.org/#setPage=selectPage

each user can edit this in the settings, but the link is treated with higher priority.