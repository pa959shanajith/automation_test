
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
  db.mindmaps.aggregate([{'$match': {"_id": {'$in':moduleids}}},{"$lookup":{
    from: "screens",
    localField: "testscenarios.screens._id",
    foreignField: "_id",
    as: "screens"}},
 {"$lookup":{
    from: "testcases",
    localField: "testscenarios.screens.testcases",
    foreignField: "_id",
    as: "testcases"}},
    {"$lookup":{
from:"dataobjects",
localField:"testscenarios.screens._id",
foreignField:"parent",
as: "dataobjects"}},{"$lookup":{
from: "testscenarios",
localField: "testscenarios._id",
foreignField: "_id",
as: "Scenarios"}}
,{$set:{"screens":{ $cond: [{$eq: [{$size: '$screens'}, 0] }, [[]], '$screens'] },
"Scenarios":{ $cond: [{$eq: [{$size: '$Scenarios'}, 0] }, [[]], '$Scenarios'] },
"testcases":{ $cond: [{$eq: [{$size: '$testcases'}, 0] }, [[]], '$testcases'] }}},
{$project:{"_id":0,"mindmapId_id":"$_id","name":1,"versionnumber":1,"createdthrough":1,"deleted":1,"testscenarios":1,"screens._id":1,"screens.name":1,"screens.parent":1,"screens.screenshot":1,"screens.scrapedurl":1,"screens.orderlist":1,
"testcases._id":1,"testcases.name":1,"testcases.screenid":1,"testcases.steps":1,
"dataobjects":{ $cond: [{$eq: [{$size: '$dataobjects'}, 0] }, [[]], '$dataobjects'] },
"Scenarios._id":1,"Scenarios.name":1,"Scenarios.parent":1,"Scenarios.testcaseids":1,}},
 
{$unwind:"$Scenarios"},{$unwind:"$screens"},{$unwind:"$testcases"},{$unwind:"$dataobjects"},{"$out":"ExportedFile"}])
db.mindmapIdslist.drop()
db.ExportedFile.insertOne({"apptype":apptypeName})

  

print("exported")
  
}
catch (ex) {
    printjson(ex);
}



