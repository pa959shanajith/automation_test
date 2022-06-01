export function getAccessRules (data) {
    let standards = [];
    for (let stdobj of data['access-rules']) {
        standards.push(stdobj.tag);
    }
    return standards;
} 


export function prepareOptionLists (reportData) {
    let projectList = [];
    let dataDict = {};

    for (let project of reportData) {
        projectList.push({ key: project._id, text: project.name });
        dataDict[project._id] = { relList: [], relDict: {}, name: project.name };

        for (let release of project.releases) {
            dataDict[project._id].relList.push({ key: release.name, text: release.name});
            dataDict[project._id].relDict[release.name] = { cycList: [], name: release.name };

            for (let cycle of release.cycles) {
                dataDict[project._id].relDict[release.name].cycList.push({ key: cycle._id, text: cycle.name })
            }
        }

    }

    return [projectList, dataDict];
}

const moduleTypeDict = { 'basic': 'Module', 'batch': 'Batch', 'endtoend': 'End to End' };

export function prepareModuleList (modulesData) {
    let moduleList = [];
    
    for (let moduleItem of modulesData.modules) {
        let moduleObj = { key: moduleItem._id, text: moduleItem.name, data : { secondaryText: moduleTypeDict[moduleItem.type] }, type: 'module' };
        moduleList.push(moduleObj);
    }

    for (let moduleName of modulesData.batch) {
        if (moduleName){
            let moduleObj = { key: moduleName, text: moduleName, data : { secondaryText: moduleTypeDict['batch'] }, type: 'batch' };
            moduleList.push(moduleObj);
        }
    }

    return moduleList;
}

export function getFunctionalBarChartValues (scenarioList) {
    let legends = [
        { text: "Pass", badgeText: "P" }, 
        { text: "Fail", badgeText: "F" }, 
        { text: "Incomplete", badgeText: "I" }, 
        { text: "Terminated", badgeText: "T" }
    ];

    let values = {
        "Pass": { value: 0 },
        "Fail": { value: 0 },
        "Incomplete": { value: 0 },
        "Terminated": { value: 0 },
    }

    let total = 0;

    for (let scenario of scenarioList) {
        let status = scenario.status;
        if (status === "Terminate") status = "Terminated";
        values[status].value += 1;
        total += 1;
    }

    if (!total) total = 1;

    for (let legend of legends) {
        values[legend.text].value =  Math.round(( values[legend.text].value / total ) * 10000)/100;
    }
    
    return [legends, values];
}

export function prepareScreenList (screenData) {
    let allKeys = Object.keys(screenData);
    let screenList = [];
    for (let key of allKeys) {
        screenList.push({key: key, text: screenData[key]})
    }

    return screenList;
}

export function getStandardData (ruleMap, accessRules) {
    let standardList = [];
    let ruleNameDict = {};
    for (let accessRule of accessRules) {
        if (accessRule.selected)
            ruleNameDict[accessRule.tag.replace(".", "_")] = { name: accessRule.name, status: (accessRule.pass ? "Pass" : "Fail"), tag: accessRule.tag };
    }
    for (let rule in ruleMap) {
        if (rule in ruleNameDict)
            standardList.push({ testscenarioname: ruleNameDict[rule].name, status: ruleNameDict[rule].status, tag: ruleNameDict[rule].tag })
    }
    return standardList;
}

export function getAccessibilityBarChartValues (accessRules)  {
    let legends = [
        { text: "Pass", badgeText: "P" }, 
        { text: "Fail", badgeText: "F"}, 
        { text: "Not applicable", badgeText: "NA" }, 
    ];

    let values = {
        "Pass": { value: 0 },
        "Fail": { value: 0 },
        "Not applicable": { value: 0 },
    }

    let total = 0;

    for (let accessRule of accessRules) {
        if (accessRule.selected) {
            if (accessRule.pass) values['Pass'].value += 1;   
            else values['Fail'].value += 1;
        }
    }

    total = values['Not applicable'].value + values['Pass'].value + values['Fail'].value;

    if (!total) total = 1;

    for (let legend of legends) {
        values[legend.text].value =  Math.round(( values[legend.text].value / total ) * 10000)/100;
    }

    return [legends, values];
}

export function prepareBatchExecutionCard (executionData) {
    let executionDict = {};
    let batchIdToExecId = {};
    let executionNum = 0;

    for (let index in executionData) {
        let execution = executionData[index];

        if (!(execution.batchid in executionDict)) {
            executionDict[execution.batchid] = [];
            batchIdToExecId[execution.batchid] = [];
            ++executionNum;
        }
        
        batchIdToExecId[execution.batchid].push(execution.execution_id);
        executionDict[execution.batchid] = {
            _id: execution.batchid,
            title: `Execution No: E${executionNum}`,
            smart: execution.smart,
            status: execution.status,
            msg_one: getMessage(execution.start_time, 'Started'),
            msg_two: getMessage(execution.end_time, 'Ended'),
            onSelId: batchIdToExecId[execution.batchid],
            batch_id: execution.batchid,
            execution_id: execution.execution_id,
        }
    }

    let executionList = Object.values(executionDict);
    return executionList;
}

export function prepareExecutionCard (executionData) {
    let executionList = [];
    
    for (let index in executionData) {
        let execution = executionData[index];
        let moduleCard = {
            _id: execution.execution_id,
            title: `Execution No: E${parseInt(index)+1}`,
            smart: execution.smart,
            status: execution.status,
            msg_one: getMessage(execution.start_time, 'Started'),
            msg_two: getMessage(execution.end_time, 'Ended'),
            onSelId: [execution.execution_id],
            batch_id: execution.batchid,
            execution_id: execution.execution_id,
        }
        executionList.push(moduleCard);
    }
    return executionList;
}

export function prepareScreenCard (screenData) {
    let screenList = [];
    
    for (let index in screenData) {
        let screen = screenData[index];
        let moduleCard = {
            _id: screen._id,
            title: screen.title,
            msg_one: getISTDate(screen.executedtime),
            onSelId: [screen._id]
        }
        screenList.push(moduleCard);
    }
    return screenList;
}

function getMessage(dateTime, event) {
    let result = `${event} on ${dateTime}`;
    if (typeof dateTime === 'string' && dateTime !== '-') {
        let [date, time] = dateTime.split(' ');
        result = `${event} on ${date} at ${time}`;
    }
    return result;
}

function getISTDate(UtcDateString) {
    let date = new Date(UtcDateString);
    const weekdays = ["Sun","Mon","Tues","Wed","Thurs","Fri","Sat"];
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sept", "Oct", "Nov", "Dec"];

    const istDate = `${weekdays[date.getDay()]}, ${("0"+date.getDate()).slice(-2)} ${months[date.getMonth()]} ${date.getFullYear()} ${date.toLocaleTimeString()}`;
    return istDate;
}

export function prepareLogData (logs) {
    let scen2Log = {};
    for (let scenario of logs) {
        scen2Log[scenario.scenario_id] = {};
        for (let tc of scenario.tcdetails) {
            scen2Log[scenario.scenario_id][tc.tcname] = tc.steps;
        }
    }
    return scen2Log;
}