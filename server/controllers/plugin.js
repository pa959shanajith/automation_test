var create_ice = require('../controllers/create_ice');

//getProjectIds
exports.getProjectIDs_Nineteen68 = function (req, res) {
	if (req.cookies['connect.sid'] != undefined) {
		var sessionCookie = req.cookies['connect.sid'].split(".");
		var sessionToken = sessionCookie[0].split(":");
		sessionToken = sessionToken[1];
	}
	if (sessionToken != undefined && req.session.id == sessionToken) {
			req.session.userObj = req.body;
		create_ice.getProjectIDs_Nineteen68(req.session.userObj, function (err, data) {
			if (err) {
				console.log(err);
				res.send('fail');
			} else {
				res.send(data);
			}
		});
	} else {
		res.send("Invalid Session");
	}
};
