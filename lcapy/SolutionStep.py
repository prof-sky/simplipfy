from lcapy import Circuit


class SolutionStep:
    def __init__(self, step: tuple):
        self.circuit = step[0]
        self.cpt1 = step[1]
        self.cpt2 = step[2]
        self.newCptName = step[3]
        self.relation = step[4]
        self.is_initial_step = not (step[1] or step[2] or step[3] or step[4])
        self.LastStep = None
        self.NextStep = None
