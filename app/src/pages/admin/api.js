import axios from 'axios';
const url = "https://"+window.location.hostname+":8443";


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
