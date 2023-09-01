import axios from 'axios';
import {RedirectPage, Messages as MSG} from '../global'
import {history} from './index'
import {url} from '../../App';

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
        if(res.status === 401 || res.data === "Invalid Session"){
            RedirectPage(history)
            return {error:MSG.GENERIC.INVALID_SESSION};
        }
        if(res.status===200 && res.data !== "fail"){            
            return res.data;
        }
        console.error(res.data)
        return {error:MSG.SCHEDULE.ERR_FETCH_TESTSUITE}
    }catch(err){
        console.error(err)
        return {error:MSG.SCHEDULE.ERR_FETCH_TESTSUITE}
    }
}

/*Component  
  api returns 
*/

export const getScheduledDetails_ICE = async(configKey, configName) => { 
    try{
        const res = await axios(url+'/getScheduledDetails_ICE', {
            method: 'POST',
            headers: {
            'Content-type': 'application/json',
            },
            data: {param : 'getScheduledDetails_ICE', configKey: configKey, configName: configName},
            credentials: 'include'
        });
        if(res.status === 401 || res.data === "Invalid Session"){
            RedirectPage(history)
            return {error:MSG.GENERIC.INVALID_SESSION};
        }
        if(res.status===200 && res.data !== "fail"){            
            return res.data;
        }
        console.error(res.data)
        return {error:MSG.SCHEDULE.ERR_FETCH_SCHEDULE}
    }catch(err){
        console.error(err)
        return {error:MSG.SCHEDULE.ERR_FETCH_SCHEDULE}
    }
}

/*Component  
  api returns 
*/

export const testSuitesScheduler_ICE = async(executionData) => { 
    try{
        const parallel = await axios(url+"/hooks/validateParallelExecutions",{
            method: 'POST'
        });
        if(parallel.status===200 && parallel.data.status==='pass'){
            const res = await axios(url+'/testSuitesScheduler_ICE', {
                method: 'POST',
                headers: {
                'Content-type': 'application/json',
                },
                data: {param : 'testSuitesScheduler_ICE',
                executionData: executionData},
                credentials: 'include'
            });
            if(res.status === 401 || res.data === "Invalid Session"){
                RedirectPage(history)
                return {error:MSG.GENERIC.INVALID_SESSION};
            }
            if(res.status===200 && res.data !== "fail"){            
                return res.data;
            }
            console.error(res.data)
            return {error:MSG.SCHEDULE.ERR_SCHEDULE}
        }else{
            return {errorparallel: parallel.data.fail}
        }
    }catch(err){
        console.error(err)
        return {error:MSG.SCHEDULE.ERR_SCHEDULE}
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
        if(res.status === 401 || res.data === "Invalid Session"){
            RedirectPage(history)
            return {error:MSG.GENERIC.INVALID_SESSION};
        }
        if(res.status===200 && res.data !== "fail"){            
            return res.data;
        }
        console.error(res.data)
        return {error:MSG.SCHEDULE.ERR_CANCEL_SCHEDULE}
    }catch(err){
        console.error(err)
        return {error:MSG.SCHEDULE.ERR_CANCEL_SCHEDULE}
    }
}

export const testSuitesSchedulerRecurring_ICE = async(executionData) => { 
    try {
        const res = await axios(url+'/testSuitesSchedulerRecurring_ICE', {
            method: 'POST',
            headers: {
            'Content-type': 'application/json',
            },
            data: {param : 'testSuitesScheduler_ICE',
            executionData: executionData},
            credentials: 'include'
        });
        if (res.status === 401 || res.data === "Invalid Session") {
            RedirectPage(history)
            return {error:MSG.GENERIC.INVALID_SESSION};
        }
        if (res.status===200 && res.data !== "fail") {            
            return res.data;
        }
        console.error(res.data)
        return {error:MSG.SCHEDULE.ERR_SCHEDULE}
    } catch(err) {
        console.error(err)
        return {error:MSG.SCHEDULE.ERR_SCHEDULE}
    }
}


// get scheduled details from scheduled date
export const getScheduledDetailsOnDate_ICE = async(scheduledDate, configKey, configName) => { 
    try{
        const res = await axios(url+'/getScheduledDetailsOnDate_ICE', {
            method: 'POST',
            headers: {
            'Content-type': 'application/json',
            },
            data: {param : 'getScheduledDetails_ICE', scheduledDate: scheduledDate, configKey: configKey, configName: configName},
            credentials: 'include'
        });
        if(res.status === 401 || res.data === "Invalid Session"){
            RedirectPage(history)
            return {error:MSG.GENERIC.INVALID_SESSION};
        }
        if(res.status===200 && res.data !== "fail"){            
            return res.data;
        }
        console.error(res.data)
        return {error:MSG.SCHEDULE.ERR_FETCH_SCHEDULE}
    }catch(err){
        console.error(err)
        return {error:MSG.SCHEDULE.ERR_FETCH_SCHEDULE}
    }
}

// get schedule count using config key
export const getScheduledCount = async (configKey) => {
    try {
        const result = await axios(url + '/getScheduledCount', {
            method: 'POST',
            headers: {
                'Content-type': 'application/json'
            },
            data: {
                configKey: configKey
            },
            credentials: 'include'
        });

        if (result.status === 401 || result.data === "Invalid Session") {
            RedirectPage(history);
            return {
                error: MSG.GENERIC.INVALID_SESSION
            };
        }

        if (result.status === 200 && result.data !== "fail") {
            return result.data
        }

        console.error(result.data);
        return {
            error: MSG.SCHEDULE.ERR_FETCH_SCHEDULE
        };
    }
    catch (error) {
        console.error(error);
        return {
            error: MSG.SCHEDULE.ERR_FETCH_SCHEDULE
        };
    }
}