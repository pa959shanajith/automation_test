import axios from 'axios';
import {url} from '../../App';

/*Component DesignContent
  api returns {"mirror":"","name":"","reuse":bool,"scrapedurl":"","view":[{"_id":"","cord":"","custname":"","height":,"hiddentag":"","left":,"objectType":"","parent":[""],"tag":"","top":,"url":"","width":,"xpath":""}/{"_id":"","custname":"","height":,"hiddentag":"","left":,"parent":[""],"tag":"button","top":,"url":"","width":,"xpath":""}]}
*/
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

/*Component DesignContent
  api returns String (Invalid Session/Success)
*/
export const updateScreen_ICE = arg => {
    return new Promise((resolve, reject)=>{
        axios(url+"/updateScreen_ICE", {
            method: 'POST',
            headers : {
                'Content-type' : 'application/json'
            },
            data : { 
                data: arg
            },
            credentials : 'include',
        })
        .then(res=>{
            if (res.status === 200) resolve(res.data)
            else reject(res.status);
        })
        .catch(error=>reject(error));
    });
}

/*Component DesignContent
  api returns {"template":"","reuse":bool,"testcase":[{"addTestCaseDetails":"","addTestCaseDetailsInfo":"{\"actualResult_fail\":\"\",\"actualResult_pass\":\"\",\"testcaseDetails\":\"\"}","appType":"","cord":"","custname": "","inputVal":[""],"keywordVal":"","objectName":"","outputVal":"","remarks": "a;b","stepNo":int,"url":""}],"testcasename":"","del_flag":bool}
*/
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

/*Component DesignContent
  api returns String (Invalid Session/Success)
*/
export const updateTestCase_ICE = (testCaseId, testCaseName, testCaseData, userInfo, versionnumber, import_status, copiedTestCases) => {
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
                import_status: import_status,
                copiedTestCases: copiedTestCases
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

/*Component ActionbarItems (DesignPage)
  api returns String (Invalid Session/unavailableLocalServer/success/fail/Terminate/browserUnavailable/scheduleModeOn/ExecutionOnlyAllowed)
                or {status:"", "":xpath}
*/ 
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

/*Component ActionbarItems (DesignPage)
  api returns {"<type>":{"<keyword>":{"inputtype": [""],"inputval": [""],"outputval": [""]}}
}
*/ 
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

/*Component DependentTestCaseDialog
  api returns [{"testcaseId":"","testcaseName":""}]
*/ 
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