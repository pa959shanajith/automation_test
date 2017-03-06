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
