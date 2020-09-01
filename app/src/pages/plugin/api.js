import axios from 'axios';
const url = "https://"+window.location.hostname+":8443";


export const getProjectIDs = async() => {
    try{
        const res = await axios(url+"/getProjectIDs", {
            method: 'POST',
            headers : {
                'Content-type' : 'application/json'
            },
            data : {'action': 'getProjectIDs', 'allflag': true},
            credentials : 'include',
        });
        if (res.status == 200){
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

export const getTaskJson_mindmaps = async(obj) => {
    try{
        const res = await axios(url+"/getTaskJson_mindmaps", {
            method: 'POST',
            headers : {
                'Content-type' : 'application/json'
            },
            data : {'action': 'getTaskJson_mindmaps', 'obj': obj},
            credentials : 'include',
        });
        if (res.status == 200){
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
        if (res.status == 200){
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

export const getNames_ICE = async(requestedids, idtype) => {
    try{
        const res = await axios(url+"/getNames_ICE", {
            method: 'POST',
            headers : {
                'Content-type' : 'application/json'
            },
            data : {'action': 'getNames_ICE', 'requestedids': requestedids, 'idtype': idtype},
            credentials : 'include',
        });
        if (res.status == 200){
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