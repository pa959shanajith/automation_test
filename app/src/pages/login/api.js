
import axios from 'axios';
const url = "https://"+window.location.hostname+":8443";

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