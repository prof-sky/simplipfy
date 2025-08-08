from sympy import Rational, Symbol, solve


def equationIsValid(R1: float, R2: float, R3: float, R4: float, Uq: float, Um: float) -> bool:
    """
    :param R1: Resistance R1
    :param R2: Resistance R2
    :param R3: Resistance R3
    :param R4: Resistance R4
    :param Uq: Voltage of the source in Volts
    :param Um: Voltage between point A (between R1 and R2) and B (between R3 and R4) in Weathstone bridge
     R1 and R2 in seires, R3 and R4 in series, R1+R2 parallel R3+R4

    Check if the equation:
    Um = Uq * (R2/(R1+R2) - R4/(R3+R4)
    is valid for the given values of R1, R2, R3, R4, Uq, and Um.
    The equation is valid if the left-hand side equals the right-hand side. Uses sympy Rational to avoid floating point
    errors.
    """
    potA = Rational(R2, R1 + R2)
    potB = Rational(R4, R3 + R4)
    return Rational((potA - potB)*Uq, 1) == Rational(Um, 1)

def bridgeIsBalanced(R1: float, R2: float, R3: float, R4: float) -> bool:
    """
    :param R1: Resistance R1 in ohm
    :param R2: Resistance R2 in ohm
    :param R3: Resistance R3 in ohm
    :param R4: Resistance R4 in ohm

    Check if the Wheatstone bridge is balanced. The bridge is balanced if the ratio of the resistances is equal.
    """
    return Rational(R1, R2) == Rational(R3, R4)


def calcMissingVal(R1, R2, R3, R4, Uq, Um) -> tuple[str, float]:
    """
    :param R1: Resistance R1 in ohm
    :param R2: Resistance R2 in ohm
    :param R3: Resistance R3 in ohm
    :param R4: Resistance R4 in ohm
    :param Uq: Voltage across the voltage source
    :param Um: Voltage between point A (between R1 and R2) and B (between R3 and R4) in Weathstone bridge
     R1 and R2 in series, R3 and R4 in series, R1+R2 parallel R3+R4
    :returns: tuple[varName, varVal] value of the missing variable, if the bridge is balanced there are infinitely many
     solutions for Uq, in this case for varVal 0 is returned

    Calculate the missing value of the Wheatstone bridge equation
    """
    # Map variable names to values
    values = {
        "R1": R1,
        "R2": R2,
        "R3": R3,
        "R4": R4,
        "Uq": Uq,
        "Um": Um
    }

    # Count how many values are missing
    missing = [k for k, v in values.items() if v is None]
    if len(missing) != 1:
        raise ValueError("Exactly one value must be None")

    missing_var = missing[0]

    # Create sympy symbols for known and unknown
    symbols = {}
    for key, val in values.items():
        if val is None:
            symbols[key] = Symbol(key)
        else:
            symbols[key] = Rational(val)

    # Unpack for convenience
    R1 = symbols["R1"]
    R2 = symbols["R2"]
    R3 = symbols["R3"]
    R4 = symbols["R4"]
    Uq = symbols["Uq"]
    Um = symbols["Um"]

    # Wheatstone bridge logic:
    # (R1 / (R1 + R2)) - (R3 / (R3 + R4)) * Uq == Um
    eq = (R2 / (R1 + R2) - R4 / (R3 + R4)) * Uq - Um

    if missing_var == "Uq" and Um == 0:
        # there are inifinitely many solutions and 0 is one of them
        return "Uq", 0

    # Solve for missing variable
    sol = solve(eq, symbols[missing_var], dict=True)[0]

    return missing_var, sol[symbols[missing_var]]
