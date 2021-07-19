import axios from 'axios';
import {RedirectPage, Messages as MSG} from '../global'
import {history} from './index'
import {url} from '../../App'

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
        if(res.status === 401 || res.data === "Invalid Session"){
            RedirectPage(history)
            return {error:MSG.GENERIC.INVALID_SESSION};
        }
        if(res.status===200 && res.data !== "fail"){            
            return res.data;
        }
        console.error(res.data)
        return {error:MSG.PROFJ.ERR_FETCH_RESULTS}
    }catch(err){
        console.error(err)
        return {error:MSG.PROFJ.ERR_FETCH_RESULTS}
    }
}