import axios from 'axios';
import {RedirectPage, Messages as MSG} from '../global'
import {history} from './index'
import {url} from '../../App';

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