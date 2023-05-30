import axios from 'axios';
import {Messages as MSG} from '../global/components/Messages'
import {url} from '../../App'

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
            // RedirectPage(history)
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

