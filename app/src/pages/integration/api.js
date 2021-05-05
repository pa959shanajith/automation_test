import axios from 'axios';
import {RedirectPage} from '../global';
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
            return {error:'invalid session'};
        }
        if(res.status===200 && res.data !== "fail"){            
            return res.data;
        }
        console.error(res.data)
        return {error:'Failed to Login'}
    }catch(err){
        console.error(err)
        return {error:'Failed to Login'}
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
            return {error:'invalid session'};
        }
        if(res.status===200 && res.data !== "fail"){            
            return res.data;
        }
        console.error(res.data)
        return {error:'Failed to Project Details'}
    }catch(err){
        console.error(err)
        return {error:'Failed to Project Details'}
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
            return {error:'invalid session'};
        }
        if(res.status===200 && res.data !== "fail"){            
            return res.data;
        }
        console.error(res.data)
        return {error:'Failed to TestSuite Details'}
    }catch(err){
        console.error(err)
        return {error:'Failed to TestSuite Details'}
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
            return {error:'invalid session'};
        }
        if(res.status===200 && res.data !== "fail"){            
            return res.data;
        }
        console.error(res.data)
        return {error:'Map Testcases Before Save'}
    }catch(err){
        console.error(err)
        return {error:'Failed to Save Mapped TestCases'}
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
            return {error:'invalid session'};
        }
        if(res.status===200 && res.data !== "fail"){            
            return res.data;
        }
        console.error(res.data)
        return {error:'No Mapped Dataa Found'}
    }catch(err){
        console.error(err)
        return {error:'No Mapped Data Found'}
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
            return {error:'invalid session'};
        }
        if(res.status===200 && res.data !== "fail"){            
            return res.data;
        }
        console.error(res.data)
        return {error:'No User Details Found ,Please Login Again'}
    }catch(err){
        console.error(err)
        return {error:'No User Details Found ,Please Login Again'}
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
            return {error:'invalid session'};
        }
        if(res.status===200 && res.data !== "fail"){            
            return res.data;
        }
        console.error(res.data)
        return {error:'No Projects Found ,Please add Projects'}
    }catch(err){
        console.error(err)
        return {error:'No Projects Found ,Please add Projects'}
    }
}

export const qcFolderDetails_ICE = async(domain ,foldername ,project,qcaction,testset) => {
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
            project : project,
            qcaction : qcaction,
            testset : testset
        }
        });
        if(res.status === 401 || res.data === "Invalid Session"){
            RedirectPage(history)
            return {error:'invalid session'};
        }
        if(res.status===200 && res.data !== "fail"){            
            return res.data;
        }
        console.error(res.data)
        return {error:'No Projects Found ,Please add Projects'}
    }catch(err){
        console.error(err)
        return {error:'No Projects Found ,Please add Projects'}
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
            return {error:'invalid session'};
        }
        if(res.status===200 && res.data !== "fail"){            
            return res.data;
        }
        console.error(res.data)
        return {error:'Map Testcases Before Save'}
    }catch(err){
        console.error(err)
        return {error:'Failed to Save Mapped Testcases'}
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
            return {error:'invalid session'};
        }
        if(res.status===200 && res.data !== "fail"){            
            return res.data;
        }
        console.error(res.data)
        return {error:'No Mapped Data Found'}
    }catch(err){
        console.error(err)
        return {error:'No Mapped Data Found'}
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
				zephyraction: "project"
            }
        });
        if(res.status === 401 || res.data === "Invalid Session"){
            RedirectPage(history)
            return {error:'invalid session'};
        }
        if(res.status===200 && res.data !== "fail"){            
            return res.data;
        }
        console.error(res.data)
        return {error:'Failed to get list.'}
    }catch(err){
        console.error(err)
        return {error:'Failed to get list.'}
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
            return {error:'invalid session'};
        }
        if(res.status===200){            
            return res.data;
        }
        console.error(res.data)
        return {error:'No Projects Found, Please add Projects'}
    }catch(err){
        console.error(err)
        return {error:'No Projects Found, Please add Projects'}
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
            return {error:'invalid session'};
        }
        if(res.status===200 && res.data !== "fail"){
            return res.data;
        }
        console.error(res.data)
        return {error:'Failed to get list.'}
    } catch(err){
        console.error(err)
        return {error:'Failed to get list.'}
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
            return {error:'invalid session'};
        }
        if(res.status===200 && res.data !== "fail"){            
            return res.data;
        }
        console.error(res.data)
        return {error:'No Mapped Data Found'}
    }catch(err){
        console.error(err)
        return {error:'No Mapped Data Found'}
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
            return {error:'invalid session'};
        }
        if(res.status===200 && res.data !== "fail"){            
            return res.data;
        }
        console.error(res.data)
        return {error:'Map Testcases Before Save'}
    }catch(err){
        console.error(err)
        return {error:'Failed to Save Mapped Testcases'}
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
            return {error:'invalid session'};
        }
        if(res.status===200 && res.data !== "fail"){            
            return res.data;
        }
        console.error(res.data)
        return {error:'Failed to fetch testcases'}
    }catch(err){
        console.error(err)
        return {error:'Failed to fetch testcases'}
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
            return {error:'invalid session'};
        }
        if(res.status===200 && res.data !== "fail"){            
            return res.data;
        }
        console.error(res.data)
        return {error:'Failed to Unsync Mapped Files.'}
    }catch(err){
        console.error(err)
        return {error:'Failed to Unsync Mapped Files.'}
    }
}