import axios from 'axios';
import {url} from '../../App';
import {history} from './index'
import { RedirectPage, Messages as MSG } from '../global'

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

export const getDetails_ICE = async(idtype, requestedids) => { 
    try{
        const res = await axios(url+'/getDetails_ICE', {
            method: 'POST',
            headers: {
            'Content-type': 'application/json',
            },
            data: {idtype: idtype,requestedids: requestedids},
            credentials: 'include'
        });
        if(res.status === 401 || res.data === "Invalid Session" ){
            RedirectPage(history)
            return {error:MSG.GENERIC.INVALID_SESSION};
        }else if(res.status===200 && res.data !== "fail"){            
            return res.data;
        }
        console.error(res.data)
        return {error:MSG.ADMIN.ERR_FETCH_DOMAIN_DETAILS}
    }catch(err){
        console.error(err)
        return {error:MSG.ADMIN.ERR_FETCH_DOMAIN_DETAILS}
    }
}

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
            RedirectPage(history)
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

export const getAvailablePlugins = async() => { 
    try{
        const res = await axios(url+'/getAvailablePlugins', {
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
        return {error:MSG.ADMIN.ERR_FETCH_PLUGINS}
    }catch(err){
        console.error(err)
        return {error:MSG.ADMIN.ERR_FETCH_PLUGINS}
    }
}

export const getDomains_ICE = async() => { 
    try{
        const res = await axios(url+'/getDomains_ICE', {
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
        return {error:MSG.ADMIN.ERR_FETCH_DOMAIN}
    }catch(err){
        console.error(err)
        return {error:MSG.ADMIN.ERR_FETCH_DOMAIN}
    }
}

/*Component TaskSection
  api returns {"appType":"","projectId":"","screenId":"","screenName":"","testCaseId":"","versionnumber":int,"testCaseName":"","scenarioId":"","scenarioName":"","assignedTestScenarioIds":[],"taskDetails":[{"taskName":"","taskDescription":"","taskType":"","subTaskType":"","subTaskId":"","assignedTo":"","reviewer":"","startDate":"","expectedEndDate":"","batchTaskIDs":[""],"status":"","reuse":"","releaseid":"","cycleid":""}],"testSuiteDetails":[{"assignedTime":"","releaseid":"","cycleid":"","testsuiteid":"","testsuitename":"","projectidts":"","assignedTestScenarioIds":"","subTaskId":""}],"scenarioFlag":"","releaseid":"","cycleid":""}
*/
export const getTaskJson_mindmaps = obj => {
    return new Promise((resolve, reject) => {
        axios(url+"/getTaskJson_mindmaps", {
            method: 'POST',
            headers : {
                'Content-type' : 'application/json'
            },
            data : {'action': 'getTaskJson_mindmaps', 'obj': obj},
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
    });
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


export const getMappedDiscoverUser = async(data) => {
    try{
        const res = await axios(url+'/getMappedDiscoverUser', {
            method: 'GET',
            credentials: 'include'
        });

        if(res.status===200 && res.data !== "fail"){            
            return res.data;
        }else if(res.status===200 && res.data === "fail"){            
            return {error : MSG.PLUGIN.ERR_UNMAPPED_DISCOVER_USER};
        }
        else if(res.status === 401 || res.data === "Invalid Session"){
            return {error:MSG.GENERIC.INVALID_SESSION};
        }
        return {error:MSG.PLUGIN.ERR_FETCHING_DISCOVER_USER}
    }catch(err){
        return {error:MSG.PLUGIN.ERR_FETCHING_DISCOVER_USER}
    }
}

export const getGeniusData = async(data, snr_data) => {
  try{
      const res = await axios(url+'/getGeniusData', {
          method: 'POST',
          credentials: 'include',
          data:{data, snr_data}
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