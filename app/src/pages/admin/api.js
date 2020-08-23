import axios from 'axios';
const url = 'https://127.0.0.1:8443';

//TODO   -   make comment for each API
/*Component getProjectList
  use: 
  api returns { appType : [],appTypeName:[],cycles:{},domains:[],projectId:[],projectName:[],projecttypes:{},releases:[]}
  todo : add url from env or store and error handling 
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
        if(res.status===200){
            return res.data;
        }else{
            console.error(res.status)
        }
    }catch(err){
        console.error(err)
    }
}

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
        if(res.status===200){
            return res.data;
        }else{
            console.error(res.status)
        }
    }catch(err){
        console.error(err)
    }
}


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
        if(res.status===200){
            return res.data;
        }else{
            console.error(res.status)
        }
    }catch(err){
        console.error(err)
    }
}

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
        if(res.status===200){
            return res.data;
        }else{
            console.error(res.status)
        }
    }catch(err){
        console.error(err)
    }
}

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
        if(res.status===200){
            return res.data;
        }else{
            console.error(res.status)
        }
    }catch(err){
        console.error(err)
    }
}
