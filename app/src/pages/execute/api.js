import axios from 'axios';
import {RedirectPage} from '../global'
import {history} from './index'
const url = "https://"+window.location.hostname+":8443";

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
        if(res.status === 401 || res.status === "Invalid Session"){
            RedirectPage(history)
            return {error:'invalid session'};
        }
        if(res.status===200 && res.data !== "fail"){            
            return res.data;
        }
        console.error(res.data)
        return {error:'Failed to fetch test suite data.'}
    }catch(err){
        console.error(err)
        return {error:'Failed to test suite data.'}
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
        if(res.status === 401 || res.status === "Invalid Session"){
            RedirectPage(history)
            return {error:'invalid session'};
        }
        if(res.status===200 && res.data !== "fail"){            
            return res.data;
        }
        console.error(res.data)
        return {error:'Failed to update test suit.'}
    }catch(err){
        console.error(err)
        return {error:'Failed to update test suit.'}
    }
}

/*Component  
  api returns string ex. "inprogress"
*/

export const reviewTask = async(projectId,taskId,taskstatus,version,batchTaskIDs) => { 
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
				batchIds:batchTaskIDs},
            credentials: 'include'
        });
        if(res.status === 401 || res.status === "Invalid Session"){
            RedirectPage(history)
            return {error:'invalid session'};
        }
        if(res.status===200 && res.data !== "fail"){            
            return res.data;
        }
        console.error(res.data)
        return {error:'Failed to review task.'}
    }catch(err){
        console.error(err)
        return {error:'Failed to review task.'}
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
        if(res.status === 401 || res.status === "Invalid Session"){
            RedirectPage(history)
            return {error:'invalid session'};
        }
        if(res.status===200 && res.data !== "fail"){            
            return res.data;
        }
        console.error(res.data)
        return {error:'Failed to load location details.'}
    }catch(err){
        console.error(err)
        return {error:'Failed to load location details.'}
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
        if(res.status === 401 || res.status === "Invalid Session"){
            RedirectPage(history)
            return {error:'invalid session'};
        }
        if(res.status===200 && res.data !== "fail"){            
            return res.data;
        }
        console.error(res.data)
        return {error:'Failed to fetch test case.'}
    }catch(err){
        console.error(err)
        return {error:'Failed to fetch test case.'}
    }
}

/*Component  
  api returns string ex. "success"
*/

export const ExecuteTestSuite_ICE = async(executionData) => { 
    try{
        const res = await axios(url+'/ExecuteTestSuite_ICE', {
            method: 'POST',
            headers: {
            'Content-type': 'application/json',
            },
            data: {param : 'ExecuteTestSuite_ICE',
            executionData: executionData},
            credentials: 'include'
        });
        if(res.status === 401 || res.status === "Invalid Session"){
            RedirectPage(history)
            return {error:'invalid session'};
        }
        if(res.status===200 && res.data !== "fail"){            
            return res.data;
        }
        console.error(res.data)
        return {error:'Failed to execute test suite.'}
    }catch(err){
        console.error(err)
        return {error:'Failed to execute test suite.'}
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
        if(res.status === 401 || res.status === "Invalid Session"){
            RedirectPage(history)
            return {error:'invalid session'};
        }
        if(res.status===200 && res.data !== "fail"){            
            return res.data;
        }
        console.error(res.data)
        return {error:'Failed to login qc server.'}
    }catch(err){
        console.error(err)
        return {error:'Failed to login qc server.'}
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
        if(res.status === 401 || res.status === "Invalid Session"){
            RedirectPage(history)
            return {error:'invalid session'};
        }
        if(res.status===200 && res.data !== "fail"){            
            return res.data;
        }
        console.error(res.data)
        return {error:'Failed to login qtest server.'}
    }catch(err){
        console.error(err)
        return {error:'Failed to login qtest server.'}
    }
}