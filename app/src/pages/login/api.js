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

/*Component LoginFields
  api returns {proceed:true} / invalidServerConf
*/
export const checkUser = async(user) => {
    console.log(user);
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
            console.log(user);
            return {error: 'Failed to check user'}
        }
    }
    catch(err){
        console.log(err);
        return {error: 'Failed to check user'}
    }
}