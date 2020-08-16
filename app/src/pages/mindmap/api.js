import axios from 'axios';
const url = 'https://127.0.0.1:8443';


/*Component populateProjects
  use: 
  api returns { appType : [],appTypeName:[],cycles:{},domains:[],projectId:[],projectName:[],projecttypes:{},releases:[]}
  todo : add url from env or store and error handling 
*/

export const populateProjects = async() => {
    try{
        const res = await axios(url+'/populateProjects', {
            method: 'POST',
            headers: {
            'Accept': 'application/json'
            },
            body: JSON.stringify({"action":"populateProjects"}),
            credentials: 'include'
        });
        if(res.status=200){
            return res.data;
        }else{
            console.error(res.status)
        }
    }catch(err){
        console.error(err)
    }
}