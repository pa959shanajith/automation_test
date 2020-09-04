import axios from 'axios';
const url = 'https://'+window.location.hostname+':8443';


/*Component getProjectList
  use: 
  api returns { appType : [],appTypeName:[],cycles:{},domains:[],projectId:[],projectName:[],projecttypes:{},releases:[]}
  todo : add url from env or store and error handling 
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
        if(res.status===200){
            return res.data;
        }else{
            console.error(res.status)
            return;
        }
    }catch(err){
        console.error(err)
        return;
    }
}

/*Component getProjectType
  api returns {projectType: "", project_id: "", projectid: "", project_typename: "", releases: []}
  todo : add url from env or store and error handling 
*/

export const getProjectType = async(projectId) => {
    try{
        const res = await axios(url+'/getProjectTypeMM', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            data: {"action":"getProjectTypeMM",projectId:projectId},
            credentials: 'include'
        });
        if(res.status===200){
            return res.data;
        }else{
            console.error(res.status)
            return;
        }
    }catch(err){
        console.error(err)
        return;
    }
}

/*Component getProjectType
  api returns {projectType: "", project_id: "", projectid: "", project_typename: "", releases: []}
  todo : add url from env or store and error handling 
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
        if(res.status===200){
            return res.data;
        }else{
            console.error(res.status)
            return;
        }
    }catch(err){
        console.error(err)
        return;
    }
}

/*Component getScreens
  api returns {projectType: "", project_id: "", projectid: "", project_typename: "", releases: []}
  todo : add url from env or store and error handling 
*/

export const getScreens = async(projectId) => {
    try{
        const res = await axios(url+'/getScreens', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            data: {"action":"getProjectTypeMM",projectId:projectId},
            credentials: 'include'
        });
        if(res.status===200){
            return res.data;
        }else{
            console.error(res.status)
            return;
        }
    }catch(err){
        console.error(err)
        return;
    }
}