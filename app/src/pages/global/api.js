
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