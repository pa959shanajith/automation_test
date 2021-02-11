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

export const highlightScrapElement_ICE = (xpath, objurl, appType) => {
    return new Promise((resolve, reject)=> {
        axios(url+"/highlightScrapElement_ICE", {
            method: 'POST',
            headers : {
                'Content-type' : 'application/json'
            },
            data : {"action": "highlightScrapElement_ICE",
                    "elementXpath": xpath, 
                    "elementUrl": objurl,
                    "appType": appType
                },
            credentials : 'include',
        })
        .then(res=>{
            if (res.status === 200) resolve(res.data);
            else reject(res.status);
        })
        .catch(err => reject(err));
    });
}

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

export const initScrapeWS_ICE = arg => {
    return new Promise((resolve, reject) => {
        axios(url+"/debugTestCase_ICE", {
            method: 'POST',
            headers : {
                'Content-type' : 'application/json'
            },
            data : {
                param : 'debugTestCaseWS_ICE',
                testCaseWS: arg
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

export const launchWSDLGo = wsdlUrl => {
    return new Promise((resolve, reject) => {
        axios(url+"/debugTestCase_ICE", {
            method: 'POST',
            headers : {
                'Content-type' : 'application/json'
            },
            data : {
                param : 'wsdlListGenerator_ICE',
                wsdlurl: wsdlUrl
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

export const wsdlAdd = (wsdlUrl, wsdlSelectedMethod, resultFile) => {
    return new Promise((resolve, reject) => {
        axios(url+"/debugTestCase_ICE", {
            method: 'POST',
            headers : {
                'Content-type' : 'application/json'
            },
            data : {
                param : 'wsdlServiceGenerator_ICE',
                wsdlurl: wsdlUrl,
                method : wsdlSelectedMethod,
                resultFile:resultFile
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

