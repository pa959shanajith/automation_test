function getColor(overAllStatus) {
	if(overAllStatus == "Pass") return "green";
	else if(overAllStatus == "Fail")    return "red";
	else if(overAllStatus == "Terminate")    return "#faa536";
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