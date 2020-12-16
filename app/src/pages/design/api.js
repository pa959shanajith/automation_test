import axios from 'axios';
const url = "https://"+window.location.hostname+":8443";


export const getScrapeDataScreenLevel_ICE = (type, screenId, projectId, testCaseId) =>	{
    return new Promise((resolve, reject)=>{
        axios(url+"/getScrapeDataScreenLevel_ICE", {
            method: 'POST',
            headers : {
                'Content-type' : 'application/json'
            },
            data : {
                param: 'getScrapeDataScreenLevel_ICE',
                screenId: screenId,
                projectId: projectId,
                type: type,
                testCaseId: testCaseId
            },
            credentials : 'include',
        }).then(res=>{
            if (res.status === 200){
                resolve(res.data);
            }
            else{
                reject(res.status);
            }
        })
        .catch(error=>reject(error))
    })
}

export const updateScreen_ICE = (scrapeObject) => {
    return new Promise((resolve, reject)=>{
        axios(url+"/updateScreen_ICE", {
            method: 'POST',
            headers : {
                'Content-type' : 'application/json'
            },
            data : { scrapeObject : scrapeObject },
            credentials : 'include',
        })
        .then(res=>{
            if (res.status === 200){
                resolve(res.data);
            }
            else{
                reject(res.status);
            }
        })
        .catch(error=>reject(error));
    });
}

export const readTestCase_ICE = (userInfo, testCaseId, testCaseName, versionnumber, screenName) => {
    return new Promise((resolve, reject)=> {
        axios(url+"/readTestCase_ICE", {
            method: 'POST',
            headers : {
                'Content-type' : 'application/json'
            },
            data : {
                param : 'readTestCase_ICE',
                userInfo: userInfo,
                testcaseid: testCaseId,
                testcasename: testCaseName,
                versionnumber: versionnumber,
                screenName : screenName
            },
            credentials : 'include',
        })
        .then(res=>{
            if (res.status === 200){
                resolve(res.data);
            }
            else{
                reject({error: res.status});
            }
        })
        .catch(err=>reject({error: err}));
    });
}

export const updateTestCase_ICE = (testCaseId, testCaseName, testCaseData, userInfo, versionnumber, import_status) => {
    return new Promise((resolve, reject)=>{
        axios(url+"/updateTestCase_ICE", {
            method: 'POST',
            headers : {
                'Content-type' : 'application/json'
            },
            data : {
                param : 'updateTestCase_ICE',
                testcaseid: testCaseId,
                testcasename: testCaseName,
                testcasesteps: JSON.stringify(testCaseData),
                userinfo: userInfo,
                skucodetestcase : "skucodetestcase",
                tags: "tags",
                versionnumber: versionnumber,
                import_status: import_status
            },
            credentials : 'include',
        })
        .then(res=>{
            if (res.status === 200){
                resolve(res.data);
            }
            else{
                reject(res.status);
            }
        })
        .catch(error=>reject(error));
    });
}

export const debugTestCase_ICE = (browserType, testcaseID, userInfo, appType) => {
    return new Promise((resolve, reject)=>{
        axios(url+"/debugTestCase_ICE", {
            method: 'POST',
            headers : {
                'Content-type' : 'application/json'
            },
            data : {
                param : 'debugTestCase_ICE',
                userInfo: userInfo,
                browsertypes: browserType,
                testcaseids: testcaseID,
                apptype: appType
            },
            credentials : 'include',
        })
        .then(res=>{
            if (res.status === 200){
                resolve(res.data);
            }
            else{
                reject(res.status);
            }
        })
        .catch(error=>reject(error));
    });
}

export const getKeywordDetails_ICE = (appType) => {
    return new Promise((resolve, reject)=>{
        axios(url+"/getKeywordDetails_ICE", {
            method: 'POST',
            headers : {
                'Content-type' : 'application/json'
            },
            data : {
                param : 'getKeywordDetails_ICE',
                projecttypename : appType
            },
            credentials : 'include',
        })
        .then(res=>{
            if (res.status === 200){
                resolve(res.data);
            }
            else{
                reject(res.status);
            }
        })
        .catch(error=>reject(error))
    })
}

export const getTestcasesByScenarioId_ICE = (testScenarioId) => {
    return new Promise((resolve, reject)=>{
        axios(url+"/getTestcasesByScenarioId_ICE", {
            method: 'POST',
            headers : {
                'Content-type' : 'application/json'
            },
            data : {
                param : 'getTestcasesByScenarioId_ICE',
                testScenarioId : testScenarioId
            },
            credentials : 'include',
        })
        .then(res=>{   
            if (res.status === 200){
                resolve(res.data);
            }
            else{
                reject(res.status)
            }
        })
        .catch(error=>reject(error))
    })
}

export const reviewTask = (projectId, taskid, taskstatus, version, batchTaskIDs) => {
    return new Promise((resolve, reject)=>{
        axios(url+"/reviewTask", {
            method : 'POST',
            headers : {
                'Content-type' : "application/json"
            },
            data: { action: 'reviewTask', 
                    prjId: projectId,
                    taskId: taskid,
                    status: taskstatus,
                    versionnumber: version,
                    batchIds: batchTaskIDs
                },
            credentials : 'include'
        })
        .then(res=>{
            if (res.status === 200 && res.data!=="fail") {
                resolve(res.data);
            }
            else{
                reject(res.status);
            }
        })
        .catch(err => reject(err));
    })
}