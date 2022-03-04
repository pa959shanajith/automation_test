import axios from 'axios';
import {RedirectPage, Messages as MSG, VARIANT} from '../global'
import {history} from './index'
import {url} from '../../App'



/* getDetails_JIRA
  api returns {jiraURL: ,jiraUsername: ,jirakey:} or "empty"
*/

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


/*  manageJiraDetails
  api returns string "success" , "fail"
*/

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
            RedirectPage(history)
            return {error:MSG.GENERIC.INVALID_SESSION};
        }
        if(res.status===200 && res.data !== "fail"){            
            return res.data;
        }
        console.error(res.data)
        return {error: {content: "Failed to "+action+" Zephyr Configuration.", variant: VARIANT.ERROR}}
    }catch(err){
        console.error(err)
        return {error:{content: "Failed to "+action+" Zephyr Configuration.", variant: VARIANT.ERROR}}
    }
}