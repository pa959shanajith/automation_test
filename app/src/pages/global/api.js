
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
            data: {'newpassword': newpassword, currpassword, userData},
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