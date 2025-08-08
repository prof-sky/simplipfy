from simplipfy.KirchhoffSolver.kirchhofSolver import KirchhoffSolver as khs
from simplipfy.KirchhoffSolver.kirchhoffStates import KirchhoffStates as ks


class TestKirchhoffSolver:
    voltTestCase = [
        (["Va", "R1", "R3"], ks.isNewEquation, '0 = - U_{ges} + U_{1} + U_{3}', False, False, 1),
        (["R3", "R4"], ks.notAValidEquation, "", False, False, 1),
        (["Va", "R2", "R1", "R4"], ks.notAValidLoopOrder, "", False, False, 1),
        (["Va", "R1", "R3"], ks.duplicateEquation, '0 = - U_{ges} + U_{1} + U_{3}', False, False, 1),
        (["R3", "R2", "R4"], ks.isNewEquation, "0 = - U_{3} + U_{2} + U_{4}", True, False, 2)
    ]
    curTestCase = [
        (["R1", "R3"], ks.notAValidEquation, ("", "", ""), True, False, 2),
        (["R2", "R3"], ks.notAValidEquation, ("", "", ""), True, False, 2),
        (["R1", "R4"], ks.notAValidEquation, ("", "", ""), True, False, 2),
        (
                ["R1", "R2", "R3"], ks.isNewEquation,
                ('0 = + I_{1} - I_{2} - I_{3}', '0 = - I_{1} - I_{2} - I_{3}', '0 = + I_{1} + I_{2} + I_{3}'),
                True, False, 3
        ),
        (["R1", "R4"], ks.notAValidEquation, ("", "", ""), True, False, 3),
        (
                ["R1", "R2", "R3"], ks.duplicateEquation,
                ('0 = + I_{1} - I_{2} - I_{3}', '0 = - I_{1} - I_{2} - I_{3}', '0 = + I_{1} + I_{2} + I_{3}'),
                True, False, 3,
        ),
        (
                ["R2", "R4"], ks.isNewEquation,
                ('0 = + I_{2} - I_{4}', '0 = - I_{2} - I_{4}', '0 = + I_{2} + I_{4}'),
                True, True, 4
        )
    ]

    def test_checkVoltageLoopRule(self):

        solver = khs("00_Resistor_Hetznecker.txt", "../Circuits/kirchhoff/", {"volt": "U", "total": "ges"})
        for case in self.voltTestCase:
            cpts, exState, exEq, allVoltEq, allEq, lenEq = case
            state, eq = solver.checkVoltageLoopRule(cpts)
            assert state == exState.value, f"Expected {exState}, but got {ks(state)}"
            assert eq == exEq, f"Expected {exEq}, but got {eq}"
            assert solver.foundAllVoltEquations() == allVoltEq, f"Expected foundAllVoltEquations to be {allVoltEq}, but got {solver.foundAllVoltEquations()}"
            assert solver.foundAllEquations() == allEq, f"Expected foundAllEquations to be {allEq}, but got {solver.foundAllEquations()}"
            assert len(solver.equations()) == lenEq, f"Expected length of equations to be {lenEq}, but got {len(solver.equations())}"

    def test_checkJunctionRule(self):
        solver = khs("00_Resistor_Hetznecker.txt", "../Circuits/kirchhoff/", {"volt": "U", "total": "ges"})
        for veq in self.voltTestCase:
            solver.checkVoltageLoopRule(veq[0])

        for case in self.curTestCase:
            cpts, exState, exEq, allVoltEq, allEq, lenEq = case
            state, eq = solver.checkJunctionRule(cpts)
            assert state == exState.value, f"Expected {exState}, but got {ks(state)}"
            assert eq == exEq, f"Expected {exEq}, but got {eq}"
            assert solver.foundAllVoltEquations() == allVoltEq, f"Expected foundAllVoltEquations to be {allVoltEq}, but got {solver.foundAllVoltEquations()}"
            assert solver.foundAllEquations() == allEq, f"Expected foundAllEquations to be {allEq}, but got {solver.foundAllEquations()}"
            assert len(solver.equations()) == lenEq, f"Expected length of equations to be {lenEq}, but got {len(solver.equations())}"
