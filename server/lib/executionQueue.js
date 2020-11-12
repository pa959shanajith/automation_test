var utils = require('../lib/utils');
var suite = require('../controllers/suite')
const redisServer = require('./redisSocketHandler');

class Execution_Queue{
    static queue_list = {}
    static project_list = {}
    static ice_list = {}
    
    static queue_init(){
        var _this = this
        var fnName = 'instantiateQueue'
        var inputs = {
            "projectids": [],
            "poolid": "all"
        }
        _this.queue_list, _this.project_list, _this.ice_list = setUpPool(inputs)

    }

    static register_execution_trigger_ICE(ice_name){
        ice_list[ice_name]["status"] = true
        redisServer.redisSubServer.subscribe('ICE2_'+ice_name);
        redisServer.redisSubServer.on("message",triggerExecution);
    }
    
    static addTestSuiteToQueue(batchExecutionData, execIds, userInfo,type){
        var targetICE = "";
        var projectid = "";
        if (userInfo.icename){
            targetICE = userInfo.icename;
        }
        if( batchExecutionData.batchInfo[0] && batchExecutionData.batchInfo[0].projectid){
            projectid = batchExecutionData.batchInfo[0].projectid;
        }
        var testSuite = {"batchExecutionData":batchExecutionData,"execIds": execIds, "userInfo": userInfo,"type":type}
        if(targetICE && targetICE in ice_list && ice_list[targetICE]["poolid"] in queue_list){
            if(ice_list[ice_name]["mode"]){
                result = executeTestSuite(batchExecutionData, execIds, userInfo, type);
                return true;
            }
            pool = queue_list[ice_list[targetICE]["poolid"]];
            pool["execution_list"].push(testSuite);
            return true;
        }else if(projectid && projectid in project_list){
            pools = project_list[projectid];
            poolid = getLeastLoadedPool(pools);
            pool = queue_list[poolid];
            pool["execution_list"].push(testSuite);
            return true;
        }else{
            result = executeTestSuite(batchExecutionData, execIds, userInfo, type)
            return true;
        }
        return false;
    }
     
    getLeastLoadedICE(poolQueues){
        var min =  Number.MAX_SAFE_INTEGER
        var index = "";
        for (poolid in poolQueues){
            if (queue_list[poolQueues[poolid]]["execution_list"].size() < min){
                min = queue_list[poolQueues[poolid]]["execution_list"].size();
                index = poolid;
            }
        }
        return index;
    }   
}


async function triggerExecution(channel, ice_data){
    var data = JSON.parse(ice_data)
    var result = false
    if (channel != "ICE2_" + data.username && data.onAction != 'ice_status_change') return;
    var ice_name = data.username
    if(!ice_name in ice_list){
        return result;
    }
    ice_list[ice_name]["mode"] = data.mode
    if(data.mode){
        return result;
    } 
    poolid = ice_list[ice_name]["poolid"]
    pool = queue_list[poolid]
    queue = pool["execution_list"] 
    for(i = 0; i < queue.length; i++){
        testSuite = queue[i];
        if(testSuite.userInfo.icename === ice_name || testSuite === "any"){
            console.log("---------------- Sending Execution request -----------------");
            try{
                result = await executeTestSuite(testSuite.batchExecutionData, testSuite.execIds, testSuite.userInfo, testSuite.type)
                queue.splice(i,1);
                switch(testSuite.type){
                    case 'ACTIVE': break;
                    case 'API': break;
                    case 'SCHEDULE': break;
                }
            }catch(e){
                logger.error("Error in triggerExecution. Error: %s",e);
            }
            break;
        }
    }
    return result;
} 


async function setUpPool(inputs){
    const fnName = "setUpPool"
    projectid = {}
    ice_list = {}
    queue_list = {}
    try{
        pools = await utils.fetchData(inputs, "admin/getPools", fnName);
        for(index in pools){
            pool = pools[index]
            var poolid = pool["_id"];
            queue_list[poolid] = {};
            queue_list[poolid]["name"] = pool["poolname"];
            project_list = setUpProjectList(pool["projectids"],poolid);
            inputs = {
                "poolids" : [poolid]
            }
            queue_list[poolid]["ice_list"] = await utils.fetchData(inputs, "/admin/getICE_pools", fnName);
            ice_list = setUpICEList(queue_list[poolid]["ice_list"],poolid);
            queue_list[poolid]["execution_list"] = []
        }
        return queue_list,project_list,ice_list
    }catch(exception){
        console.log(exception)
    }
    return queue_list,project_list,ice_list
}

function setUpProjectList(projectids,poolid){
    project_list = {}
    for (project in projectids){
        projectid = projectids[project];
        if (projectid in project_list){
            project_list[projectid].push(poolid);
        }else{
            project_list[projectid] = [poolid];
        }
    }
    return project_list
}

function setUpICEList(list,poolid){
    ice_list = {}
    for (ice in list){
        ice_name = list[ice];
        ice_list[ice_name] = {}
        ice_list[ice_name]["poolid"] = poolid;
        ice_list[ice_name]["mode"] = false
        ice_list[ice_name]["status"] = false
    }
    return ice_list;
}

async function executeTestSuite(batchExecutionData, execIds, userInfo,type){
    try {
		result = await suite.executionFunction(batchExecutionData, execIds, userInfo, type);
	} catch (ex) {
		result = "fail";
		logger.error("Error in ExecuteTestSuite_ICE service. Error: %s", ex)
	}
	//if (result == DO_NOT_PROCESS) return true;
	return result;
}

module.exports.Execution_Queue = Execution_Queue