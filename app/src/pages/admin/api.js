import axios from 'axios';
import {RedirectPage} from '../global'
import {history} from './index'
const url = "https://"+window.location.hostname+":8443";

/* Component
  api returns [["Admin": ""],["Test Lead": ""],["": ""],["": ""]...]
*/

export const getUserRoles = async() => { 
    try{
        const res = await axios(url+'/getUserRoles', {
            method: 'POST',
            headers: {
            'Content-type': 'application/json',
            },
            credentials: 'include'
        });
        if(res.status === 401 || res.status === "Invalid Session"){
            RedirectPage(history)
            return {error:'invalid session'};
        }
        if(res.status===200 && res.data !== "fail"){            
            return res.data;
        }
        console.error(res.data)
        return {error:'Failed to fetch user roles'}
    }catch(err){
        console.error(err)
        return {error:'Failed to fetch user roles'}
    }
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
        if(res.status === 401 || res.status === "Invalid Session"){
            RedirectPage(history)
            return {error:'invalid session'};
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

/* Component
  api returns [{name:"",_id:""},{name:"",_id:""},{name:"",_id:""},{name:"",_id:""},,,]
*/

export const getLDAPConfig = async(action, args, opts) => { 
    try{
        const res = await axios(url+'/getLDAPConfig', {
            method: 'POST',
            headers: {
            'Content-type': 'application/json',
            },
            data: {action: action,args: args,opts: opts},
            credentials: 'include'
        });
        if(res.status === 401 || res.status === "Invalid Session"){
            RedirectPage(history)
            return {error:'invalid session'};
        }
        else if(res.status === "fail" ){
            return {error:"Failed to fetch LDAP server configurations."}
        }
        else if(res.status === "insufficient_access" ){
            return {error:"Either Credentials provided in LDAP server configuration does not have required privileges for fetching users or there is no such user"}
        }
        if(res.status===200 && res.data !== "fail"){            
            return res.data;
        }
        console.error(res.data)
        return {error:"Failed to fetch LDAP server configurations"}
    }catch(err){
        console.error(err)
        return {error:"Failed to fetch LDAP server configurations"}
    }
}

/* Component
  api returns [{name:"",_id:""},{name:"",_id:""},{name:"",_id:""},{name:"",_id:""},,,]
*/

export const getSAMLConfig = async(name) => { 
    try{
        const res = await axios(url+'/getSAMLConfig', {
            method: 'POST',
            headers: {
            'Content-type': 'application/json',
            },
            data: {name: name},
            credentials: 'include'
        });
        if(res.status === 401 || res.status === "Invalid Session"){
            RedirectPage(history)
            return {error:'invalid session'};
        }
        else if(res.status === "fail" ){
            return {error:"Failed to fetch SAML server configurations."}
        }
        if(res.status===200 && res.data !== "fail"){            
            return res.data;
        }
        console.error(res.data)
        return {error:"Failed to fetch SAML server configurations"}
    }catch(err){
        console.error(err)
        return {error:"Failed to fetch SAML server configurations"}
    }
}

/* Component
  api returns string ex. "success" 
*/

export const manageSAMLConfig = async(action, confObj) => { 
    try{
        const res = await axios(url+'/manageSAMLConfig', {
            method: 'POST',
            headers: {
            'Content-type': 'application/json',
            },
            data: {action: action,conf: confObj},
            credentials: 'include'
        });
        if(res.status === 401 || res.status === "Invalid Session"){
            RedirectPage(history)
            return {error:'invalid session'};
        }
        if(res.status===200 && res.data !== "fail"){            
            return res.data;
        }
        console.error(res.data)
        return {error:"Failed to manage SAML server configurations"}
    }catch(err){
        console.error(err)
        return {error:"Failed to manage SAML server configurations"}
    }
}

/* Component
  api returns [{name:"",_id:""},{name:"",_id:""},{name:"",_id:""},{name:"",_id:""},,,]
*/

export const getOIDCConfig = async(name) => { 
    try{
        const res = await axios(url+'/getOIDCConfig', {
            method: 'POST',
            headers: {
            'Content-type': 'application/json',
            },
            data: {name: name},
            credentials: 'include'
        });
        if(res.status === 401 || res.status === "Invalid Session"){
            RedirectPage(history)
            return {error:'invalid session'};
        }
        else if(res.status === "fail" ){
            return {error:"Failed to fetch OpenID server configurations."}
        }
        if(res.status===200 && res.data !== "fail"){            
            return res.data;
        }
        console.error(res.data)
        return {error:"Failed to fetch OpenID server configurations"}
    }catch(err){
        console.error(err)
        return {error:"Failed to fetch OpenID server configurations"}
    }
}

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
        if(res.status === 401 || res.status === "Invalid Session" ){
            RedirectPage(history)
            return {error:'invalid session'};
        }
        else if(res.status === "fail" ){
            return {error:"Failed to fetch users."}
        }
        else if(res.status === "empty" ){
            return {error:"There are no users created yet."}
        }
        else if(res.status===200 && res.data !== "fail"){            
            return res.data;
        }
        console.error(res.data)
        return {error:"Failed to fetch users."}
    }catch(err){
        console.error(err)
        return {error:"Failed to fetch users."}
    }
}

export const restartService = async(i) => {
    try{
        const res = await axios(url+"/restartService", {
            method : 'POST',
            headers : {
                'Content-type' : "application/json"
            },
            data: {id: i},
            credentials : 'include'
        });
        if (res.status === 200) {
            return res.data;
        }
        else{
            console.log(res.status);
        }
    }
    catch(err){
        console.log(err)
    }
} 

/* Component
  api returns array of available plugins - ["","","",..]
*/

export const getAvailablePlugins = async() => { 
    try{
        const res = await axios(url+'/getAvailablePlugins', {
            method: 'POST',
            headers: {
            'Content-type': 'application/json',
            },
            credentials: 'include'
        });
        if(res.status === 401 || res.status === "Invalid Session" ){
            RedirectPage(history)
            return {error:'invalid session'};
        }else if(res.status===200 && res.data !== "fail"){            
            return res.data;
        }
        console.error(res.data)
        return {error:"Failed to fetch available plugins."}
    }catch(err){
        console.error(err)
        return {error:"Failed to fetch available plugins."}
    }
}

/* Component
  api returns [{name: "rolename", plugins: {…}},{},{},]
*/

export const getPreferences = async() => { 
    try{
        const res = await axios(url+'/getPreferences', {
            method: 'POST',
            headers: {
            'Content-type': 'application/json',
            },
            credentials: 'include'
        });
        if(res.status === 401 || res.status === "Invalid Session"){
            RedirectPage(history)
            return {error:'invalid session'};
        }
        if(res.status===200 && res.data !== "fail"){            
            return res.data;
        }
        console.error(res.data)
        return {error:"Failed to fetch Preferences."}
    }catch(err){
        console.error(err)
        return {error:"Failed to fetch Preferences."}
    }
}

/* Component
  api returns array containing domain names
*/

export const getDomains_ICE = async() => { 
    try{
        const res = await axios(url+'/getDomains_ICE', {
            method: 'POST',
            headers: {
            'Content-type': 'application/json',
            },
            credentials: 'include'
        });
        if(res.status === 401 || res.status === "Invalid Session" ){
            RedirectPage(history)
            return {error:'invalid session'};
        }else if(res.status===200 && res.data !== "fail"){            
            return res.data;
        }
        console.error(res.data)
        return {error:"Failed to fetch domains."}
    }catch(err){
        console.error(err)
        return {error:"Failed to fetch domains."}
    }
}

/* Component
  api returns string ex. "success" or {projectIds:[],projectNames:[]}
*/

export const getNames_ICE = async(requestedids, idtype) => { 
    try{
        const res = await axios(url+'/getNames_ICE', {
            method: 'POST',
            headers: {
            'Content-type': 'application/json',
            },
            data: {requestedids: requestedids,idtype: idtype},
            credentials: 'include'
        });
        if(res.status === 401 || res.status === "Invalid Session" ){
            RedirectPage(history)
            return {error:'invalid session'};
        }else if(res.status===200 && res.data !== "fail"){            
            return res.data;
        }
        console.error(res.data)
        return {error:"Failed to get names."}
    }catch(err){
        console.error(err)
        return {error:"Failed to get names."}
    }
}

/* Component
  api returns string ex. "success"
*/

export const createProject_ICE = async(createprojectObj) => { 
    try{
        const res = await axios(url+'/createProject_ICE', {
            method: 'POST',
            headers: {
            'Content-type': 'application/json',
            },
            data: {createProjectObj: createprojectObj},
            credentials: 'include'
        });
        if(res.status === 401 || res.status === "Invalid Session" ){
            RedirectPage(history)
            return {error:'invalid session'};
        }else if(res.status===200 && res.data !== "fail"){            
            if(res.data === 'invalid_name_spl') return {error:"Failed to create project. Special characters found in project/release/cycle name"};
            return res.data;
        }
        console.error(res.data)
        return {error:"Failed to create project."}
    }catch(err){
        console.error(err)
        return {error:"Failed to create project."}
    }
}

/* Component
  api returns {projectIds: [],projectNames:[]}
*/

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
        if(res.status === 401 || res.status === "Invalid Session" ){
            RedirectPage(history)
            return {error:'invalid session'};
        }else if(res.status===200 && res.data !== "fail"){            
            return res.data;
        }
        console.error(res.data)
        return {error:"Failed to fetch domains details."}
    }catch(err){
        console.error(err)
        return {error:"Failed to fetch domains details."}
    }
}

/* Component
  api returns string ex. "success"
*/

export const updateProject_ICE = async(updateProjectObj, userDetails) => { 
    try{
        const res = await axios(url+'/updateProject_ICE', {
            method: 'POST',
            headers: {
            'Content-type': 'application/json',
            },
            data: {updateProjectObj: updateProjectObj,
                userDetails: userDetails},
            credentials: 'include'
        });
        if(res.status === 401 || res.status === "Invalid Session" ){
            RedirectPage(history)
            return {error:'invalid session'};
        }else if(res.status===200 && res.data !== "fail"){            
            return res.data;
        }
        console.error(res.data)
        return {error:"Failed to update project."}
    }catch(err){
        console.error(err)
        return {error:"Failed to update project."}
    }
}

/* Component
  api returns [{name:"",_id:""},{name:"",_id:""},{name:"",_id:""},{name:"",_id:""},,,]
*/

export const getAssignedProjects_ICE = async(getAssignProj) => { 
    try{
        const res = await axios(url+'/getAssignedProjects_ICE', {
            method: 'POST',
            headers: {
            'Content-type': 'application/json',
            },
            data: {getAssignProj: getAssignProj},
            credentials: 'include'
        });
        if(res.status === 401 || res.status === "Invalid Session" ){
            RedirectPage(history)
            return {error:'invalid session'};
        }else if(res.status===200 && res.data !== "fail"){            
            return res.data;
        }
        console.error(res.data)
        return {error:"Failed to fetch assigned projects."}
    }catch(err){
        console.error(err)
        return {error:"Failed to fetch assigned projects."}
    }
}

/* Component
  api returns string ex. "success"
*/

export const assignProjects_ICE = async(assignProjectsObj) => { 
    try{
        const res = await axios(url+'/assignProjects_ICE', {
            method: 'POST',
            headers: {
            'Content-type': 'application/json',
            },
            data: {assignProjectsObj: assignProjectsObj},
            credentials: 'include'
        });
        if(res.status === 401 || res.status === "Invalid Session" ){
            RedirectPage(history)
            return {error:'invalid session'};
        }else if(res.status===200 && res.data !== "fail"){            
            return res.data;
        }
        console.error(res.data)
        return {error:"Failed to assign projects."}
    }catch(err){
        console.error(err)
        return {error:"Failed to assign projects."}
    }
}

/* Component
  api returns an object containing clientData: [] sessionData: []
*/

export const manageSessionData = async(action, user, key, reason) => { 
    try{
        const res = await axios(url+'/manageSessionData', {
            method: 'POST',
            headers: {
            'Content-type': 'application/json',
            },
            data: {action: action,
                    user: user,
                    key: key,
                    reason: reason},
            credentials: 'include'
        });
        if(res.status === 401 || res.status === "Invalid Session"){
            RedirectPage(history)
            return {error:'invalid session'};
        }
        if(res.status===200 && res.data !== "fail"){            
            return res.data;
        }
        console.error(res.data)
        return {error:"Failed to manage session Data."}
    }catch(err){
        console.error(err)
        return {error:"Failed to manage session Data."}
    }
}

/* Component
  api returns [{icename: "",icetype: "",provisionedon: "",provisionedto: "",status: "",token: "",username: "",_id: ""},{...},]
*/

export const fetchICE = async(args) => { 
    try{
        const res = await axios(url+'/fetchICE', {
            method: 'POST',
            headers: {
            'Content-type': 'application/json',
            },
            data: {user: args},
            credentials: 'include'
        });
        if(res.status === 401 || res.status === "Invalid Session"){
            RedirectPage(history)
            return {error:'invalid session'};
        }
        if( res.status === "empty"){
            return {error:"There are no ICE provisioned"};
        }
        if(res.status===200 && res.data !== "fail"){            
            return res.data;
        }
        console.error(res.data)
        return {error:"Failed to fetch ICE Details"}
    }catch(err){
        console.error(err)
        return {error:"Failed to fetch ICE Details"}
    }
}

/* Component
  api returns token or message(string)
*/

export const provisions = async(tokeninfo) => { 
    try{
        const res = await axios(url+'/provisionIce', {
            method: 'POST',
            headers: {
            'Content-type': 'application/json',
            },
            data: {tokeninfo:tokeninfo},
            credentials: 'include'
        });
        if(res.status === 401){
            RedirectPage(history)
            return {error:'invalid session'};
        }
        if(res.status===200 ){    
            if(res.data === 'DuplicateIceName') return {error:"ICE Provisioned Failed!<br/>ICE name or User already exists"};
            if(res.data === 'invalid_splname') return {error:"ICE Provisioned Failed!<br/>Special characters found in icename"};
            return res.data;
        }
        console.error(res.data)
    }catch(err){
        console.error(err)
        return {error:"ICE Provisioning Failed"}
    }
}

/* Component
  api returns string ex. "success" 
*/

export const manageOIDCConfig = async(action, confObj) => { 
    try{
        const res = await axios(url+'/manageOIDCConfig', {
            method: 'POST',
            headers: {
            'Content-type': 'application/json',
            },
            data: {action: action, conf: confObj},
            credentials: 'include'
        });
        if(res.status === 401 || res.status === "Invalid Session"){
            RedirectPage(history)
            return {error:'invalid session'};
        }
        if(res.status===200 && res.data !== "fail"){            
            return res.data;
        }
        console.error(res.data)
        return {error:"Failed to manage OIDC configuration."}
    }catch(err){
        console.error(err)
        return {error:"Failed to manage OIDC configuration."}
    }
} 

/* Component
  api returns [{deactivated: "",expireson: "",generatedon: "",icetype: "",name: "",projects: [],type: "",userid: "",_id: ""},{...},]
*/


export const getCIUsersDetails = async(CIUser) => { 
    try{
        const res = await axios(url+'/getCIUsersDetails', {
            method: 'POST',
            headers: {
            'Content-type': 'application/json',
            },
            data: {CIUser: CIUser},
            credentials: 'include'
        });
        if(res.status === 401 || res.status === "Invalid Session" ){
            RedirectPage(history)
            return {error:'invalid session'};
        }
        else if(res.status === "fail" ){
            return {error:"Failed to fetch user details."}
        }
        else if(res.status===200 && res.data !== "fail"){            
            return res.data;
        }
        console.error(res.data)
        return {error:"Failed to fetch user details."}
    }catch(err){
        console.error(err)
        return {error:"Failed to fetch user details."}
    }
} 

/* Component
  api returns token
*/

export const manageCIUsers = async(action,CIUser) => { 
    try{
        const res = await axios(url+'/manageCIUsers', {
            method: 'POST',
            headers: {
            'Content-type': 'application/json',
            },
            data: {action: action, CIUser: CIUser},
            credentials: 'include'
        });
        if(res.status === 401){
            RedirectPage(history)
            return {error:'invalid session'};
        }
        if(res.status===200 && res.data !== "fail"){            
            if(res.data === 'invalid_name_special') return {error:"Failed to generate token, Special characters found in token name"};
            if(res.data === 'invalid_past_time') return {error:"Expiry time should be 8 hours more than current time"};
            return res.data;
        }
        console.error(res.data)
        return {error:"Failed to manage user"}
    }catch(err){
        console.error(err)
        return {error:"Failed to manage user"}
    }
}

export const testLDAPConnection = async(auth, urlLDAP, baseDN, bindDN, bindCredentials, secure, cert) => { 
    try{
        const res = await axios(url+'/testLDAPConnection', {
            method: 'POST',
            headers: {
            'Content-type': 'application/json',
            },
            data: {ldapURL: urlLDAP,
                    baseDN: baseDN,
                    secure: secure,
                    tlsCert: cert,
                    authType: auth,
                    username: bindDN,
                    password: bindCredentials},
            credentials: 'include'
        });
        if(res.status === 401 || res.status === "Invalid Session"){
            RedirectPage(history)
            return {error:'invalid session'};
        }
        if(res.status===200 && res.data !== "fail"){            
            return res.data;
        }
        console.error(res.data)
        return {error:"Test Connection Failed!"}
    }catch(err){
        console.error(err)
        return {error:"Test Connection Failed!"}
    }
} 


export const manageLDAPConfig = async(action, confObj) => { 
    try{
        const res = await axios(url+'/manageLDAPConfig', {
            method: 'POST',
            headers: {
            'Content-type': 'application/json',
            },
            data: {action: action, conf: confObj},
            credentials: 'include'
        });
        if(res.status === 401 || res.status === "Invalid Session"){
            RedirectPage(history)
            return {error:'invalid session'};
        }
        if(res.status===200 && res.data !== "fail"){            
            return res.data;
        }
        console.error(res.data)
        return {error:"Failed to manage LDAP config!"}
    }catch(err){
        console.error(err)
        return {error:"Failed to manage LDAP config!"}
    }
}

export const updatePool = async(data) => { 
    try{
        const res = await axios(url+'/updatePool', {
            method: 'POST',
            headers: {
            'Content-type': 'application/json',
            },
            data: data,
            credentials: 'include'
        });
        if(res.status === 401 || res.status === "Invalid Session"){
            RedirectPage(history)
            return {error:'invalid session'};
        }
        if(res.status===200 && res.data !== "fail"){ 
            if(res.data === 'invalid_splname') return {error:"Failed to update ICE Pool. Special characters found in poolname."};
            if(res.data === 'success')return res.data;
        }
        console.error(res.data)
        return {error:"Failed to Update ICE pool!"}
    }catch(err){
        console.error(err)
        return {error:"Failed to Update ICE pool!"}
    }
} 

export const deleteICE_pools = async(data) => { 
    try{
        const res = await axios(url+'/deleteICE_pools', {
            method: 'POST',
            headers: {
            'Content-type': 'application/json',
            },
            data: data,
            credentials: 'include'
        });
        if(res.status === 401 || res.status === "Invalid Session"){
            RedirectPage(history)
            return {error:'invalid session'};
        }
        if(res.status===200 && res.data !== "fail"){ 
            if(res.data === 'success')return res.data;
        }
        console.error(res.data)
        return {error:"Failed to Delete ICE pool!"}
    }catch(err){
        console.error(err)
        return {error:"Failed to Delete ICE pool!"}
    }
}

export const createPool_ICE = async(data) => { 
    try{
        const res = await axios(url+'/createPool_ICE', {
            method: 'POST',
            headers: {
            'Content-type': 'application/json',
            },
            data: data,
            credentials: 'include'
        });
        if(res.status === 401 || res.status === "Invalid Session"){
            RedirectPage(history)
            return {error:'invalid session'};
        }
        if(res.status===200 && res.data !== "fail"){ 
            if(res.data === 'Pool exists') return {error:"Pool name already exist!"};
            if(res.data === 'invalid_splname') return {error:"Special characters found in poolname."};
            if(res.data === 'success')return res.data;
        }
        console.error(res.data)
        return {error:"Failed to create ICE pool!"}
    }catch(err){
        console.error(err)
        return {error:"Failed to create ICE pool!"}
    }
}


export const getICEinPools = async(data) => { 
    try{
        const res = await axios(url+'/getICEinPools', {
            method: 'POST',
            headers: {
            'Content-type': 'application/json',
            },
            data: data,
            credentials: 'include'
        });
        if(res.status === 401 || res.status === "Invalid Session"){
            RedirectPage(history)
            return {error:'invalid session'};
        }
        if(res.status===200 && res.data !== "fail"){ 
            if(res.data === "empty") return{error:"No ICE available!"}
            return res.data;
        }
        console.error(res.data)
        return {error:"Failed to fetch ICE!"}
    }catch(err){
        console.error(err)
        return {error:"Failed to fetch ICE!"}
    }
}

export const getAvailable_ICE = async(data) => { 
    try{
        const res = await axios(url+'/getAvailable_ICE', {
            method: 'POST',
            headers: {
            'Content-type': 'application/json',
            },
            data: data,
            credentials: 'include'
        });
        if(res.status === 401 || res.status === "Invalid Session"){
            RedirectPage(history)
            return {error:'invalid session'};
        }
        if(res.status===200 && res.data !== "fail"){ 
            if(res.data.length<1) return{error:"No active ICE available!"}
            return res.data;
        }
        console.error(res.data)
        return {error:"Failed to fetch available ICE!"}
    }catch(err){
        console.error(err)
        return {error:"Failed to fetch available ICE!"}
    }
}

export const clearQueue = async(data) => { 
    try{
        const res = await axios(url+'/clearQueue', {
            method: 'POST',
            headers: {
            'Content-type': 'application/json',
            },
            data: data,
            credentials: 'include'
        });
        if(res.status === 401 || res.status === "Invalid Session"){
            RedirectPage(history)
            return {error:'invalid session'};
        }
        if(res.status===200 && res.data !== "fail"){ 
            if(res.data === 'empty') return {error:"Queue is already empty."} 
            if(res.data === 'success') return res.data
        }
        console.error(res.data)
        return {error:"Failed Clear Queue!"}
    }catch(err){
        console.error(err)
        return {error:"Failed Clear Queue!"}
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
        if(res.status === 401 || res.status === "Invalid Session"){
            RedirectPage(history)
            return {error:'invalid session'};
        }
        if(res.status===200 && res.data !== "fail"){ 
            if(res.data === 'empty' || Object.keys(res.data).length<1) return {val:"empty",error:"There are no ICE pools created yet."}           
            return res.data;
        }
        console.error(res.data)
        return {error:"Failed to fetch pools!"}
    }catch(err){
        console.error(err)
        return {error:"Failed to fetch pools!"}
    }
} 

//{"action":"provider","channel":"email","args":"smtp"}
export const getNotificationChannels = async(data) => { 
    try{
        const res = await axios(url+'/getNotificationChannels', {
            method: 'POST',
            headers: {
            'Content-type': 'application/json',
            },
            data: data,
            credentials: 'include'
        });
        if(res.status === 401 || res.status === "Invalid Session"){
            RedirectPage(history)
            return {error:'invalid session'};
        }
        if(res.status===200 && res.data !== "fail"){  
            // if(res.data === 'empty')return {error : "Fail to fetch configured details for selected provider."}          
            // return {"_id":"5fab88ae911ebf83599cc1bc","active":true,"appurl":"https://srv01nineteen68","auth":false,"channel":"email","host":"10.41.31.131","name":"smtpconf","pool":{"enable":true,"maxconnections":10,"maxmessages":120},"port":587,"provider":"smtp","proxy":{"auth":false,"enable":false,"pass":"","url":"","user":""},"sender":{"email":"avoassure-alerts@avoautomation.com","name":"Avo Assure Alerts"},"timeouts":{"connection":240000,"greeting":60000,"socket":1200000},"tls":{"insecure":"true","security":"auto"}}
            return res.data;
        }
        console.error(res.data)
        return {error:"Fail to fetch configured details for selected provider."}
    }catch(err){
        console.error(err)
        return {error:"Fail to fetch configured details for selected provider."}
    }
}

export const manageNotificationChannels = async(data) => { 
    try{
        const res = await axios(url+'/manageNotificationChannels', {
            method: 'POST',
            headers: {
            'Content-type': 'application/json',
            },
            data: data,
            credentials: 'include'
        });
        if(res.status === 401 || res.status === "Invalid Session"){
            RedirectPage(history)
            return {error:'invalid session'};
        }
        if(res.status===200 && res.data !== "fail"){  
            if(res.data === 'empty')return {error : "Fail to update configuration for selected provider."}          
            return res.data;
        }
        console.error(res.data)
        return {error:"Fail to update configuration for selected provider."}
    }catch(err){
        console.error(err)
        return {error:"Fail to update configuration for selected provider."}
    }
}

export const testNotificationChannels = async(data) => { 
    try{
        const res = await axios(url+'/testNotificationChannels', {
            method: 'POST',
            headers: {
            'Content-type': 'application/json',
            },
            data: data,
            credentials: 'include'
        });
        if(res.status === 401 || res.status === "Invalid Session"){
            RedirectPage(history)
            return {error:'invalid session'};
        }
        if(res.status===200 && res.data !== "fail"){  
            if(res.data === 'empty') return "Fail to fetch configured details for selected provider.";
            else if (res.data === "invalidprovider")  return "Selected Provider is not supported yet!";
            else if (res.data === "invalidrecipient") return "Recipient address is invalid!";
            else if (res.data === "success") return "Test Email Sent!";
        }
        console.error(res.data)
        return {error:"Failed! Re-check the configuration."}
    }catch(err){
        console.error(err)
        return {error:"Failed! Re-check the configuration."}
    }
}


/* Component Session Management
  api returns
*/

export const fetchLockedUsers = async() => { 
    try{
        const res = await axios(url+'/fetchLockedUsers', {
            method: 'POST',
            headers: {
            'Content-type': 'application/json',
            },
            data: {},
            credentials: 'include'
        });
        if(res.status === 401 || res.status === "Invalid Session" ){
            RedirectPage(history)
            return {error:'invalid session'};
        }else if(res.status===200 && res.data !== "fail"){            
            return res.data;
        }
        console.error(res.data)
        return {error:"Failed to fetch locked users."}
    }catch(err){
        console.error(err)
        return {error:"Failed to fetch locked users"}
    }
}

/* Component Session Management
  api returns
*/

export const unlockUser = async(user) => { 
    try{
        const res = await axios(url+'/unlockUser', {
            method: 'POST',
            headers: {
            'Content-type': 'application/json',
            },
            data: {user: user},
            credentials: 'include'
        });
        if(res.status === 401 || res.status === "Invalid Session" ){
            RedirectPage(history)
            return {error:'invalid session'};
        }else if(res.status===200 && res.data !== "fail"){            
            return res.data;
        }
        console.error(res.data)
        return {error:"Failed to unlocked users."}
    }catch(err){
        console.error(err)
        return {error:"Failed to unlocked users"}
    }
}

/* Component 
  api returns
*/

export const gitSaveConfig = async(action, userId,projectId,gitAccToken,gitUrl) => { 
    try{
        const res = await axios(url+'/gitSaveConfig', {
            method: 'POST',
            headers: {
            'Content-type': 'application/json',
            },
            data: {action: action,
                    userId: userId,
                    projectId: projectId,
                    gitAccToken: gitAccToken,
                    gitUrl: gitUrl},
            credentials: 'include'
        });
        if(res.status === 401 || res.status === "Invalid Session" ){
            RedirectPage(history)
            return {error:'invalid session'};
        }else if(res.status===200 && res.data !== "fail"){            
            return res.data;
        }
        console.error(res.data)
        return {error:"Error while Git "+action+ " Configuration"}
    }catch(err){
        console.error(err)
        return {error:"Error while Git "+action+ " Configuration"}
    }
}


/* Component GitConfig
  api returns
*/

export const gitEditConfig = async(userId, projectId) => { 
    try{
        const res = await axios(url+'/gitEditConfig', {
            method: 'POST',
            headers: {
            'Content-type': 'application/json',
            },
            data: {userId: userId,
				projectId: projectId},
            credentials: 'include'
        });
        if(res.status === 401 || res.status === "Invalid Session" ){
            RedirectPage(history)
            return {error:'invalid session'};
        }else if(res.status===200 && res.data !== "fail"){            
            return res.data;
        }
        console.error(res.data)
        return {error:"Failed to fetch git configurations."}
    }catch(err){
        console.error(err)
        return {error:"Failed to fetch git configurations."}
    }
}