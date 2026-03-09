cheatsheetDeTexts = {
    resistanceColHeading:
        "Widerstand R",
    reactanceColHeading:
        "Blindwiderstand X",
    resistorRowHeading:
        "Widerstand R",
	resistorHeading:
		"Widerstand",
    capacitorRowHeading:
        "Kondensator C",
	capacitorHeading:
		"Kondensator",
    inductorRowHeading:
        "Spule L",
	inductorHeading:
		"Spule",
    subTableSeriesHeading:
        "Serie",
    subTableParallelHeading:
        "Parallel",
    subTableHeading:
        "ZUSAMMENFASSUNGS-FORMELN",
	subResistorText:
		"<b>Parallel\n</b><br/>" +
		"Für die Vereinfachung von parallel liegenden Widerständen, werden die Kehrwerte der Widerstände miteinander addiert. Diese ergeben den Kehrwert des Ersatzwiderstandes.\n" +  "<br/>" +
		"In Parallelschaltungen teilt sich der Strom auf und die Spannung bleibt gleich.\n" +  "<br/>" +
		"<b>In Reihe</b>\n<br/>" +
		"Für die Vereinfachung von in Reihe liegenden Widerständen, werden die Widerstandswerte miteinander addiert. Diese ergeben den Widerstandswert des Ersatzwiderstand.\n" +  "<br/>" +
		"In Reihenschalungen bleibt der Strom gleich und die Spannung teilt sich auf.\n" +  "<br/>",
	subCapacitorText:
		"<b>Parallel</b>\n<br/>" +
		"Für die Vereinfachung von parallel liegenden Kondensatoren, werden die Kapazitäten miteinander addiert. Diese ergeben die Kapazität des Ersatzkondensator.\n"+ "<br/>" +
		"<b>In Reihe</b>\n<br/>" +
		"Für die Vereinfachung von in Reihe liegenden Kondensatoren, werden die Kehrwerte der Kapazitäten miteinander addiert. Diese ergeben den Kehrwert der Kapazität des Ersatzkondensator.\n" + "<br/>",
	subInductorText:
		"<b>Parallel</b>\n<br/>" +
		"Für die Vereinfachung von parallel liegenden Spulen, werden die Kehrwerte der Induktivität miteinander addiert. Diese ergeben den Kehrwert der Induktivität der Ersatzspule.\n"+  "<br/>" +
		"<b>In Reihe</b>\n<br/>" +
		"Für die Vereinfachung von in Reihe liegenden Spulen, werden die Induktivitätswerte miteinander addiert. Diese ergeben die Induktivität der Ersatzspule.\n" +  "<br/>",
	resReaTableHeading:
        "KOMPLEXER WIDERSTAND",
	complexText:
		"<b>Allgemein</b><br/>"+
		"Der komplexe Widerstand"+ " \\(\\underline{Z}\\)"+
		", auch elektrische Impedanz genannt, beschreibt den sich wechselnden Widerstand von frequenzbeeinflussten Bauteilen, wie Spulen oder Kondensatoren und tritt in Wechselstromkreisen auf. " +
		"Er setzt sich aus einem Realteil \\(R\\) und Imaginärteil \\(X\\) zusammen."+
		"\\[\\underline{Z} = R + j \\cdot X\\]"+
		"Der Realteil wird auch als Wirkwiderstand bezeichnet und der Imaginärteil wird auch mit Blindwiderstand oder Reaktanz bezeichnet. " +
		"Alternativ kann die Impedanz in Eulerform angegeben werden, in dem der Betrag der Impedanz \\(|\\underline{Z}|\\) für den Scheinwiderstand steht und \\(φ\\) für den Phasenverschiebungswinkel."+
		"\\[\\underline{Z} = |\\underline{Z}| \\cdot e^jφ\\]"+
		"Der Scheinwiederstand ist mit der Formel \\(|\\underline{Z}|= \\sqrt{R^2+X^2}\\) berechenbar und der Phasenverschiebungswinkel wird mit \\(φ = tan^{-1}(\\frac{X}{R})\\) bestimmt.<br/><br/>"+
		"<b>Widerstand</b><br/>"+
		"Die ohmschen Widerstände bilden nur den Wirkwiderstand ab und enthalten keinen Blindwiderstand. \\[\\underline{Z_R} = R\\]"+
		"<b>Spule</b><br/>"+
		"Spulen besitzen lediglich einen Blindwiderstand, der mit höherer Induktivität und Frequenz steigt. \\[\\underline{Z_L} = ω \\cdot L\\]"+
		"<b>Kondensator</b><br/>"+
		"Bei Kondensatoren ist nur ein negativer Blindwiderstand vorhanden, welcher mit steigender Kapazität und Frequenz geringer wird. \\[\\underline{Z_C} = -\\frac{1}{ω \\cdot C}\\]"+
		"<b>Reihenschaltung von Widerstand und Spule</b><br/>"+
		"Wird in einem Wechselstromkreis ein Widerstand und eine Spule in Reihe geschaltet, so lässt sich die Impedanz durch die Kombination von Wirk- und Blindwiderstand berechnen. \\[\\underline{Z} = R + j \\cdot ω \\cdot L\\]"+
		"<b>Reihenschaltung von Widerstand und Kondensator</b><br/>"+
		"Wird in einem Wechselstromkreis ein Widerstand und ein Kondensator in Reihe geschaltet, so lässt sich die Impedanz durch die Kombination von Wirk- und Blindwiderstand berechnen. \\[\\underline{Z} = R - j \\cdot \\frac{1}{ω \\cdot C}\\]"+
		"<b>Reihenschaltung von Widerstand, Spule und Kondensator</b><br/>"+
		"Wird in einem Wechselstromkreis ein Widerstand, eine Spule und ein Kondensator in Reihe geschaltet, so lässt sich die Impedanz durch die Kombination von Wirkwiderstand und die zusammengefassten Blindwiderstände berechnen. \\[\\underline{Z} = R +j \\cdot (ω \\cdot L - \\frac{1}{ω \\cdot C})\\]",
    wheatstoneFormulaHeading:
        "WHEATSTONE-BRÜCKE",
	wheatstoneText:
		"<b>Ausgeglichene Brücke</b><br>"+
		`Damit die Brücke ausgeglichen ist, muss die Brückenspannung \\(U_M\\) gleich null sein. Dieser Fall ist für das folgende Verhältnis der Widerstände gegeben:` +
		"\\[\\frac{R_1}{R_2} = \\frac{R_3}{R_4}\\]" +
		"<b>Unausgeglichene Brücke</b><br/>"+
		`Ist das Verhältnis einer ausgeglichenen Brücke nicht gegeben, so lässt sich die Brückenspannung \\(U_M\\) wie folgt berechnen:` +
		`\\[U_M = U_q \\cdot (\\frac{R_2}{R_1 + R_2} - \\frac{R_4}{R_3 +R_4})\\]`,
	explanationHeading:
		"Erklärung",
	kirchhoffLawHeading:
		"KIRCHHOFFSCHE GESETZE",
	kirchhoffLawLoopHeading:
		"Maschenregel",
	kirchhoffLawNodeHeading:
		"Knotenregel",
	kirchhoffLawLoopText:
		"Die Summe aller in Maschenrichtung zeigenden Spannungen und aller gegen die Maschenrichtung zeigenden Spannungen ist null. " +
		"\\[\\sum_{k=1}^{n} I_k =0\\]",
	kirchhoffLawNodeText:
		"Der in einen Knoten fließende Strom ergibt mit dem herausfließenden Strom in Summe null."+
		"\\[\\sum_{k=1}^{n} U_k =0\\]",
}