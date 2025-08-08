window.uploadEnTexts = {
    uploadHelpBtn:
        "Help",
    uploadBtn:
        "Load circuits",
    uploadModalTitle:
        "Use custom circuits",
    uploadModalText:
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
        "Download <a href='./Circuits_example.zip' download='Circuits_example.zip'>Circuits_example.zip</a> with an example of how the zip file should look like.<br>" +
        "You do not have to use all folders, but you can not use any others than the following:<br>" +
        "resistor, capacitor, inductor, symbolic, mixed, kirchhoff<br>",
    downloadInfoMsg:
        "A link was attached, should the circuits be downloaded from this link?<br><b>Only click yes if you were expecting this link!</b><br>",
    no:
        "No",
    yes:
        "Yes",
    uploadNote:
        "Select the zip folder you just downloaded"
}