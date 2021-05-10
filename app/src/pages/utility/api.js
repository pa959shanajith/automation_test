import axios from 'axios';
import {RedirectPage} from '../global'
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
            return {error:'invalid session'};
        }
        if(res.status===200 && res.data !== "fail"){            
            return res.data;
        }
        console.error(res.data)
        return {error:'Failed to Encrypt'}
    }catch(err){
        console.error(err)
        return {error:'Failed to Encrypt'}
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
            return {error:'invalid session'};
        }
        if(res.status===200 && res.data !== "fail"){            
            return res.data;
        }
        console.error(res.data)
        return {error:'Failed to Fetch'}
    }catch(err){
        console.error(err)
        return {error:'Failed to Fetch'}
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
                datatablename: arg.tableName,
                dtheaders: arg.headers,
                datatable: arg.data,
            }
        });
        if(res.status === 401){
            RedirectPage(history)
            return { error: 'invalid session' };
        }
        if(res.status === 200 && res.data !== "fail"){            
            return res.data;
        }
        console.error(res.data)
        return { error:'Failed to create DataTable' }
    }catch(err){
        console.error(err)
        return {error:'Failed to create DataTable'}
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
                datatablename: arg.tableName,
                dtheaders: arg.headers,
                datatable: arg.data,
            }
        });
        if(res.status === 401){
            RedirectPage(history)
            return { error: 'invalid session' };
        }
        if(res.status === 200 && res.data !== "fail"){            
            return res.data;
        }
        console.error(res.data)
        return { error:'Failed to edit DataTable' }
    }catch(err){
        console.error(err)
        return {error:'Failed to edit DataTable'}
    }
}

export const confirmDeleteDataTable = async(arg) => {
    try{
        const res = await axios(url+'/manageDataTable', {
            method: 'POST',
            headers: {
                'Content-type': 'application/json',
            },
            data: {
                action: "deleteConfirm",
                datatablename: arg.tableName
            }
        });
        if(res.status === 401){
            RedirectPage(history)
            return { error: 'invalid session' };
        }
        if(res.status === 200 && res.data !== "fail"){            
            return res.data;
        }
        console.error(res.data)
        return { error:'Failed to confirm delete DataTable' }
    }catch(err){
        console.error(err)
        return {error:'Failed to confirm delete DataTable'}
    }
}

export const deleteDataTable = async(arg) => {
    try{
        const res = await axios(url+'/manageDataTable', {
            method: 'POST',
            headers: {
                'Content-type': 'application/json',
            },
            data: {
                action: "delete",
                datatablename: arg.tableName
            }
        });
        if(res.status === 401){
            RedirectPage(history)
            return { error: 'invalid session' };
        }
        if(res.status === 200 && res.data !== "fail"){            
            return res.data;
        }
        console.error(res.data)
        return { error:'Failed to delete DataTable' }
    }catch(err){
        console.error(err)
        return {error:'Failed to delete DataTable'}
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
            return { error: 'invalid session' };
        }
        if(res.status === 200 && res.data !== "fail"){            
            return res.data;
        }
        console.error(res.data)
        return { error:'Failed to Fetch DataTables' }
    }catch(err){
        console.error(err)
        return {error:'Failed to Fetch DataTables'}
    }
}

export const fetchDataTable = async(arg) => {
    try{
        const res = await axios(url+'/getDatatableDetails', {
            method: 'POST',
            headers: {
                'Content-type': 'application/json',
            },
            data: {
                action: "datatable",
                datatablename: arg.tableName,
            }
        });
        if(res.status === 401){
            RedirectPage(history)
            return { error: 'invalid session' };
        }
        if(res.status === 200 && res.data !== "fail"){            
            return res.data;
        }
        console.error(res.data)
        return { error:'Failed to Fetch DataTables' }
    }catch(err){
        console.error(err)
        return {error:'Failed to Fetch DataTables'}
    }
}