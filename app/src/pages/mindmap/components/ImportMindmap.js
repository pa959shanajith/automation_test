import React, { useRef, Fragment, useState, useEffect } from 'react';
import {excelToMindmap, getProjectList, getModules, getScreens, importMindmap , pdProcess, importGitMindmap} from '../api';
import {ModalContainer, Messages as MSG } from '../../global'
import { parseProjList, getApptypePD, getJsonPd} from '../containers/MindmapUtils';
import { useDispatch } from 'react-redux';
import * as actionTypes from '../state/action';
import PropTypes from 'prop-types';
import '../styles/ImportMindmap.scss'



const ImportMindmap = ({setImportPop,setBlockui,displayError,setOptions}) => {
    const [projList,setProjList] = useState({})
    const [error,setError] = useState('')
    const [submit,setSubmit] = useState(false)
    useEffect(()=>{
        (async()=>{
            setBlockui({show:true,content:'Loading ...'})
            var res = await getProjectList()
            if(res.error){displayError(res.error);return;}
            var data = parseProjList(res)
            setProjList(data)
            setBlockui({show:false})
        })()
    },[]) 
    if(!Object.keys(projList).length >0) return null
    return(
        <ModalContainer 
        modalClass = 'modal-md'
        title='Import Mindmap'
        close={()=>setImportPop(false)}
        footer={<Footer error={error} setSubmit={setSubmit}/>}
        content={<Container submit={submit} setSubmit={setSubmit} displayError={displayError} setOptions={setOptions} projList={projList} setImportPop={setImportPop} setError={setError} setBlockui={setBlockui} displayError={displayError}/>} 
      />
    )
}

const Container = ({projList,setBlockui,displayError,setError,setSubmit,submit,setOptions,setImportPop}) => {
    const dispatch = useDispatch()
    const ftypeRef = useRef()
    const uploadFileRef = useRef()
    const projRef = useRef()
    const gitconfigRef = useRef()
    const gitBranchRef = useRef()
    const gitVerRef = useRef()
    const gitPathRef = useRef()
    const sheetRef = useRef()
    const [importType,setImportType] = useState(undefined)
    const [fileUpload,setFiledUpload] = useState(undefined)
    const [sheetList,setSheetList] = useState([])
    const upload = () => {
        setError('')
        setFiledUpload(undefined)
        uploadFile({setBlockui,projList,uploadFileRef,setSheetList,setError,setFiledUpload})
    }
    const changeImportType = (e) => {
        setSheetList([])
        setFiledUpload(undefined)
        setImportType(e.target.value)
        setError('')
        if(uploadFileRef.current)uploadFileRef.current.value = ''
    }
    const acceptType = {
        pd:".pd",
        excel:".xls,.xlsx",
        git:".mm",
        json:".mm",
		sel:".sel"
    }
    useEffect(()=>{
        if(submit){
            setSubmit(false)
            setError('')
            var err = validate({importType,ftypeRef,uploadFileRef,projRef,gitconfigRef,gitBranchRef,gitVerRef,gitPathRef,sheetRef})
            if(err){
                return;
            }
            var importData = fileUpload;
            (async()=>{
                if(importType === 'git'){
                    setBlockui({content:'Importing ...',show:true})
                    var data = await importGitMindmap ({
                        projectid : projRef.current.value,
                        gitname : gitconfigRef.current.value,
                        gitbranch : gitBranchRef.current.value,
                        gitversion : gitVerRef.current.value,
                        gitfolderpath : gitPathRef.current.value
                    })
                    if(data.error){
                        if(data.error === 'No entries'){
                            const projectname = projRef.current[projRef.current.selectedIndex].text;
                            data.error = 'Module does not belong to project '+projectname;
                        }
                        setImportPop(false);
                        displayError(data.error);
                        return;
                    }
                    var importProj = data.projectid
                    if(!importProj || !projList[importProj]){
                        displayError(MSG.MINDMAP.WARN_PROJECT_ASSIGN_USER)
                        return;
                    }
                    var res = await importMindmap(data)
                    if(res.error){setError(res.error);setBlockui({show:false});return;}
                    var req={
                        tab:"tabCreate",
                        projectid:data.projectid,
                        version:0,
                        cycId: null,
                        moduleid:res._id
                    }
                    var res = await getModules(req)
                    if(res.error){displayError(res.error);return;}
                    importData = res
                    setBlockui({show:false})
                }
                loadImportData({
                    importType,
                    importData, 
                    importProj:projRef.current ? projRef.current.value: undefined,
                    sheet:sheetRef.current? sheetRef.current.value: undefined,
                    dispatch:dispatch,
                    displayError:displayError,
                    setBlockui:setBlockui,
                    setOptions:setOptions,
                    setImportPop:setImportPop,
                    changeImportType:changeImportType
                })
            })()
        }
    },[submit])
    return(
        <div data-test='mp__import-popup' className = 'mp__import-popup'>
            <div>
                <label>Import As: </label>
                <select className='imp-inp' defaultValue={'def-val'} onChange={changeImportType} ref={ftypeRef}>
                    <option value={'def-val'} disabled>Select Import Format</option>
                    <option value={'pd'}>AvoDiscovery (.pd)</option>
                    <option value={'excel'}>Excel Workbook (.xls,.xlsx)</option>
                    <option value={'git'}>Git (.mm)</option>
                    <option value={'json'}>MindMap (.mm)</option>
					<option value={'sel'}>Selenium to AVO (.sel)</option>
                </select>
            </div>
            {importType &&
                <Fragment>
                    {(importType==='git')?
                        <Fragment>
                            <div>
                                <label>Project: </label>
                                <select className='imp-inp' defaultValue={'def-val'} ref={projRef}>
                                    <option value={'def-val'} disabled>Select Project</option>
                                    {Object.entries(projList).map((e,i)=>
                                    <option value={e[1].id} key={i}>{e[1].name}</option>
                                )}
                                </select>
                            </div>
                            <div>
                                <label>Git Configuration: </label>
                                <input onChange={(e)=>e.target.value=e.target.value.replaceAll(" ","")} placeholder={'Git configuration name'} ref={gitconfigRef}/>
                            </div>
                            <div>
                                <label>Git Branch: </label>
                                <input onChange={(e)=>e.target.value=e.target.value.replaceAll(" ","")} placeholder={'Branch name'} ref={gitBranchRef}/>
                            </div>
                            <div>
                                <label>Version: </label>
                                <input onChange={(e)=>e.target.value=e.target.value.replaceAll(" ","")} placeholder={'Version'} ref={gitVerRef}/>
                            </div>
                            <div>
                                <label>Folder Path: </label>
                                <input placeholder={'Ex: Projectname/Modulename'} ref={gitPathRef}/>
                            </div>
                        </Fragment>:
                        <div>
                            <label>Upload File: </label>
                            <input accept={acceptType[importType]} type='file' onChange={upload} ref={uploadFileRef}/>
                        </div>
                    }
                </Fragment>
            }
            {fileUpload &&
                <Fragment>
                    {(importType==='json')?
                    <div>
                        <label>Project: </label>
                        <select className='imp-inp' disabled={true} defaultValue={fileUpload.projectID} ref={projRef}>
                            <option value={fileUpload.projectID} disabled>{projList[fileUpload.projectID].name}</option>
                        </select>
                    </div>
                    :null}
                    {(importType==='pd')?
                    <div>
                        <label>Project: </label>
                        <select className='imp-inp' defaultValue={'def-val'} ref={projRef}>
                            <option value={'def-val'} disabled>Select Project</option>
                            {(()=>{
                                var appType = getApptypePD(fileUpload)
                                return Object.entries(projList).map((e)=>{
                                    if(appType === e[1].apptypeName.toLowerCase()){
                                        return <option value={e[1].id} key={e[0]}>{e[1].name}</option>
                                    }
                                })
                            })()       
                            }
                        </select>
                    </div>:null
                    }
					{(importType==='sel')?
                    <div>
                        <label>Project: </label>
                        <select className='imp-inp' defaultValue={'def-val'} ref={projRef}>
                            <option value={'def-val'} disabled>Select Project</option>
                            {(()=>{
                                var appType = 'web';
                                return Object.entries(projList).map((e)=>{
                                    if(appType === e[1].apptypeName.toLowerCase()){
                                        return <option value={e[1].id} key={e[0]}>{e[1].name}</option>
                                    }
                                })
                            })()       
                            }
                        </select>
                    </div>:null
                    }
                    {(importType==='excel')?
                    <Fragment>
                    <div>
                        <label>Project: </label>
                        <select className='imp-inp' defaultValue={'def-val'} ref={projRef}>
                            <option value={'def-val'} disabled>Select Project</option>
                            {Object.entries(projList).map((e,i)=>
                            <option value={e[1].id} key={i}>{e[1].name}</option>
                        )}
                        </select>
                    </div>
                    <div>
                        <label>Select Sheet: </label>
                        <select defaultValue={"def-val"} ref={sheetRef}>
                            <option value="def-val" disabled>Please Select Sheet</option>
                            {sheetList.map((e,i)=><option value={e} key={i}>{e}</option>)}
                        </select>
                    </div>
                    </Fragment>
                    :null}
                </Fragment>
            }
        </div>
    )
}
// Footer for sheet choose popup
const Footer = ({error,setSubmit}) =>{
    return(
      <Fragment>
            <div className='mnode__buttons'>
                <label className='err-message'>{error}</label>
                <button onClick={()=>setSubmit(true)}>Import</button>
            </div>
      </Fragment>
    )
}

const validate = ({ftypeRef,uploadFileRef,projRef,gitconfigRef,gitBranchRef,gitVerRef,gitPathRef,sheetRef}) =>{
    var err = false;
    [ftypeRef,uploadFileRef,projRef,gitconfigRef,gitBranchRef,gitVerRef,gitPathRef,sheetRef].forEach((e)=>{
        if(e.current){
            e.current.style.border = '1px solid black';
            if(e.current.value === 'def-val' || e.current.value === ''){
                e.current.style.border = '1px solid red';
                err = true
            }
            if(e.current.type === 'file' && !uploadFileRef.current.files[0]){
                e.current.style.border = '1px solid red';
                err = true
            }
        }
    })
    return err
}

// loadImportData :
// imports all the data to mindmapCanvas by setting moduleData based on type
// createnew should be true for all import except mm because nodes will be not created it will be revoked from saved data

const loadImportData = async({importData,sheet,importType,importProj,dispatch,displayError,setBlockui,setImportPop,setOptions,changeImportType}) =>{
    var mindmapData = importData
    setBlockui({content:'Importing ...',show:true})
    if(importType === 'excel'){
        let validateNode = true;
        var res = await excelToMindmap({'content':importData,'flag':'data',sheetname: sheet})
        if(res.error){displayError(res.error);return;}
        res.forEach((e, i) =>{
            if (!validNodeDetails(e.name)) validateNode = false;
        });
        if(!validateNode){
            changeImportType({target: {value: "excel"}});
            displayError(MSG.MINDMAP.ERR_INVALID_MODULE_NAME);return;
        }
        mindmapData = {createnew:true,importData:{createdby:'excel',data:res}} 
    }
    if(importType === 'pd'){
        var res =  await pdProcess({'projectid':importProj,'file':importData})
        if(res.error){displayError(res.error);return;}
        var data = getJsonPd(res.data)
        mindmapData = {createnew:true,importData:{createdby:'pd',data:data}}
    }
	if(importType === 'sel'){
        var res =  await pdProcess({'projectid':importProj,'file':importData})
        if(res.error){displayError(res.error);return;}
        var data = getJsonPd(res.data)
        mindmapData = {createnew:true,importData:{createdby:'sel',data:data}}
    }
    var moduledata = await getModules({"tab":"tabCreate","projectid":importProj,"moduleid":null})
    if(moduledata.error){displayError(moduledata.error);return;}
    var screendata = await getScreens(importProj)
    if(screendata.error){displayError(screendata.error);return;}
    dispatch({type:actionTypes.IMPORT_MINDMAP,payload:{
            selectProj : importProj,
            selectModule : mindmapData,
            screenData : screendata,
            moduleList : moduledata,
        }
    })
    setImportPop(false)
    setOptions('importmindmap')
}

const uploadFile = async({uploadFileRef,setSheetList,setError,setFiledUpload,projList,setData,fileImport,setBlockui}) =>{
    var file = uploadFileRef.current.files[0]
    if(!file)return;
    var extension = file.name.substr(file.name.lastIndexOf('.')+1)
    setBlockui({content:'Uploading ...',show:true})
    try{
        const result =  await read(file)
        if(extension === 'pd'){
            var appType = getApptypePD(result)
            var projFlag = false
            Object.keys(projList).map((e)=>{
                if(appType === projList[e].apptypeName.toLowerCase()){
                    projFlag = true ;
                }
            })
            if(projFlag){
                setFiledUpload(result)
            }else{
                setError("no project of same apptype is assigned to the user")
            }
        }
		else if(extension === 'sel'){
            var appType = 'web';
            var projFlag = false
            Object.keys(projList).map((e)=>{
                if(appType === projList[e].apptypeName.toLowerCase()){
                    projFlag = true ;
                }
            })
            if(projFlag){
                setFiledUpload(result)
            }else{
                setError("no project of same apptype is assigned to the user")
            }
        }
		else if(extension === 'xls' || extension === 'xlsx'){
            var res = await excelToMindmap({'content':result,'flag':"sheetname"})
            setBlockui({show:false})
            if(res.error){setError(res.error);return;}
            if(res.length>0){
                setFiledUpload(result)
                setSheetList(res)
            }else{
                setError("File is empty")
            }
        }else if(extension === 'json' || extension === 'mm'){
            var data = JSON.parse(result);
            if (!('testscenarios' in data)){
                setError("Incorrect JSON imported. Please check the contents!!");
            }else if(data.testscenarios.length === 0){
                setError("The file has no node structure to import, please check!!");
            }else{
                var importProj = data.projectid
                if(!importProj || !projList[importProj]){
                    setError(MSG.MINDMAP.WARN_PROJECT_ASSIGN_USER)
                    setBlockui({show:false})
                    return;
                }
                var res = await importMindmap(data)
                if(res.error){setError(res.error);setBlockui({show:false});return;}
                var req={
                    tab:"tabCreate",
                    projectid:data.projectid,
                    version:0,
                    cycId: null,
                    moduleid:res._id
                }
                res = await getModules(req)
                if(res.error){setError(res.error);setBlockui({show:false});return;}
                setFiledUpload(res)
            }
        }else{
            setError("File is not supported")
        }    
        setBlockui({show:false})
    }catch(err){
        setBlockui({show:false})
        setError("invalid File!")
        console.error(err)
    }
}

// read promise that resolves on successful input file read
function read(file) {
    return new Promise ((res,rej)=>{
        var reader = new FileReader();
        reader.onload = function() {
        res(reader.result);
        }
        reader.onerror = () => {
        rej("fail")
        }
        reader.onabort = () =>{
        rej("fail")
        }
        reader.readAsBinaryString(file);
    })
}

const validNodeDetails = (value) =>{
    var nName, flag = !0;
    nName = value;
    var regex = /^[a-zA-Z0-9_]*$/;;
    if (nName.length == 0 || nName.length > 255 || nName.indexOf('_') < 0 || !(regex.test(nName)) || nName== 'Screen_0' || nName == 'Scenario_0' || nName == 'Testcase_0') {
        flag = !1;
    }
    return flag;
};


ImportMindmap.propTypes={
    setImportPop : PropTypes.func.isRequired,
    setBlockui :  PropTypes.func.isRequired,
    displayError : PropTypes.func.isRequired,
    setOptions :   PropTypes.func.isRequired
}

export default ImportMindmap;