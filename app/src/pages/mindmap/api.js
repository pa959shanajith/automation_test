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

/*Component saveMindmap
  api returns moduleID if saved
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

/*Component exportMindmap
  api returns Json data
*/

export const exportMindmap = async(moduleId) => {
    try{
        const res = await axios(url+'/exportMindmap', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            data: {
                mindmapId:moduleId
            },
            credentials: 'include',
        });
        if(res.status === 401){
            RedirectPage(history)
            return {error:'invalid session'};
        }
        if(res.status===200 && res.data !== "fail"){            
            return res.data;
        }
        console.error(res.data)
        return {error:'Failed to export mindmap'}
    }catch(err){
        console.error(err)
        return {error:'Failed to export mindmap'}
    }
}

/*Component populateScenarios
  api returns [{"_id":"5f2598face7ab3cefb3e5962","name":"Scenario_1"}]
*/

export const populateScenarios = async(moduleID) => {
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

/*Component readTestSuite_ICE
  api returns {"5f6d956afc748e91d0f8b74e":{"executestatus":[1],"condition":[0],"dataparam":[""],"scenarioids":[""],"scenarionames":[""],"projectnames":[""],"testsuitename":"","moduleid":"","testsuiteid":""}}
*/

export const readTestSuite_ICE = async(data) => {
    try{
        const res = await axios(url+'/readTestSuite_ICE', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            data: {
				param: 'readTestSuite_ICE',
				readTestSuite: data,
				fromFlag: "mindmaps"
			},
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
        return {error:'Failed to fetch testsuites details'}
    }catch(err){
        console.error(err)
        return {error:'Failed to fetch testsuites details'}
    }
}

/*Component populateUsers
  api returns {"rows":[{"_id":"5e26c3958bedab828b8a2943","addroles":[],"defaultrole":"5db0022cf87fdec084ae49aa","name":"test.b"}]}
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
        if(res.status===200 && res.data !== "fail" && res.data.rows.length >0){            
            return res.data;
        }
        console.error(res.data)
        return {error:'Failed to fetch Users'}
    }catch(err){
        console.error(err)
        return {error:'Failed to fetch Users'}
    }
}


/*Component excelToMindmap
    api return [{"id":"f2e7651d-521d-43cc-9346-4d823785b238","name":"Module_1","type":0},{"id":"39b97aa7-9fac-42d9-b167-9c1cb0464390","name":"Scenario_3","type":1},{"id":"06ef3e21-5b24-44ef-ba70-847a887fe2e2","name":"Screen_1","type":2,"uidx":1},{"id":"450b0b9e-0763-4e7e-8cd4-e1ae75121ec1","name":"Testcase_2","type":3,"uidx":1},{"id":"c120e074-3905-4e1b-ae85-9fca209626c5","name":"Screen_2fsdf","type":2,"uidx":3},{"id":"4f360398-25c4-429a-9689-700801506be0","name":"Testcase_1","type":3,"uidx":3},{"id":"056ab9b2-0334-431e-bc49-3883dfe7bdf6","name":"Screen_3","type":2,"uidx":5},{"id":"132b00f1-ded9-45d2-b793-abbca6500ca4","name":"Testcase_3","type":3,"uidx":5}]
    with flag = "sheetname"  returns list of sheet name
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
        return {error:'Invalid data in excel, please check!'}
    }catch(err){
        console.error(err)
        return {error:'Invalid data in excel, please check!'}
    }
}

/*Component importMindmap
  api return {"_id":"5f6d956afc748e91d0f8b74e"} on success
*/

export const importMindmap = async(data) => {
    try{
        const res = await axios(url+'/importMindmap', {
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
        return {error:'error fetching data from file'}
    }catch(err){
        console.error(err)
        return {error:'error fetching data from file'}
    }
}

/*Component pdProcess
  api returns {"success":true,"data":[[{"label":"Login_c4a74fede3fe4e5eabb70b01f7b72e12","type":"task"},{"label":"Order_c4a74fede3fe4e5eabb70b01f7b72e12","type":"task"},{"label":"Logout_c4a74fede3fe4e5eabb70b01f7b72e12","type":"task"}]],"history":"W3siYWN0aW9uIjoiQ3JlYXRlZCIsInJldmlld2VyIjoiSm9obiBTbWl0aCIsImFzc2lnbmVlIjoiQW5keSBSb2dlciIsInRpbWUiOiJNb24gTWFyIDAyIDIwMjAgMTk6MjI6MDUgR01UIn0seyJhY3Rpb24iOiJQZW5kaW5nIEFwcHJvdmFsIiwiYXNzaWduZWUiOiJBbmR5IFJvZ2VyIiwicmV2aWV3ZXIiOiJKb2huIFNtaXRoIiwidGltZSI6Ik1vbiBNYXIgMDIgMjAyMCAxOTo0NzowMyBHTVQifSx7ImFjdGlvbiI6IkFwcHJvdmVkIiwiYXNzaWduZWUiOiJBbmR5IFJvZ2VyIiwicmV2aWV3ZXIiOiJKb2huIFNtaXRoIiwidGltZSI6Ik1vbiBNYXIgMDIgMjAyMCAxOTo0ODowMyBHTVQifSx7ImFjdGlvbiI6ImV4cG9ydCIsImFzc2lnbmVlIjoiVmlrcmFtIFByYWJodSIsInJldmlld2VyIjoiIiwidGltZSI6IjIwMjAtMDMtMzFUMTI6NDE6MTguMjA2WiJ9XQ=="}
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