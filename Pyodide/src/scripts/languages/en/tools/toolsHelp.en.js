toolsHelpEnTexts = {
    qrCodeGen:
        "If you want to share a specific circuit, you can convert the file into a QR code here. " +
        "To do this, select a suitable netlist (can be created in Custom Netlist or in the Editor) and select the task type. " +
        "The QR code will redirect the user directly to the circuit.\n<b>Show the QR code on a white background for best results.</b>",
    qrCodeScan:
        "Use this QR scanner to save yourself the loading time of the page if a circuit is shared via QR code. You can also scan a QR code with your smartphone to access the circuit directly, but then the page needs to be reloaded.",
    trackViewer:
        "After entering the trackingId with key (separated by -) you can track what users do with the circuit. Hover over an icon to see what the user did.",
    svgGen:
        "<b>Important note:</b> The zip folder needs to contain the further folders like resistor, capacitor, ... See also the Circuits_example.zip in your own circuits as example",
    customCircuits:
        "Upload a zip file with your circuits (nothing gets uploaded, all your file stay on your " +
        "local machine). The zip file must have the following structure:<br><br>" +
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
        "The MyCircuits.zip can also directly inlcude the subfolders.<br>" +
        "Download <a href='./Circuits_example.zip' download='Circuits_example.zip'>Circuits_example.zip</a> with an example of how the zip file should look like.<br>" +
        "You do not have to use all folders, but you can not use any others than the following:<br>" +
        "resistor, capacitor, inductor, symbolic, mixed, kirchhoff, magnetic<br>",
    netlistComments:
        "# --generalize:<br>" +
        "This creates a general form of the circuit from the netlist<br><br>" +
        "# --optimize-mobile:<br>" +
        "Rotates the circuit vertically if it is wider than it is high to make it more readable on smartphones<br><br>" +
        "# --optimize-desktop:<br>" +
        "Rotates the circuit horizontally if it is higher than it is wide to make it more readable on desktops<br><br>" +
        "Only one of the optimize options can be used at a time, generalize needs to be active for this.<br><br>" +
        "# --shownodes-true:<br>" +
        "Shows the node numbers of the circuit<br><br>" +
        "Further information can be found in the documentation<br>" +
        "<a href=https://docs.simplipfy.org/source/general/netlists.html>netlist documentation</a>",
}