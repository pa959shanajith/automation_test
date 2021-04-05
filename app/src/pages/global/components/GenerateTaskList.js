const GenerateTaskList = (tasksJson, type) => {

    let tempDataObj = [];
    let reviewList = [];
    let todoList = [];
    let taskList = [];

    for(let i=0; i < tasksJson.length; i++) {
        let testSuiteDetails =tasksJson[i].testSuiteDetails;
        let tasktype = tasksJson[i].taskDetails[0].taskType;
        let taskname = tasksJson[i].taskDetails[0].taskName;
        let status = tasksJson[i].taskDetails[0].status;

        let dataobj = {
            'uid': tasksJson[i].uid,
            'accessibilityParameters': tasksJson[i].accessibilityParameters,
            'scenarioflag':tasksJson[i].scenarioFlag,
            'scenarioTaskType': tasksJson[i].scenarioTaskType || 'disable',
            'apptype':tasksJson[i].appType,
            'projectid':tasksJson[i].projectId,
            'screenid':tasksJson[i].screenId,
            'screenname':tasksJson[i].screenName,
            'testcaseid':tasksJson[i].testCaseId,
            'testcasename':tasksJson[i].testCaseName,
            'scenarioid':tasksJson[i].scenarioId,
            'taskname':taskname,
            'taskdes':tasksJson[i].taskDetails[0].taskDescription,
            'tasktype':tasktype,
            'subtask':tasksJson[i].taskDetails[0].subTaskType,
            'subtaskid':tasksJson[i].taskDetails[0].subTaskId,
            'assignedtestscenarioids':tasksJson[i].assignedTestScenarioIds,
            'assignedto':tasksJson[i].taskDetails[0].assignedTo,
            'startdate':tasksJson[i].taskDetails[0].startDate,
            'exenddate':tasksJson[i].taskDetails[0].expectedEndDate,
            'status': status,
            'versionnumber':tasksJson[i].versionnumber,
            'batchTaskIDs':tasksJson[i].taskDetails[0].batchTaskIDs,
            'releaseid':tasksJson[i].taskDetails[0].releaseid,
            'cycleid':tasksJson[i].taskDetails[0].cycleid,
            'reuse':tasksJson[i].taskDetails[0].reuse
        }

        if (type === "refList")
            taskList.push({'panel_idx': i, 'testSuiteDetails': testSuiteDetails, 'dataobj': dataobj, 'taskname': taskname, 'tasktype': tasktype});
        else if (type === "pluginList"){
            tempDataObj.push(dataobj);
            if (status === 'underReview') reviewList.push({'panel_idx': i, 'testSuiteDetails': tasksJson[i].testSuiteDetails, 'dataobj': dataobj, 'taskname': taskname, 'tasktype': tasktype})
            else todoList.push({'panel_idx': i, 'testSuiteDetails': tasksJson[i].testSuiteDetails, 'dataobj': dataobj, 'taskname': taskname, 'tasktype': tasktype})
        }
    }

    if (type === "refList") return taskList;
    else if (type === "pluginList") 
        return { 
            dataObjList: tempDataObj,
            reviewList: reviewList, 
            todoList: todoList
        }
    else return [];
}

export default GenerateTaskList;