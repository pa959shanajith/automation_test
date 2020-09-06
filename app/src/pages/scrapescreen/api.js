import axios from 'axios';
const url = 'https://127.0.0.1:8443';

export const GetScrapeDataScreenLevel_ICE = async() => {
    try{
            var screenId = JSON.parse(localStorage.getItem('user'))[1].screenId;
			var projectId = JSON.parse(localStorage.getItem('user'))[1].projectId;
            var testCaseId = JSON.parse(localStorage.getItem('user'))[1].testCaseId;
            var type = JSON.parse(localStorage.getItem('user'))[1].appType;
            
        const res = await axios(url+'/getScrapeDataScreenLevel_ICE', {
            method: 'POST',
            headers: {
            'Content-type': 'application/json',
            },
           data: {
            param : 'getScrapeDataScreenLevel_ICE',
				screenId : screenId,
				projectId : projectId,
				type:type,
				testCaseId:testCaseId
           }
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
