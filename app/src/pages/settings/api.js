import axios from 'axios';
import {RedirectPage, Messages as MSG} from '../global';
import {history} from './index';
import {url} from '../../App';

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
            RedirectPage(history)
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
            RedirectPage(history)
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
            RedirectPage(history)
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
            RedirectPage(history)
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
            RedirectPage(history)
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
            RedirectPage(history)
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
            RedirectPage(history)
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