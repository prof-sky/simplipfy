cheatsheetEnTexts = {
    resistanceColHeading:
        "Resistance R",
    reactanceColHeading:
        "Reactance X",
    resistorRowHeading:
        "Resistor R",
	resistorHeading:
		"Resistor",
    capacitorRowHeading:
        "Capacitor C",
	capacitorHeading:
		"Capacitor",
    inductorRowHeading:
        "Inductor L",
	inductorHeading:
		"Inductor",
    subTableSeriesHeading:
        "Series",
    subTableParallelHeading:
        "Parallel",
    subTableHeading:
        "SUBSTITUTION FORMULAS",
	subResistorText:
		"<b>Parallel</b><br/>" +
		"To simplify parallel resistors, the inverse values of the resistors are added together. This gives the inverse value of the equivalent resistance.\n" + "<br/>" +
		"In parallel circuits, the current is divided and the voltage remains the same. \n" + "<br/>" +
		"<b>Series</b><br/>" +
		"To simplify resistors connected in series, the resistance values are added together. This gives the resistance value of the equivalent resistor.\n" + "<br/>" +
		"In series circuits, the current remains the same and the voltage is divided." + "<br/>",
	subCapacitorText:
		"<b>Parallel</b><br/>" +
		"To simplify parallel capacitors, the capacities are added together. This gives the capacitance of the equivalent capacitor.\n"+ "<br/>"+
		"<b>Series</b><br/>" +
		"To simplify capacitors connected in series, the inverse values of the capacities are added together. These give the inverse value of the capacitance of the equivalent capacitor.\n" + "<br/>",
	subInductorText:
		"<b>Parallel</b><br/>" +
		"To simplify parallel inductors, the inverse values of the inductance are added together. These result in the inverse value of the inductance of the equivalent inductor.\n"+ "<br/>" +
		"<b>Series</b><br/>" +
		"To simplify a series of connected inductors, their inductance values are added together. This gives the inductance of the equivalent inductor.\n" + "<br/>",
	resReaTableHeading:
        "COMPLEX IMPEDANCE",
	complexText:
		"<b>General</b><br/>" +
		"The complex resistance, \\(\\underline{Z}\\)" +
		" also known as electrical impedance, describes the changing resistance of frequency-influenced components such as coils or capacitors and occurs in alternating current circuits. " +
		"It consists of a real part \\(R\\) and an imaginary part \\(X\\)."+
		"\\[\\underline{Z} = R + j \\cdot X\\]"+
		"The real part is also referred to as effective resistance, and the imaginary part is also referred to as reactance. " +
		"Alternatively, the impedance can be specified in Euler form, where the magnitude of the impedance \\(|\\underline{Z}|\\) represents the apparent resistance and \\(φ\\) represents the phase shift angle."+
		"\\[\\underline{Z} = |\\underline{Z}| \\cdot e^jφ\\]"+
		"The apparent resistance can be calculated using the formula \\(|\\underline{Z}|= \\sqrt{R^2+X^2}\\), and the phase shift angle is determined using \\(φ = tan^{-1}(\\frac{X}{R})\\).<br/><br/>"+
		"<b>Resistor</b><br/>"+
		"Ohmic resistors only represent the effective resistance and do not include any reactive resistance. " +
		"\\[\\underline{Z_R} = R\\]"+
		"<b>Inductor</b><br/>"+
		"Inductors only have reactive resistance, which increases with higher inductance and frequency. " +
		"\\[\\underline{Z_L} = ω \\cdot L\\]"+
		"<b>Capasitor</b><br/>"+
		"Capacitors only have negative reactive resistance, which decreases as capacity and frequency increase. " +
		"\\[\\underline{Z_C} = -\\frac{1}{ω \\cdot C}\\]"+
		"<b>Series connection of resistor and inductor</b><br/>"+
		"If a resistor and an inductor are connected in series in an alternating current circuit, the impedance can be calculated by combining the effective resistance and reactance. " +
		"\\[\\underline{Z} = R + j \\cdot ω \\cdot L\\]"+
		"<b>Series connection of resistor and capasitor</b><br/>"+
		"If a resistor and a capacitor are connected in series in an alternating current circuit, the impedance can be calculated by combining the effective resistance and reactance. " +
		"\\[\\underline{Z} = R - j \\cdot \\frac{1}{ω \\cdot C}\\]"+
		"<b>Series connection of resistor, inductor and capasitor</b><br/>"+
		"If a resistor, an inductor, and a capacitor are connected in series in an alternating current circuit, the impedance can be calculated by combining the effective resistance and the combined reactive resistances. " +
		"\\[\\underline{Z} = R +j \\cdot (ω \\cdot L - \\frac{1}{ω \\cdot C})\\]",
	wheatstoneFormulaHeading:
        "WHEATSTONE BRIDGE",
	wheatstoneText:
		"<b>Balanced bridge</b>"+"<br/>"+
		"In order for the bridge to be balanced, the bridge voltage \\(V_M\\) must be zero. This case is given for the following ratio of resistances:" +
		"\\[\\frac{R_1}{R_2} = \\frac{R_3}{R_4}\\]" +
		"<b>Unbalanced bridge</b>"+"<br/>"+
		"If the ratio of a balanced bridge is not given, the bridge voltage \\(V_M\\) can be calculated as follows:" +
		"\\[V_M = V_q \\cdot (\\frac{R_2}{R_1 + R_2} - \\frac{R_4}{R_3 +R_4})\\]",
	explanationHeading:
		"Explanation",
	kirchhoffLawHeading:
		"KIRCHHOFF'S LAWS",
	kirchhoffLawLoopHeading:
		"Loop Law",
	kirchhoffLawNodeHeading:
		"Node Law",
	kirchhoffLawLoopText:
		"The sum of all voltages pointing in the loop direction, with all voltages pointing against the loop direction, is zero. " +
		"\\[\\sum_{k=1}^{n} I_k =0\\]",
	kirchhoffLawNodeText:
		"The current flowing into a node adds up to zero with the current flowing out."+
		"\\[\\sum_{k=1}^{n} V_k =0\\]",
}