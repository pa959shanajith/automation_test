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

export const getNames_ICE = async(requestedIds, idType) => {
    try{
        const res = await axios(url+"/getNames_ICE", {
            method : 'POST',
            headers : {
                'Content-type' : "application/json"
            },
            data: {'param': 'getNames_ICE', requestedids : requestedIds, idtype : idType},
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
