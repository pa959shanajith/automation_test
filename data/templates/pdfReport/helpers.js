function getColor(overAllStatus) {
    if(overAllStatus == "Pass") return "green";
    else if(overAllStatus == "Fail")    return "red";
    else if(overAllStatus == "Terminate")    return "#faa536";
}