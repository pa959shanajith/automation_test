import axios from 'axios';
import {RedirectPage, Messages as MSG} from '../global'
import {history} from './index'
import {url} from '../../App';

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
        if(res.status === 401 || res.data === "Invalid Session"){
            RedirectPage(history)
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
        }else if(res.status === 401 || res.data === "Invalid Session"){
            RedirectPage(history)
            return {error:MSG.GENERIC.INVALID_SESSION};
        }
        console.error(res.data)
        return {error:MSG.MINDMAP.ERR_FETCH_MODULES}
    }catch(err){
        console.error(err)
        return {error:MSG.MINDMAP.ERR_FETCH_MODULES}
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
        if(res.status === 401 || res.data === "Invalid Session"){
            RedirectPage(history)
            return {error:MSG.GENERIC.INVALID_SESSION};
        }
        if(res.status===200 && res.data !== "fail"){            
            return res.data;
        }
        console.error(res.data)
        return {error:MSG.MINDMAP.ERR_FETCH_SCREEN}
    }catch(err){
        console.error(err)
        return {error:MSG.MINDMAP.ERR_FETCH_SCREEN}
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
        if(res.status === 401 || res.data === "Invalid Session"){
            RedirectPage(history)
            return {error:MSG.GENERIC.INVALID_SESSION};
        }
        if(res.status===200 && res.data !== "fail"){            
            return res.data;
        }
        console.error(res.data)
        return {error:MSG.MINDMAP.ERR_SAVE_MINDMAP}
    }catch(err){
        console.error(err)
        return {error:MSG.MINDMAP.ERR_SAVE_MINDMAP}
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
        if(res.status === 401 || res.data === "Invalid Session"){
            RedirectPage(history)
            return {error:MSG.GENERIC.INVALID_SESSION};
        }
        if(res.status===200 && res.data !== "fail"){            
            return res.data;
        }
        console.error(res.data)
        return {error:MSG.MINDMAP.ERR_EXPORT}
    }catch(err){
        console.error(err)
        return {error:MSG.MINDMAP.ERR_EXPORT}
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
        if(res.status === 401 || res.data === "Invalid Session"){
            RedirectPage(history)
            return {error:MSG.GENERIC.INVALID_SESSION};
        }
        if(res.status===200 && res.data !== "fail"){            
            return res.data;
        }
        console.error(res.data)
        return {error:MSG.MINDMAP.ERR_EXPORT_MINDMAP}
    }catch(err){
        console.error(err)
        return {error:MSG.MINDMAP.ERR_EXPORT_MINDMAP}
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
        if(res.status === 401 || res.data === "Invalid Session"){
            RedirectPage(history)
            return {error:MSG.GENERIC.INVALID_SESSION};
        }
        if(res.status===200 && res.data !== "fail"){            
            return res.data;
        }
        console.error(res.data)
        return {error:MSG.MINDMAP.ERR_FETCH_SCENARIO}
    }catch(err){
        console.error(err)
        return {error:MSG.MINDMAP.ERR_FETCH_SCENARIO}
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
        if(res.status === 401 || res.data === "Invalid Session"){
            RedirectPage(history)
            return {error:MSG.GENERIC.INVALID_SESSION};
        }
        if(res.status===200 && res.data !== "fail"){            
            return res.data;
        }
        console.error(res.data)
        return {error:MSG.MINDMAP.ERR_FETCH_TESTSUITE}
    }catch(err){
        console.error(err)
        return {error:MSG.MINDMAP.ERR_FETCH_TESTSUITE}
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
        if(res.status === 401 || res.data === "Invalid Session"){
            RedirectPage(history)
            return {error:MSG.GENERIC.INVALID_SESSION};
        }
        if(res.status===200 && res.data !== "fail" && res.data.rows.length >0){            
            return res.data;
        }
        console.error(res.data)
        return {error:MSG.MINDMAP.ERR_FETCH_USER}
    }catch(err){
        console.error(err)
        return {error:MSG.MINDMAP.ERR_FETCH_USER}
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
        if(res.status === 401 || res.data === "Invalid Session"){
            RedirectPage(history)
            return {error:MSG.GENERIC.INVALID_SESSION};
        }
        else if (res.data == 'valueError') {
            return {error : MSG.MINDMAP.ERR_EMPTY_COL}
        } 
        else if (res.data == 'duplicateSce') {
            return {error : MSG.MINDMAP.ERR_DUPLI_EXCEL_SCE_DATA}
        } 
        else if (res.data == 'duplicateMod') {
            return {error : MSG.MINDMAP.ERR_DUPLI_EXCEL_MOD_DATA}
        } 
        else if (res.data == "emptySheet" || res.data == 'fail') {
            return {error : MSG.MINDMAP.ERR_EXCEL_SHEET}
        }
        else if(res.status===200 && res.data !== "fail"){            
            return res.data;
        }
        console.error(res.data)
        return {error:MSG.MINDMAP.ERR_INVALID_EXCEL_DATA}
    }catch(err){
        console.error(err)
        return {error:MSG.MINDMAP.ERR_INVALID_EXCEL_DATA}
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
        if(res.status === 401 || res.data === "Invalid Session"){
            RedirectPage(history)
            return {error:MSG.GENERIC.INVALID_SESSION};
        }
        if(res.status===200 && res.data !== "fail"){            
            return res.data;
        }
        return {error:MSG.MINDMAP.ERR_FETCH_DATA}
    }catch(err){
        console.error(err)
        return {error:MSG.MINDMAP.ERR_FETCH_DATA}
    }
}
export const writeFileServer = async(data) => {
    try{
        const res = await axios(url+'/writeFileServer', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            data: data,
            credentials: 'include'
        });
        if(res.status === 401 || res.data === "Invalid Session"){
            RedirectPage(history)
            return {error:MSG.GENERIC.INVALID_SESSION};
        }
        if(res.status===200 && res.data !== "fail"){            
            return res.data;
        }
        return {error:MSG.MINDMAP.ERR_FETCH_DATA}
    }catch(err){
        console.error(err)
        return {error:MSG.MINDMAP.ERR_FETCH_DATA}
    }
}

export const writeZipFileServer = async(data) => {
    try{
        const res = await axios(url+'/writeZipFileServer', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            data: data,
            credentials: 'include'
        });
        if(res.status === 401 || res.data === "Invalid Session"){
            RedirectPage(history)
            return {error:MSG.GENERIC.INVALID_SESSION};
        }
        if(res.status===200 && res.data !== "fail"){            
            return res.data;
        }
        return {error:MSG.MINDMAP.ERR_FETCH_DATA}
    }catch(err){
        console.error(err)
        return {error:MSG.MINDMAP.ERR_FETCH_DATA}
    }
}
/*Component gitToMindmap
  api return {"_id":"5f6d956afc748e91d0f8b74e"} on success
*/

export const gitToMindmap = async(data) => {
    try{
        const res = await axios(url+'/gitToMindmap', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            data: data,
            credentials: 'include'
        });
        if(res.status === 401 || res.data === "Invalid Session"){
            RedirectPage(history)
            return {error:MSG.GENERIC.INVALID_SESSION};
        }
        if(res.status===200 && res.data !== "fail"){            
            return res.data;
        }
        return {error:MSG.MINDMAP.ERR_FETCH_DATA}
    }catch(err){
        console.error(err)
        return {error:MSG.MINDMAP.ERR_FETCH_DATA}
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
        if(res.status === 401 || res.data === "Invalid Session"){
            RedirectPage(history)
            return {error:MSG.GENERIC.INVALID_SESSION};
        }
        if(res.status===200 && res.data !== "fail"){            
            return res.data;
        }
        return {error:MSG.MINDMAP.ERR_FETCH_DATA}
    }catch(err){
        console.error(err)
        return {error:MSG.MINDMAP.ERR_FETCH_DATA}
    }
}

/*Component importGitMindmap
  api returns {"success":true,"data":[[{"label":"Login_c4a74fede3fe4e5eabb70b01f7b72e12","type":"task"},{"label":"Order_c4a74fede3fe4e5eabb70b01f7b72e12","type":"task"},{"label":"Logout_c4a74fede3fe4e5eabb70b01f7b72e12","type":"task"}]],"history":"W3siYWN0aW9uIjoiQ3JlYXRlZCIsInJldmlld2VyIjoiSm9obiBTbWl0aCIsImFzc2lnbmVlIjoiQW5keSBSb2dlciIsInRpbWUiOiJNb24gTWFyIDAyIDIwMjAgMTk6MjI6MDUgR01UIn0seyJhY3Rpb24iOiJQZW5kaW5nIEFwcHJvdmFsIiwiYXNzaWduZWUiOiJBbmR5IFJvZ2VyIiwicmV2aWV3ZXIiOiJKb2huIFNtaXRoIiwidGltZSI6Ik1vbiBNYXIgMDIgMjAyMCAxOTo0NzowMyBHTVQifSx7ImFjdGlvbiI6IkFwcHJvdmVkIiwiYXNzaWduZWUiOiJBbmR5IFJvZ2VyIiwicmV2aWV3ZXIiOiJKb2huIFNtaXRoIiwidGltZSI6Ik1vbiBNYXIgMDIgMjAyMCAxOTo0ODowMyBHTVQifSx7ImFjdGlvbiI6ImV4cG9ydCIsImFzc2lnbmVlIjoiVmlrcmFtIFByYWJodSIsInJldmlld2VyIjoiIiwidGltZSI6IjIwMjAtMDMtMzFUMTI6NDE6MTguMjA2WiJ9XQ=="}
*/

export const importGitMindmap = async(data) => {
    try{
        const res = await axios(url+'/importGitMindmap', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            data: data,
            credentials: 'include'
        });
        if(res.status === 401 || res.data === "Invalid Session"){
            RedirectPage(history)
            return {error:MSG.GENERIC.INVALID_SESSION};
        }
        if(res.data === "empty"){
            console.error(res.data)
            return {error:MSG.MINDMAP.ERR_VERIFY_INPUT}
        }
        if(res.data === "Invalid inputs"){
            console.error(res.data)
            return {error:MSG.MINDMAP.ERR_MODULE_EXIST}
        }
		if(res.data === "No entries"){
            console.error(res.data)
            return {error:res.data}
        }
        // if (!('testscenarios' in res.data)){
        //     console.error(res.data)
        //     return {error:MSG.MINDMAP.ERR_JSON_INCORRECT_IMPORT}
        // }else if(res.data.testscenarios.length === 0){
        //     console.error(res.data)
        //     return {error:MSG.MINDMAP.ERR_NODE_STRUCT_IMPORT}
        // }
        if(res.status===200 && res.data !== "fail"){            
            return res.data;
        }
        console.error(res.data)
        return {error:MSG.MINDMAP.ERR_IMPORT_MODULE_GIT}
    }catch(err){
        console.error(err)
        return {error:MSG.MINDMAP.ERR_IMPORT_MODULE_GIT}
    }
}

/*Component exportToGit
  api returns {"success":true,"data":[[{"label":"Login_c4a74fede3fe4e5eabb70b01f7b72e12","type":"task"},{"label":"Order_c4a74fede3fe4e5eabb70b01f7b72e12","type":"task"},{"label":"Logout_c4a74fede3fe4e5eabb70b01f7b72e12","type":"task"}]],"history":"W3siYWN0aW9uIjoiQ3JlYXRlZCIsInJldmlld2VyIjoiSm9obiBTbWl0aCIsImFzc2lnbmVlIjoiQW5keSBSb2dlciIsInRpbWUiOiJNb24gTWFyIDAyIDIwMjAgMTk6MjI6MDUgR01UIn0seyJhY3Rpb24iOiJQZW5kaW5nIEFwcHJvdmFsIiwiYXNzaWduZWUiOiJBbmR5IFJvZ2VyIiwicmV2aWV3ZXIiOiJKb2huIFNtaXRoIiwidGltZSI6Ik1vbiBNYXIgMDIgMjAyMCAxOTo0NzowMyBHTVQifSx7ImFjdGlvbiI6IkFwcHJvdmVkIiwiYXNzaWduZWUiOiJBbmR5IFJvZ2VyIiwicmV2aWV3ZXIiOiJKb2huIFNtaXRoIiwidGltZSI6Ik1vbiBNYXIgMDIgMjAyMCAxOTo0ODowMyBHTVQifSx7ImFjdGlvbiI6ImV4cG9ydCIsImFzc2lnbmVlIjoiVmlrcmFtIFByYWJodSIsInJldmlld2VyIjoiIiwidGltZSI6IjIwMjAtMDMtMzFUMTI6NDE6MTguMjA2WiJ9XQ=="}
*/

export const exportToGit = async(data) => {
    try{
        const res = await axios(url+'/exportToGit', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            data: data,
            credentials: 'include'
        });
        if(res.status === 401 || res.data === "Invalid Session"){
            RedirectPage(history)
            return {error:MSG.GENERIC.INVALID_SESSION};
        }
        else if(res.data==='empty'){
            console.error(res.data)
            return {error:MSG.MINDMAP.ERR_PROJECT_GIT_CONGIG}
        }
        else if(res.data==="unable to connect GIT"){
            console.error(res.data)
            return {error:MSG.MINDMAP.ERR_PROJECT_GIT_CON}
        }
        else if(res.data==='Error creating repository'){
            console.error(res.data)
            return {error:res.data}
        }
        else if(res.data==='"Unable to fetch Repos"'){
            console.error(res.data)
            return {error:res.data}
        }
        else if(res.data==='commit exists'){
            console.error(res.data)
            return {error:MSG.MINDMAP.ERR_GIT_COMMIT_VERSION_EXIST}
        }
        else if(res.data==='Invalid gitbranch'){
            console.error(res.data)
            return {error:MSG.MINDMAP.ERR_GIT_BRANCH_EXIST}
        }
        else if(res.data==='Invalid url'){
            console.error(res.data)
            return {error:MSG.MINDMAP.ERR_INVALID_GIT_CLONE_PATH}
        }
        else if(res.data==='Invalid token'){
            console.error(res.data)
            return {error:MSG.MINDMAP.ERR_GIT_ACCESS_TOKEN}
        }
        else if(res.data==='Invalid credentials'){
            console.error(res.data)
            return {error:MSG.MINDMAP.ERR_GIT_ACCESS_CRED}
        }
        else if(res.status===200 && res.data !== "fail"){          
            return res.data;
        }
        console.error(res.data)
        return {error:MSG.MINDMAP.ERR_EXPORT_GITT}
    }catch(err){
        console.error(err)
        return {error:MSG.MINDMAP.ERR_EXPORT_GITT}
    }
}


/*Component 
    data={
            "action": "update",
            "mindmapid": "5f50c6fddb5de734c8077f07",
            "taskdata": {},
            "priority": 0,
            "newrules": {
                "ruleid4":{
                    "groupids":[],
                    "additionalrecepients":[],
                    "actiontype":"1",
                    "targetnode": "all",
                    "actionon": null,
                    "targetnodeid": null
                },
                "ruleid5":{
                    "groupids":[],
                    "additionalrecepients":[],
                    "actiontype":"2",
                    "targetnode": "scenarios",
                    "actionon": "specific",
                    "targetnodeid": null
                }        
            },
            "updatedrules":{
            },
            "deletedrules":[""]
        }

*/

export const updateNotificationConfiguration = async(data) => {
    try{
        const res = await axios(url+'/updateNotificationConfiguration', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            data: data,
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
        return {error:MSG.MINDMAP.ERR_UPDATE_NOTIFICATION_RULES}
    }catch(err){
        console.error(err)
        return {error:MSG.MINDMAP.ERR_UPDATE_NOTIFICATION_RULES}
    }
}

/*Component 
    data={
            fetchby:"mindmapid",
            id:"id"
        }

*/

export const getNotificationConfiguration = async(data) => {
    try{
        const res = await axios(url+'/getNotificationConfiguration', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            data: data,
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
        return {error:MSG.MINDMAP.ERR_NOTIFICATION_CONFIG}
    }catch(err){
        console.error(err)
        return {error:MSG.MINDMAP.ERR_NOTIFICATION_CONFIG}
    }
}

//No payload required
export const getNotificationRules = async(data) => {
    try{
        const res = await axios(url+'/getNotificationRules', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            data: {},
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
        return {error:MSG.MINDMAP.ERR_GET_NOTIFICATION}
    }catch(err){
        console.error(err)
        return {error:MSG.MINDMAP.ERR_GET_NOTIFICATION}
    }
}

export const deleteScenario = async(data) => {
    try{
        const res = await axios(url+'/deleteScenario', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            data: data,
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
        return {error:MSG.MINDMAP.ERR_DELETE_SCENARIO}
    }catch(err){
        console.error(err)
        return {error:MSG.MINDMAP.ERR_DELETE_SCENARIO}
    }
}
export const deleteScenarioETE = async(data) => {
    try{
        const res = await axios(url+'/deleteScenarioETE', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            data: data,
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
        return {error:MSG.MINDMAP.ERR_DELETE_SCENARIO}
    }catch(err){
        console.error(err)
        return {error:MSG.MINDMAP.ERR_DELETE_SCENARIO}
    }
}
export const exportToProject = async(moduleId) => {
    try{
        const res = await axios(url+'/exportToProject', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            data: {
                mindmapId:moduleId
            },
            credentials: 'include',
        });
        if(res.status === 401 || res.data === "Invalid Session"){
            RedirectPage(history)
            return {error:MSG.GENERIC.INVALID_SESSION};
        }
        if(res.status===200 && res.data !== "fail"){            
            return res.data;
        }
        console.error(res.data)
        return {error:MSG.MINDMAP.ERR_EXPORT_MINDMAP}
    }catch(err){
        console.error(err)
        return {error:MSG.MINDMAP.ERR_EXPORT_MINDMAP}
    }
}
export const exportToMMSkel = async(data) => {
    try{
        const res = await axios(url+'/exportToMMSkel', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            data: {'data':data},
            credentials: 'include',
        });
        if(res.status === 401 || res.data === "Invalid Session"){
            RedirectPage(history)
            return {error:MSG.GENERIC.INVALID_SESSION};
        }
        if(res.status===200 && res.data !== "fail"){            
            return res.data;
        }
        console.error(res.data)
        return {error:MSG.MINDMAP.ERR_EXPORT_MINDMAP}
    }catch(err){
        console.error(err)
        return {error:MSG.MINDMAP.ERR_EXPORT_MINDMAP}
    }
}
export const jsonToMindmap = async(moduleId) => {
    try{
        const res = await axios(url+'/jsonToMindmap', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            data: {
                mindmapId:moduleId
            },
            credentials: 'include',
        });
        if(res.status === 401 || res.data === "Invalid Session"){
            RedirectPage(history)
            return {error:MSG.GENERIC.INVALID_SESSION};
        }
        if(res.status===200 && res.data !== "fail"){            
            return res.data;
        }
        console.error(res.data)
        return {error:MSG.MINDMAP.ERR_FETCH_DATA}
    }catch(err){
        console.error(err)
        return {error:MSG.MINDMAP.ERR_FETCH_DATA}
    }
}
export const singleExcelToMindmap = async(data) => {
    try{
        const res = await axios(url+'/singleExcelToMindmap', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            data: {'data':data},
            credentials: 'include'
        });
        if(res.status === 401 || res.data === "Invalid Session"){
            RedirectPage(history)
            return {error:MSG.GENERIC.INVALID_SESSION};
        }
        else if (res.data == 'valueError') {
            return {error : MSG.MINDMAP.ERR_EMPTY_COL}
        }
        else if (res.data == 'Multiple modules') {
            return {error : MSG.MINDMAP.ERR_MULTI_MOD}
        }  
        else if (res.data == "emptySheet" || res.data == 'fail') {
            return {error : MSG.MINDMAP.ERR_EXCEL_SHEET}
        }
        else if(res.status===200 && res.data !== "fail"){            
            return res.data;
        }
        console.error(res.data)
        return {error:MSG.MINDMAP.ERR_INVALID_EXCEL_DATA}
    }catch(err){
        console.error(err)
        return {error:MSG.MINDMAP.ERR_INVALID_EXCEL_DATA}
    }
}
export const checkExportVer = async(data) => {
    try{
        const res = await axios(url+'/checkExportVer', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            data: data,
            credentials: 'include'
        });
        if(res.status === 401 || res.data === "Invalid Session"){
            RedirectPage(history)
            return {error:MSG.GENERIC.INVALID_SESSION};
        }
        if(res.status===200 && res.data !== "fail"){            
            return res.data;
        }
        return {error:MSG.MINDMAP.ERR_FETCH_DATA}
    }catch(err){
        console.error(err)
        return {error:MSG.MINDMAP.ERR_FETCH_DATA}
    }
}