import axios from 'axios';
import {RedirectPage} from '../global'
import {history} from './index'
const url = "https://"+window.location.hostname+":8443";

/*Component  
  api returns 
*/

export const readTestSuite_ICE = async(readTestSuite) => { 
    try{
        const res = await axios(url+'/readTestSuite_ICE', {
            method: 'POST',
            headers: {
            'Content-type': 'application/json',
            },
            data: {param : 'getScheduledDetails_ICE',
            readTestSuite : readTestSuite,
            fromFlag: "scheduling"},
            credentials: 'include'
        });
        if(res.status === 401 || res.status === "Invalid Session"){
            RedirectPage(history)
            return {error:'invalid session'};
        }
        if(res.status===200 && res.data !== "fail"){            
            return res.data;
        }
        console.error(res.data)
        return {error:"Failed to fetch Testsuite."}
    }catch(err){
        console.error(err)
        return {error:"Failed to fetch Testsuite."}
    }
}

/*Component  
  api returns 
*/

export const getScheduledDetails_ICE = async() => { 
    try{
        const res = await axios(url+'/getScheduledDetails_ICE', {
            method: 'POST',
            headers: {
            'Content-type': 'application/json',
            },
            data: {param : 'getScheduledDetails_ICE'},
            credentials: 'include'
        });
        if(res.status === 401 || res.status === "Invalid Session"){
            RedirectPage(history)
            return {error:'invalid session'};
        }
        if(res.status===200 && res.data !== "fail"){            
            return res.data;
        }
        console.error(res.data)
        return {error:"Failed to fetch schedule Testsuite."}
    }catch(err){
        console.error(err)
        return {error:"Failed to fetch  schedule Testsuite."}
    }
}

/*Component  
  api returns 
*/

export const testSuitesScheduler_ICE = async(executionData) => { 
    try{
        const res = await axios(url+'/testSuitesScheduler_ICE', {
            method: 'POST',
            headers: {
            'Content-type': 'application/json',
            },
            data: {param : 'testSuitesScheduler_ICE',
            executionData: executionData},
            credentials: 'include'
        });
        if(res.status === 401 || res.status === "Invalid Session"){
            RedirectPage(history)
            return {error:'invalid session'};
        }
        if(res.status===200 && res.data !== "fail"){            
            return res.data;
        }
        console.error(res.data)
        return {error:"Failed to schedule Testsuite."}
    }catch(err){
        console.error(err)
        return {error:"Failed to schedule Testsuite."}
    }
}


/*Component  
  api returns 
*/

export const cancelScheduledJob_ICE = async(schDetails, host, schedUserid) => { 
    try{
        const res = await axios(url+'/cancelScheduledJob_ICE', {
            method: 'POST',
            headers: {
            'Content-type': 'application/json',
            },
            data: {param: 'cancelScheduledJob_ICE',
            schDetails: schDetails,
            host: host,
            schedUserid: schedUserid},
            credentials: 'include'
        });
        if(res.status === 401 || res.status === "Invalid Session"){
            RedirectPage(history)
            return {error:'invalid session'};
        }
        if(res.status===200 && res.data !== "fail"){            
            return res.data;
        }
        console.error(res.data)
        return {error:"Failed to cancel scheduled job."}
    }catch(err){
        console.error(err)
        return {error:"Failed to cancel scheduled job."}
    }
}