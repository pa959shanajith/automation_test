import axios from 'axios';
import {RedirectPage} from '../global'
import {history} from './index'
const url = 'https://'+window.location.hostname+':8443';

/*Component getProjectList
  use: 
  api returns { appType : [],appTypeName:[],cycles:{},domains:[],projectId:[],projectName:[],projecttypes:{},releases:[]}
*/

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
        if(res.status === 401){
            RedirectPage(history)
            return {error:'invalid session'};
        }
        if(res.status===200 && res.data !== "fail"){            
            return res.data;
        }
        console.error(res.data)
        return {error:'Failed to fetch project list'}
    }catch(err){
        console.error(err)
        return {error:'Failed to fetch project list'}
    }
}

/*Component getModules
  api returns [{name: "", type: "", id: ""},{name: "", type: "", id: ""}]
*/

export const getModules = async(props) => {
    try{
        const res = await axios(url+'/getModules', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            data: props,
            credentials: 'include'
        });
        if(res.status===200 && res.data !== "fail"){            
            return res.data;
        }else if(res.status === 401){
            RedirectPage(history)
            return {error:'invalid session'};
        }
        console.error(res.data)
        return {error:'Failed to fetch Module list'}
    }catch(err){
        console.error(err)
        return {error:'Failed to fetch Modules'}
    }
}

/*Component getScreens
  api returns {screenList: [{name:"",parent:[],_id:""}], testCaseList: [{name:"",parent:[],_id:"",screenid:''}]}
*/

export const getScreens = async(projectId) => {
    try{
        const res = await axios(url+'/getScreens', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            data: {projectId:projectId},
            credentials: 'include'
        });
        if(res.status === 401){
            RedirectPage(history)
            return {error:'invalid session'};
        }
        if(res.status===200 && res.data !== "fail"){            
            return res.data;
        }
        console.error(res.data)
        return {error:'Failed to fetch screens'}
    }catch(err){
        console.error(err)
        return {error:'Failed to fetch screens'}
    }
}

/*Component getScreens
  api returns {screenList: [{name:"",parent:[],_id:""}], testCaseList: [{name:"",parent:[],_id:"",screenid:''}]}
*/

export const getProjectTypeMM = async(projectId) => {
    try{
        const res = await axios(url+'/getProjectTypeMM', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            data: {"action":"getProjectTypeMM",projectId:projectId},
            credentials: 'include'
        });
        if(res.status === 401){
            RedirectPage(history)
            return {error:'invalid session'};
        }
        if(res.status===200 && res.data !== "fail"){            
            return res.data;
        }
        console.error(res.data)
        return {error:'Failed to fetch screens'}
    }catch(err){
        console.error(err)
        return {error:'Failed to fetch screens'}
    }
}

/*Component saveMindmap
  api returns moduleID
*/

export const saveMindmap = async(props) => {
    var data = {
        action:props.action?props.action:"/saveData",
        write: props.write,
        map: props.map,
        deletednode: props.deletednode,
        unassignTask: props.unassignTask,
        prjId: props.prjId,
        createdthrough: props.createdthrough,
        cycId: props.cycId,
        relId: props.relId?props.relId:null
    }
    try{
        const res = await axios(url+data.action, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            data: data,
            credentials: 'include'
        });
        if(res.status === 401){
            RedirectPage(history)
            return {error:'invalid session'};
        }
        if(res.status===200 && res.data !== "fail"){            
            return res.data;
        }
        console.error(res.data)
        return {error:'Failed to save mindmap'}
    }catch(err){
        console.error(err)
        return {error:'Failed to save mindmap'}
    }
}

/*Component exportToExcel
  api returns excel data
*/

export const exportToExcel = async(props) => {
    try{
        const res = await axios(url+'/exportToExcel', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            data: props,
            credentials: 'include',
            responseType:'arraybuffer'
        });
        if(res.status === 401){
            RedirectPage(history)
            return {error:'invalid session'};
        }
        if(res.status===200 && res.data !== "fail"){            
            return res.data;
        }
        console.error(res.data)
        return {error:'Failed to export excel'}
    }catch(err){
        console.error(err)
        return {error:'Failed to export excel'}
    }
}

/*Component getScenarios
  api returns {screenList: [{name:"",parent:[],_id:""}], testCaseList: [{name:"",parent:[],_id:"",screenid:''}]}
*/

export const getScenarios = async(moduleID) => {
    try{
        const res = await axios(url+'/populateScenarios', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            data: {"action":"populateScenarios","moduleId":moduleID},
            credentials: 'include'
        });
        if(res.status === 401){
            RedirectPage(history)
            return {error:'invalid session'};
        }
        if(res.status===200 && res.data !== "fail"){            
            return res.data;
        }
        console.error(res.data)
        return {error:'Failed to fetch scenarios'}
    }catch(err){
        console.error(err)
        return {error:'Failed to fetch scenarios'}
    }
}

/*Component populateUsers
  api returns {screenList: [{name:"",parent:[],_id:""}], testCaseList: [{name:"",parent:[],_id:"",screenid:''}]}
*/

export const populateUsers = async(projectId) => {
    try{
        const res = await axios(url+'/populateUsers', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            data: {"projectId":projectId},
            credentials: 'include'
        });
        if(res.status === 401){
            RedirectPage(history)
            return {error:'invalid session'};
        }
        if(res.status===200 && res.data !== "fail"){            
            return res.data;
        }
        console.error(res.data)
        return {error:'Failed to fetch scenarios'}
    }catch(err){
        console.error(err)
        return {error:'Failed to fetch scenarios'}
    }
}


/*Component excelToMindmap
  api returns {screenList: [{name:"",parent:[],_id:""}], testCaseList: [{name:"",parent:[],_id:"",screenid:''}]}
*/

export const excelToMindmap = async(data) => {
    try{
        const res = await axios(url+'/excelToMindmap', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            data: {'data':data},
            credentials: 'include'
        });
        if(res.status === 401){
            RedirectPage(history)
            return {error:'invalid session'};
        }
        if(res.status===200 && res.data !== "fail"){            
            return res.data;
        }
        console.error(res.data)
        return {error:'error fetching sheet names'}
    }catch(err){
        console.error(err)
        return {error:'error fetching sheet names'}
    }
}

/*Component excelToMindmap
  api returns {screenList: [{name:"",parent:[],_id:""}], testCaseList: [{name:"",parent:[],_id:"",screenid:''}]}
*/

export const pdProcess = async(data) => {
    try{
        const res = await axios(url+'/pdProcess', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            data: {'data':data},
            credentials: 'include'
        });
        if(res.status === 401){
            RedirectPage(history)
            return {error:'invalid session'};
        }
        if(res.status===200 && res.data !== "fail"){            
            return res.data;
        }
        return {error:'error fetching data from file'}
    }catch(err){
        console.error(err)
        return {error:'error fetching data from file'}
    }
}