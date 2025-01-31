
import axios from 'axios';
import {url} from '../../App';

/*Component RedirectPage
*/
export const logoutUser = () => {
    return new Promise((resolve, reject) => {
        axios(url+"/logoutUser", {
            method : 'POST',
            headers : {
                'Content-type' : "application/json"
            },
            data: {'param': 'logoutUser'},
            credentials : 'include'
        })
        .then(res => {
            if (res.status === 200) {
                resolve(res.data);
            }
            else{
                reject(res.status);
            }
        })
        .catch(err => {
            reject(err)
        })
    });
}

/*Component ChangePassword 
 ------------------Reset Current password--------------------------
  api returns "Invalid Session"/"success"/"same"/"incorrect"/"fail"
*/
export const resetPassword = (newpassword, currpassword=null, userData=null) => {
    return new Promise((resolve, reject) => {
        axios(url+"/resetPassword", {
            method: "POST",
            headers: {
                "Content-type": "application/json"
            },
            data: {'newpassword': newpassword, userData,currpassword},
            credentials : 'include'
        })
        .then(res => {
            if (res.status === 200){
                resolve(res.data);
            }
            else{
                reject(res.status);
            }
        })
        .catch(err => {
            reject(err);
        })
    })
}
export const keepSessionAlive = () => {
    return new Promise((resolve, reject)=>{
        axios(url+"/keepSessionAlive", {
            method : 'POST',
            credentials : 'include'
        })
        .then(res=>{
            if (res.status === 200) {
                resolve(res.data);
            }
            else{
                reject(res.status);
            }
        })
        .catch(err => {
            reject(err)
        })
    });
}

/*Component ChangeDefaultIce
  api returns ice_list: [""] or string mssg ex. "fail"
*/
export const getUserICE = async() => {
    return new Promise((resolve, reject)=>{
        axios(url+"/getUserICE", {
            method: "POST",
            headers: {
                "Content-type": "application/json"
            },
            credentials : 'include'
        })
        .then(res => {
            if (res.status === 200){
                resolve(res.data);
            }
            else{
                reject(res.status);
            }
        })
        .catch(err => {
            reject(err);
        })
    })
}


/*Component ChangeDefaultIce
  api returns string mssg ex. "success"
*/
export const setDefaultUserICE = async(defaultICE) => {
    return new Promise((resolve, reject)=>{
        axios(url+"/setDefaultUserICE", {
            method: "POST",
            headers: {
                "Content-type": "application/json"
            },
            data: { defaultICE : defaultICE},
            credentials : 'include'
        })
        .then(res => {
            if (res.status === 200){
                resolve(res.data);
            }
            else{
                reject(res.status);
            }
        })
        .catch(err => {
            reject(err);
        })
    })
}
/*Component DesignContent
  api returns fail/inprogress
*/ 
export const reviewTask = (projectId, taskid, taskstatus, version, batchTaskIDs, nodeid, taskname, groupids, additionalrecepients) => {
    return new Promise((resolve, reject)=>{
        axios(url+"/reviewTask", {
            method : 'POST',
            headers : {
                'Content-type' : "application/json"
            },
            data: { action: 'reviewTask', 
                    prjId: projectId,
                    taskId: taskid,
                    status: taskstatus,
                    versionnumber: version,
                    batchIds: batchTaskIDs,
                    nodeid: nodeid,
                    taskname, taskname,
                    extragroups:groupids,
                    extrausers:additionalrecepients
                },
            credentials : 'include'
        })
        .then(res => {
            if (res.status === 200){
                resolve(res.data);
            }
            else{
                reject(res.status);
            }
        })
        .catch(err => {
            reject(err);
        })
    })
}