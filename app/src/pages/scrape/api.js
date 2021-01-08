import axios from 'axios';
import { RedirectPage } from '../global';
import { history } from './index';

const url = "https://"+window.location.hostname+":8443";

/*Component ActionBarItems (Scrape)
  api returns Invalid Session/Response Body exceeds max. Limit./scheduleModeOn/unavailableLocalServer/fail/Terminate/wrongWindowName/ExecutionOnlyAllowed/{"mirror":"","name":"",scrapedurl":"","view":[{"_id":"","cord":"","custname":"","height":,"hiddentag":"","left":,"objectType":"","parent":[""],"tag":"","top":,"url":"","width":,"xpath":""}/{"_id":"","custname":"","height":,"hiddentag":"","left":,"parent":[""],"tag":"button","top":,"url":"","width":,"xpath":""}]}
*/
export const initScraping_ICE = screenViewObject => {
    return new Promise((resolve, reject)=>{
        axios(url+"/initScraping_ICE", {
            method: 'POST',
            headers : {
                'Content-type' : 'application/json'
            },
            data : {'param': 'initScraping_ICE', 'screenViewObject': screenViewObject},
            credentials : 'include',
        })
        .then(res=>{
            if (res.status === 401) {
                RedirectPage(history);
                reject("Invalid Session");
            }
            else if (res.status === 200 && res.data !== 'fail') resolve(res.data);
            else reject(res.status)
        })
        .catch(err => reject(err))
    });
}

// export const highlightScrapElement_ICE = (xpath, url, appType) => {
//     return new Promise((resolve, reject)=> {
//         axios(url+"/highlightScrapElement_ICE", {
//             method: 'POST',
//             headers : {
//                 'Content-type' : 'application/json'
//             },
//             data : {"action": "highlightScrapElement_ICE",
//                     "elementXpath": xpath, 
//                     "elementUrl": url,
//                     "appType": appType
//                 },
//             credentials : 'include',
//         })
//         .then(res=>{
//             if (res.status === 200) resolve(res.data);
//             else reject(res.status);
//         })
//         .catch(err => reject(err));
//     });
// }

/*Component ScrapeScreen
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
        })
        .then(res=>{
            if (res.status === 200) resolve(res.data)
            else reject(res.status);
        })
        .catch(error=>reject(error))
    })
}

export const userObjectElement_ICE = custObjProps => {
    return new Promise((resolve, reject) => {
        axios(url+"/userObjectElement_ICE", {
            method: 'POST',
            headers : {
                'Content-type' : 'application/json'
            },
            data : { "action": "userObjectElement_ICE", "object": custObjProps },
            credentials : 'include',
        })
        .then(res=>{
            if (res.status === 200) resolve(res.data)
            else reject(res.status);
        })
        .catch(err => reject(err));
    });
}

// export const updateScreen_ICE = scrapeObject => {
//     return new Promise((resolve, reject)=>{
//         axios(url+"/updateScreen_ICE", {
//             method: 'POST',
//             headers : {
//                 'Content-type' : 'application/json'
//             },
//             data : { scrapeObject : scrapeObject },
//             credentials : 'include',
//         })
//         .then(res=>{
//             if (res.status === 200) resolve(res.data)
//             else reject(res.status);
//         })
//         .catch(error=>reject(error));
//     });
// }

// export const mapScrapeData_ICE = updateData => {
//     try{
//         const res = await axios(url+"/updateScreen_ICE", {
//             method: 'POST',
//             headers : {
//                 'Content-type' : 'application/json'
//             },
//             data : { scrapeObject : updateData },
//             credentials : 'include',
//         });
//         if (res.status === 200){
//             return res.data;
//         }
//         else{
//             console.log(res.status)
//         }
//     }
//     catch(err){
//         console.log(err);
//     }
// }

// export const readTestCase_ICE = (userInfo, testCaseId, testCaseName, versionnumber, screenName) => {
//     return new Promise((resolve, reject)=> {
//         axios(url+"/readTestCase_ICE", {
//             method: 'POST',
//             headers : {
//                 'Content-type' : 'application/json'
//             },
//             data : {
//                 param : 'readTestCase_ICE',
//                 userInfo: userInfo,
//                 testcaseid: testCaseId,
//                 testcasename: testCaseName,
//                 versionnumber: versionnumber,
//                 screenName : screenName
//             },
//             credentials : 'include',
//         })
//         .then(res=>{
//             if (res.status === 200){
//                 resolve(res.data);
//             }
//             else{
//                 reject({error: res.status});
//             }
//         })
//         .catch(err=>reject({error: err}));
//     });
// }

// export const updateTestCase_ICE = (testCaseId, testCaseName, testCaseData, userInfo, versionnumber, import_status) => {
//     return new Promise((resolve, reject)=>{
//         axios(url+"/updateTestCase_ICE", {
//             method: 'POST',
//             headers : {
//                 'Content-type' : 'application/json'
//             },
//             data : {
//                 param : 'updateTestCase_ICE',
//                 testcaseid: testCaseId,
//                 testcasename: testCaseName,
//                 testcasesteps: JSON.stringify(testCaseData),
//                 userinfo: userInfo,
//                 skucodetestcase : "skucodetestcase",
//                 tags: "tags",
//                 versionnumber: versionnumber,
//                 import_status: import_status
//             },
//             credentials : 'include',
//         })
//         .then(res=>{
//             if (res.status === 200){
//                 resolve(res.data);
//             }
//             else{
//                 reject(res.status);
//             }
//         })
//         .catch(error=>reject(error));
//     });
// }

// export const debugTestCase_ICE = (browserType, testcaseID, userInfo, appType) => {
//     return new Promise((resolve, reject)=>{
//         axios(url+"/debugTestCase_ICE", {
//             method: 'POST',
//             headers : {
//                 'Content-type' : 'application/json'
//             },
//             data : {
//                 param : 'debugTestCase_ICE',
//                 userInfo: userInfo,
//                 browsertypes: browserType,
//                 testcaseids: testcaseID,
//                 apptype: appType
//             },
//             credentials : 'include',
//         })
//         .then(res=>{
//             if (res.status === 200){
//                 resolve(res.data);
//             }
//             else{
//                 reject(res.status);
//             }
//         })
//         .catch(error=>reject(error));
//     });
// }

// export const initScrapeWS_ICE = async(initWSJson) => {
//     try{
//         const res = await axios(url+"/debugTestCase_ICE", {
//             method: 'POST',
//             headers : {
//                 'Content-type' : 'application/json'
//             },
//             data : {
//                 param : 'debugTestCaseWS_ICE',
//                 testCaseWS: initWSJson
//             },
//             credentials : 'include',
//         });
//         if (res.status === 200){
//             return res.data;
//         }
//         else{
//             console.log(res.status)
//         }
//     }
//     catch(err){
//         console.log(err);
//     }
// }

// export const getKeywordDetails_ICE = (appType) => {
//     return new Promise((resolve, reject)=>{
//         axios(url+"/getKeywordDetails_ICE", {
//             method: 'POST',
//             headers : {
//                 'Content-type' : 'application/json'
//             },
//             data : {
//                 param : 'getKeywordDetails_ICE',
//                 projecttypename : appType
//             },
//             credentials : 'include',
//         })
//         .then(res=>{
//             if (res.status === 200){
//                 resolve(res.data);
//             }
//             else{
//                 reject(res.status);
//             }
//         })
//         .catch(error=>reject(error))
//     })
// }

// export const launchWSDLGo = async(wsdlUrl) => {
//     try{
//         const res = await axios(url+"/debugTestCase_ICE", {
//             method: 'POST',
//             headers : {
//                 'Content-type' : 'application/json'
//             },
//             data : {
//                 param : 'wsdlListGenerator_ICE',
//                 wsdlurl: wsdlUrl
//             },
//             credentials : 'include',
//         });
//         if (res.status === 200){
//             return res.data;
//         }
//         else{
//             console.log(res.status)
//         }
//     }
//     catch(err){
//         console.log(err);
//     }
// }

// export const wsdlAdd = async(wsdlUrl, wsdlSelectedMethod, resultFile) => {
//     try{
//         const res = await axios(url+"/debugTestCase_ICE", {
//             method: 'POST',
//             headers : {
//                 'Content-type' : 'application/json'
//             },
//             data : {
//                 param : 'wsdlServiceGenerator_ICE',
//                 wsdlurl: wsdlUrl,
//                 method : wsdlSelectedMethod,
//                 resultFile:resultFile
//             },
//             credentials : 'include',
//         });
//         if (res.status === 200){
//             return res.data;
//         }
//         else{
//             console.log(res.status)
//         }
//     }
//     catch(err){
//         console.log(err);
//     }
// }

// export const getTestcasesByScenarioId_ICE = (testScenarioId) => {
//     return new Promise((resolve, reject)=>{
//         axios(url+"/getTestcasesByScenarioId_ICE", {
//             method: 'POST',
//             headers : {
//                 'Content-type' : 'application/json'
//             },
//             data : {
//                 param : 'getTestcasesByScenarioId_ICE',
//                 testScenarioId : testScenarioId
//             },
//             credentials : 'include',
//         })
//         .then(res=>{   
//             if (res.status === 200){
//                 resolve(res.data);
//             }
//             else{
//                 reject(res.status)
//             }
//         })
//         .catch(error=>reject(error))
//     })
// }

// export const updateIrisDataset = async(data) => {
//     try{
//         const res = await axios(url+"/updateIrisDataset", {
//             method: 'POST',
//             headers : {
//                 'Content-type' : 'application/json'
//             },
//             data : {
//                 data : data
//             },
//             credentials : 'include',
//         });
//         if (res.status === 200){
//             return res.data;
//         }
//         else{
//             console.log(res.status)
//         }
//     }
//     catch(err){
//         console.log(err);
//     }
// }

