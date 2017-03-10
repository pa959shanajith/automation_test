var express = require('express');
var router = express.Router();

/* GET Login page. */
router.get('/', function(req, res, next) {
	if(!req.session.uniqueID) res.status(200).render('index.jade',{title:'Mindmap'});
	else res.status(200).redirect('/home');
});

/* POST Login page. */
router.post('/', function(req, res, next) {
	var isValid=false;
	// Remove Below 2 lines after login service is enabled.
	isValid=true;	// Remove this
	var userID = {username:'MD',id:'bf518e45-efbb-4127-b6dd-79f81977ce53',project:{id:'712da980-740c-4483-9e8e-d82594e5354c',name:''},attributes:{fName:'Ranjan',lName:'Agrawal',role:'Developer'}};	// Remove this
	/*ADD LOGIN MODULE HERE*/

	if (isValid) {
		req.session.uniqueID = userID;
		res.status(200).redirect('/home');
	}
	else {
		req.session.uniqueID = undefined;
		res.status(401).redirect('/');
	}
});

module.exports = router;
