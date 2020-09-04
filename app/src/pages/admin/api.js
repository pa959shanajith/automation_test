import axios from 'axios';
// const url = 'https://127.0.0.1:8443';
const url = "https://"+window.location.hostname+":8443";

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
        if(res.status===200){
            return res.data;
        }else{
            console.error(res.status)
        }
    }catch(err){
        console.error(err)
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
        if (res.status == 200) {
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
export const getAvailablePlugins = async() => { 
    try{
        const res = await axios(url+'/getAvailablePlugins', {
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

export const getDomains_ICE = async() => { 
    try{
        const res = await axios(url+'/getDomains_ICE', {
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
        if(res.status===200){
            return res.data;
        }else{
            console.error(res.status)
        }
    }catch(err){
        console.error(err)
    }
}

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
        if(res.status===200){
            return res.data;
        }else{
            console.error(res.status)
        }
    }catch(err){
        console.error(err)
    }
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
        if(res.status===200){
            return res.data;
        }else{
            console.error(res.status)
        }
    }catch(err){
        console.error(err)
    }
}



export const updateProject_ICE = async(updateProjectObj) => { 
    try{
        const res = await axios(url+'/updateProject_ICE', {
            method: 'POST',
            headers: {
            'Content-type': 'application/json',
            },
            data: {updateProjectObj: updateProjectObj},
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
        if(res.status===200){
            return res.data;
        }else{
            console.error(res.status)
        }
    }catch(err){
        console.error(err)
    }
}

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
        if(res.status===200){
            return res.data;
        }else{
            console.error(res.status)
        }
    }catch(err){
        console.error(err)
    }
}

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
        if(res.status===200){
            return res.data;
        }else{
            console.error(res.status)
        }
    }catch(err){
        console.error(err)
    }
}

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
        if(res.status===200){
            return res.data;
        }else{
            console.error(res.status)
        }
    }catch(err){
        console.error(err)
    }
}
