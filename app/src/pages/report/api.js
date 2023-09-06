import axios from 'axios';
import {url} from '../../App';
import { Messages as MSG,RedirectPage} from '../global/components/Messages';
// import {history} from './index'

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
            // RedirectPage(history)
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

export const downloadReports = async(getDownload) => {
    try{
        const res = await axios(`/viewReport?reportID=${getDownload?.id}&type=${ getDownload?.type === 'json' ? 'json' : 'pdf' }&images=${ getDownload?.type === 'pdfwithimg' ? true : false }`, {
            method: 'GET',
            headers: {
            'Content-type': 'application/json',
            },
            responseType:(getDownload?.type === 'json')? 'application/json' : 'arraybuffer',
            credentials: 'include'
        });
        if(res.status === 401 || res.data === "Invalid Session"){
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
            // RedirectPage(history)
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
            // RedirectPage(history)
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
            "url": jiraurl,
            "username": jirausername,
            "password": jirapwd,
            "projects": [{
                "key": "10002",
                "text": "Avobank",
                "code": "AV"
            }, {
                "key": "10000",
                "text": "N68_testing",
                "code": "DUM"
            }, {
                "key": "10001",
                "text": "Testing",
                "code": "TES"
            }],
            "project": project,
            "issuetype":"Bug",
            }
        });
        if(res.status === 401 || res.data === "Invalid Session"){
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
    console.log(projects);
    try{

        const res = await axios(url+'/connectAzure_ICE', {
            method: 'POST',
            headers: {
            'Content-type': 'application/json',
            },
        //    data: {   
        //    "action" : 'getAzureConfigureFields',
        //     "url": jiraurl,
        //     "username": jirausername,
        //     "password": jirapwd,
        //     "projects": [
        //         {
        //             "id": "c5d3a8af-ebac-4015-ad8b-72c66fcf8fbd",
        //             "name": "AvoAssure",
        //             "description": "Avo Assure - Agile PM",
        //             "url": "https://dev.azure.com/AvoAutomation/_apis/projects/c5d3a8af-ebac-4015-ad8b-72c66fcf8fbd",
        //             "state": "wellFormed",
        //             "revision": 324,
        //             "visibility": "private",
        //             "lastUpdateTime": "2023-03-02T05:55:11.44Z"
        //         }
        //     ],
        //     "project": project,
        //     "issuetype":"Bug",
        //     }
            data: {
                "project": "5fd09fd1-b930-4a90-8740-d0ce504f1b5a",
                "issuetype": "Bug",
                "url": "https://dev.azure.com/AvoAutomation",
                "username": "ajith.antony",
                "pat": "hesmefz5oco6l3jeeujsoopifjo3tmbgu3vvezkwnrtzdo5o5ira",
                "projects": [
                    {
                        "key": "5fd09fd1-b930-4a90-8740-d0ce504f1b5a",
                        "text": "AvoTest"
                    },
                    {
                        "key": "c5d3a8af-ebac-4015-ad8b-72c66fcf8fbd",
                        "text": "AvoAssure"
                    }
                ],
                "action": "getAzureConfigureFields"
            }
        });
        if(res.status === 401 || res.data === "Invalid Session"){
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