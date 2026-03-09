toolsHelpDeTexts = {
    qrCodeGen:
        "Wenn du eine bestimmte Schaltung teilen m&oumlchtest, dann kannst du die Datei hier zu einem QR-Code umwandeln. " +
        "Wähle dazu eine gegeignete Netzliste aus (kann in Eigene Netzliste oder im Editor erstellt werden) und wähle die Aufgabenart aus. " +
        "Dieser QR-Code leitet den Nutzer direkt zur Schaltung weiter.\n<b>Zeige diesen QR Code auf einem weißen Hintergrund an, um die besten Ergebnisse zu bekommen.</b>",
    qrCodeScan:
        "Nutze diesen QR-Scanner um dir die Ladezeit der Seite zu sparen, wenn eine Schaltung per QR Code geteilt wird. Du kannst auch einen QR-Code mit deinem Smartphone scannen, um direkt zur Schaltung zu gelangen, dann muss jedoch die Seite neu geladen werden.",
    trackViewer:
        "Nach Eingeben der TrackingId mit Schlüssel (mit - getrennt) kannst du verfolgen was die Nutzer mit der Schaltung machen. Gehe mit der Maus über ein Symbol um zu sehen, was der Nutzer gemacht hat.",
    svgGen:
        "<b>Wichtiger Hinweis:</b> Der zip Ordner muss die weiteren Ordner enthalten wie resistor, capacitor, ... Siehe auch das Circuits_example.zip in den eigenen Schaltungen als Beispiel",
    netlistComments:
        "# --generalize:<br>" +
        "Erstellt eine allgemeine Form des Schaltkreises aus der Netzliste<br><br>" +
        "# --optimize-mobile:<br>" +
        "Dreht den Schaltkreis vertikal, wenn er breiter als hoch ist, um ihn auf Smartphones lesbarer zu machen<br><br>" +
        "# --optimize-desktop:<br>" +
        "Dreht den Schaltkreis horizontal, wenn er h&oumlher als breit ist, um ihn auf Desktops lesbarer zu machen<br><br>" +
        "Nur eine der Optimierungsoptionen kann gleichzeitig verwendet werden, generalize muss aktiv sein, damit dies funktioniert." +
        "<br><br>" +
        "# --shownodes-true:<br>" +
        "Zeigt die Knotennummern des Schaltkreises an<br><br>" +
        "Weitere Informationen finden Sie in der Dokumentation<br>" +
        "<a href=https://docs.simplipfy.org/source/general/netlists.html>Netlist Dokumentation</a>",
    customCircuits:
        "L&aumldt eine ZIP-Datei mit eigenen Schaltkreisen von Ihrem Computer (kein Server upload)." +
        "Die ZIP-Datei ben&oumltigt die folgende Ordner-Strucktur:<br><br>" +
        "<p style='text-align: left'>" +
        "MyCircuits.zip<br>" +
        "-- MyCircuits<br>" +
        "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;-- resistor<br>" +
        "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;-- file1.txt<br>" +
        "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;-- file2.txt<br>" +
        "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;-- capacitor<br>" +
        "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;-- file1.txt<br>" +
        "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;-- inductor<br>" +
        "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;-- file1.txt<br>" +
        "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;-- symbolic<br>" +
        "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;-- file1.txt<br>" +
        "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;-- mixed<br>" +
        "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;-- file1.txt<br>" +
        "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;-- kirchhoff<br>" +
        "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;-- file1.txt<br>" +
        "<br></p>" +
        "Die Ordner können auch direkt im zip liegen, ohne in einem Unterordner zu sein. <br>" +
        "Download <a href='./Circuits_example.zip' download='Circuits_example.zip'>Circuits_example.zip</a> f&uumlr ein Beispiel ZIP-Datei.<br>" +
        "Sie m&uumlssen nicht alle Ordner verwenden, m&uumlssen sich aber auf die folgenden Ordner beschr&aumlnken:<br>" +
        "resistor, capacitor, inductor, symbolic, mixed, kirchhoff, magnetic<br>",
}