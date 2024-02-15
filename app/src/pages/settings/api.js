import axios from 'axios';
import {RedirectPage, Messages as MSG, VARIANT} from '../global';
import {navigate} from './Components/ManageIntegrations';
import {url} from '../../App';
import {history} from './index'

export const connectJira_ICE = async(jiraurl,jirausername,jirapwd) => {
    try{

        const res = await axios(url+'/connectJira_ICE', {
            method: 'POST',
            headers: {
            'Content-type': 'application/json',
            },
           data: {   
           "action" : 'jiraLogin',
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

export const manageJiraDetails = async(action, userObj) => { 
    try{
        const res = await axios(url+'/manageJiraDetails', {
            method: 'POST',
            headers: {
            'Content-type': 'application/json',
            },
            data: {action: action,user: userObj},
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
        return {error: {content: "Failed to "+action+" Jira Configuration.", variant: VARIANT.ERROR}}
    }catch(err){
        console.error(err)
        return {error:{content: "Failed to "+action+" Jira Configuration.", variant: VARIANT.ERROR}}
    }
}

export const getJiraTestcases_ICE = async(input_payload) => {
    try{
        const res = await axios(url+'/connectJira_ICE', {
            method: 'POST',
            headers: {
            'Content-type': 'application/json',
            },
           data: {   
        'project': input_payload['project'],
        'issuetype': input_payload['issuetype'],
        'itemType': input_payload['itemType'],
        'url': input_payload['url'],
        'username': input_payload['username'],
        'password': input_payload['password'],
        'projects': input_payload['projects_data'],
        'key':input_payload['key'],
        "action": "getJiraTestcases"

          
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
            RedirectPage(history)
            return {error:MSG.GENERIC.INVALID_SESSION};
        }else if(res.status===200 && res.data !== "fail"){            
            return res.data;
        }
        console.error(res.data)
        return {error:MSG.SETTINGS.ERR_JIRA_FETCH}
    }catch(err){
        console.error(err)
        return {error:MSG.SETTINGS.ERR_JIRA_FETCH}
    }
}

export const getDetails_Azure = async() => { 
    try{
        const res = await axios(url+'/getDetails_Azure', {
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
        return {error:MSG.SETTINGS.ERR_ZEPHYR_FETCH}
    }catch(err){
        console.error(err)
        return {error:MSG.SETTINGS.ERR_ZEPHYR_FETCH}
    }
}

export const getDetails_SAUCELABS = async() => { 
    try{
        const res = await axios(url+'/getDetails_SAUCELABS', {
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
        return {error:MSG.SETTINGS.ERR_ZEPHYR_FETCH}
    }catch(err){
        console.error(err)
        return {error:MSG.SETTINGS.ERR_ZEPHYR_FETCH}
    }
}

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

export const getDetails_Testrail = async () => {
    try {
        const { data, status } = await axios(url + '/getDetails_Testrail', {
            method: 'POST',
            headers: {
                'Content-type': 'application/json',
            },
            credentials: 'include'
        });
        
        if (status === 401 || data === "Invalid Session") {
            RedirectPage(history)
            return { error: MSG.GENERIC.INVALID_SESSION };
        } else if (status === 200 && data !== "fail") {
            return data;
        } else if (status !== 200 || data == "fail") {
            return data;
        }
        return { error: MSG.SETTINGS.ERR_TESTRAIL_FETCH }
    } catch (err) {
        console.error(err)
        return { error: MSG.SETTINGS.ERR_TESTRAIL_FETCH }
    }
}

export const getProjectPlans = async (projectPayload) => {
    try {
        const { data, status } = await axios(url + '/getProjectPlans', {
            method: 'POST',
            headers: {
                'Content-type': 'application/json',
            },
            credentials: 'include',
            data: projectPayload
        });
        
        if (status === 401 || data === "Invalid Session") {
            RedirectPage(history)
            return { error: MSG.GENERIC.INVALID_SESSION };
        } else if (status === 200 && data !== "fail") {
            return data;
        } else if (status !== 200 || data == "fail") {
            return data;
        }
        return { error: MSG.SETTINGS.ERR_TESTRAIL_TESTPLAN_FETCH }
    } catch (err) {
        console.error(err)
        return { error: MSG.SETTINGS.ERR_TESTRAIL_TESTPLAN_FETCH }
    }
}

export const getSuitesTestrail_ICE = async (payload) => {
    try {
        const { data, status } = await axios(url + '/getSuitesTestrail_ICE', {
            method: 'POST',
            headers: {
                'Content-type': 'application/json',
            },
            credentials: 'include',
            data: payload
        });
        
        if (status === 401 || data === "Invalid Session") {
            RedirectPage(history)
            return { error: MSG.GENERIC.INVALID_SESSION };
        } else if (status === 200 && data !== "fail") {
            return data;
        } else if (status !== 200 || data == "fail") {
            return data;
        }
        return { error: MSG.SETTINGS.ERR_TESTRAIL_TESTPLAN_FETCH }
    } catch (err) {
        console.error(err)
        return { error: MSG.SETTINGS.ERR_TESTRAIL_TESTPLAN_FETCH }
    }
}

export const getSectionsTestrail_ICE = async (payload) => {
    try {
        const { data, status } = await axios(url + '/getSectionsTestrail_ICE', {
            method: 'POST',
            headers: {
                'Content-type': 'application/json',
            },
            credentials: 'include',
            data: payload
        });
        
        if (status === 401 || data === "Invalid Session") {
            RedirectPage(history)
            return { error: MSG.GENERIC.INVALID_SESSION };
        } else if (status === 200 && data !== "fail") {
            return data;
        } else if (status !== 200 || data == "fail") {
            return data;
        }
        return { error: MSG.SETTINGS.ERR_TESTRAIL_TESTPLAN_FETCH }
    } catch (err) {
        console.error(err)
        return { error: MSG.SETTINGS.ERR_TESTRAIL_TESTPLAN_FETCH }
    }
}

/*  manageZephyrDetails
  api returns string "success" , "fail"
*/

export const manageZephyrDetails = async(action, userObj) => {
    try{
        const res = await axios(url+'/manageZephyrDetails', {
            method: 'POST',
            headers: {
            'Content-type': 'application/json',
            },
            data: {action: action,user: userObj},
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
        return {error:MSG.INTEGRATION.ERR_LOGIN_AGAIN}
    }catch(err){
        console.error(err)
        return {error:MSG.INTEGRATION.ERR_LOGIN_AGAIN}
    }
}

export const manageTestRailDetails = async (action, userObj) => {
    try {
        const { data, status } = await axios(url + '/manageTestrailDetails', {
            method: 'POST',
            headers: {
                'Content-type': 'application/json',
            },
            data: { action, user: userObj },
            credentials: 'include'
        });

        if (status === 401 || data === "Invalid Session") {
            RedirectPage(navigate)
            return { error: MSG.GENERIC.INVALID_SESSION };
        }
        else if (status === 200 && data !== "fail") {
            return data;
        }
    } catch (err) {
        console.error(err)
        return { error: MSG.INTEGRATION.ERR_LOGIN_AGAIN }
    }
}

export const getAvoDetails = async(user_id) => {
    try{
        const res = await axios(url+'/getAvoDetails', {
            method: 'POST',
            headers: {
                'Content-type': 'application/json',
            },
            data: {
                action: 'getAvoDetails',
                user_id : user_id
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
        return {error:MSG.INTEGRATION.ERR_GET_LIST}
    } catch(err){
        console.error(err)
        return {error:MSG.INTEGRATION.ERR_GET_LIST}
    }
}

export const saveJiraDetails_ICE = async(mappedDetails) => {
    try{
        console.log(mappedDetails);
        const res = await axios(url+'/saveJiraDetails_ICE', {
            method: 'POST',
            headers: {
            'Content-type': 'application/json',
            },
           data: {
            mappedDetails : mappedDetails,
            action : 'saveJiraDetails_ICE'
            
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
        return {error:MSG.INTEGRATION.ERR_MAP_TC}
    }catch(err){
        console.error(err)
        return {error:MSG.INTEGRATION.ERR_SAVE_MAPPED_TC}
    }
}

export const saveUnsyncDetails = async(undoMapList) => {
    try{
        const res = await axios(url+'/saveUnsyncDetails', {
            method: 'POST',
            headers: {
            'Content-type': 'application/json',
            },
            data: {
                action: "saveUnsyncDetails",
                screenType: undoMapList['screenType'],
                undoMapList : undoMapList, 
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
        return {error:MSG.INTEGRATION.ERR_UNSYNC}
    }catch(err){
        console.error(err)
        return {error:MSG.INTEGRATION.ERR_UNSYNC}
    }
}

export const viewJiraMappedList_ICE = async(userID) => {
    try{
        const res = await axios(url+'/viewJiraMappedList_ICE', {
            method: 'POST',
            headers: {
            'Content-type': 'application/json',
            },
            data: {
                user_id : userID,
                action : 'viewJiraMappedList_ICE'
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
        return {error:MSG.INTEGRATION.ERR_EMPTY_MAPPED_DATA}
    }catch(err){
        console.error(err)
        return {error:MSG.INTEGRATION.ERR_EMPTY_MAPPED_DATA}
    }
}


export const excelToZephyrMappings = async(data) => {
    try{
        const res = await axios(url+'/excelToZephyrMappings', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            data: {'data':data},
            credentials: 'include'
        });
        if(res.status === 401 || res.data === "Invalid Session"){
            RedirectPage(navigate)
            return {error:MSG.GENERIC.INVALID_SESSION};
        }
        else if (res.data == 'valueError') {
            return {error : MSG.MINDMAP.ERR_EMPTY_COL}          //using the errors that are defined under Mindmap, as they have the required error content
        }
        else if(res.data == 'invalidformat'){
            return {error:MSG.MINDMAP.ERR_INVALID_EXCEL_DATA}
        }
        else if (res.data == "emptySheet" || res.data == 'fail') {
            return {error : MSG.MINDMAP.ERR_EXCEL_SHEET}
        }
        else if(res.status===200 && res.data !== "fail"){            
            return res.data;
        }
        console.error(res.data)
        return {error:MSG.MINDMAP.ERR_INVALID_EXCEL_DATA}
    }catch(err){
        console.error(err)
        return {error:MSG.MINDMAP.ERR_INVALID_EXCEL_DATA}
    }
}

export const loginToZephyr_ICE = async(zephyrPayload) => {
    try{
        const res = await axios(url+'/loginToZephyr_ICE', {
            method: 'POST',
            headers: {
                'Content-type': 'application/json',
            },
            data: {
                action: "loginToZephyr_ICE",
                zephyrPayload: zephyrPayload,
				zephyraction: "login"
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
        return {error:MSG.INTEGRATION.ERR_GET_LIST}
    }catch(err){
        console.error(err)
        return {error:MSG.INTEGRATION.ERR_GET_LIST}
    }
}

export const getProjectsTestrail_ICE = async(testRailPayload) => {
    try{
        const res = await axios(url+'/getProjectsTestrail_ICE', {
            method: 'POST',
            headers: {
                'Content-type': 'application/json',
            },
            data: testRailPayload
        });

        if(res.status === 401 || res.data === "Invalid Session"){
            RedirectPage(navigate)
            return {error:MSG.GENERIC.INVALID_SESSION};
        }
        if(res.status===200 && res.data !== "fail"){            
            return res.data;
        }
        console.error(res.data)
        return {error:MSG.INTEGRATION.ERR_GET_LIST}
    }catch(err){
        console.error(err)
        return {error:MSG.INTEGRATION.ERR_GET_LIST}
    }
}

export const getTestcasesTestrail_ICE = async(payload) => {
    try{
        const res = await axios(url+'/getTestcasesTestrail_ICE', {
            method: 'POST',
            headers: {
                'Content-type': 'application/json',
            },
            data: payload
        });

        if(res.status === 401 || res.data === "Invalid Session"){
            RedirectPage(navigate)
            return {error:MSG.GENERIC.INVALID_SESSION};
        }
        if(res.status===200 && res.data !== "fail"){            
            return res.data;
        }
        console.error(res.data)
        return {error:MSG.INTEGRATION.ERR_GET_LIST}
    }catch(err){
        console.error(err)
        return {error:MSG.INTEGRATION.ERR_GET_LIST}
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
        if(res.status === 429 || res.data === "Max retries exceeded"){
            return {error:MSG.GENERIC.MAX_RETRIES_EXCEEDED};
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

export const saveAzureDetails_ICE = async(mappedDetails) => {
    try{
        const res = await axios(url+'/saveAzureDetails_ICE', {
            method: 'POST',
            headers: {
            'Content-type': 'application/json',
            },
           data: {
            mappedDetails : mappedDetails,
            action : 'saveAzureDetails_ICE'
            
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
        return {error:MSG.INTEGRATION.ERR_MAP_TC}
    }catch(err){
        console.error(err)
        return {error:MSG.INTEGRATION.ERR_SAVE_MAPPED_TC}
    }
}

export const viewAzureMappedList_ICE = async(userID) => {
    try{
        const res = await axios(url+'/viewAzureMappedList_ICE', {
            method: 'POST',
            headers: {
            'Content-type': 'application/json',
            },
            data: {
                user_id : userID,
                action : 'viewAzureMappedList_ICE'
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
        return {error:MSG.INTEGRATION.ERR_EMPTY_MAPPED_DATA}
    }catch(err){
        console.error(err)
        return {error:MSG.INTEGRATION.ERR_EMPTY_MAPPED_DATA}
    }
}

export const manageAzureDetails = async(action, userObj) => {
    try{
        const res = await axios(url+'/manageAzureDetails', {
            method: 'POST',
            headers: {
            'Content-type': 'application/json',
            },
            data: {action: action,user: userObj},
            credentials: 'include'
        });
        if(res.status === 401 || res.data === "Invalid Session"){
            RedirectPage(navigate)
            return {error:MSG.GENERIC.INVALID_SESSION};
        }
        if(res.status===200){            
            return res.data;
        }
        console.error(res.data)
        return {error: {content: "Failed to "+action+" Azure Configuration.", variant: VARIANT.ERROR}}
    }catch(err){
        console.error(err)
        return {error:{content: "Failed to "+action+" Azure Configuration.", variant: VARIANT.ERROR}}
    }
}

export const manageSaucelabsDetails = async(action, userObj) => {
    try{
        const res = await axios(url+'/manageSaucelabsDetails', {
            method: 'POST',
            headers: {
            'Content-type': 'application/json',
            },
            data: {action: action,user: userObj},
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
        return {error: {content: "Failed to "+action+" Saucelab Configuration.", variant: VARIANT.ERROR}}
    }catch(err){
        console.error(err)
        return {error:{content: "Failed to "+action+" Saucelab Configuration.", variant: VARIANT.ERROR}}
    }
}
export const zephyrProjectDetails_ICE = async(projectId, user_id) => {
    try{
        const res = await axios(url+'/zephyrProjectDetails_ICE', {
            method: 'POST',
            headers: {
            'Content-type': 'application/json',
            },
           data: {
                action : 'zephyrProjectDetails_ICE',
                projectId:	projectId,
                zephyraction: "release",
                user_id : user_id 
            }
        });
        if(res.status === 401 || res.data === "Invalid Session"){
            RedirectPage(navigate)
            return {error:MSG.GENERIC.INVALID_SESSION};
        }
        if(res.status===200){            
            return res.data;
        }
        console.error(res.data)
        return {error:MSG.INTEGRATION.ERR_ADD_PROJECT}
    }catch(err){
        console.error(err)
        return {error:MSG.INTEGRATION.ERR_ADD_PROJECT}
    }
}

export const zephyrCyclePhase_ICE = async(releaseId, user_id) => {
    try{
        const res = await axios(url+'/zephyrCyclePhase_ICE', {
            method: 'POST',
            headers: {
                'Content-type': 'application/json',
            },
            data: {
                action: 'zephyrCyclePhase_ICE',
                releaseId:	releaseId,
                zephyraction: "cyclephase",
                user_id : user_id
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
        return {error:MSG.INTEGRATION.ERR_GET_LIST}
    } catch(err){
        console.error(err)
        return {error:MSG.INTEGRATION.ERR_GET_LIST}
    }
}

export const zephyrTestcaseDetails_ICE = async(zephyraction, treeId) => {
    try{
        const res = await axios(url+'/zephyrTestcaseDetails_ICE', {
            method: 'POST',
            headers: {
            'Content-type': 'application/json',
            },
            data: {
                action : 'zephyrTestcaseDetails_ICE',
                treeId: treeId,
                zephyraction: zephyraction,
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
        return {error:MSG.INTEGRATION.ERR_FETCH_TESTCASE}
    }catch(err){
        console.error(err)
        return {error:MSG.INTEGRATION.ERR_FETCH_TESTCASE}
    }
}

export const saveZephyrDetails_ICE = async(mappedDetails) => {
    try{
        const res = await axios(url+'/saveZephyrDetails_ICE', {
            method: 'POST',
            headers: {
            'Content-type': 'application/json',
            },
           data: {
            mappedDetails : mappedDetails,
            action : 'saveZephyrDetails_ICE'
            
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
        return {error:MSG.INTEGRATION.ERR_MAP_TC}
    }catch(err){
        console.error(err)
        return {error:MSG.INTEGRATION.ERR_SAVE_MAPPED_TC}
    }
}

export const viewZephyrMappedList_ICE = async(userID) => {
    try{
        const res = await axios(url+'/viewZephyrMappedList_ICE', {
            method: 'POST',
            headers: {
            'Content-type': 'application/json',
            },
            data: {
                user_id : userID,
                action : 'viewZephyrMappedList_ICE'
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
        return {error:MSG.INTEGRATION.ERR_EMPTY_MAPPED_DATA}
    }catch(err){
        console.error(err)
        return {error:MSG.INTEGRATION.ERR_EMPTY_MAPPED_DATA}
    }
}

export const manageBrowserstackDetails = async(action, userObj) => {
    try{
        const res = await axios(url+'/manageBrowserstackDetails', {
            method: 'POST',
            headers: {
            'Content-type': 'application/json',
            },
            data: {action: action,user: userObj},
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
        return {error: {content: "Failed to "+action+" Browserstack Configuration.", variant: VARIANT.ERROR}}
    }catch(err){
        console.error(err)
        return {error:{content: "Failed to "+action+" Browserstack Configuration.", variant: VARIANT.ERROR}}
    }
}

export const getDetails_BROWSERSTACK = async() => { 
    try{
        const res = await axios(url+'/getDetails_BROWSERSTACK', {
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
export const getjira_json = async(input_payload) => {
    try{
        const res = await axios(url+'/getjira_json', {
            method: 'POST',
            headers: {
            'Content-type': 'application/json',
            },
           data: {   
                'project': input_payload['project'],
                'issuetype': input_payload['issuetype'],
                'itemType': input_payload['itemType'],
                'url': input_payload['url'],
                'username': input_payload['username'],
                'password': input_payload['password'],
                'projects': input_payload['projects_data'],
                'key':input_payload['key'],
                "action": "getJiraJSON"
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