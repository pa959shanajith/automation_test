import axios from 'axios';
const url = "https://"+window.location.hostname+":8443";

export const GetScrapeDataScreenLevel_ICE = async(_CT) => {
    try{
            var screenId = _CT.screenId;
			var projectId = _CT.projectId;
            var testCaseId = _CT.testCaseId;
            var type = _CT.appType;
            
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
        if(res.status===200){
            return res.data;
        }else{
            console.error(res.status)
        }
    }catch(err){
        console.error(err)
    }
}

export const updateScreen_ICE = async(scrapeObject) => {
    try{
        const res = await axios(url+'/updateScreen_ICE', {
            method: 'POST',
            headers: {
            'Content-type': 'application/json',
            },
           data: { //updateScreen_ice
               scrapeObject: scrapeObject
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

export const initScraping_ICE = async(browser) => {
    try{
        const res = await axios(url+'/initScraping_ICE', {
            method: 'POST',
            headers: {
            'Content-type': 'application/json',
            },
           data: {
               param : 'initScraping_ICE',
               screenViewObject:{
                browserType: browser
               }
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

