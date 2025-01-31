import axios from 'axios';
import {Messages as MSG, RedirectPage} from '../global'
import {url} from '../../App';
import {navigate} from './containers/HomePage';

/* Component
  api returns [{name:"",_id:""},{name:"",_id:""},{name:"",_id:""},{name:"",_id:""},,,]
*/


/* Component
  api returns data in array - [{"username","id","id","userRole"},{"username","id","id","userRole"},,,]
*/

export const getUserDetails = async(action, args) => { 
    try{
        const res = await axios(url+'/getUserDetails', {
            method: 'POST',
            headers: {
            'Content-type': 'application/json',
            },
            data: {action: action,args: args},
            credentials: 'include'
        });
        if(res.status === 401 || res.data === "Invalid Session" ){
            RedirectPage(navigate)
            return {error:MSG.GENERIC.INVALID_SESSION};
        }
        else if(res.status === "fail" ){
            return {error:MSG.ADMIN.ERR_FETCH_USER}
        }
        else if(res.status === "empty" ){
            return {error:MSG.ADMIN.ERR_EMPTY_USER}
        }
        else if(res.status===200 && res.data !== "fail"){            
            return res.data;
        }
        console.error(res.data)
        return {error:MSG.ADMIN.ERR_FETCH_USER}
    }catch(err){
        console.error(err)
        return {error:MSG.ADMIN.ERR_FETCH_USER}
    }
}

export const userCreateProject_ICE = (details) => {
    return new Promise((resolve, reject)=> {
        axios(url+"/userCreateProject_ICE", {
            method: 'POST',
            headers : {
                'Content-type' : 'application/json'
            },
            data : {'action': 'createProject_ICE', 'allflag': true, ...details},
            credentials : 'include',
        })
        .then(res=>{
            if (res.status === 200){
                resolve(res.data);
            }
            else{
                reject(res.status)
            }
        })
        .catch(err => {
            reject(err);
        })
    })
}

export const validateProject = () => {
    return new Promise((resolve, reject)=> {
        axios(url+"/validateProject", {
            method: 'POST',
            headers : {
                'Content-type' : 'application/json'
            },
            data : {},
            credentials : 'include',
        })
        .then(res=>{
            if (res.status === 200){
                resolve(res.data);
            }
            else{
                reject(res.status)
            }
        })
        .catch(err => {
            reject(err);
        })
    })
}

/*Component TaskSection
  api returns {"appType":[""],"appTypeName":[""],"cycles":{"":[""]},"domains":[],"projectId":[],"projectName":[],"projecttypes":{},"releases":[[{"cycles":[{"_id":"","name":""}],"name":""}]]}
*/
export const getProjectIDs = () => {
    return new Promise((resolve, reject)=> {
        axios(url+"/getProjectIDs", {
            method: 'POST',
            headers : {
                'Content-type' : 'application/json'
            },
            data : {'action': 'getProjectIDs', 'allflag': true},
            credentials : 'include',
        })
        .then(res=>{
            if (res.status === 200){
                resolve(res.data);
            }
            else{
                reject(res.status)
            }
        })
        .catch(err => {
            reject(err);
        })
    })
}

/* Component
  api returns string "sucess" , "fail"
*/

export const manageUserDetails = async(action, userObj) => { 
    try{
        const res = await axios(url+'/manageUserDetails', {
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
        return {error:"Failed to "+action+" user."}
    }catch(err){
        console.error(err)
        return {error:"Failed to "+action+" user."}
    }
}


export const fetchProjects = async(data) => {
    try{
        const res = await axios(url+'/fetchProjects', {
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
        return {error:MSG.MINDMAP.ERR_FETCH_PROJECT}
    }catch(err){
        console.error(err)
        return {error:MSG.MINDMAP.ERR_FETCH_PROJECT}
    }
}

export const getProjectsMMTS = async(data) => {
    try{
        const res = await axios(url+'/getProjectsMMTS', {
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
        return {error:MSG.MINDMAP.ERR_FETCH_PROJECT}
    }catch(err){
        console.error(err)
        return {error:MSG.MINDMAP.ERR_FETCH_PROJECT}
    }
}

export const getAgent = async () => {
    try {
        // const res = await fetch("/downloadAgent");
        // const {status} = await res.json();
        // if (status === "available") window.location.href = "https://localhost:8443/downloadAgent"+queryICE+"&file=getICE"
        // if (status === "available"){
        const link = document.createElement('a');
        link.href = "/downloadURL?link="+window.location.origin.split("//")[1];
        link.setAttribute('download', "avoURL.txt");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.location.href = window.location.origin+"/downloadAgent";
        // }
        // else setMsg(MSG.GLOBAL.ERR_PACKAGE);
    } catch (ex) {
        console.error("Error while downloading Agent. Error:", ex);
    }
}


export const getUsers_ICE = (project_id) => {
    return new Promise((resolve, reject)=> {
        axios(url+"/getUsers_ICE", {
            method: 'POST',
            headers : {
                'Content-type' : 'application/json'
            },
            data : {'action': 'getUsers_ICE', 'allflag': true,project_id},
            credentials : 'include',
        })
        .then(res=>{
            if (res.status === 200){
                resolve(res.data);
            }
            else{
                reject(res.status)
            }
        })
        .catch(err => {
            reject(err);
        })
    })
}


export const userUpdateProject_ICE = (data) => {
    return new Promise((resolve, reject)=> {
        axios(url+"/userUpdateProject_ICE", {
            method: 'POST',
            headers : {
                'Content-type' : 'application/json'
            },
            data : {'action': 'userUpdateProject_ICE', 'allflag': true, ...data},
            credentials : 'include',
        })
        .then(res=>{
            if (res.status === 200){
                resolve(res.data);
            }
            else{
                reject(res.status)
            }
        })
        .catch(err => {
            reject(err);
        })
    })
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

export const getGeniusData = async(data, snr_data,isAlreadySaved,completeScenraioDetials,scrnreused,migrationData) => {
    try{
        const res = await axios(url+'/getGeniusData', {
            method: 'POST',
            credentials: 'include',
            data:{data, snr_data,isAlreadySaved,completeScenraioDetials,scrnreused,migrationData}
        });
        if(res.status===200 && res.data !== "fail"){            
            return res.data;
        }else if(res.status===200 && res.data === "fail"){            
            return {error : MSG.PLUGIN.ERR_SAVING_GENIUS_DATA};
        }
        else if(res.status === 401 || res.data === "Invalid Session"){
            return {error:MSG.GENERIC.INVALID_SESSION};
        }
        return {error:MSG.PLUGIN.ERR_SAVING_GENIUS_DATA}
    }catch(err){
        return {error:MSG.PLUGIN.ERR_SAVING_GENIUS_DATA}
    }
  }

  export const profileLevel_ExecutionStatus = (data) => {
    return new Promise((resolve, reject)=> {
        axios(url+"/profileLevel_ExecutionStatus", {
            method: 'POST',
            headers : {
                'Content-type' : 'application/json'
            },
            data : {'action': 'profileLevel_ExecutionStatus', 'allflag': true, ...data},
            credentials : 'include',
        })
        .then(res=>{
            if (res.status === 200){
                resolve({data: res.data});
            }
            else{
                reject(res.status)
            }
        })
        .catch(err => {
            reject(err);
        })
    })
}

export const moduleLevel_ExecutionStatus = (data) => {
    return new Promise((resolve, reject)=> {
        axios(url+"/moduleLevel_ExecutionStatus", {
            method: 'POST',
            headers : {
                'Content-type' : 'application/json'
            },
            data : {'action': 'moduleLevel_ExecutionStatus', 'allflag': true, ...data},
            credentials : 'include',
        })
        .then(res=>{
            if (res.status === 200){
                resolve({data:res.data});
            }
            else{
                reject(res.status)
            }
        })
        .catch(err => {
            reject(err);
        })
    })
}

export const rasa_prompt_model = (data) => {
    return new Promise((resolve, reject)=> {
        axios(url+"/rasa_prompt_model", {
            method: 'POST',
            headers : {
                'Content-type' : 'application/json'
            },
            data : {'action': 'rasa_prompt_model', ...data},
            credentials : 'include',
        })
        .then(res=>{
            if (res.status === 200){
                resolve({data:res.data});
            }
            else{
                reject(res.status)
            }
        })
        .catch(err => {
            reject(err);
        })
    })
}
export const defect_analysis = (data) => {
    return new Promise((resolve, reject)=> {
        axios(url+"/defect_analysis", {
            method: 'POST',
            headers : {
                'Content-type' : 'application/json'
            },
            data : {'action': 'defect_analysis', 'allflag': true, ...data},
            credentials : 'include',
        })
        .then(res=>{
            if (res.status === 200){
                resolve(res.data);
            }
            else{
                reject(res.status)
            }
        })
        .catch(err => {
            reject(err);
        })
    })
}
export const teststepLevel_ExecutionStatus = (data) => {
    return new Promise((resolve, reject)=> {
        axios(url+"/teststepLevel_ExecutionStatus", {
            method: 'POST',
            headers : {
                'Content-type' : 'application/json'
            },
            data : {'action': 'teststepLevel_ExecutionStatus', 'allflag': true, ...data},
            credentials : 'include',
        })
        .then(res=>{
            if (res.status === 200){
                resolve(res.data);
            }
            else{
                reject(res.status)
            }
        })
        .catch(err => {
            reject(err);
        })
    })
}
  export const getScreens = async(params) => {
    try{
        const res = await axios(url+'/getScreens', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            data: {projectId:params.projectId,
                param:params.param},
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
        return {error:MSG.MINDMAP.ERR_FETCH_SCREEN}
    }catch(err){
        console.error(err)
        return {error:MSG.MINDMAP.ERR_FETCH_SCREEN}
    }
}

export const getGeniusDataSAP = async(data, snr_data,isAlreadySaved,completeScenraioDetials,scrnreused) => {
    try{
        const res = await axios(url+'/getGeniusDataSAP', {
            method: 'POST',
            credentials: 'include',
            data:{data, snr_data,isAlreadySaved,completeScenraioDetials,scrnreused}
        });
        if(res.status===200 && res.data !== "fail"){            
            return res.data;
        }else if(res.status===200 && res.data === "fail"){            
            return {error : MSG.PLUGIN.ERR_SAVING_GENIUS_DATA};
        }
        else if(res.status === 401 || res.data === "Invalid Session"){
            return {error:MSG.GENERIC.INVALID_SESSION};
        }
        return {error:MSG.PLUGIN.ERR_SAVING_GENIUS_DATA}
    }catch(err){
        return {error:MSG.PLUGIN.ERR_SAVING_GENIUS_DATA}
    }
}



