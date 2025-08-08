from enum import Enum


class CPrintColors(Enum):
    """
    ANSI escape codes for colored text in the terminal.
    """
    PURPLE = '\033[95m'
    BLUE = '\033[94m'
    CYAN = '\033[96m'
    GREEN = '\033[92m'
    YELLOW = '\033[93m'
    RED = '\033[91m'
    HEADER = PURPLE
    OKBLUE = BLUE
    OKCYAN = CYAN
    OKGREEN = GREEN
    WARNING = YELLOW
    FAIL = RED


def cPrint(text: str, color: CPrintColors = CPrintColors.RED, bold=False, underline=False):
    """
    param text: str to print
    param color: BColors enum value to set the color of the text

    Print colored text to the console, with a default color of red.
    """
    if bold:
        text = '\033[1m' + text
    if underline:
        text = '\033[4m' + text

    print(color.value + text + '\033[0m')