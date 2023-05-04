
db.auth("avoassure",pwd);
print(pwd)

print(db.auth)

// printjson (_id);
print ("exporting");

try {
    let mindmapids=db.mindmapIdslist.find({"_id":ObjectId(idlistId)},{"_id":0,"mindmapids":1}).toArray()
    let apptypeName=db.mindmapIdslist.find({"apptypeName":{$exists:true}},{"_id":0,"apptypeName":1}).toArray()
    moduleids=mindmapids[0]["mindmapids"]
    apptypeName=apptypeName[0]["apptypeName"]
    
  db.ExportedFile.drop()
  db.mindmaps.aggregate([{'$match': {"_id": {'$in':moduleids}}},{"$out":"Export_mindmap"}])
  db.Export_mindmap.updateMany({},{"$set":{"appType":"Web"}})
  db.testscenarios.aggregate([{'$match': {"parent": {'$in':moduleids}}},
  {"$out":"Export_testscenarios"}])
  var scenarioIds=db.Export_testscenarios.aggregate( [
    {"$group":{"_id":null,"scenarioids":{"$push":"$_id"}}}, 
    {"$project":{"_id":0,"scenarioids":1}}
    ] ).toArray()
    
    var scenarios=scenarioIds[0]["scenarioids"]
  db.screens.aggregate([{'$match': {"parent": {'$in':scenarios}}},{"$out":"Export_screens"}])
  var screenIds=db.Export_screens.aggregate( [
    {"$group":{"_id":null,"screenids":{"$push":"$_id"}}}, 
    {"$project":{"_id":0,"screenids":1}}
    ] ).toArray()    
    var screens=screenIds[0]["screenids"]  
  db.testcases.aggregate([{'$match': {"screenid": {'$in':screens}}},
      {"$out":"Export_testcases"}])
  db.dataobjects.aggregate([{'$match': {"parent": {'$in':screens}}}
      ,{"$out":"Export_dataobjects"}])
  
  
  


  

print("exported")
  
}
catch (ex) {
    printjson(ex);
}



