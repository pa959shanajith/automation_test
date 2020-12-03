import axios from 'axios';
const url = "https://"+window.location.hostname+":8443";

export const logoutUser = async() => {
    try{
        const res = await axios(url+"/logoutUser", {
            method : 'POST',
            headers : {
                'Content-type' : "application/json"
            },
            data: {'param': 'logoutUser'},
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

export const keepSessionAlive = async() => {
    try{
        const res = await axios(url+"/keepSessionAlive", {
            method : 'POST',
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

export const updateTaskStatus = async(obj) => {
    try{
        const res = await axios(url+"/updateTaskstatus_mindmaps", {
            method: 'POST',
            headers : {
                'Content-type' : 'application/json'
            },
            data : {'obj': obj},
            credentials : 'include',
        });
        if (res.status === 200){
            return res.data;
        }
        else{
            console.log(res.status)
        }
    }
    catch(err){
        console.log(err);
    }
}

export const resetPassword = async(newpassword, currpassword) => {
    try{
        const res = await axios(url+"/resetPassword", {
            method: "POST",
            headers: {
                "Content-type": "application/json"
            },
            data: {'newpassword': newpassword, 'currpassword': currpassword},
            credentials : 'include'
        });
        if (res.status === 200){
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

export const getRoleNameByRoleId = async(roleasarray) => {
    try{
        const res = await axios(url+"/getRoleNameByRoleId", {
            method: "POST",
            headers: {
                "Content-type": "application/json"
            },
            data: {'action': "getRoleNameByRoleId", 'role': roleasarray},
            credentials : 'include'
        });
        if (res.status === 200){
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