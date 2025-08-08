from typing import Callable

from simplipfy.Tools.validateCircuitFile import ValidateCircuitFile as VCF


class TestValidateCircuit:
    # correct circuit string
    correctString = "V1 0 1 dc 10; down\nW 0 2; right\nR1 2 3 300; down\nW 3 1; left"

    # circuit string with warnings
    warnings = "V1 0 1\nR1 0 1 100"

    # circuit string with errors
    onlyVoltageSource = "V1 0 1"
    semErrNodes = "V1 0 1 dc 10; down\n W 0 2; right\nR1 3 4 300; down\nW 4 1; left"

    # helper functions to check if a string is empty or not
    @staticmethod
    def isEmptyString(s: str) -> bool:
        return s == ''

    @staticmethod
    def isNotEmptyString(s: str) -> bool:
        return s != ''

    @staticmethod
    def check(validator: VCF, valid: bool, errMsgs: Callable[[str], bool], warnMsgs: Callable[[str], bool]) -> bool:
        try:
            assert validator.isValid() == valid
            assert errMsgs(validator.errMsgs)
            assert warnMsgs(validator.warnMsgs)
            return True

        except AssertionError:
            return False

    def test_noErrors_noWarnings(self):
        self.check(VCF(fileStr=self.correctString), True, self.isEmptyString, self.isEmptyString)

    def test_noErross_withWarnings(self):
        self.check(VCF(fileStr=self.warnings), True, self.isEmptyString, self.isNotEmptyString)

    def test_errors(self):
        self.check(VCF(fileStr=self.onlyVoltageSource), False, self.isNotEmptyString, self.isNotEmptyString)
        self.check(VCF(fileStr=self.semErrNodes), False, self.isNotEmptyString, self.isEmptyString)