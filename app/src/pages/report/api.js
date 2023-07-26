import axios from 'axios';
import {url} from '../../App';
import { Messages as MSG,RedirectPage} from '../global/components/Messages';
// import {history} from './index'

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
                'projectid': props.projectid,
                'param':props.param
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

export const getReportList = async(getConfigKey) => {
    try{
        const res = await axios(url+'/fetchExecProfileStatus', {
            method: 'POST',
            headers: {
            'Content-type': 'application/json',
            },
            data: {
                query:"fetchExecProfileStatus",
                configurekey: getConfigKey,
            },
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

export const getTestSuite = async(getSuiteKey) => {
    try{
        const res = await axios(url+'/fetchModSceDetails', {
            method: 'POST',
            headers: {
            'Content-type': 'application/json',
            },
            data: getSuiteKey,
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

export const viewReport = async (reportid, reportType="json", screenshotFlag) => { 
    try{
        const res = await axios(url+'/viewReport', {
            method: 'GET',
            headers: {
                'Content-type': 'application/json',
            },
            responseType:(reportType === 'pdf')? 'arraybuffer':'application/json',
            params: { reportID: reportid, type: reportType, images: screenshotFlag  },
            credentials: 'include'
        });
        if(res.status === 401 || res.data === "Invalid Session"){
            // RedirectPage(history)
            return { error: MSG.GENERIC.INVALID_SESSION };
        }
        if(res.status===200 && res.data !== "fail"){            
            return res.data;
        }
        console.error(res.data)
        return { error: MSG.REPORT.ERR_FETCH_REPORT }
    }
    catch(err){
        console.error(err)
        return { error: MSG.REPORT.ERR_FETCH_REPORT }
    }
}