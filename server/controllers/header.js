/**
 * Dependencies.
 */
var Joi = require('joi');
var dbConn = require('../../server/config/icetestautomation');
var cassandra = require('cassandra-driver');


exports.getProjectDetails_ICE = function (req, res) {
            //base request elements
            var requestedprojectid = req.body.projectId;
            //response data
            responsedata={
                domainid:"",
                projectname:"",
                projectid:"",
                projecttypeid:""
            }
            /*
             * Query 1 fetching the domainid,projectname,projectid,projecttypeid
             * based on projectid
             */
            var fetchprojectDetails="select domainid,projectname,projectid,projecttypeid from projects"+
            " where projectid="+requestedprojectid;
            dbConn.execute(fetchprojectDetails, function (fetchprojectDetailserr, fetchprojectDetailsresult) {
                if (fetchprojectDetailserr) {
                    var flag = "Error in fetchprojectDetails : Fail";
                    res.send(flag);
                }else {
                    for (var index = 0; index < fetchprojectDetailsresult.rows.length; index++) {
                        responsedata.domainid=fetchprojectDetailsresult.rows[index].domainid;
                        responsedata.projectname=fetchprojectDetailsresult.rows[index].projectname;
                        responsedata.projectid=fetchprojectDetailsresult.rows[index].projectid;
                        responsedata.projecttypeid=fetchprojectDetailsresult.rows[index].projecttypeid;
                    }
                    res.send(responsedata);
                }
            });
        }
exports.logoutUser_Nineteen68 = function (req, res) {
    req.session.destroy();
        if(req.session == undefined)
        {
            res.send('Session Expired');
        }
};

//getReleaseName Functionality
	exports.getReleaseNameByReleaseId_ICE = function (req, res) {
		var releaseId = req.body.releaseId;
		var projectId = req.body.projectId;
		if(projectId === 'undefined' || projectId === null|| projectId === ''|| releaseId ==='undefined' || releaseId === null || releaseId === ''){
			console.log('Invalid data received in getReleaseNameByReleaseId_ICE');
		}else{
			var getReleaseName = "select releasename from icetestautomation.releases where releaseid = "+releaseId+" and projectid = "+projectId+"";
			console.log("sd", getReleaseName)
			dbConn.execute(getReleaseName, function(err, result) {
				//console.log("Result", result);
				var	releaseName = '';
				if(err){
					console.log(err);
				}else{
					if(result.rows.length > 0){
						for (var i = 0; i < result.rows.length; i++) {
						releaseName = result.rows[i].releasename;
						}
					}
					else{
						releaseName = "";
					}
				}
					try{
						res.send(releaseName);
					}catch(ex){
						console.log("Exception occured in getReleaseNameByReleaseId_ICE : ",ex)
					}
			});
		}
	  }

//get cycleName
exports.getCycleNameByCycleId_ICE = function (req, res) {
	if(req.body.cycleId === 'undefined' || req.body.cycleId === null|| req.body.cycleId === ''|| req.body.releaseId ==='undefined' || req.body.releaseId === null || req.body.releaseId === '')
	{
		console.log('Invalid data received in getCycleNameByCycleId_ICE');
	}else{
	var getCycleName = "select cyclename from cycles where releaseid = "+req.body.releaseId+" and cycleid = "+req.body.cycleId+"";
		dbConn.execute(getCycleName, function(err, result) {
							if(err){ console.log(err);
							}
							else{
								if(result.rows.length > 0)
								{
										for (var i = 0; i < result.rows.length; i++) {
										    cycleName = result.rows[i].cyclename;
								          }	
								}
								else{
									cycleName = "";
								}
									try{
										res.send(cycleName);
									}catch(ex){
										console.log("Exception occured in getCycleNameByCycleId : ",ex)
									}
							}
		});
	}
}