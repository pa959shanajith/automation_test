import axios from 'axios';
import {url} from '../../App';
import {  Messages as MSG } from '../global'

/*Component TaskSection
  api returns {"appType":[""],"appTypeName":[""],"cycles":{"":[""]},"domains":[],"projectId":[],"projectName":[],"projecttypes":{},"releases":[[{"cycles":[{"_id":"","name":""}],"name":""}]]}
*/
export const getProjectIDs = () => {
    return new Promise((resolve, reject)=> {
        axios(url+"/getProjectIDs", {
            method: 'POST',
            headers : {
                'Content-type' : 'application/json'
            },
            data : {'action': 'getProjectIDs', 'allflag': true},
            credentials : 'include',
        })
        .then(res=>{
            if (res.status === 200){
                resolve(res.data);
            }
            else{
                reject(res.status)
            }
        })
        .catch(err => {
            reject(err);
        })
    })
}


/*Component TaskSection
  api returns {"appType":"","projectId":"","screenId":"","screenName":"","testCaseId":"","versionnumber":int,"testCaseName":"","scenarioId":"","scenarioName":"","assignedTestScenarioIds":[],"taskDetails":[{"taskName":"","taskDescription":"","taskType":"","subTaskType":"","subTaskId":"","assignedTo":"","reviewer":"","startDate":"","expectedEndDate":"","batchTaskIDs":[""],"status":"","reuse":"","releaseid":"","cycleid":""}],"testSuiteDetails":[{"assignedTime":"","releaseid":"","cycleid":"","testsuiteid":"","testsuitename":"","projectidts":"","assignedTestScenarioIds":"","subTaskId":""}],"scenarioFlag":"","releaseid":"","cycleid":""}
*/
export const getTaskJson_mindmaps = obj => {
    return new Promise((resolve, reject) => {
        axios(url+"/getTaskJson_mindmaps", {
            method: 'POST',
            headers : {
                'Content-type' : 'application/json'
            },
            data : {'action': 'getTaskJson_mindmaps', 'obj': obj},
            credentials : 'include',
        })
        .then(res=>{
            if (res.status === 200){
                resolve(res.data);
            }
            else{
                reject(res.status)
            }
        })
        .catch(err => {
            reject(err);
        })
    });
}


export const getMappedDiscoverUser = async(data) => {
    try{
        const res = await axios(url+'/getMappedDiscoverUser', {
            method: 'GET',
            credentials: 'include'
        });

        if(res.status===200 && res.data !== "fail"){            
            return res.data;
        }else if(res.status===200 && res.data === "fail"){            
            return {error : MSG.PLUGIN.ERR_UNMAPPED_DISCOVER_USER};
        }
        else if(res.status === 401 || res.data === "Invalid Session"){
            return {error:MSG.GENERIC.INVALID_SESSION};
        }
        return {error:MSG.PLUGIN.ERR_FETCHING_DISCOVER_USER}
    }catch(err){
        return {error:MSG.PLUGIN.ERR_FETCHING_DISCOVER_USER}
    }
}
