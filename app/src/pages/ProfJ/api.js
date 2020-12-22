import axios from 'axios';
const url = "https://"+window.location.hostname+":8443";

/*Component getTopMatches_ProfJ
  use: gets the Reply of ChatBot on Sending UserQuery
  api returns [[0:Number , 1: Reply Message , 2: Number(link)]]
*/
export const getTopMatches_ProfJ = async(userQuery) => {
    try{
        const res = await axios(url+'/getTopMatches_ProfJ', {
            method: 'POST',
            headers: {
            'Content-type': 'application/json',
            },
           data: {
            userQuery : userQuery,
            param : 'getTopMatches_ProfJ'
           }
        });
        if(res.status===200){
            return res.data;
        }else{
            console.error(res.status)
        }
    }catch(err){
        console.error(err)
    }
}