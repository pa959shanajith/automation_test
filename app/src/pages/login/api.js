
import axios from 'axios';
const url = "https://wslkcmp6f-473.slksoft.com:8443";

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
        if (res.status == 200){
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
        if (res.status == 200){
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
        if (res.status == 200){
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

export const checkUserState = async() => {
    try{
        console.log("Calling...");
        const res = await axios(url+"/checkUserState", {
            method: "POST",
            credentials : 'include'
        });
        if (res.status == 200){
            return res.data;
        }
        else{
            console.log("Else...");
            console.log(res.status);
        }
    }
    catch(err){
        console.log("Err...");
        console.log(err);
    }
}

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
        if (res.status == 200){
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