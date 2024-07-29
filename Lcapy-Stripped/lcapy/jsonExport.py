from sympy import latex
from lcapy import state
from sympy import Mul
from lcapy.impedanceConverter import ImpedanceToComponent
from lcapy.impedanceConverter import ValueToComponent
from lcapy.netlistLine import NetlistLine
from sympy.physics.units import Hz
from sympy import parse_expr
from lcapy import omega0
from lcapy import Solution


class JsonExport:
    def __init__(self, thisStep, lastStep):
        return

    @staticmethod
    def getDictForStep(name1, name2, newName, thisStep, lastStep):

        if not (name1 and name2 and newName and lastStep) and thisStep:
            # this is the initial step which is used as an overview of the circuit
            as_dict = {}
            state.show_units = True

            for cptName in thisStep.circuit.elements.keys():
                cpt = thisStep.circuit.elements[cptName]
                if cpt.type == "V" and cpt.has_ac:
                    as_dict[cptName] = latex(
                        Solution.addUnit(
                            NetlistLine(str(cpt)).value,
                            cpt.type
                        )
                    )
                    # ToDo omega_0 is in Hz but is 2*pi*f the question is how should omega_0 be specified in netlist
                    if cpt.has_ac:
                        if cpt.args[2] is not None:
                            as_dict["omega_0"] = latex(parse_expr(str(cpt.args[2])) * Hz)
                        else:
                            as_dict["omega_0"] = latex(omega0)
                    elif cpt.has_dc:
                        as_dict["omega_0"] = latex(Mul(0) * Hz)
                    else:
                        raise AssertionError("Voltage Source is not ac or dc")

                elif not cpt.type == "W":
                    cCpt = NetlistLine(ImpedanceToComponent(str(cpt), omega_0=omega0))
                    as_dict[cCpt.type + cCpt.typeSuffix] = latex(
                        Solution.addUnit(
                            cCpt.value,
                            cCpt.type
                        )
                    )
            # ToDo Remove print in release
            print(as_dict)

        elif not (name1 or name2 or newName or lastStep or thisStep or step):
            raise ValueError(f"missing information in {step}: {name1}, {name2}, {newName}, {thisStep}, {lastStep}")

        else:
            state.show_units = True
            cpt1 = lastStep.circuit[name1]
            cpt2 = lastStep.circuit[name2]
            cptRes = thisStep.circuit[newName]

            valCpt1 = str(Solution.getElementSpecificValue(cpt1))
            valCpt2 = str(Solution.getElementSpecificValue(cpt2))
            valCptRes = str(Solution.getElementSpecificValue(cptRes))

            convValCpt1, cvc1Type = ValueToComponent(valCpt1, omega_0=omega0)
            convValCpt2, cvc2Type = ValueToComponent(valCpt2, omega_0=omega0)
            convValCptRes, cvcrType = ValueToComponent(valCptRes, omega_0=omega0)

            if not valCpt1 == convValCpt1 and not valCpt2 == convValCpt2 and not valCptRes == convValCptRes:
                if cvc1Type == cvc2Type:
                    eqVal1 = Solution.addUnit(convValCpt1, cvc1Type)
                    eqVal2 = Solution.addUnit(convValCpt2, cvc2Type)
                    eqRes = Solution.addUnit(convValCptRes, cvcrType)
                    compType = cvc1Type
                    assert compType in ["R", "L", "C"]
                    hasConversion = False
                    convValCpt1 = None
                    convValCpt2 = None
                    convValCptRes = None
                else:
                    eqVal1 = Solution.addUnit(valCpt1, "Z")
                    eqVal2 = Solution.addUnit(valCpt2, "Z")
                    eqRes = Solution.addUnit(valCptRes, "Z")
                    compType = NetlistLine(str(cptRes)).type
                    assert compType == "Z"
                    hasConversion = True
                    convValCpt1 = None
                    convValCpt2 = None
                    convValCptRes = Solution.addUnit(convValCptRes, cvcrType)

            elif valCpt1 == convValCpt1 and valCpt2 == convValCpt2 and not valCptRes == convValCptRes:
                eqVal1 = Solution.addUnit(valCpt1, "Z")
                eqVal2 = Solution.addUnit(valCpt2, "Z")
                eqRes = Solution.addUnit(valCptRes, "Z")
                compType = NetlistLine(str(cpt1)).type
                assert compType == "Z"
                hasConversion = True
                convValCpt1 = None
                convValCpt2 = None
                convValCptRes = Solution.addUnit(convValCptRes, cvcrType)

            else:
                eqVal1 = Solution.addUnit(valCpt1, "Z")
                eqVal2 = Solution.addUnit(valCpt2, "Z")
                eqRes = Solution.addUnit(valCptRes, "Z")
                compType = NetlistLine(str(cpt1)).type
                assert compType == "Z"
                hasConversion = False
                convValCpt1 = None
                convValCpt2 = None
                convValCptRes = None

            equation = Solution.makeLatexEquation(eqVal1, eqVal2, eqRes, thisStep.relation, compType)

            as_dict = {"name1": name1,
                       "name2": name2,
                       "newName": newName,
                       "relation": thisStep.relation,
                       "value1": eqVal1,
                       "value2": eqVal2,
                       "result": eqRes,
                       "latexEquation": equation,
                       "hasConversion": hasConversion,
                       "convVal1": convValCpt1,
                       "convVal2": convValCpt2,
                       "convResult": convValCptRes
                       }
            for key in ["value1", "value2", "result", "convVal1", "convVal2", "convResult"]:
                if as_dict[key]:
                    as_dict[key] = latex(as_dict[key])