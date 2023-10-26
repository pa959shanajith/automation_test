import axios from 'axios';
import {url} from '../../App';
import { Messages as MSG, RedirectPage} from '../global';
import {navigate} from './components/reports'

export const fetchConfigureList = async(props) => {
    console.log(props);
    try{
        const res = await axios(url+'/getConfigureList', {
            method: 'POST',
            headers: {
                'Content-type': 'application/json',
            },
            data: {
                action: "configurelist",
                'projectid': props.projectid,
                'param':props.param
            }
        });
        if(res.status === 401){
            RedirectPage(navigate)
            return {error:MSG.GENERIC.INVALID_SESSION}
        }
        if(res.status === 200 && res.data !== "fail"){            
            return res.data;
        }
        console.error(res.data)
        return { error:MSG.UTILITY.ERR_FETCH_DATATABLES}
    }catch(err){
        console.error(err)
        return {error:MSG.UTILITY.ERR_FETCH_DATATABLES}
    }
}

export const getFunctionalReports = async(projId, relName, cycId) => {
    try{
        const res = await axios(url+'/getReportsData_ICE', {
            method: 'POST',
            headers: {
                'Content-type': 'application/json',
            },
            data: {
                reportsInputData:{
                    projectId: projId,
                    releaseName: relName,
                    cycleId: cycId,
                    configurekey: projId,
                    type:"allmodules",
                }
            },
            credentials: 'include'
        });
        if(res.status === 401 || res.data === "Invalid Session"){
            RedirectPage(navigate)
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

export const getProjectList = async() => {
    try{
        const res = await axios(url+'/populateProjects', {
            method: 'POST',
            headers: {
            'Content-type': 'application/json',
            },
            data: {"action":"populateProjects"},
            credentials: 'include'
        });
        if(res.status === 401 || res.data === "Invalid Session"){
            RedirectPage(navigate)
            return {error:MSG.GENERIC.INVALID_SESSION};
        }
        if(res.status===200 && res.data !== "fail"){            
            return res.data;
        }
        console.error(res.data)
        return {error:MSG.MINDMAP.ERR_FETCH_PROJECT}
    }catch(err){
        console.error(err)
        return {error:MSG.MINDMAP.ERR_FETCH_PROJECT}
    }
}

export const getReportList = async(getConfigKey) => {
    try{
        const res = await axios(url+'/fetchExecProfileStatus', {
            method: 'POST',
            headers: {
            'Content-type': 'application/json',
            },
            data: {
                query:"fetchExecProfileStatus",
                configurekey: getConfigKey,
            },
            credentials: 'include'
        });
        if(res.status === 401 || res.data === "Invalid Session"){
            RedirectPage(navigate)
            return {error:MSG.GENERIC.INVALID_SESSION};
        }
        if(res.status===200 && res.data !== "fail"){            
            return res.data;
        }
        console.error(res.data)
        return {error:MSG.MINDMAP.ERR_FETCH_PROJECT}
    }catch(err){
        console.error(err)
        return {error:MSG.MINDMAP.ERR_FETCH_PROJECT}
    }
}

export const getReportListSuites = async(getTestSuiteId) => {
    try{
        const res = await axios(url+'/fetchExecProfileStatus', {
            method: 'POST',
            headers: {
            'Content-type': 'application/json',
            },
            data: {
                query:"fetchExecProfileStatus",
                testsuiteid: getTestSuiteId,
            },
            credentials: 'include'
        });
        if(res.status === 401 || res.data === "Invalid Session"){
            RedirectPage(navigate)
        }
        if(res.status===200 && res.data !== "fail"){            
            return res.data;
        }
        console.error(res.data)
    }catch(err){
        console.error(err)
    }
}

export const getScreenData = async(screenName) =>{
    try{
        const res = await axios(url+'/getAccessibilityData_ICE', {
            method: 'POST',
            headers: {
            'Content-type': 'application/json',
            },
            data: {
                screendata: screenName,
                type: "reportdata_names_only"
            },
            credentials: 'include'
        });
        if(res.status === 401 || res.data === "Invalid Session"){
            return {error:MSG.GENERIC.INVALID_SESSION};
        }
        if(res.status === 200 && Object.keys(res.data).length < 1){
        }
        if(res.status===200 && res.data !== "fail"){            
            return res.data;
        }
        console.error(res.data)
    }catch(err){
        console.error(err)
    }
}

export const getAccessibilityData = async(id, type = "reportdata") =>{
    try{
        const res = await axios(url+'/getAccessibilityData_ICE', {
            method: 'POST',
            headers: {
            'Content-type': 'application/json',
            },
            data: {
                executionid: id,
                type: type
            },
            credentials: 'include'
        });
        if(res.status === 401 || res.data === "Invalid Session"){
            return {error:MSG.GENERIC.INVALID_SESSION};
        }
        if(res.status === 200 && Object.keys(res.data).length < 1){
        }
        if(res.status===200 && res.data !== "fail"){            
            return res.data;
        }
        console.error(res.data)
    }catch(err){
        console.error(err)
    }
}

export const getTestSuiteList = async(getTestSuiteId) => {
    try{
        const res = await axios(url+'/fetchExecProfileStatus', {
            method: 'POST',
            headers: {
            'Content-type': 'application/json',
            },
            data: {
                query:"fetchExecProfileStatus",
                testsuiteid: getTestSuiteId,
            },
            credentials: 'include'
        });
        if(res.status === 401 || res.data === "Invalid Session"){
            RedirectPage(navigate)
        }
        if(res.status===200 && res.data !== "fail"){            
            return res.data;
        }
        console.error(res.data)
    }catch(err){
        console.error(err)
    }
}

export const openScreenshot = async(path) => {
    try{
        const res = await axios(url+'/openScreenShot', {
            method: 'POST',
            headers: {
                'Content-type': 'application/json',
            },
            credentials: 'include',
            data: {
                "absPath": [path]
            },
        });
        if(res.status === 401 || res.data === "Invalid Session" ){
            return {error:MSG.GENERIC.INVALID_SESSION};
        }else if(res.status===200 && res.data !== "fail"){            
            return res.data;
        }
        console.error(res.data)
    }catch(err){
        console.error(err)
    }
}

export const getTestSuite = async(getSuiteKey) => {
    try{
        const res = await axios(url+'/fetchModSceDetails', {
            method: 'POST',
            headers: {
            'Content-type': 'application/json',
            },
            data: getSuiteKey,
            credentials: 'include'
        });
        if(res.status === 401 || res.data === "Invalid Session"){
            RedirectPage(navigate)
        }
        if(res.status===200 && res.data !== "fail"){            
            return res.data;
        }
        console.error(res.data)
    }catch(err){
        console.error(err)
    }
}

export const fetchScenarioInfo = async(executionId) => {
    try{
        const res = await axios(url+'/reportStatusScenarios_ICE', {
            method: 'POST',
            headers: {
                'Content-type': 'application/json',
            },
            data: {
                "executionId": [executionId]
            },
            credentials: 'include'
        });
        if(res.status===200 && res.data !== "fail"){            
            return res.data;
        }
        console.error(res.data)
    }catch(err){
        console.error(err)
    }
}

export const downloadReports = async(getDownload, type) => {
    try{
        const res = await axios(`/viewReport?reportID=${getDownload?.id}&type=${ getDownload?.type === 'json' ? 'json' : 'pdf' }&images=${type}`, {
            method: 'GET',
            headers: {
            'Content-type': 'application/json',
            },
            responseType:(getDownload?.type === 'json')? 'application/json' : 'arraybuffer',
            credentials: 'include'
        });
        if(res.status === 401 || res.data === "Invalid Session"){
            RedirectPage(navigate)
            return {error:MSG.GENERIC.INVALID_SESSION};
        }
        if(res.status===200 && res.data !== "fail"){            
            return res.data;
        }
        console.error(res.data)
        return {error:MSG.MINDMAP.ERR_FETCH_PROJECT}
    }catch(err){
        console.error(err)
        return {error:MSG.MINDMAP.ERR_FETCH_PROJECT}
    }
}

export const getAccessibilityScreens = async(projId, relName, cycId) =>{
    try{
        const res = await axios(url+'/getAccessibilityData_ICE', {
            method: 'POST',
            headers: {
                'Content-type': 'application/json',
            },
            data: {
                'cycleId': cycId,
                'projectId': projId,
                'releaseName': relName,
                'type': "screendata"
            },
            credentials: 'include'
        });
        if(res.status === 401 || res.data === "Invalid Session"){
        }
        if(res.status === 200 && Object.keys(res.data).length < 1){
        }
        if(res.status===200 && res.data !== "fail"){            
            return res.data;
        }
        console.error(res.data)
    }catch(err){
        console.error(err)
    }
}

export const viewReport = async (reportid, reportType="json", screenshotFlag) => { 
    try{
        const res = await axios(url+'/viewReport', {
            method: 'GET',
            headers: {
                'Content-type': 'application/json',
            },
            responseType:(reportType === 'pdf')? 'arraybuffer':'application/json',
            params: { reportID: reportid, type: reportType, images: screenshotFlag  },
            credentials: 'include'
        });
        if(res.status === 401 || res.data === "Invalid Session"){
            RedirectPage(navigate)
            return { error: MSG.GENERIC.INVALID_SESSION };
        }
        if(res.status===200 && res.data !== "fail"){            
            return res.data;
        }
        console.error(res.data)
        return { error: MSG.REPORT.ERR_FETCH_REPORT }
    }
    catch(err){
        console.error(err)
        return { error: MSG.REPORT.ERR_FETCH_REPORT }
    }
}

export const getDetails_JIRA = async() => { 
    try{
        const res = await axios(url+'/getDetails_JIRA', {
            method: 'POST',
            headers: {
            'Content-type': 'application/json',
            },
            credentials: 'include'
        });
        if(res.status === 401 || res.data === "Invalid Session" ){
            RedirectPage(navigate)
            return {error:MSG.GENERIC.INVALID_SESSION};
        }else if(res.status===200 && res.data !== "fail"){            
            return res.data;
        }
        console.error(res.data)
        return {error:MSG.JIRA.WARN_FETCH_SAVED_CREDS}
    }catch(err){
        console.error(err)
        return {error:MSG.JIRA.WARN_FETCH_SAVED_CREDS}
    }
}

export const getDetails_AZURE = async() => { 
    try{
        const res = await axios(url+'/getDetails_AZURE', {
            method: 'POST',
            headers: {
            'Content-type': 'application/json',
            },
            credentials: 'include'
        });
        if(res.status === 401 || res.data === "Invalid Session" ){
            RedirectPage(navigate)
            return {error:MSG.GENERIC.INVALID_SESSION};
        }else if(res.status===200 && res.data !== "fail"){            
            return res.data;
        }
        console.error(res.data)
        return {error:MSG.JIRA.WARN_FETCH_SAVED_CREDS}
    }catch(err){
        console.error(err)
        return {error:MSG.JIRA.WARN_FETCH_SAVED_CREDS}
    }
}

export const connectJira_ICE = async(jiraurl,jirausername,jirapwd) => {
    try{

        const res = await axios(url+'/connectJira_ICE', {
            method: 'POST',
            headers: {
            'Content-type': 'application/json',
            },
           data: {   
           "action" : 'loginToJira',
            "url": jiraurl,
            "username": jirausername,
            "password": jirapwd,
            }
        });
        if(res.status === 401 || res.data === "Invalid Session"){
            RedirectPage(navigate)
            return {error:MSG.GENERIC.INVALID_SESSION};
        }
        if(res.status===200 && res.data !== "fail"){            
            return res.data;
        }
        console.error(res.data)
        return {error:MSG.INTEGRATION.ERR_LOGIN_AGAIN}
    }catch(err){
        console.error(err)
        return {error:MSG.INTEGRATION.ERR_LOGIN_AGAIN}
    }
}

export const connectJira_ICE_Fields = async(project, type, jiraurl, jirausername, jirapwd, projects) => {
    console.log(projects);
    try{

        const res = await axios(url+'/connectJira_ICE', {
            method: 'POST',
            headers: {
            'Content-type': 'application/json',
            },
           data: {   
           "action" : 'getJiraConfigureFields',
            url: jiraurl,
            username: jirausername,
            password: jirapwd,
            projects: projects,
            project: project,
            issuetype:"Bug",
            }
        });
        if(res.status === 401 || res.data === "Invalid Session"){
            RedirectPage(navigate)
            return {error:MSG.GENERIC.INVALID_SESSION};
        }
        if(res.status===200 && res.data !== "fail"){            
            return res.data;
        }
        console.error(res.data)
        return {error:MSG.INTEGRATION.ERR_LOGIN_AGAIN}
    }catch(err){
        console.error(err)
        return {error:MSG.INTEGRATION.ERR_LOGIN_AGAIN}
    }
}

export const connectJira_ICE_create = async(data) => {
    try{

        const res = await axios(url+'/connectJira_ICE', {
            method: 'POST',
            headers: {
            'Content-type': 'application/json',
            },
            data: data
        });
        if(res.status === 401 || res.data === "Invalid Session"){
            RedirectPage(navigate)
            return {error:MSG.GENERIC.INVALID_SESSION};
        }
        if(res.status===200 && res.data !== "fail"){            
            return res.data;
        }
        console.error(res.data)
        return {error:MSG.INTEGRATION.ERR_LOGIN_AGAIN}
    }catch(err){
        console.error(err)
        return {error:MSG.INTEGRATION.ERR_LOGIN_AGAIN}
    }
}

export const connectAzzure_ICE_create = async(data) => {
    try{
        const res = await axios(url+'/connectAzure_ICE', {
            method: 'POST',
            headers: {
            'Content-type': 'application/json',
            },
            credentials: 'include',
            data: data
        });
        if(res.status === 401 || res.data === "Invalid Session" ){
            RedirectPage(navigate)
            return {error:MSG.GENERIC.INVALID_SESSION};
        }else if(res.status===200 && res.data !== "fail"){            
            return res.data;
        }
        console.error(res.data)
        return {error:MSG.AZURE.ERR_AZURE_LOG_DEFECT}
    }catch(err){
        console.error(err)
        return {error:MSG.AZURE.ERR_AZURE_LOG_DEFECT}
    }
}

export const connectAzure_ICE = async(dataObj) => {
    try{

        const res = await axios(url+'/connectAzure_ICE', {
            method: 'POST',
            headers: {
            'Content-type': 'application/json',
            },
           data:dataObj
        });
        if(res.status === 401 || res.data === "Invalid Session"){
            RedirectPage(navigate)
            return {error:MSG.GENERIC.INVALID_SESSION};
        }
        if(res.status===200 && res.data !== "fail"){            
            return res.data;
        }
        console.error(res.data)
        return {error:MSG.INTEGRATION.ERR_LOGIN_AGAIN}
    }catch(err){
        console.error(err)
        return {error:MSG.INTEGRATION.ERR_LOGIN_AGAIN}
    }
}

export const connectAzure_ICE_Fields = async(project, type, jiraurl, jirausername, jirapwd, projects) => {
    try{

        const res = await axios(url+'/connectAzure_ICE', {
            method: 'POST',
            headers: {
            'Content-type': 'application/json',
            },
            data: {
                project: project,
                issuetype: "Bug",
                url: jiraurl,
                username: jirausername,
                pat: jirapwd,
                projects: projects,
                action: "getAzureConfigureFields"
            }
        });
        if(res.status === 401 || res.data === "Invalid Session"){
            RedirectPage(navigate)
            return {error:MSG.GENERIC.INVALID_SESSION};
        }
        if(res.status===200 && res.data !== "fail"){            
            return res.data;
        }
        console.error(res.data)
        return {error:MSG.INTEGRATION.ERR_LOGIN_AGAIN}
    }catch(err){
        console.error(err)
        return {error:MSG.INTEGRATION.ERR_LOGIN_AGAIN}
    }
}

export const viewJiraMappedList_ICE = async(userID, scenarioName) => {
    try{
        const res = await axios(url+'/viewJiraMappedList_ICE', {
            method: 'POST',
            headers: {
            'Content-type': 'application/json',
            },
            // responseType: 'arraybuffer',
            credentials: 'include',
            data: {
                "userID": userID,
                "scenarioName": scenarioName,
                "action": "viewJiraMappedList_ICE"
            },
        });
        if(res.status === 401 || res.data === "Invalid Session" ){
            RedirectPage(navigate)
            return {error:MSG.GENERIC.INVALID_SESSION};
        }else if(res.status===200 && res.data !== "fail"){            
            return res.data;
        }
        console.error(res.data)
        return {error:MSG.AZURE.ERR_AZURE_LOGIN}
    }catch(err){
        console.error(err)
        return {error:MSG.AZURE.ERR_AZURE_LOGIN}
    }
}

export const viewAzureMappedList_ICE = async(userID, scenarioName) => {
    try{
        const res = await axios(url+'/viewAzureMappedList_ICE', {
            method: 'POST',
            headers: {
            'Content-type': 'application/json',
            },
            // responseType: 'arraybuffer',
            credentials: 'include',
            data: {
                "userID": userID,
                "scenarioName": scenarioName,
                "action": "viewAzureMappedList_ICE"
            },
        });
        if(res.status === 401 || res.data === "Invalid Session" ){
            RedirectPage(navigate)
            return {error:MSG.GENERIC.INVALID_SESSION};
        }else if(res.status===200 && res.data !== "fail"){            
            return res.data;
        }
        console.error(res.data)
        return {error:MSG.AZURE.ERR_AZURE_LOGIN}
    }catch(err){
        console.error(err)
        return {error:MSG.AZURE.ERR_AZURE_LOGIN}
    }
}