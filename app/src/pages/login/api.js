import axios from 'axios';
import {url} from '../../App';

/*Component LoginFields
  api returns String (restart/validCredential/inValidCredential/invalid_username_password/userLogged/inValidLDAPServer/invalidUserConf)
*/
export const authenticateUser = async(username, password) => {
    try{
        const res = await axios(url+"/login", {
            method : 'POST',
            headers : {
                'Content-type' : "application/json"
            },
            data: {'username': username, 'password': password},
            credentials : 'include'
        });
        if (res.status === 200 && res.data !== "fail") {
            return res.data;
        }
        else{
            return {error: 'Failed to Authenticate User'}
        }
    }
    catch(err){
        return {error: 'Failed to Authenticate User'}
    }
}

/*Component BasePage
  api returns {"user_id":"","username":"","email_id":"","additionalrole":[],"firstname":"","lastname":"","role":"","taskwflow":bool,"token":"","dbuser":bool,"ldapuser":bool,"samluser":bool,"openiduser":bool,"rolename":"","pluginsInfo":[{"pluginName":"","pluginValue":bool}],"page":"plugin"}
*/
export const loadUserInfo = async(selRole) => {
    try{
        const res = await axios(url+"/loadUserInfo", {
            method: "POST",
            headers: {
                "Content-type": "application/json"
            },
            data: {'action': 'loadUserInfo', selRole: selRole},
            credentials : 'include'
        });
        if (res.status === 200){
            return res.data;
        }
        else{
            return {error: 'Failed to load User info'}
        }
    }
    catch(err){
        return {error: 'Failed to load User info'}
    }
}

/*Component BasePage
  api returns String (fail/unauthorized/badrequest/nouser/nouserprofile/userLogged/inValidCredential/noProjectsAssigned/reload/redirect/Invalid Session)
*/
export const validateUserState = async() => {
    try{
        const res = await axios(url+"/validateUserState", {
            method: "POST",
            credentials : 'include'
        });
        if (res.status === 200){
            return res.data;
        }
        else{
            return {error: 'Failed to validate User'}
        }
    }
    catch(err){
        return {error: 'Failed to validate User'}
    }
}

/*Component LoginFields
  api returns {proceed:true} / invalidServerConf
*/
export const checkUser = async(user) => {
    try{
        const res = await axios(url+"/checkUser", {
            method: "POST",
            headers: {
                "Content-type": "application/json"
            },
            data: {'username': user},
            credentials : 'include'
        });
        if (res.status === 200){
            return res.data;
        }
        else{
            return {error: 'Failed to check user'}
        }
    }
    catch(err){
        return {error: 'Failed to check user'}
    }
}

/*Component Login
  api returns true / false
*/
export const shouldShowVerifyPassword = async(user_id) => {
    try{
        const res = await axios(url+"/verifyUser", {
            method: "POST",
            headers: {
                "Content-type": "application/json"
            },
            data: { user_id },
            credentials : 'include'
        });
        if (res.status === 200){
            return res.data;
        }
        else{
            return {error: 'Failed to verify user'}
        }
    }
    catch(err){
        return {error: 'Failed to verify user'}
    }
}

/*Component Login
  api returns flag and/or user
*/
export const shouldResetPassword = async(uid) => {
  try{
      const res = await axios(url+"/checkForgotExpiry", {
          method: "POST",
          headers: {
              "Content-type": "application/json"
          },
          data: { uid },
          credentials : 'include'
      });
      if (res.status === 200){
          return res.data;
      }
      else{
          return {error: 'Failed to verify user'}
      }
  }
  catch(err){
      return {error: 'Failed to verify user'}
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

export const storeUserDetails = async(userData) => {
    try{
        const res = await axios(url+"/storeUserDetails", {
            method : 'POST',
            headers : {
                'Content-type' : "application/json"
            },
            data: {
                action: "storeUserDetails",
                userDetails : userData
            },
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
        console.log(err);
    }
}

export const forgotPasswordEmail = async(args) => {
    try{
        const res = await axios(url+"/forgotPasswordEmail", {
            method : 'POST',
            headers : {
                'Content-type' : "application/json"
            },
            data: args,
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
        console.log(err);
    }
}

export const unlockAccountEmail = async(username) => {
    try{
        const res = await axios(url+"/unlockAccountEmail", {
            method : 'POST',
            headers : {
                'Content-type' : "application/json"
            },
            data: {
                username: username
            },
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
        console.log(err);
    }
}

export const unlock = async(username, password) => {
    try{
        const res = await axios(url+"/unlock", {
            method : 'POST',
            headers : {
                'Content-type' : "application/json"
            },
            data: {
                username: username,
				password: password
            },
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
        console.log(err);
    }
}