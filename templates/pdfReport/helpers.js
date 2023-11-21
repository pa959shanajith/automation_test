function getColor(overAllStatus) {
	if(overAllStatus == "Pass") return "#28a745";
	else if(overAllStatus == "Fail")    return "#dc3545";
	else if(overAllStatus == "Terminate")    return "#ffc107";
}

function validateImageID(path,slno){
	if(path!=null) return "#img-"+slno;
	else return '';
}

function validateImagePath(path) {
	if(path!=null) return 'block';
	else return 'none';
}

function getDataURI(uri) {
	var f="data:image/PNG;base64,";
	if(uri=="fail" || uri=="unavailableLocalServer") return f;
	else return f+uri;
}

Handlebars.registerHelper('ifEquals', function(arg1, arg2, options) {
    return (arg1 == arg2) ? options.fn(this) : options.inverse(this);
});

Handlebars.registerHelper('ifnotEquals', function(arg1, arg2, options) {
    return (arg1 != arg2) ? options.fn(this) : options.inverse(this);
});

