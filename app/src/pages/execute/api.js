import axios from 'axios';
import {RedirectPage, Messages as MSG} from '../global'
import {history} from './index'
import {url} from '../../App'

/*Component  
  api returns { ModuleId:condition: [], dataparam: [], executestatus:[], moduleid: "", projectnames:[],scenarioids:[],scenarionames: [],testsuiteid: "", testsuitename: "", versionnumber: int}
*/

export const readTestSuite_ICE = async(readTestSuite) => { 
    try{
        const res = await axios(url+'/readTestSuite_ICE', {
            method: 'POST',
            headers: {
            'Content-type': 'application/json',
            },
            data: {param : 'readTestSuite_ICE', readTestSuite : readTestSuite, fromFlag:"execution"},
            credentials: 'include'
        });
        if(res.status === 401 || res.data === "Invalid Session"){
            RedirectPage(history)
            return {error:MSG.GENERIC.INVALID_SESSION};
        }
        if(res.status===200 && res.data !== "fail"){            
            return res.data;
        }
        console.error(res.data)
        return {error:MSG.EXECUTE.ERR_TESTSUITE_FETCH}
    }catch(err){
        console.error(err)
        return {error:MSG.EXECUTE.ERR_TESTSUITE_FETCH}
    }
}

/*Component  
  api returns string ex. "success"
*/

export const updateTestSuite_ICE = async(batchDetails) => { 
    try{
        const res = await axios(url+'/updateTestSuite_ICE', {
            method: 'POST',
            headers: {
            'Content-type': 'application/json',
            },
            data: {param : 'updateTestSuite_ICE', batchDetails: batchDetails},
            credentials: 'include'
        });
        if(res.status === 401 || res.data === "Invalid Session"){
            RedirectPage(history)
            return {error:MSG.GENERIC.INVALID_SESSION};
        }
        if(res.status===200 && res.data !== "fail"){            
            return res.data;
        }
        console.error(res.data)
        return {error:MSG.EXECUTE.ERR_TESTSUITE_UPDATE}
    }catch(err){
        console.error(err)
        return {error:MSG.EXECUTE.ERR_TESTSUITE_UPDATE}
    }
}

/*Component  
  api returns string ex. "inprogress"
*/

export const reviewTask = async(projectId,taskId,taskstatus,version,batchTaskIDs, nodeid, taskname, groupids, additionalrecepients) => { 
    try{
        const res = await axios(url+'/reviewTask', {
            method: 'POST',
            headers: {
            'Content-type': 'application/json',
            },
            data: {action: "reviewTask",
				prjId:projectId,
				taskId:taskId,
				status:taskstatus,
				versionnumber:version,
				batchIds:batchTaskIDs,
                nodeid:nodeid,
                taskname: taskname,
                extragroups:groupids,
                extrausers:additionalrecepients
            },
            credentials: 'include'
        });
        if(res.status === 401 || res.data === "Invalid Session"){
            RedirectPage(history)
            return {error:MSG.GENERIC.INVALID_SESSION};
        }
        if(res.status===200 && res.data !== "fail"){            
            return res.data;
        }
        console.error(res.data)
        return {error:MSG.EXECUTE.ERR_REVIEW_TASK}
    }catch(err){
        console.error(err)
        return {error:MSG.EXECUTE.ERR_REVIEW_TASK}
    }
}

/*Component  
  api returns projectids: [""], projectnames: [""], screenids: [""], screennames: [""], testcaseids: [""], testcasenames: [""]
*/

export const loadLocationDetails = async(scenarioName, scenarioId) => { 
    try{
        const res = await axios(url+'/getTestcaseDetailsForScenario_ICE', {
            method: 'POST',
            headers: {
            'Content-type': 'application/json',
            },
            data: {param : 'getTestcaseDetailsForScenario_ICE', testScenarioId : scenarioId},
            credentials: 'include'
        });
        if(res.status === 401 || res.data === "Invalid Session"){
            RedirectPage(history)
            return {error:MSG.GENERIC.INVALID_SESSION};
        }
        if(res.status===200 && res.data !== "fail"){            
            return res.data;
        }
        console.error(res.data)
        return {error:MSG.EXECUTE.ERR_LOCATION_DETAILS}
    }catch(err){
        console.error(err)
        return {error:MSG.EXECUTE.ERR_LOCATION_DETAILS}
    }
}

/*Component  
  api returns del_flag: true/false,reuse: true/false ,template: "",testcase: [], testcasename: ""
*/

export const readTestCase_ICE = async(userInfo,testCaseId,testCaseName,versionnumber,screenName) => { 
    try{
        const res = await axios(url+'/readTestCase_ICE', {
            method: 'POST',
            headers: {
            'Content-type': 'application/json',
            },
            data: {param : 'readTestCase_ICE',
            userInfo: userInfo,
            testcaseid: testCaseId,
            testcasename: testCaseName,
            versionnumber: versionnumber,
            screenName : screenName},
            credentials: 'include'
        });
        if(res.status === 401 || res.data === "Invalid Session"){
            RedirectPage(history)
            return {error:MSG.GENERIC.INVALID_SESSION};
        }
        if(res.status===200 && res.data !== "fail"){            
            return res.data;
        }
        console.error(res.data)
        return {error:MSG.EXECUTE.ERR_FETCH_TC}
    }catch(err){
        console.error(err)
        return {error:MSG.EXECUTE.ERR_FETCH_TC}
    }
}

/*Component  
  api returns string ex. "success"
*/

export const ExecuteTestSuite_ICE = async(executionData) => { 
    try{
        const steps = await axios(url+'/hooks/validateExecutionSteps',{
            method: 'POST'
        });
        if(steps.status===200 && steps.data.status === 'pass'){
            const res = await axios(url+'/ExecuteTestSuite_ICE', {
                method: 'POST',
                headers: {
                'Content-type': 'application/json',
                },
                data: {param : 'ExecuteTestSuite_ICE',
                executionData: executionData},
                credentials: 'include'
            });
            if(res.status === 401 || res.data === "Invalid Session"){
                RedirectPage(history)
                return {errorapi:MSG.GENERIC.INVALID_SESSION};
            }
            if(res.status===200 && res.data !== "fail"){            
                return res.data;
            }
            console.error(res.data)
            return {errorapi:MSG.EXECUTE.ERR_EXECUTE_TESTSUITE}
        }else{
           return {errorsteps:steps.data}
        }
    }catch(err){
        console.error(err)
        return {errorapi:MSG.EXECUTE.ERR_EXECUTE_TESTSUITE}
    }
}

/*Component  
  api returns string ex. "unavailableLocalServer"
*/

export const loginQCServer_ICE = async(qcURL,qcUserName,qcPassword) => { 
    try{
        const res = await axios(url+'/loginQCServer_ICE', {
            method: 'POST',
            headers: {
            'Content-type': 'application/json',
            },
            data: {action: "loginQCServer_ICE",
                qcURL: qcURL,
                qcUsername: qcUserName,
                qcPassword : qcPassword,
                qcaction: "domain"},
            credentials: 'include'
        });
        if(res.status === 401 || res.data === "Invalid Session"){
            RedirectPage(history)
            return {error:MSG.GENERIC.INVALID_SESSION};
        }
        if(res.status===200 && res.data !== "fail"){            
            return res.data;
        }
        console.error(res.data)
        return {error:MSG.EXECUTE.ERR_LOGIN_QC}
    }catch(err){
        console.error(err)
        return {error:MSG.EXECUTE.ERR_LOGIN_QC}
    }
}

/*Component  
  api returns string ex. "unavailableLocalServer"
*/

export const loginQTestServer_ICE = async(qcURL,qcUserName,qcPassword, qcType) => { 
    try{
        const res = await axios(url+'/loginToQTest_ICE', {
            method: 'POST',
            headers: {
            'Content-type': 'application/json',
            },
            data: {action: "loginToQTest_ICE",
            qcURL: qcURL,
            qcUsername: qcUserName,
            qcPassword : qcPassword,
            qcType : qcType,
            qcaction: "domain"},
            credentials: 'include'
        });
        if(res.status === 401 || res.data === "Invalid Session"){
            RedirectPage(history)
            return {error:MSG.GENERIC.INVALID_SESSION};
        }
        if(res.status===200 && res.data !== "fail"){            
            return res.data;
        }
        console.error(res.data)
        return {error:MSG.EXECUTE.ERR_LOGIN_QTEST}
    }catch(err){
        console.error(err)
        return {error:MSG.EXECUTE.ERR_LOGIN_QTEST}
    }
}

export const getPools = async(data) => { 
    try{
        const res = await axios(url+'/getPools', {
            method: 'POST',
            headers: {
            'Content-type': 'application/json',
            },
            data: data,
            credentials: 'include'
        });
        if(res.status === 401 || res.data === "Invalid Session"){
            RedirectPage(history)
            return {error:MSG.GENERIC.INVALID_SESSION};
        }
        if(res.status===200 && res.data !== "fail"){ 
            if(res.data === 'empty') return {error:MSG.EXECUTE.ERR_EMPTY_USER}           
            return res.data;
        }
        console.error(res.data)
        return {error:MSG.GENERIC.ERR_FETCH_POOLS}
    }catch(err){
        console.error(err)
        return {error:MSG.GENERIC.ERR_FETCH_POOLS}
    }
} 

/*Component  
  api returns object=> 
*/

export const getICE_list = async(data) => { 
    try{
        const res = await axios(url+'/getICE_list', {
            method: 'POST',
            headers: {
            'Content-type': 'application/json',
            },
            data: data,
            credentials: 'include'
        });
        if(res.status === 401 || res.data === "Invalid Session"){
            RedirectPage(history)
            return {error:MSG.GENERIC.INVALID_SESSION};
        }
        if(res.status===200 && res.data !== "fail"){            
            return res.data;
        }
        console.error(res.data)
        return {error:MSG.GENERIC.ERR_FETCH_ICE}
    }catch(err){
        console.error(err)
        return {error:MSG.GENERIC.ERR_FETCH_ICE}
    }
}

/*Component  
  api returns object=> 
*/

export const loginZephyrServer_ICE = async(zephyrURL, zephyrUserName, zephyrPassword, zephyrApiToken, zephyrAuthType, integrationType) => { 
    try{
        var zephyrPayload = {};
        zephyrPayload.authtype = zephyrAuthType;
        zephyrPayload.zephyrURL = zephyrURL;
        zephyrPayload.zephyrUserName = zephyrUserName;
        zephyrPayload.zephyrPassword = zephyrPassword;
        zephyrPayload.zephyrApiToken = zephyrApiToken;
        const res = await axios(url+'/loginToZephyr_ICE', {
            method: 'POST',
            headers: {
            'Content-type': 'application/json',
            },
            data: { action: "loginToZephyr_ICE",
                action: "loginToZephyr_ICE",
                zephyrPayload: zephyrPayload,
                integrationType : integrationType,
                zephyraction: "login"
            },
            credentials: 'include'
        });
        if(res.status === 401 || res.data === "Invalid Session"){
            RedirectPage(history)
            return {error:MSG.GENERIC.INVALID_SESSION};
        }
        if(res.status===200 && res.data !== "fail"){            
            return res.data;
        }
        console.error(res.data)
        return {error:MSG.EXECUTE.ERR_LOGIN_ZEPHYR}
    }catch(err){
        console.error(err)
        return {error:MSG.EXECUTE.ERR_LOGIN_ZEPHYR}
    }
}



/*Component  ExecuteContent
  api returns  string - success/fail
*/

export const updateAccessibilitySelection = async(suiteInfo) => { 
    try{
        const res = await axios(url+'/updateAccessibilitySelection', {
            method: 'POST',
            headers: {
            'Content-type': 'application/json',
            },
            data: suiteInfo,
            credentials: 'include'
        });
        if(res.status === 401 || res.data === "Invalid Session"){
            RedirectPage(history)
            return {error:MSG.GENERIC.INVALID_SESSION};
        }
        if(res.status===200 && res.data !== "fail"){            
            return res.data;
        }
        console.error(res.data)
        return {error:MSG.EXECUTE.ERR_SAVE_ACCESSIBILITY}
    }catch(err){
        console.error(err)
        return {error:MSG.EXECUTE.ERR_SAVE_ACCESSIBILITY}
    }
}

/* getDetails_ZEPHYR
  api returns {zephyrUrl: ,zephyrUsername: ,zephyrPassword: ,zephyrToken:} or "empty"
*/

export const getDetails_ZEPHYR = async() => { 
    try{
        const res = await axios(url+'/getDetails_Zephyr', {
            method: 'POST',
            headers: {
            'Content-type': 'application/json',
            },
            credentials: 'include'
        });
        if(res.status === 401 || res.data === "Invalid Session" ){
            RedirectPage(history)
            return {error:MSG.GENERIC.INVALID_SESSION};
        }else if(res.status===200 && res.data !== "fail"){
            return res.data;
        }
        console.error(res.data)
        return {error:MSG.SETTINGS.ERR_ZEPHYR_FETCH}
    }catch(err){
        console.error(err)
        return {error:MSG.SETTINGS.ERR_ZEPHYR_FETCH}
    }
}