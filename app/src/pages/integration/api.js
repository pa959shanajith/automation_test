import axios from 'axios';
import {RedirectPage, Messages as MSG} from '../global';
import {history} from './index';
import {url} from '../../App';

/*Component loginToQTest_ICE
  use: logins to qTets Environment  
  api returns [{id:"",name:""}]
*/


export const loginToQTest_ICE = async(qcPassword ,qcURL , qcUsername) => {
    try{
        const res = await axios(url+'/loginToQTest_ICE', {
            method: 'POST',
            headers: {
            'Content-type': 'application/json',
            },
           data: {
            qcPassword: qcPassword,
            qcURL: qcURL,
            qcUsername : qcUsername, 
            action : 'loginToQTest_ICE',
            qcaction : "domain"
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
        return {error:MSG.INTEGRATION.ERR_LOGIN}
    }catch(err){
        console.error(err)
        return {error:MSG.INTEGRATION.ERR_LOGIN}
    }
}
/*Component qtestProjectDetails_ICE
  use: get Project List i.e. list of all scenario  of Particular project 
  api returns [avoassure_projects:[]]
*/

export const qtestProjectDetails_ICE = async(domain , userid) => {
    try{
        const res = await axios(url+'/qtestProjectDetails_ICE', {
            method: 'POST',
            headers: {
            'Content-type': 'application/json',
            },
           data: {
            user_id: userid,
            domain : domain, 
            action : 'qtestProjectDetails_ICE',
            qcaction : "project"
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
        return {error:MSG.INTEGRATION.ERR_PROJECT_DETAILS}
    }catch(err){
        console.error(err)
        return {error:MSG.INTEGRATION.ERR_PROJECT_DETAILS}
    }
}
/*Component qtestFolderDetails_ICE
  use: get Cycle and TestSuite Details of a Particular Release 
  api returns [Cycle:"Cycle Name",testsuites:[0:{id: ,name: , testruns:[0:{id: , name:}]}]]
*/
export const qtestFolderDetails_ICE = async(releaseId, foldername, projectId, qcaction, testCasename) => {
    try{
        const res = await axios(url+'/qtestFolderDetails_ICE', {
            method: 'POST',
            headers: {
                'Content-type': 'application/json',
            },
            data: {
                project: releaseId,
                foldername : foldername,
                domain : projectId, 
                action : 'qtestFolderDetails_ICE',
                qcaction : qcaction,
                testset: testCasename
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
        return {error:MSG.INTEGRATION.ERR_TESTSUITE_DETAILS}
    }catch(err){
        console.error(err)
        return {error:MSG.INTEGRATION.ERR_TESTSUITE_DETAILS}
    }
}
/*Component saveQtestDetails_ICE
  use: Saves the Synced TestCzses and Scenario pair
  api returns: sucess/ Fail 
*/
export const saveQtestDetails_ICE = async(mappedDetails) => {
    try{
        const res = await axios(url+'/saveQtestDetails_ICE', {
            method: 'POST',
            headers: {
                'Content-type': 'application/json',
            },
            data: {
                mappedDetails : mappedDetails,
                action : 'saveQtestDetails_ICE'
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
/*Component viewQtestMappedList_ICE
  use: Gets the Values of the mapped files 
  api returns: [] 
*/
export const viewQtestMappedList_ICE = async(userID) => {
    try{
        const res = await axios(url+'/viewQtestMappedList_ICE', {
            method: 'POST',
            headers: {
            'Content-type': 'application/json',
            },
           data: {
            user_id : userID,
            action : 'viewQtestMappedList_ICE'
            
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

/*Component viewQtestMappedList_ICE
  use: Gets the Values of the mapped files 
  api returns: [] 
*/
export const zephyrUpdateMapping = async(updateMapPayload, rootCheck) => {
    try{
        const res = await axios(url+'/zephyrUpdateMapping', {
            method: 'POST',
            headers: {
            'Content-type': 'application/json',
            },
           data: {
            updateMapPayload : updateMapPayload,
            rootCheck: rootCheck,
            zephyraction : 'testcase'
            
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
        return {error:MSG.INTEGRATION.ERR_UPDATE_MAP}
    }catch(err){
        console.error(err)
        return {error:MSG.INTEGRATION.ERR_UPDATE_MAP}
    }
}

export const loginQCServer_ICE = async(qcPassword , qcURL , qcUsername ) => {
    try{
        const res = await axios(url+'/loginQCServer_ICE', {
            method: 'POST',
            headers: {
            'Content-type': 'application/json',
            },
           data: {
            qcPassword: qcPassword,
            qcURL: qcURL,
            qcUsername: qcUsername,   
            action : 'loginQCServer_ICE',
            qcaction : "domain"
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

export const qcProjectDetails_ICE = async(domain ,user_id ) => {
    try{
        const res = await axios(url+'/qcProjectDetails_ICE', {
            method: 'POST',
            headers: {
            'Content-type': 'application/json',
            },
           data: {
            action : 'qcProjectDetails_ICE',
            domain: domain,
            user_id: user_id,
            qcaction : "project"
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
        return {error:MSG.INTEGRATION.ERR_ADD_PROJECT}
    }catch(err){
        console.error(err)
        return {error:MSG.INTEGRATION.ERR_ADD_PROJECT}
    }
}

export const qcFolderDetails_ICE = async(domain ,foldername ,project,qcaction,testset,folderid) => {
    try{
        const res = await axios(url+'/qcFolderDetails_ICE', {
            method: 'POST',
            headers: {
            'Content-type': 'application/json',
            },
           data: {
            action : 'qcFolderDetails_ICE',
            domain: domain,
            foldername: foldername,
            folderid: folderid,
            project : project,
            qcaction : qcaction,
            testset : testset
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
        return {error:MSG.INTEGRATION.ERR_ADD_PROJECT}
    }catch(err){
        console.error(err)
        return {error:MSG.INTEGRATION.ERR_ADD_PROJECT}
    }
}

/*Component saveQtestDetails_ICE
  use: Saves the Synced TestCzses and Scenario pair
  api returns: sucess/ Fail 
*/
export const saveQcDetails_ICE = async(mappedDetails) => {
    try{
        const res = await axios(url+'/saveQcDetails_ICE', {
            method: 'POST',
            headers: {
            'Content-type': 'application/json',
            },
           data: {
            mappedDetails : mappedDetails,
            action : 'saveQcDetails_ICE'
            
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
/*Component viewQtestMappedList_ICE
  use: Gets the Values of the mapped files 
  api returns: [] 
*/
export const viewQcMappedList_ICE = async(userID) => {
    try{
        const res = await axios(url+'/viewQcMappedList_ICE', {
            method: 'POST',
            headers: {
            'Content-type': 'application/json',
            },
           data: {
            user_id : userID,
            action : 'viewQcMappedList_ICE'
            
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
export const loginToZephyr_ICE = async(zephyrurl, username, password) => {
    try{
        const res = await axios(url+'/loginToZephyr_ICE', {
            method: 'POST',
            headers: {
                'Content-type': 'application/json',
            },
            data: {
                action: "loginToZephyr_ICE",
				zephyrURL: zephyrurl,
				zephyrUserName:	username,
				zephyrPassword: password,
				zephyraction: "login"
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
    }catch(err){
        console.error(err)
        return {error:MSG.INTEGRATION.ERR_GET_LIST}
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
            RedirectPage(history)
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

export const zephyrMappedCyclePhase = async(releaseId, user_id) => {
    try{
        const res = await axios(url+'/zephyrMappedCyclePhase', {
            method: 'POST',
            headers: {
                'Content-type': 'application/json',
            },
            data: {
                action: 'zephyrMappedCyclePhase',
                releaseId:	releaseId,
                zephyraction: "mapcyclephase",
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
            RedirectPage(history)
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

export const zephyrMappedTestcaseDetails_ICE = async(zephyraction, treeId, cyclephaseid) => {
    try{
        const res = await axios(url+'/zephyrMappedTestcaseDetails_ICE', {
            method: 'POST',
            headers: {
            'Content-type': 'application/json',
            },
            data: {
                action : 'zephyrMappedTestcaseDetails_ICE',
                treeId: treeId,
                cyclephaseid: cyclephaseid,
                zephyraction: zephyraction,
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
        return {error:MSG.INTEGRATION.ERR_FETCH_TESTCASE}
    }catch(err){
        console.error(err)
        return {error:MSG.INTEGRATION.ERR_FETCH_TESTCASE}
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