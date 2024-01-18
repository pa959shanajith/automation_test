import axios from 'axios';
import {RedirectPage, Messages as MSG} from '../global'
import {history} from './index'
import {url} from '../../App'
// import { GroupShowAll } from '@fluentui/react';
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
        if(res.status === 401 || res.data === "Invalid Session"){
            RedirectPage(history)
            return {error:MSG.GENERIC.INVALID_SESSION};
        }
        if(res.status===200 && res.data !== "fail"){            
            return res.data;
        }
        console.error(res.data)
        return {error:MSG.ADMIN.ERR_FETCH_USERROLES}
    }catch(err){
        console.error(err)
        return {error:MSG.ADMIN.ERR_FETCH_USERROLES}
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
        if(res.status === 401 || res.data === "Invalid Session"){
            RedirectPage(history)
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
        if(res.status === 401 || res.data === "Invalid Session"){
            RedirectPage(history)
            return {error:MSG.GENERIC.INVALID_SESSION};
        }
        else if(res.status === "fail" ){
            return {error:MSG.ADMIN.ERR_FETCH_LDAP}
        }
        else if(res.status === "insufficient_access" ){
            return {error:MSG.ADMIN.ERR_INSUFFICIENT_ACCESS}
        }
        if(res.status===200 && res.data !== "fail"){            
            return res.data;
        }
        console.error(res.data)
        return {error:MSG.ADMIN.ERR_FETCH_LDAP}
    }catch(err){
        console.error(err)
        return {error:MSG.ADMIN.ERR_FETCH_LDAP}
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
        if(res.status === 401 || res.data === "Invalid Session"){
            RedirectPage(history)
            return {error:MSG.GENERIC.INVALID_SESSION};
        }
        else if(res.status === "fail" ){
            return {error:MSG.ADMIN.ERR_FETCH_SAML}
        }
        if(res.status===200 && res.data !== "fail"){            
            return res.data;
        }
        console.error(res.data)
        return {error:MSG.ADMIN.ERR_FETCH_SAML}
    }catch(err){
        console.error(err)
        return {error:MSG.ADMIN.ERR_FETCH_SAML}
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
        if(res.status === 401 || res.data === "Invalid Session"){
            RedirectPage(history)
            return {error:MSG.GENERIC.INVALID_SESSION};
        }
        if(res.status===200 && res.data !== "fail"){            
            return res.data;
        }
        console.error(res.data)
        return {error:MSG.ADMIN.ERR_MANAGE_SAML}
    }catch(err){
        console.error(err)
        return {error:MSG.ADMIN.ERR_MANAGE_SAML}
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
        if(res.status === 401 || res.data === "Invalid Session"){
            RedirectPage(history)
            return {error:MSG.GENERIC.INVALID_SESSION};
        }
        else if(res.status === "fail" ){
            return {error:MSG.ADMIN.ERR_FETCH_OPENID}
        }
        if(res.status===200 && res.data !== "fail"){            
            return res.data;
        }
        console.error(res.data)
        return {error:MSG.ADMIN.ERR_FETCH_OPENID}
    }catch(err){
        console.error(err)
        return {error:MSG.ADMIN.ERR_FETCH_OPENID}
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
        if(res.status === 401 || res.data === "Invalid Session"){
            RedirectPage(history)
            return {error:MSG.GENERIC.INVALID_SESSION};
        }
        if(res.status===200 && res.data !== "fail"){            
            return res.data;
        }
        console.error(res.data)
        return {error:MSG.ADMIN.ERR_FETCH_PREFERENCES}
    }catch(err){
        console.error(err)
        return {error:MSG.ADMIN.ERR_FETCH_PREFERENCES}
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
        if(res.status === 401 || res.data === "Invalid Session" ){
            RedirectPage(history)
            return {error:MSG.GENERIC.INVALID_SESSION};
        }else if(res.status===200 && res.data !== "fail"){            
            return res.data;
        }
        console.error(res.data)
        return {error:MSG.ADMIN.ERR_FETCH_NAME}
    }catch(err){
        console.error(err)
        return {error:MSG.ADMIN.ERR_FETCH_NAME}
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
        if(res.status === 401 || res.data === "Invalid Session" ){
            RedirectPage(history)
            return {error:MSG.GENERIC.INVALID_SESSION};
        }else if(res.status===200 && res.data !== "fail"){            
            if(res.data === 'invalid_name_spl') return {error:MSG.ADMIN.ERR_CREATE_PROJECT_SP_CHAR};
            return res.data;
        }
        console.error(res.data)
        return {error:MSG.ADMIN.ERR_CREATE_PROJECT}
    }catch(err){
        console.error(err)
        return {error:MSG.ADMIN.ERR_CREATE_PROJECT}
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
        if(res.status === 401 || res.data === "Invalid Session" ){
            RedirectPage(history)
            return {error:MSG.GENERIC.INVALID_SESSION};
        }else if(res.status===200 && res.data !== "fail"){            
            return res.data;
        }
        console.error(res.data)
        return {error:MSG.ADMIN.ERR_UPDATE_PROJECT}
    }catch(err){
        console.error(err)
        return {error:MSG.ADMIN.ERR_UPDATE_PROJECT}
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
        if(res.status === 401 || res.data === "Invalid Session" ){
            RedirectPage(history)
            return {error:MSG.GENERIC.INVALID_SESSION};
        }else if(res.status===200 && res.data !== "fail"){            
            return res.data;
        }
        console.error(res.data)
        return {error:MSG.ADMIN.ERR_FETCH_ASSIGNED_PROJECT}
    }catch(err){
        console.error(err)
        return {error:MSG.ADMIN.ERR_FETCH_ASSIGNED_PROJECT}
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
        if(res.status === 401 || res.data === "Invalid Session" ){
            RedirectPage(history)
            return {error:MSG.GENERIC.INVALID_SESSION};
        }else if(res.status===200 && res.data !== "fail"){            
            return res.data;
        }
        console.error(res.data)
        return {error:MSG.ADMIN.ERR_ASSIGN_PROJECT}
    }catch(err){
        console.error(err)
        return {error:MSG.ADMIN.ERR_ASSIGN_PROJECT}
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
        if(res.status === 401 || res.data === "Invalid Session"){
            RedirectPage(history)
            return {error:MSG.GENERIC.INVALID_SESSION};
        }
        if(res.status===200 && res.data !== "fail"){            
            return res.data;
        }
        console.error(res.data)
        return {error:MSG.ADMIN.ERR_MANAGE_SESSION}
    }catch(err){
        console.error(err)
        return {error:MSG.ADMIN.ERR_MANAGE_SESSION}
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
        if(res.status === 401 || res.data === "Invalid Session"){
            RedirectPage(history)
            return {error:MSG.GENERIC.INVALID_SESSION};
        }
        if( res.status === "empty"){
            return {error:MSG.ADMIN.ERR_NO_ICE_PROVISION};
        }
        if(res.status===200 && res.data !== "fail"){            
            return res.data;
        }
        console.error(res.data)
        return {error:MSG.ADMIN.ERR_FETCH_ICE_DETAILS}
    }catch(err){
        console.error(err)
        return {error:MSG.ADMIN.ERR_FETCH_ICE_DETAILS}
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
        if(res.status === 401 || res.data === "Invalid Session"){
            RedirectPage(history)
            return {error:MSG.GENERIC.INVALID_SESSION};
        }
        if(res.status===200 ){    
            if(res.data === 'DuplicateIceName') return {error:MSG.ADMIN.ERR__ICE_EXIST};
            if(res.data === 'invalid_splname') return {error:MSG.ADMIN.ERR_ICE_SPECHAR};
            return res.data;
        }
        console.error(res.data)
    }catch(err){
        console.error(err)
        return {error:MSG.ADMIN.ERR_ICE_PROVISION}
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
        if(res.status === 401 || res.data === "Invalid Session"){
            RedirectPage(history)
            return {error:MSG.GENERIC.INVALID_SESSION};
        }
        if(res.status===200 && res.data !== "fail"){            
            return res.data;
        }
        console.error(res.data)
        return {error:MSG.ADMIN.ERR_MANAGE_OIDC}
    }catch(err){
        console.error(err)
        return {error:MSG.ADMIN.ERR_MANAGE_OIDC}
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
        if(res.status === 401 || res.data === "Invalid Session" ){
            RedirectPage(history)
            return {error:MSG.GENERIC.INVALID_SESSION};
        }
        else if(res.status === "fail" ){
            return {error:MSG.ADMIN.ERR_FETCH_USER_DETAILS}
        }
        else if(res.status===200 && res.data !== "fail"){            
            return res.data;
        }
        console.error(res.data)
        return {error:MSG.ADMIN.ERR_FETCH_USER_DETAILS}
    }catch(err){
        console.error(err)
        return {error:MSG.ADMIN.ERR_FETCH_USER_DETAILS}
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
        if(res.status === 401 || res.data === "Invalid Session"){
            RedirectPage(history)
            return {error:MSG.GENERIC.INVALID_SESSION};
        }
        if(res.status===200 && res.data !== "fail"){            
            if(res.data === 'invalid_name_special') return {error:MSG.ADMIN.ERR_SPECHAR_TOKEN};
            if(res.data === 'invalid_past_time') return {error:MSG.ADMIN.ERR_EXPIRY_TOKEN};
            return res.data;
        }
        console.error(res.data)
        return {error:MSG.ADMIN.ERR_MANAGE_USER}
    }catch(err){
        console.error(err)
        return {error:MSG.ADMIN.ERR_MANAGE_USER}
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
        if(res.status === 401 || res.data === "Invalid Session"){
            RedirectPage(history)
            return {error:MSG.GENERIC.INVALID_SESSION};
        }
        if(res.status===200 && res.data !== "fail"){            
            return res.data;
        }
        console.error(res.data)
        return {error:MSG.ADMIN.ERR_TEST_CONNECTION}
    }catch(err){
        console.error(err)
        return {error:MSG.ADMIN.ERR_TEST_CONNECTION}
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
        if(res.status === 401 || res.data === "Invalid Session"){
            RedirectPage(history)
            return {error:MSG.GENERIC.INVALID_SESSION};
        }
        if(res.status===200 && res.data !== "fail"){            
            return res.data;
        }
        console.error(res.data)
        return {error:MSG.ADMIN.ERR_MANAGE_LDAP}
    }catch(err){
        console.error(err)
        return {error:MSG.ADMIN.ERR_MANAGE_LDAP}
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
        if(res.status === 401 || res.data === "Invalid Session"){
            RedirectPage(history)
            return {error:MSG.GENERIC.INVALID_SESSION};
        }
        if(res.status===200 && res.data !== "fail"){ 
            if(res.data === 'invalid_splname') return {error:MSG.ADMIN.ERR_SPECHAR_POOLNAME};
            if(res.data === 'success')return res.data;
        }
        console.error(res.data)
        return {error:MSG.ADMIN.ERR_UPDATE_ICEPOOL}
    }catch(err){
        console.error(err)
        return {error:MSG.ADMIN.ERR_UPDATE_ICEPOOL}
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
        if(res.status === 401 || res.data === "Invalid Session"){
            RedirectPage(history)
            return {error:MSG.GENERIC.INVALID_SESSION};
        }
        if(res.status===200 && res.data !== "fail"){ 
            if(res.data === 'success')return res.data;
        }
        console.error(res.data)
        return {error:MSG.ADMIN.ERR_DELETE_ICEPOOL}
    }catch(err){
        console.error(err)
        return {error:MSG.ADMIN.ERR_DELETE_ICEPOOL}
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
        if(res.status === 401 || res.data === "Invalid Session"){
            RedirectPage(history)
            return {error:MSG.GENERIC.INVALID_SESSION};
        }
        if(res.status===200 && res.data !== "fail"){ 
            if(res.data === 'Pool exists') return {error:MSG.ADMIN.ERR_POOL_EXIST};
            if(res.data === 'invalid_splname') return {error:MSG.ADMIN.ERR_SPECHAR_POOL_NAME};
            if(res.data === 'success')return res.data;
        }
        console.error(res.data)
        return {error:MSG.ADMIN.ERR_CREATE_ICEPOOL}
    }catch(err){
        console.error(err)
        return {error:MSG.ADMIN.ERR_CREATE_ICEPOOL}
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
        if(res.status === 401 || res.data === "Invalid Session"){
            RedirectPage(history)
            return {error:MSG.GENERIC.INVALID_SESSION};
        }
        if(res.status===200 && res.data !== "fail"){ 
            if(res.data === "empty") return{error:MSG.ADMIN.ERR_NO_ICE}
            return res.data;
        }
        console.error(res.data)
        return {error:MSG.GENERIC.ERR_FETCH_ICE}
    }catch(err){
        console.error(err)
        return {error:MSG.GENERIC.ERR_FETCH_ICE}
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
        if(res.status === 401 || res.data === "Invalid Session"){
            RedirectPage(history)
            return {error:MSG.GENERIC.INVALID_SESSION};
        }
        if(res.status===200 && res.data !== "fail"){ 
            if(res.data.length<1) return{error:MSG.ADMIN.ERR_NO_ACTIVE_ICE}
            return res.data;
        }
        console.error(res.data)
        return {error:MSG.ADMIN.ERR_AVAILABLE_ICE}
    }catch(err){
        console.error(err)
        return {error:MSG.ADMIN.ERR_AVAILABLE_ICE}
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
        if(res.status === 401 || res.data === "Invalid Session"){
            RedirectPage(history)
            return {error:MSG.GENERIC.INVALID_SESSION};
        }
        if(res.status===200 && res.data !== "fail"){ 
            if(res.data === 'empty') return {error:MSG.ADMIN.ERR_EMPTY_QUEUE} 
            if(res.data === 'success') return res.data
        }
        console.error(res.data)
        return {error:MSG.ADMIN.ERR_CLEAR_QUEUE}
    }catch(err){
        console.error(err)
        return {error:MSG.ADMIN.ERR_CLEAR_QUEUE}
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
            RedirectPage(history)
            return {error:MSG.GENERIC.INVALID_SESSION};
        }
        if(res.status===200 && res.data !== "fail"){ 
            if(res.data === 'empty' || Object.keys(res.data).length<1) return {val:"empty",error:MSG.ADMIN.ERR_NO_ICEPOOL}           
            return res.data;
        }
        console.error(res.data)
        return {error:MSG.GENERIC.ERR_FETCH_POOLS}
    }catch(err){
        console.error(err)
        return {error:MSG.GENERIC.ERR_FETCH_POOLS}
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
        if(res.status === 401 || res.data === "Invalid Session"){
            RedirectPage(history)
            return {error:MSG.GENERIC.INVALID_SESSION};
        }
        if(res.status===200 && res.data !== "fail"){  
            // if(res.data === 'empty')return {error : "Fail to fetch configured details for selected provider."}          
            // return {"_id":"5fab88ae911ebf83599cc1bc","active":true,"appurl":"https://srv01nineteen68","auth":false,"channel":"email","host":"10.41.31.131","name":"smtpconf","pool":{"enable":true,"maxconnections":10,"maxmessages":120},"port":587,"provider":"smtp","proxy":{"auth":false,"enable":false,"pass":"","url":"","user":""},"sender":{"email":"avoassure-alerts@avoautomation.com","name":"Avo Assure Alerts"},"timeouts":{"connection":240000,"greeting":60000,"socket":1200000},"tls":{"insecure":"true","security":"auto"}}
            return res.data;
        }
        console.error(res.data)
        return {error:MSG.ADMIN.ERR_PROVIDER_DETAILS}
    }catch(err){
        console.error(err)
        return {error:MSG.ADMIN.ERR_PROVIDER_DETAILS}
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
        if(res.status === 401 || res.data === "Invalid Session"){
            RedirectPage(history)
            return {error:MSG.GENERIC.INVALID_SESSION};
        }
        if(res.status===200 && res.data !== "fail"){  
            if(res.data === 'empty')return {error : MSG.ADMIN.ERR_UPDATE_PROVIDER}          
            return res.data;
        }
        console.error(res.data)
        return {error:MSG.ADMIN.ERR_UPDATE_PROVIDER}
    }catch(err){
        console.error(err)
        return {error:MSG.ADMIN.ERR_UPDATE_PROVIDER}
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
        if(res.status === 401 || res.data === "Invalid Session"){
            RedirectPage(history)
            return {error:MSG.GENERIC.INVALID_SESSION};
        }
        if(res.status===200 && res.data !== "fail"){  
            if(res.data === 'empty') return MSG.ADMIN.ERR_UPDATE_PROVIDER;
            else if (res.data === "invalidprovider")  return MSG.ADMIN.ERR_UNSUPPORTIVE_PROVIDER;
            else if (res.data === "invalidrecipient") return MSG.ADMIN.ERR_REC_ADDRESS;
            else if (res.data === "success") return MSG.ADMIN.SUCC_EMAIL_SENT;
        }
        console.error(res.data)
        return {error:MSG.ADMIN.ERR_RECHECK_CONFIG}
    }catch(err){
        console.error(err)
        return {error:MSG.ADMIN.ERR_RECHECK_CONFIG}
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
        if(res.status === 401 || res.data === "Invalid Session" ){
            RedirectPage(history)
            return {error:MSG.GENERIC.INVALID_SESSION};
        }else if(res.status===200 && res.data !== "fail"){            
            return res.data;
        }
        console.error(res.data)
        return {error:MSG.ADMIN.ERR_FETCH_LOCKED_USER}
    }catch(err){
        console.error(err)
        return {error:MSG.ADMIN.ERR_FETCH_LOCKED_USER}
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
        if(res.status === 401 || res.data === "Invalid Session" ){
            RedirectPage(history)
            return {error:MSG.GENERIC.INVALID_SESSION};
        }else if(res.status===200 && res.data !== "fail"){            
            return res.data;
        }
        console.error(res.data)
        return {error:MSG.ADMIN.ERR_UNLOCK_USER}
    }catch(err){
        console.error(err)
        return {error:MSG.ADMIN.ERR_UNLOCK_USER}
    }
}

/* Component 
  api returns
*/

export const gitSaveConfig = async(action, userId,projectId,gitConfigName,gitAccToken,gitUrl,gitUsername,gitEmail) => { 
    try{
        const res = await axios(url+'/gitSaveConfig', {
            method: 'POST',
            headers: {
            'Content-type': 'application/json',
            },
            data: {action: action,
                    userId: userId,
                    projectId: projectId,
                    gitConfigName: gitConfigName,
                    gitAccToken: gitAccToken,
                    gitUrl: gitUrl,
                    gitUsername:gitUsername,
                    gitEmail:gitEmail},
            credentials: 'include'
        });
        if(res.status === 401 || res.data === "Invalid Session" ){
            RedirectPage(history)
            return {error:MSG.GENERIC.INVALID_SESSION};
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
        if(res.status === 401 || res.data === "Invalid Session" ){
            RedirectPage(history)
            return {error:MSG.GENERIC.INVALID_SESSION};
        }else if(res.status===200 && res.data !== "fail"){            
            return res.data;
        }
        console.error(res.data)
        return {error:MSG.ADMIN.ERR_FETCH_GIT}
    }catch(err){
        console.error(err)
        return {error:MSG.ADMIN.ERR_FETCH_GIT}
    }
}

/*Component exportProject
  props : {projectid,projectName} 
  api returns downloadable data
*/

export const exportProject = async(props) => {
    try{
        const res = await axios(url+'/exportProject', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            data: props,
            credentials: 'include',
            responseType:'arraybuffer'
        });
        if(res.status === 401 || res.data === "Invalid Session"){
            RedirectPage(history)
            return {error:MSG.GENERIC.INVALID_SESSION};
        }
        if(res.status===200 && res.data !== "fail"){            
            return res.data;
        }
        console.error(res.data)
        return {error:MSG.ADMIN.ERR_EXPORT}
    }catch(err){
        console.error(err)
        return {error:MSG.ADMIN.ERR_EXPORT}
    }
}

/*Component 
  props : {
            groupdata:  { 
                            "groupid1":{"groupname":"name1","internalusers":[userid1,userid2],"otherusers":["emailid1","emailid2"]},
                            "groupid2":{"groupname":"name2","internalusers":[userid2,userid3],"otherusers":["emailid4","emailid1"]}
                        },
			action: "update" or "create" or "delete"
          }
  api returns operation status
*/

export const updateNotificationGroups = async(props) => {
    try{
        const res = await axios(url+'/updateNotificationGroups', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            data: props,
            credentials: 'include',
        });
        if(res.status === 401 || res.data === "Invalid Session"){
            RedirectPage(history)
            return {error:MSG.GENERIC.INVALID_SESSION};
        }
        if(res.status===200 && res.data !== "fail"){            
            return res.data;
        }
        console.error(res.data)
        return {error:MSG.CUSTOM(`Fail to ${props.action} email Groups.`)}
    }catch(err){
        console.error(err)
        return {error:MSG.CUSTOM(`Fail to ${props.action} email Groups.`)}
    }
}

/*Component 
  props : {groupids:["id1","id2"],groupnames:["name1","name2"]}
  api returns notifications groups 
  if groupids and groupnames are both empty then all the groups will be sent
*/

export const getNotificationGroups = async(props) => {
    try{
        const res = await axios(url+'/getNotificationGroups', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            data: props,
            credentials: 'include',
        });
        if(res.status === 401 || res.data === "Invalid Session"){
            RedirectPage(history)
            return {error:MSG.GENERIC.INVALID_SESSION};
        }
        if(res.status===200 && res.data !== "fail"){            
            return res.data;
        }
        console.error(res.data)
        return {error:MSG.ADMIN.ERR_GROUPNAME_FETCH}
    }catch(err){
        console.error(err)
        return {error:MSG.ADMIN.ERR_GROUPNAME_FETCH}
    }
}

export const avoDiscoverSaveConfig = async(inputs) => { 
    try{
        const res = await axios(url+'/avoDiscoverMap', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            data: {
                "inputs":inputs
            },
            credentials: 'include',
        });
        if(res.status === 401 || res.data === "Invalid Session"){
            RedirectPage(history)
            return {error:MSG.GENERIC.INVALID_SESSION};
        }
        if(res.data === 'Unauthorized'){
            return {error:MSG.ADMIN.AVODISCOVER_AUTH_ERR}
        }
        if(res.data === 'ECONNREFUSED' || res.data === 'ENOTFOUND' || res.data === 'EAI_AGAIN'){
            return {error:MSG.ADMIN.AVODISCOVER_URL_ERR}
        }
        if(res.status===200 && res.data !== "fail"){            
            return res.data;
        }
        console.error(res.data)
        return {error:MSG.ADMIN.AVODISCOVER_CONFIG_ERR}
    }catch(err){
        console.error(err)
        return {error:MSG.ADMIN.AVODISCOVER_CONFIG_ERR}
    }
}

export const avoDiscoverReset = async(action, id, avodiscoverurl) => {
    try{
        const res = await axios(url+'/avoDiscoverReset', {
            method: 'POST',
            headers: {
            'Content-type': 'application/json',
            },
            data: {
                "action":action,
                "userid":id,
                "avodiscoverurl":avodiscoverurl},
            credentials: 'include'
        });
        if(res.status === 401 || res.data === "Invalid Session"){
            return {error:MSG.GENERIC.INVALID_SESSION};
        }else if(res.status===200 && res.data !== "fail"){return res.data;}
    }catch(err){
        console.error(err)
        return {error:MSG.ADMIN.AVODISCOVER_RESET_FAIL}
    }
}

export const fetchAvoDiscoverMap = async() => {
    try{
        const res = await axios(url+'/fetchAvoDiscoverMap', {
            method: 'POST',
            headers: {
            'Content-type': 'application/json',
            },
            data: {},
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
        return {error:MSG.ADMIN.ERR_FETCH_AVODISCOVER_MAP}
    }catch(err){
        console.error(err)
        return {error:MSG.ADMIN.ERR_FETCH_AVODISCOVER_MAP}
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
            RedirectPage(history)
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


export const saveAvoAgent = async(props) => {
    try{
        const res = await axios(url+'/saveAvoAgent', {
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
            RedirectPage(history)
            return {error:MSG.GENERIC.INVALID_SESSION};
        }
        console.error(res.data)
        return {error:MSG.MINDMAP.ERR_FETCH_MODULES}
    }catch(err){
        console.error(err)
        return {error:MSG.MINDMAP.ERR_FETCH_MODULES}
    }
}
export const saveAvoGrid = async(props) => {
    try{
        const res = await axios(url+'/saveAvoGrid', {
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
            RedirectPage(history)
            return {error:MSG.GENERIC.INVALID_SESSION};
        }
        console.error(res.data)
        return {error:MSG.MINDMAP.ERR_FETCH_MODULES}
    }catch(err){
        console.error(err)
        return {error:MSG.MINDMAP.ERR_FETCH_MODULES}
    }
}

export const deleteAvoGrid = async(props) => {
    try{
        const res = await axios(url+'/deleteAvoGrid', {
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
            RedirectPage(history)
            return {error:MSG.GENERIC.INVALID_SESSION};
        }
        console.error(res.data)
        return {error:MSG.MINDMAP.ERR_FETCH_MODULES}
    }catch(err){
        console.error(err)
        return {error:MSG.MINDMAP.ERR_FETCH_MODULES}
    }
}

export const createMulitpleLdapUsers = async(action, userObj) => { 
    try{
        const res = await axios(url+'/createMulitpleLdapUsers', {
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
        return {error:"Failed to "+action+" user."}
    }catch(err){
        console.error(err)
        return {error:"Failed to "+action+" user."}
//APi for upload
/* Component
  Genarative AI api returns string ex. "success"
*/
export const uploadgeneratefile = async(props) => {
    try{
        const res = await axios(url+'/uploadgeneratefile', {
            method: 'POST',
            headers: {
                'Content-Type': 'multipart/form-data'
            },
            data: props,
                   });
        if(res.status===200 && res.data !== "fail"){
            return res.data;
        }else if(res.status === 401 || res.data === "Invalid Session"){
            RedirectPage(history)
            return {error:MSG.GENERIC.INVALID_SESSION};
        }
        console.error(res.data)
        return {error:MSG.MINDMAP.ERR_FETCH_MODULES}
    }catch(err){
        console.error(err)
        return {error:MSG.MINDMAP.ERR_FETCH_MODULES}
    }
}
/* Component
  Genarative AI api returns string ex. "success"
*/
export const getall_uploadfiles = async(props) => {
       try{
        const res = await axios(url+'/getall_uploadfiles', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            },
            params:props                     
                   });
        if(res.status===200 && res.data !== "fail"){
            return res.data;
        }else if(res.status === 401 || res.data === "Invalid Session"){
            RedirectPage(history)
            return {error:MSG.GENERIC.INVALID_SESSION};
        }
        console.error(res.data)
        return {error:MSG.MINDMAP.ERR_FETCH_MODULES}
    }catch(err){
        console.error(err)
        return {error:MSG.MINDMAP.ERR_FETCH_MODULES}
    }
}
/* Component
  Genarative AI api returns string ex. "success"
*/
export const generate_testcase = async(props) => {
       try{
        const res = await axios(url+'/generate_testcase', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            data: props,
            });
        if(res.status===200 && res.data !== "fail"){
            return res.data;
        }else if(res.status === 401 || res.data === "Invalid Session"){
            RedirectPage(history)
            return {error:MSG.GENERIC.INVALID_SESSION};
        }
        //console.error(res.data)
       return {error:MSG.MINDMAP.ERR_FETCH_MODULES}
    }catch(err){
        // console.error(err)
        return {error:MSG.MINDMAP.ERR_FETCH_MODULES}
    }
}
/* Component
  Genarative AI api returns string ex. "success"
*/
export const getJSON_userstory = async(props) => {
       try{
        const res = await axios(url+'/getJSON_userstory', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            data: props,
                  });
        if(res.status===200 && res.data !== "fail"){
            return res.data;
        }else if(res.status === 401 || res.data === "Invalid Session"){
            RedirectPage(history)
            return {error:MSG.GENERIC.INVALID_SESSION};
        }
        console.error(res.data)
     return {error:MSG.MINDMAP.ERR_FETCH_MODULES}
    }catch(err){
        console.error(err)
        return {error:MSG.MINDMAP.ERR_FETCH_MODULES}
    }
}
/* Component
  Genarative AI api returns string ex. "success"
*/
export const save_testcase = async(props) => {
    try{
        const res = await axios(url+'/save_testcase', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            data: props,
                  });
        if(res.status===200 && res.data !== "fail"){
            return res.data;
        }else if(res.status === 401 || res.data === "Invalid Session"){
            RedirectPage(history)
            return {error:MSG.GENERIC.INVALID_SESSION};
        }
        console.error(res.data)
        return {error:MSG.MINDMAP.ERR_FETCH_MODULES}
    }catch(err){
        console.error(err)
        return {error:MSG.MINDMAP.ERR_FETCH_MODULES}
    }
}