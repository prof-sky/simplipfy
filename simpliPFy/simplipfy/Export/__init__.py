"""
This package is used to export data from the lcapyInskale package.
The relevant functions for usage are:

- DictExportCircuitInfo
    Exports information about all components in the circuit and creates the image of the initial circuit.
- DictExport
    Exports information about a simplification step created with SimplifyInUserOrder Package or SimplifyStepWise Package.
    Creates the image of the circuit after the simplification step is applied.

The classes use the following objects outside of this module to gather information about the circuit:
 - lcapyInskale.Solution
 - lcapyInskale.SolutionStep
"""