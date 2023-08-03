import axios from 'axios';
import {url} from '../../App';
import { Messages as MSG,RedirectPage} from '../global/components/Messages';
import {history} from './index'

export const fetchConfigureList = async(props) => {
    console.log(props);
    try{
        const res = await axios(url+'/getConfigureList', {
            method: 'POST',
            headers: {
                'Content-type': 'application/json',
            },
            data: {
                action: "configurelist",
                'projectid': props.projectid
            }
        });
        if(res.status === 401){
            // RedirectPage(history)
            return {error:MSG.GENERIC.INVALID_SESSION}
        }
        if(res.status === 200 && res.data !== "fail"){            
            return res.data;
        }
        console.error(res.data)
        return { error:MSG.UTILITY.ERR_FETCH_DATATABLES}
    }catch(err){
        console.error(err)
        return {error:MSG.UTILITY.ERR_FETCH_DATATABLES}
    }
}
export const getICE_list = async(data) => { 
    try{
        const res = await axios(url+'/getICE_list', {
            method: 'POST',
            headers: {
            'Content-type': 'application/json',
            },
            data: data,
            credentials: 'include'
        });
        if(res.status === 401 || res.data === "Invalid Session"){
            // RedirectPage(history)
            return {error:MSG.GENERIC.INVALID_SESSION};
        }
        if(res.status===200 && res.data !== "fail"){            
            return res.data;
        }
        console.error(res.data)
        return {error:MSG.GENERIC.ERR_FETCH_ICE}
    }catch(err){
        console.error(err)
        return {error:MSG.GENERIC.ERR_FETCH_ICE}
    }
}
export const getPools = async(data) => { 
    try{
        const res = await axios(url+'/getPools', {
            method: 'POST',
            headers: {
            'Content-type': 'application/json',
            },
            data: data,
            credentials: 'include'
        });
        if(res.status === 401 || res.data === "Invalid Session"){
            // RedirectPage(history)
            return {error:MSG.GENERIC.INVALID_SESSION};
        }
        if(res.status===200 && res.data !== "fail"){ 
            if(res.data === 'empty') return {error:MSG.EXECUTE.ERR_EMPTY_USER}           
            return res.data;
        }
        console.error(res.data)
        return {error:MSG.GENERIC.ERR_FETCH_POOLS}
    }catch(err){
        console.error(err)
        return {error:MSG.GENERIC.ERR_FETCH_POOLS}
    }
} 
export const readTestSuite_ICE = async(readTestSuite) => { 
    try{
        const res = await axios(url+'/readTestSuite_ICE', {
            method: 'POST',
            headers: {
            'Content-type': 'application/json',
            },
            data: {param : 'readTestSuite_ICE', readTestSuite : readTestSuite, fromFlag:"execution"},
            credentials: 'include'
        });
        if(res.status === 401 || res.data === "Invalid Session"){
            // RedirectPage(history)
            return {error:MSG.GENERIC.INVALID_SESSION};
        }
        if(res.status===200 && res.data !== "fail"){            
            return res.data;
        }
        console.error(res.data)
        return {error:MSG.EXECUTE.ERR_TESTSUITE_FETCH}
    }catch(err){
        console.error(err)
        return {error:MSG.EXECUTE.ERR_TESTSUITE_FETCH}
    }
}
export const getProjectList = async() => {
    try{
        const res = await axios(url+'/populateProjects', {
            method: 'POST',
            headers: {
            'Content-type': 'application/json',
            },
            data: {"action":"populateProjects"},
            credentials: 'include'
        });
        if(res.status === 401 || res.data === "Invalid Session"){
            return {error:MSG.GENERIC.INVALID_SESSION};
        }
        if(res.status===200 && res.data !== "fail"){            
            return res.data;
        }
        console.error(res.data)
        return {error:MSG.MINDMAP.ERR_FETCH_PROJECT}
    }catch(err){
        console.error(err)
        return {error:MSG.MINDMAP.ERR_FETCH_PROJECT}
    }
}
export const ExecuteTestSuite_ICE = async(executionData) => { 
    try{
        const res = await axios(url+'/ExecuteTestSuite_ICE', {
            method: 'POST',
            headers: {
            'Content-type': 'application/json',
            },
            data: {param : 'ExecuteTestSuite_ICE',
            executionData: executionData},
            credentials: 'include'
        });
        if(res.status === 401 || res.data === "Invalid Session"){
            // RedirectPage(history)
            return {errorapi:MSG.GENERIC.INVALID_SESSION};
        }
        if(res.status===200 && res.data !== "fail"){            
            return res.data;
        }
        console.error(res.data)
        return {errorapi:MSG.EXECUTE.ERR_EXECUTE_TESTSUITE}
    }catch(err){
        console.error(err)
        return {errorapi:MSG.EXECUTE.ERR_EXECUTE_TESTSUITE}
    }
}
export const execAutomation = async(props) => {
    try{
        console.log(props)
        const res = await axios(url+'/execAutomation', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            data: {"key":props},
            credentials: 'include'
        });
        if(res.status===200 && res.data !== "fail"){
            return res.data;
        }else if(res.status === 401 || res.data === "Invalid Session"){
            // RedirectPage(history)
            return {error:MSG.GENERIC.INVALID_SESSION};
        }
        console.log(res.data + '  408')
        return {error:MSG.MINDMAP.ERR_FETCH_MODULES}
    }catch(err){
        console.error(err)
        return {error:MSG.MINDMAP.ERR_FETCH_MODULES}
    }
}
export const deleteConfigureKey = async(props) => {
    try{
        const res = await axios(url+'/deleteConfigureKey', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            data: {"key":props},
            credentials: 'include'
        });
        if(res.status===200 && res.data !== "fail"){
            return res.data;
        }else if(res.status === 401 || res.data === "Invalid Session"){
            // RedirectPage(history)
            return {error:MSG.GENERIC.INVALID_SESSION};
        }
        console.log(res.data + '  408')
        return {error:MSG.MINDMAP.ERR_FETCH_MODULES}
    }catch(err){
        console.error(err)
        return {error:MSG.MINDMAP.ERR_FETCH_MODULES}
    }
}
export const getQueueState = async(data) => {
    try{
        const res = await axios(url+'/getQueueState', {
            method: 'GET',
            credentials: 'include'
        });

        if(res.status===200 && res.data !== "fail"){            
            return res.data;
        }else if(res.status===200 && res.data === "fail"){            
            return {error : MSG.GLOBAL.ERR_SOMETHING_WRONG};
        }
        else if(res.status === 401 || res.data === "Invalid Session"){
            return {error:MSG.GENERIC.INVALID_SESSION};
        }
        return {error:MSG.GLOBAL.ERR_SOMETHING_WRONG}
    }catch(err){
        return {error:MSG.GLOBAL.ERR_SOMETHING_WRONG}
    }
}
export const deleteExecutionListId = async(props) => {
    try{
            const res = await axios(url+'/deleteExecutionListId', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            data: props,
            credentials: 'include'
        });
        if(res.status===200 && res.data !== "fail"){
            return res.data;
        }else if(res.status === 401 || res.data === "Invalid Session"){
            // RedirectPage(history)
            return {error:MSG.GENERIC.INVALID_SESSION};
        }
        return {error:MSG.MINDMAP.ERR_FETCH_MODULES}
    }catch(err){
        console.error(err)
        return {error:MSG.MINDMAP.ERR_FETCH_MODULES}
    }
}
