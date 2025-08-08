# Applications

## Common

In the `applications/common` directory you can find functions that are used across different applications.
This includes functions for gamification, general helper function and svgManipulation functions.

## Simplifier

The `simplifier` directory contains the code for the simplifier application (meaning the circuit simplification).
The directory contains the following files:
- explanationTexts.js: This file contains the generated explanation texts for the simplification steps.
- simplifer.js: Main file for the simplifier application, containing the logic for the simplification steps.
- simplifierHelper.js: Helpers specific to the simplifier application, e.g. for the step handling.

## Kirchhoff

The `kirchhoff` directory contains the code for the Kirchhoff application.
The directory contains the following files:
- kirchhoff.js: Main file for the Kirchhoff application, containing the logic for the Kirchhoff circuit solver.
- kirchhoffHelper.js: Helpers specific to the Kirchhoff application.

## Wheatstone

The `wheatstone` directory contains the code for the Wheatstone application.
The directory contains the following files:
- explanationTexts.js: This file contains the generated explanation texts for the Wheatstone steps.
- wheatstone.js: Main file for the Wheatstone application, containing the logic for the Wheatstone circuit solver.
- wheatstoneHelper.js: Helpers specific to the Wheatstone application.
