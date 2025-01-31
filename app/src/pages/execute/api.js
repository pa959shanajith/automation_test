import axios from 'axios';
import {url} from '../../App';
import { Messages as MSG,RedirectPage} from '../global';
import {navigate} from './components/ConfigurePage'

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
                page: props.page,
                searchKey: props.searchKey
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
            RedirectPage(navigate)
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
            RedirectPage(navigate)
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
            RedirectPage(navigate)
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
        if(res.status === 401 || res.data === "Invalid Session"){
            RedirectPage(navigate)
            return {errorapi:MSG.GENERIC.INVALID_SESSION};
        }
        if(res.status===200 && res.data !== "fail"){            
            return res.data;
        }
        console.error(res.data)
        return {errorapi:MSG.EXECUTE.ERR_EXECUTE_TESTSUITE}
    }catch(err){
        console.error(err)
        return {errorapi:MSG.EXECUTE.ERR_EXECUTE_TESTSUITE}
    }
}

export const connectAzure_ICE = async(azureURL, azureUserName, azurePassword) => {
    try{
        var apiObj = {   
            "action" : 'azureLogin',
             "url": azureURL,
             "username": azureUserName,
             "pat": azurePassword
             }    
        const res = await axios(url+'/connectAzure_ICE', {
            method: 'POST',
            headers: {
            'Content-type': 'application/json',
            },
           data:apiObj
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
            RedirectPage(navigate)
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
export const execAutomation = async(executionKey, executionThrough) => {
    try{
        const res = await axios(url+'/execAutomation', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            data: { "key": executionKey, "executionThrough": executionThrough},
            credentials: 'include'
        });
        if(res.status===200 && res.data !== "fail"){
            return res.data;
        }else if(res.status === 401 || res.data === "Invalid Session"){
            RedirectPage(navigate)
            return {error:MSG.GENERIC.INVALID_SESSION};
        }
        console.log(res.data + '  408')
        return {error:MSG.MINDMAP.ERR_FETCH_MODULES}
    }catch(err){
        console.error(err)
        return {error:MSG.MINDMAP.ERR_FETCH_MODULES}
    }
}
export const deleteConfigureKey = async(props) => {
    try{
        const res = await axios(url+'/deleteConfigureKey', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            data: {"key":props},
            credentials: 'include'
        });
        if(res.status===200 && res.data !== "fail"){
            return res.data;
        }else if(res.status === 401 || res.data === "Invalid Session"){
            RedirectPage(navigate)
            return {error:MSG.GENERIC.INVALID_SESSION};
        }
        console.log(res.data + '  408')
        return {error:MSG.MINDMAP.ERR_FETCH_MODULES}
    }catch(err){
        console.error(err)
        return {error:MSG.MINDMAP.ERR_FETCH_MODULES}
    }
}
export const getQueueState = async(data) => {
    try{
        const res = await axios(url+'/getQueueState', {
            method: 'GET',
            credentials: 'include'
        });

        if(res.status===200 && res.data !== "fail"){            
            return res.data;
        }else if(res.status===200 && res.data === "fail"){            
            return {error : MSG.GLOBAL.ERR_SOMETHING_WRONG};
        }
        else if(res.status === 401 || res.data === "Invalid Session"){
            return {error:MSG.GENERIC.INVALID_SESSION};
        }
        return {error:MSG.GLOBAL.ERR_SOMETHING_WRONG}
    }catch(err){
        return {error:MSG.GLOBAL.ERR_SOMETHING_WRONG}
    }
}
export const deleteExecutionListId = async(props) => {
    try{
            const res = await axios(url+'/deleteExecutionListId', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            data: props,
            credentials: 'include'
        });
        if(res.status===200 && res.data !== "fail"){
            return res.data;
        }else if(res.status === 401 || res.data === "Invalid Session"){
            RedirectPage(navigate)
            return {error:MSG.GENERIC.INVALID_SESSION};
        }
        return {error:MSG.MINDMAP.ERR_FETCH_MODULES}
    }catch(err){
        console.error(err)
        return {error:MSG.MINDMAP.ERR_FETCH_MODULES}
    }
}
export const getDetails_Azure=async()=>{
    try{
        const res=await axios(url+'/getDetails_Azure',{
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
    
export const fetchAgentModuleList = async(param) => {
    try{
        // console.log(req);
        const res = await axios(url+'/fetchAgentModuleList', {
            method: 'POST',
            headers: {
                'Content-type': 'application/json',
            },
            data: {
                executionListId: param 
            }
        });
        if(res.status === 401){
            RedirectPage(navigate)
            return {error:MSG.GENERIC.INVALID_SESSION}
        }
        if(res.status === 200 && res.data !== "fail"){            
            return res.data;
        }
        return { error:MSG.DevOps.ERR_DevOps_Keys}
    }catch(err){
        console.error(err)
        return {error:MSG.DevOps.ERR_DevOps_Keys}
    }
}

//fetching the history of execution  in Execution Profile Statistics Tab in Matrices

export const fetchHistory = async(fromDate,toDate) => {
    try{
        const res = await axios(url+'/fetchHistory', {
            method: 'POST',
            headers:{
                        'Content-type': 'application/json',
                    },
            data: {
                    action: "fetchHistory",
                    fromDate: fromDate,
                    toDate: toDate,
                }
            });    
        if(res.status === 401){
            RedirectPage(navigate)
            return {error:MSG.GENERIC.INVALID_SESSION}
        } 
        if(res.status === 200 && res.data !== "fail"){
            return res.data;
        }
        return { error:MSG.DevOps.ERR_DevOps_Keys}  
    }catch(err){
        console.error(err)
        return {error:MSG.DevOps.ERR_DevOps_Keys}
    }
}
//fetching the navigate of execution  in Execution Profile Statistics Tab in Matrices
export const fetchnavigate = async(fromDate,toDate) => {
    try{
        const res = await axios(url+'/fetchnavigate', {
            method: 'POST',
            headers:{
                        'Content-type': 'application/json',
                    }, 
            data: {
                    action: "fetchnavigate",
                    fromDate: fromDate,
                    toDate: toDate,
                }
            });    
        if(res.status === 401){
            RedirectPage(navigate)
            return {error:MSG.GENERIC.INVALID_SESSION}
        }    
        if(res.status === 200 && res.data !== "fail"){
            return res.data; 
        }
        return { error:MSG.DevOps.ERR_DevOps_Keys}  
    }catch(err){
        console.error(err)
        return {error:MSG.DevOps.ERR_DevOps_Keys}
    }
}
 
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
            RedirectPage(navigate)
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
            data: { 
                action: "loginToZephyr_ICE",
                zephyrPayload: zephyrPayload,
                integrationType : integrationType,
                zephyraction: "login"
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
        return {error:MSG.EXECUTE.ERR_LOGIN_ZEPHYR}
    }catch(err){
        console.error(err)
        return {error:MSG.EXECUTE.ERR_LOGIN_ZEPHYR}
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
            RedirectPage(navigate)
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

export const fetchAvoAgentAndAvoGridList = async(props) => {
    try{
        const res = await axios(url+'/getAvoAgentAndAvoGridList', {
            method: 'POST',
            headers: {
                'Content-type': 'application/json',
            },
            data:props
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

export const readTestSuite_ICEuser = async(readTestSuite) => { 
    try{
        const res = await axios(url+'/readTestSuite_ICE', {
            method: 'POST',
            headers: {
            'Content-type': 'application/json',
            },
            data: {param : 'getScheduledDetails_ICE', readTestSuite : readTestSuite, fromFlag:"scheduling"},
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
        return {error:MSG.EXECUTE.ERR_TESTSUITE_FETCH}
    }catch(err){
        console.error(err)
        return {error:MSG.EXECUTE.ERR_TESTSUITE_FETCH}
    }
}

export const sendMailOnExecutionStart = async (senderEmailAddress, recieverEmailAddress, executionData, profileName) => {
    try {
        const result = await axios(url + '/sendMailOnExecutionStart', {
            method: 'POST',
            headers: {
                'Content-type': 'application/json',
            },
            data: {
                senderEmailAddress: senderEmailAddress,
                recieverEmailAddress: recieverEmailAddress,
                executionData: executionData,
                profileName: profileName,
                startDate: new Date().getFullYear() + "-" + ("0" + (new Date().getMonth() + 1)).slice(-2) + "-" + ("0" + new Date().getDate()).slice(-2) + " " + ("0" + new Date().getHours()).slice(-2) + ":" + ("0" + new Date().getMinutes()).slice(-2) + ":" + ("0" + new Date().getSeconds()).slice(-2)
           }
        });

        if(result.status===200 && result.data !== "fail"){
            return result.data;
        }
        else if(result.status === 401 || result.data === "Invalid Session"){
            RedirectPage(navigate)
            return {error:MSG.GENERIC.INVALID_SESSION};
        }
        return {error:MSG.GLOBAL.ERR_SEND_EMAIL}
    }
    catch(error) {
        console.error(error)
        return {error:MSG.GLOBAL.ERR_SEND_EMAIL}
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

export const saveSauceLabData = async(props) => {
    try{
            const res = await axios(url+'/saveSauceLabData', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            data: props,
            credentials: 'include'
        });
        if(res.status===200 && res.data !== "fail"){
            return res.data;
        }else if(res.status === 401 || res.data === "Invalid Session"){
            RedirectPage(navigate)
            return {error:MSG.GENERIC.INVALID_SESSION};
        }
        return {error:MSG.MINDMAP.ERR_FETCH_MODULES}
    }catch(err){
        console.error(err)
        return {error:MSG.MINDMAP.ERR_FETCH_MODULES}
    }
}

export const saveAppActivityData = async(props) => {
    try{
            const res = await axios(url+'/saveAppActivityData', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            data: props,
            credentials: 'include'
        });
        if(res.status===200 && res.data !== "fail"){
            return res.data;
        }else if(res.status === 401 || res.data === "Invalid Session"){
            RedirectPage(navigate)
            return {error:MSG.GENERIC.INVALID_SESSION};
        }
        return {error:MSG.MINDMAP.ERR_FETCH_MODULES}
    }catch(err){
        console.error(err)
        return {error:MSG.MINDMAP.ERR_FETCH_MODULES}
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

export const saveBrowserstackData = async(props) => {
    try{
            const res = await axios(url+'/saveBrowserstackData', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            data: props,
            credentials: 'include'
        });
        if(res.status===200 && res.data !== "fail"){
            return res.data;
        }else if(res.status === 401 || res.data === "Invalid Session"){
            RedirectPage(navigate)
            return {error:MSG.GENERIC.INVALID_SESSION};
        }
        return {error:MSG.MINDMAP.ERR_FETCH_MODULES}
    }catch(err){
        console.error(err)
        return {error:MSG.MINDMAP.ERR_FETCH_MODULES}
    }
}