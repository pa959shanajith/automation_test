import axios from 'axios';
import {RedirectPage, Messages as MSG} from '../global'
import {history} from './index'
import {url} from '../../App';

/*Component getAllSuites_ICE
  use:  { userId: userID, readme: 'projects', projectId: projiD ????}
*/

export const getAllSuites_ICE = async(data) => {
    try{
        const res = await axios(url+'/getAllSuites_ICE', {
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
        return {error:MSG.REPORT.ERR_FETCH_SUITE_LIST}
    }catch(err){
        console.error(err)
        return {error:MSG.REPORT.ERR_FETCH_SUITE_LIST}
    }
}

//component getReportsData_ICE
//data :{"param":"getReportsData_ICE","reportsInputData":{"projectId":"5de4e4aed9cdd57f4061bca8","releaseName":"r1","cycleId":"5de4e4aed9cdd57f4061c368","type":"allmodules"}

export const getReportsData_ICE = async(data) => {
    try{
        const res = await axios(url+'/getReportsData_ICE', {
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
        return {error:MSG.REPORT.ERR_FETCH_REPORT}
    }catch(err){
        console.error(err)
        return {error:MSG.REPORT.ERR_FETCH_REPORT}
    }
}
//

//component getSuiteDetailsInExecution_ICE
//data :  {"param":"getSuiteDetailsInExecution_ICE","testsuiteid":"5df71837d9be728cf8e7ff81"}
export const getSuiteDetailsInExecution_ICE = async(data) => {
    try{
        const res = await axios(url+'/getSuiteDetailsInExecution_ICE', {
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
        return {error:MSG.REPORT.ERR_FETCH_SUITE_DETAILS}
    }catch(err){
        console.error(err)
        return {error:MSG.REPORT.ERR_FETCH_SUITE_DETAILS}
    }
}
//reportStatusScenarios_ICE
// data {"param":"reportStatusScenarios_ICE","executionId":"5e1411b89b0f1c95c23b2401","testsuiteId":"5df71837d9be728cf8e7fe5f"}
//[{"executedtime":"07-01-2020 10:37:11","browser":"chrome","status":"Fail","reportid":"5e1411ff9b0f1c95c23b2402","testscenarioid":"5de4e572d9cdd57f40624a35","testscenarioname":"Scenario_Generic1"},{"executedtime":"07-01-2020 10:38:40","browser":"chrome","status":"Fail","reportid":"5e1412589b0f1c95c23b2403","testscenarioid":"5de4e572d9cdd57f40624a36","testscenarioname":"Scenario_Generic2"}]
export const reportStatusScenarios_ICE = async(data) => {
    try{
        const res = await axios(url+'/reportStatusScenarios_ICE', {
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
        return {error:MSG.REPORT.ERR_FETCH_REPORT_STATUS}
    }catch(err){
        console.error(err)
        return {error:MSG.REPORT.ERR_FETCH_REPORT_STATUS}
    }
}

//reportStatusScenarios_ICE
// data {"param":"reportStatusScenarios_ICE","executionId":"5e1411b89b0f1c95c23b2401","testsuiteId":"5df71837d9be728cf8e7fe5f"}
//[{"executedtime":"07-01-2020 10:37:11","browser":"chrome","status":"Fail","reportid":"5e1411ff9b0f1c95c23b2402","testscenarioid":"5de4e572d9cdd57f40624a35","testscenarioname":"Scenario_Generic1"},{"executedtime":"07-01-2020 10:38:40","browser":"chrome","status":"Fail","reportid":"5e1412589b0f1c95c23b2403","testscenarioid":"5de4e572d9cdd57f40624a36","testscenarioname":"Scenario_Generic2"}]
export const viewReport = async(reportId, reportType) => {
    try{
        var targetURL = '/viewreport/'+reportId+'.'+reportType+((reportType==='pdf')?'?images=true':'');
        const res = await axios(url+targetURL, {
            method: 'GET',
            responseType:(reportType === 'pdf')? 'arraybuffer':'application/json',
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
        return {error:MSG.REPORT.ERR_FETCH_REPORT_DETAILS}
    }catch(err){
        console.error(err)
        return {error:MSG.REPORT.ERR_FETCH_REPORT_DETAILS}
    }
}


export const getAccessibilityData = async(data) =>{
    try{
        const res = await axios(url+'/getAccessibilityData_ICE', {
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
        if(res.status === 200 && Object.keys(res.data).length < 1){
            return {error:MSG.REPORT.ERR_NO_ACC_SCREEN}
        }
        if(res.status===200 && res.data !== "fail"){            
            return res.data;
        }
        console.error(res.data)
        return {error:MSG.REPORT.ERR_FETCH_SUITE_DETAILS}
    }catch(err){
        console.error(err)
        return {error:MSG.REPORT.ERR_FETCH_SUITE_DETAILS}
    }
}