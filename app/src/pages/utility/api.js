import axios from 'axios';
import {RedirectPage, Messages as MSG} from '../global'
import {history} from './index'
import {url} from '../../App';
import async from 'async';

/*Component Encrypt_ICE
  use: gets the Encrypted Value of the users Input based on encryption type also given by user only
  api returns : value
*/
export const Encrypt_ICE = async(encryptionType ,encryptionValue) => {
    try{
        const res = await axios(url+'/Encrypt_ICE', {
            method: 'POST',
            headers: {
            'Content-type': 'application/json',
            },
           data: {
            encryptionType: encryptionType,
            encryptionValue: encryptionValue,
            param : 'Encrypt_ICE'
           }
        });
        if(res.status === 401 || res.data === "Invalid Session"){
            RedirectPage(history)
            return {error:MSG.GENERIC.INVALID_SESSION}
        }
        if(res.status===200 && res.data !== "fail"){            
            return res.data;
        }
        console.error(res.data)
        return {error:MSG.UTILITY.ERR_ENCRYPT}
    }catch(err){
        console.error(err)
        return {error:MSG.UTILITY.ERR_ENCRYPT}
    }
}


export const fetchMetrics = async(arg) => {
    try{
        const res = await axios(url+'/getExecution_metrics', {
            method: 'POST',
            headers: {
                'Content-type': 'application/json',
            },
            data: {
                metrics_data : arg
            }
        });
        if(res.status === 401 || res.data === "Invalid Session"){
            RedirectPage(history)
            return {error:MSG.GENERIC.INVALID_SESSION}
        }
        if(res.status===200 && res.data !== "fail"){            
            return res.data;
        }
        console.error(res.data)
        return {error:MSG.UTILITY.ERR_FAIL_FETCH}
    }catch(err){
        console.error(err)
        return {error:MSG.UTILITY.ERR_FAIL_FETCH}
    }
}

export const createDataTable = async(arg) => {
    try{
        const res = await axios(url+'/manageDataTable', {
            method: 'POST',
            headers: {
                'Content-type': 'application/json',
            },
            data: {
                action: "create",
                name: arg.tableName,
                dtheaders: arg.headers,
                datatable: arg.data,
            }
        });
        if(res.status === 401){
            RedirectPage(history)
            return {error:MSG.GENERIC.INVALID_SESSION}
        }
        if(res.status === 200 && res.data !== "fail"){            
            return res.data;
        }
        console.error(res.data)
        return { error:MSG.UTILITY.ERR_CREATE_TADATABLE}
    }catch(err){
        console.error(err)
        return {error:MSG.UTILITY.ERR_CREATE_TADATABLE}
    }
}

export const editDataTable = async(arg) => {
    try{
        const res = await axios(url+'/manageDataTable', {
            method: 'POST',
            headers: {
                'Content-type': 'application/json',
            },
            data: {
                action: "edit",
                name: arg.tableName,
                dtheaders: arg.headers,
                datatable: arg.data,
            }
        });
        if(res.status === 401){
            RedirectPage(history)
            return {error:MSG.GENERIC.INVALID_SESSION}
        }
        if(res.status === 200 && res.data !== "fail"){            
            return res.data;
        }
        console.error(res.data)
        return { error:MSG.UTILITY.ERR_EDIT_DATATABLE}
    }catch(err){
        console.error(err)
        return {error:MSG.UTILITY.ERR_EDIT_DATATABLE}
    }
}

export const confirmDeleteDataTable = async(tableName) => {
    try{
        const res = await axios(url+'/manageDataTable', {
            method: 'POST',
            headers: {
                'Content-type': 'application/json',
            },
            data: {
                action: "deleteConfirm",
                name: tableName
            }
        });
        if(res.status === 401){
            RedirectPage(history)
            return {error:MSG.GENERIC.INVALID_SESSION}
        }
        if(res.status === 200 && res.data !== "fail"){            
            return res.data;
        }
        console.error(res.data)
        return { error:MSG.UTILITY.ERR_CONFIRM_DATATABLE}
    }catch(err){
        console.error(err)
        return {error:MSG.UTILITY.ERR_CONFIRM_DATATABLE}
    }
}

export const deleteDataTable = async(tableName) => {
    try{
        const res = await axios(url+'/manageDataTable', {
            method: 'POST',
            headers: {
                'Content-type': 'application/json',
            },
            data: {
                action: "delete",
                name: tableName
            }
        });
        if(res.status === 401){
            RedirectPage(history)
            return {error:MSG.GENERIC.INVALID_SESSION}
        }
        if(res.status === 200 && res.data !== "fail"){            
            return res.data;
        }
        console.error(res.data)
        return { error:MSG.UTILITY.ERR_DELETE_DATATABLE}
    }catch(err){
        console.error(err)
        return {error:MSG.UTILITY.ERR_DELETE_DATATABLE}
    }
}

export const fetchDataTables = async() => {
    try{
        const res = await axios(url+'/getDatatableDetails', {
            method: 'POST',
            headers: {
                'Content-type': 'application/json',
            },
            data: {
                action: "datatablenames"
            }
        });
        if(res.status === 401){
            RedirectPage(history)
            return {error:MSG.GENERIC.INVALID_SESSION}
        }
        if(res.status === 200 && res.data !== "fail"){            
            return res.data;
        }
        console.error(res.data)
        return { error:MSG.UTILITY.ERR_FETCH_DATATABLES}
    }catch(err){
        console.error(err)
        return {error:MSG.UTILITY.ERR_FETCH_DATATABLES}
    }
}

export const fetchDataTable = async(tableName) => {
    try{
        const res = await axios(url+'/getDatatableDetails', {
            method: 'POST',
            headers: {
                'Content-type': 'application/json',
            },
            data: {
                action: "datatable",
                name: tableName,
            }
        });
        if(res.status === 401){
            RedirectPage(history)
            return {error:MSG.GENERIC.INVALID_SESSION}
        }
        if(res.status === 200 && res.data !== "fail"){            
            return res.data;
        }
        console.error(res.data)
        return { error:MSG.UTILITY.ERR_FETCH_DATATABLES}
    }catch(err){
        console.error(err)
        return {error:MSG.UTILITY.ERR_FETCH_DATATABLES}
    }
}

export const exportDataTable = async(arg) => {
    try{
        var apiUrl = "exportToDtCSV";
        let excelType = "";
        switch(arg.exportFormat.toLowerCase()){
            case "csv": apiUrl = "exportToDtCSV"; break;
            case "xlsx": excelType = "xlsx"; apiUrl = "exportToDtExcel"; break;
            case "xls": excelType = "xls"; apiUrl = "exportToDtExcel"; break;
            case "xml": apiUrl = "exportToDtXML"; break;
            default: break;
        }
        const res = await axios(`${url}/${apiUrl}`, {
            method: 'POST',
            headers: {
                'Content-type': 'application/json',
            },
            data: {
                name: arg.tableName,
                filename: arg.filename,
                excelType: excelType
            },
            credentials: 'include',
            responseType:'arraybuffer'
        });
        if(res.status === 401){
            RedirectPage(history)
            return {error:MSG.GENERIC.INVALID_SESSION}
        }
        if(res.status === 200 && res.data !== "fail"){            
            return res.data;
        }
        console.error(res.data)
        return { error:MSG.UTILITY.ERR_FETCH_DATATABLES}
    }catch(err){
        console.error(err)
        return {error:MSG.UTILITY.ERR_FETCH_DATATABLES}
    }
}


export const importDataTable = async(arg) => {
    try{
        var apiUrl = "importDtFromCSV";
        switch(arg.importFormat.toLowerCase()){
            case "csv": apiUrl = "importDtFromCSV"; break;
            case "excel": apiUrl = "importDtFromExcel"; break;
            case "xml": apiUrl = "importDtFromXML"; break;
            default: break;
        }

        let apiBody =  null;
        if (arg.flag === "")
            apiBody = { content: arg.content };
        else if(arg.flag === "sheetname")
            apiBody = { content: arg.content, flag: "sheetname" }
        else 
            apiBody = { content: arg.content, flag: arg.flag, sheetname: arg.sheetname };
        
        if(arg.importFormat.toLowerCase() == "xml") {
            apiBody['row'] = arg.row;
            apiBody['column'] = arg.column;
        }

        const res = await axios(`${url}/${apiUrl}`, {
            method: 'POST',
            headers: {
                'Content-type': 'application/json',
            },
            data: apiBody
        });
        if(res.status === 401){
            RedirectPage(history)
            return {error:MSG.GENERIC.INVALID_SESSION}
        }
        if(res.status === 200 && res.data !== "fail"){            
            return res.data;
        }
        console.error(res.data)
        return { error:MSG.UTILITY.ERR_IMPORT}
    }catch(err){
        console.error(err)
        return {error:MSG.UTILITY.ERR_IMPORT}
    }
}

export const fetchProjects = async(data) => {
    try{
        const res = await axios(url+'/fetchProjects', {
            method: 'POST',
            headers: {
            'Content-type': 'application/json',
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
        return {error:MSG.MINDMAP.ERR_FETCH_PROJECT}
    }catch(err){
        console.error(err)
        return {error:MSG.MINDMAP.ERR_FETCH_PROJECT}
    }
}

export const fetchModules = async(props) => {
    try{
        const res = await axios(url+'/fetchModules', {
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

export const getPools = async(data) => { 
    try{
        const res = await axios(url+'/getPools', {
            method: 'POST',
            headers: {
            'Content-type': 'application/json',
            },
            data: data,
            credentials: 'include'
        });
        if(res.status === 401 || res.data === "Invalid Session"){
            RedirectPage(history)
            return {error:MSG.GENERIC.INVALID_SESSION};
        }
        if(res.status===200 && res.data !== "fail"){ 
            if(res.data === 'empty' || Object.keys(res.data).length<1) return {val:"empty",error:MSG.ADMIN.ERR_NO_ICEPOOL}           
            return res.data;
        }
        console.error(res.data)
        return {error:MSG.GENERIC.ERR_FETCH_POOLS}
    }catch(err){
        console.error(err)
        return {error:MSG.GENERIC.ERR_FETCH_POOLS}
    }
}

export const storeConfigureKey = async(props) => {
    try{
        const res = await axios(url+'/storeConfigureKey', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            data: {"executionData":props},
            credentials: 'include'
        });
        if(res.status===200 && res.data !== "fail"){
            return res.data;
        }else if(res.status === 401 || res.data === "Invalid Session"){
            RedirectPage(history)
            return {error:MSG.GENERIC.INVALID_SESSION};
        }
        console.log(res.data + '  408')
        return {error:MSG.MINDMAP.ERR_FETCH_MODULES}
    }catch(err){
        console.error(err)
        return {error:MSG.MINDMAP.ERR_FETCH_MODULES}
    }
}
export const execAutomation = async(props) => {
    try{
        console.log(props)
        const res = await axios(url+'/execAutomation', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            data: {"key":props},
            credentials: 'include'
        });
        if(res.status===200 && res.data !== "fail"){
            return res.data;
        }else if(res.status === 401 || res.data === "Invalid Session"){
            RedirectPage(history)
            return {error:MSG.GENERIC.INVALID_SESSION};
        }
        console.log(res.data + '  408')
        return {error:MSG.MINDMAP.ERR_FETCH_MODULES}
    }catch(err){
        console.error(err)
        return {error:MSG.MINDMAP.ERR_FETCH_MODULES}
    }
}

export const getExecScenario = async(props) => {
    try{
        console.log(props)
        const res = await axios(url+'/getExecScenario', {
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
        console.log(res.data + '  408')
        return {error:MSG.MINDMAP.ERR_FETCH_MODULES}
    }catch(err){
        console.error(err)
        return {error:MSG.MINDMAP.ERR_FETCH_MODULES}
    }
}

export const getAgentTask = async(props) => {
    try{
        const res = await axios(url+'/getAgentTask', {
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

export const fetchConfigureList = async(props) => {
    console.log(props);
    try{
        const res = await axios(url+'/getConfigureList', {
            method: 'POST',
            headers: {
                'Content-type': 'application/json',
            },
            data: {
                action: "configurelist",
                'projectid': props.projectid
            }
        });
        if(res.status === 401){
            RedirectPage(history)
            return {error:MSG.GENERIC.INVALID_SESSION}
        }
        if(res.status === 200 && res.data !== "fail"){            
            return res.data;
        }
        console.error(res.data)
        return { error:MSG.UTILITY.ERR_FETCH_DATATABLES}
    }catch(err){
        console.error(err)
        return {error:MSG.UTILITY.ERR_FETCH_DATATABLES}
    }
}

export const fetchAvoAgentAndAvoGridList = async(props) => {
    try{
        const res = await axios(url+'/getAvoAgentAndAvoGridList', {
            method: 'POST',
            headers: {
                'Content-type': 'application/json',
            },
            data:props
        });
        if(res.status === 401){
            RedirectPage(history)
            return {error:MSG.GENERIC.INVALID_SESSION}
        }
        if(res.status === 200 && res.data !== "fail"){            
            return res.data;
        }
        console.error(res.data)
        return { error:MSG.UTILITY.ERR_FETCH_DATATABLES}
    }catch(err){
        console.error(err)
        return {error:MSG.UTILITY.ERR_FETCH_DATATABLES}
    }
}

export const deleteConfigureKey = async(props) => {
    try{
        const res = await axios(url+'/deleteConfigureKey', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            data: {"key":props},
            credentials: 'include'
        });
        if(res.status===200 && res.data !== "fail"){
            return res.data;
        }else if(res.status === 401 || res.data === "Invalid Session"){
            RedirectPage(history)
            return {error:MSG.GENERIC.INVALID_SESSION};
        }
        console.log(res.data + '  408')
        return {error:MSG.MINDMAP.ERR_FETCH_MODULES}
    }catch(err){
        console.error(err)
        return {error:MSG.MINDMAP.ERR_FETCH_MODULES}
    }
}

export const setExecStatus = async(props) => {
    try{
        const res = await axios(url+'/setExecStatus', {
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

export const fetchModuleListDevopsReport = async(props) => {
    try{
        const res = await axios(url+'/fetchModuleListDevopsReport', {
            method: 'POST',
            headers: {
                'Content-type': 'application/json',
            },
            data:props
        });
        if(res.status === 401){
            RedirectPage(history)
            return {error:MSG.GENERIC.INVALID_SESSION}
        }
        if(res.status === 200 && res.data !== "fail"){            
            return res.data;
        }
        console.error(res.data)
        return { error:MSG.UTILITY.ERR_FETCH_DATATABLES}
    }catch(err){
        console.error(err)
        return {error:MSG.UTILITY.ERR_FETCH_DATATABLES}
    }
}



/*Component  ExecuteContent
  api returns  string - success/fail
*/

export const updateAccessibilitySelection = async(suiteInfo) => { 
    try{
        const res = await axios(url+'/updateAccessibilitySelection', {
            method: 'POST',
            headers: {
            'Content-type': 'application/json',
            },
            data: suiteInfo,
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
        return {error:MSG.EXECUTE.ERR_SAVE_ACCESSIBILITY}
    }catch(err){
        console.error(err)
        return {error:MSG.EXECUTE.ERR_SAVE_ACCESSIBILITY}
    }
}
export const getQueueState = async(data) => {
    try{
        const res = await axios(url+'/getQueueState', {
            method: 'GET',
            credentials: 'include'
        });

        if(res.status===200 && res.data !== "fail"){            
            return res.data;
        }else if(res.status===200 && res.data === "fail"){            
            return {error : MSG.GLOBAL.ERR_SOMETHING_WRONG};
        }
        else if(res.status === 401 || res.data === "Invalid Session"){
            return {error:MSG.GENERIC.INVALID_SESSION};
        }
        return {error:MSG.GLOBAL.ERR_SOMETHING_WRONG}
    }catch(err){
        return {error:MSG.GLOBAL.ERR_SOMETHING_WRONG}
    }
}

export const deleteExecutionListId = async(props) => {
    try{
            const res = await axios(url+'/deleteExecutionListId', {
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
        return {error:MSG.MINDMAP.ERR_FETCH_MODULES}
    }catch(err){
        console.error(err)
        return {error:MSG.MINDMAP.ERR_FETCH_MODULES}
    }
}

export const saveSauceLabData = async(props) => {
    try{
            const res = await axios(url+'/saveSauceLabData', {
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
        return {error:MSG.MINDMAP.ERR_FETCH_MODULES}
    }catch(err){
        console.error(err)
        return {error:MSG.MINDMAP.ERR_FETCH_MODULES}
    }
}

export const sendMailOnExecutionStart = async (senderEmailAddress, recieverEmailAddress, executionData, profileName) => {
    try {
        const result = await axios(url + '/sendMailOnExecutionStart', {
            method: 'POST',
            headers: {
                'Content-type': 'application/json',
            },
            data: {
                senderEmailAddress: senderEmailAddress,
                recieverEmailAddress: recieverEmailAddress,
                executionData: executionData,
                profileName: profileName,
                startDate: new Date().getFullYear() + "-" + ("0" + (new Date().getMonth() + 1)).slice(-2) + "-" + ("0" + new Date().getDate()).slice(-2) + " " + ("0" + new Date().getHours()).slice(-2) + ":" + ("0" + new Date().getMinutes()).slice(-2) + ":" + ("0" + new Date().getSeconds()).slice(-2)
           }
        });

        if(result.status===200 && result.data !== "fail"){
            return result.data;
        }
        else if(result.status === 401 || result.data === "Invalid Session"){
            RedirectPage(history)
            return {error:MSG.GENERIC.INVALID_SESSION};
        }
        return {error:MSG.GLOBAL.ERR_SEND_EMAIL}
    }
    catch(error) {
        console.error(error)
        return {error:MSG.GLOBAL.ERR_SEND_EMAIL}
    }
}