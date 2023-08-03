function getColor(overAllStatus) {
    if(overAllStatus == "Pass") return "green";
    else if(overAllStatus == "Fail")    return "red";
    else if(overAllStatus == "Terminate")    return "#faa536";
}

function getStyle(StepDescription) {
    if(StepDescription.indexOf("Testscriptname") !== -1 || StepDescription.indexOf("TestCase Name") !== -1) return "bold";
    else return;
}

Handlebars.registerHelper('ifEquals', function(arg1, arg2, options) {
    return (arg1 == arg2) ? options.fn(this) : options.inverse(this);
});

Handlebars.registerHelper('ifnotEquals', function(arg1, arg2, options) {
    return (arg1 != arg2) ? options.fn(this) : options.inverse(this);
});
function getClass(StepDescription) {
    if(StepDescription.indexOf("Testscriptname") !== -1 || StepDescription.indexOf("TestCase Name") !== -1) return "collapsible-tc demo1";
    else return "rDstepDes tabCont";
}