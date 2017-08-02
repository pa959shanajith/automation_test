function getColor(overAllStatus) {
    if(overAllStatus == "Pass") return "green";
    else if(overAllStatus == "Fail")    return "red";
    else if(overAllStatus == "Terminate")    return "#faa536";
}

function getStyle(StepDescription) {
    if(StepDescription.indexOf("Testscriptname") !== -1 || StepDescription.indexOf("TestCase Name") !== -1) return "bold";
    else return;
}