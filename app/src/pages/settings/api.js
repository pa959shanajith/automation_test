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