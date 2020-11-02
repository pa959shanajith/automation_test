import axios from 'axios';
const url = "https://"+window.location.hostname+":8443";


export const initScraping_ICE = async(screenViewObject) => {
    try{
        const res = await axios(url+"/initScraping_ICE", {
            method: 'POST',
            headers : {
                'Content-type' : 'application/json'
            },
            data : {'param': 'initScraping_ICE', 'screenViewObject': screenViewObject},
            credentials : 'include',
        });
        if (res.status === 200){
            return res.data;
        }
        else{
            console.log(res.status)
        }
    }
    catch(err){
        console.log(err);
    }
}

export const highlightScrapElement_ICE = async(xpath, url, appType) => {
    try{
        const res = await axios(url+"/highlightScrapElement_ICE", {
            method: 'POST',
            headers : {
                'Content-type' : 'application/json'
            },
            data : {"action": "highlightScrapElement_ICE",
                    "elementXpath": xpath, 
                    "elementUrl": url,
                    "appType": appType
                },
            credentials : 'include',
        });
        if (res.status === 200){
            return res.data;
        }
        else{
            console.log(res.status)
        }
    }
    catch(err){
        console.log(err);
    }
}

export const getScrapeDataScreenLevel_ICE = async(type, screenId, projectId, testCaseId) =>	{
    try{
        const res = await axios(url+"/getScrapeDataScreenLevel_ICE", {
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
        });
        if (res.status === 200){
            return res.data;
        }
        else{
            console.log(res.status)
        }
    }
    catch(err){
        console.log(err);
    }
}

export const userObjectElement_ICE = async(custObjProps) => {
    try{
        const res = await axios(url+"/userObjectElement_ICE", {
            method: 'POST',
            headers : {
                'Content-type' : 'application/json'
            },
            data : { "action": "userObjectElement_ICE", "object": custObjProps },
            credentials : 'include',
        });
        if (res.status === 200){
            return res.data;
        }
        else{
            console.log(res.status)
        }
    }
    catch(err){
        console.log(err);
    }
}

export const updateScreen_ICE = async(scrapeObject) => {
    try{
        const res = await axios(url+"/updateScreen_ICE", {
            method: 'POST',
            headers : {
                'Content-type' : 'application/json'
            },
            data : { scrapeObject : scrapeObject },
            credentials : 'include',
        });
        if (res.status === 200){
            return res.data;
        }
        else{
            console.log(res.status)
        }
    }
    catch(err){
        console.log(err);
    }
}

export const mapScrapeData_ICE = async(updateData) => {
    try{
        const res = await axios(url+"/updateScreen_ICE", {
            method: 'POST',
            headers : {
                'Content-type' : 'application/json'
            },
            data : { scrapeObject : updateData },
            credentials : 'include',
        });
        if (res.status === 200){
            return res.data;
        }
        else{
            console.log(res.status)
        }
    }
    catch(err){
        console.log(err);
    }
}

export const readTestCase_ICE = async(userInfo, testCaseId, testCaseName, versionnumber, screenName) => {
    try{
        const res = await axios(url+"/readTestCase_ICE", {
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
        });
        if (res.status === 200){
            return res.data;
        }
        else{
            console.log(res.status)
        }
    }
    catch(err){
        console.log(err);
    }
}

export const updateTestCase_ICE = async(testCaseId, testCaseName, testCaseData, userInfo, versionnumber, import_status) => {
    try{
        const res = await axios(url+"/updateTestCase_ICE", {
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
        });
        if (res.status === 200){
            return res.data;
        }
        else{
            console.log(res.status)
        }
    }
    catch(err){
        console.log(err);
    }
}

//Debug Testcases
export const debugTestCase_ICE = async(browserType, testcaseID, userInfo, appType) => {
    try{
        const res = await axios(url+"/debugTestCase_ICE", {
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
        });
        if (res.status === 200){
            return res.data;
        }
        else{
            console.log(res.status)
        }
    }
    catch(err){
        console.log(err);
    }
}

export const initScrapeWS_ICE = async(initWSJson) => {
    try{
        const res = await axios(url+"/debugTestCase_ICE", {
            method: 'POST',
            headers : {
                'Content-type' : 'application/json'
            },
            data : {
                param : 'debugTestCaseWS_ICE',
                testCaseWS: initWSJson
            },
            credentials : 'include',
        });
        if (res.status === 200){
            return res.data;
        }
        else{
            console.log(res.status)
        }
    }
    catch(err){
        console.log(err);
    }
}

export const getKeywordDetails_ICE = async(appType) => {
    try{
        const res = await axios(url+"/getKeywordDetails_ICE", {
            method: 'POST',
            headers : {
                'Content-type' : 'application/json'
            },
            data : {
                param : 'getKeywordDetails_ICE',
                projecttypename : appType
            },
            credentials : 'include',
        });
        if (res.status === 200){
            return res.data;
        }
        else{
            console.log(res.status)
        }
    }
    catch(err){
        console.log(err);
    }
}

export const launchWSDLGo = async(wsdlUrl) => {
    try{
        const res = await axios(url+"/debugTestCase_ICE", {
            method: 'POST',
            headers : {
                'Content-type' : 'application/json'
            },
            data : {
                param : 'wsdlListGenerator_ICE',
                wsdlurl: wsdlUrl
            },
            credentials : 'include',
        });
        if (res.status === 200){
            return res.data;
        }
        else{
            console.log(res.status)
        }
    }
    catch(err){
        console.log(err);
    }
}

export const wsdlAdd = async(wsdlUrl, wsdlSelectedMethod, resultFile) => {
    try{
        const res = await axios(url+"/debugTestCase_ICE", {
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
        });
        if (res.status === 200){
            return res.data;
        }
        else{
            console.log(res.status)
        }
    }
    catch(err){
        console.log(err);
    }
}

export const getTestcasesByScenarioId_ICE = async(testScenarioId) => {
    try{
        const res = await axios(url+"/getTestcasesByScenarioId_ICE", {
            method: 'POST',
            headers : {
                'Content-type' : 'application/json'
            },
            data : {
                param : 'getTestcasesByScenarioId_ICE',
                testScenarioId : testScenarioId
            },
            credentials : 'include',
        });
        if (res.status === 200){
            return res.data;
        }
        else{
            console.log(res.status)
        }
    }
    catch(err){
        console.log(err);
    }
}

export const updateIrisDataset = async(data) => {
    try{
        const res = await axios(url+"/updateIrisDataset", {
            method: 'POST',
            headers : {
                'Content-type' : 'application/json'
            },
            data : {
                data : data
            },
            credentials : 'include',
        });
        if (res.status === 200){
            return res.data;
        }
        else{
            console.log(res.status)
        }
    }
    catch(err){
        console.log(err);
    }
}

