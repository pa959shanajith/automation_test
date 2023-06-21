import React, { useRef, Fragment, useState, useEffect } from 'react';
import {excelToMindmap, getProjectList, getModules,getScreens, importMindmap ,gitToMindmap, pdProcess, importGitMindmap, writeFileServer, writeZipFileServer, jsonToMindmap} from '../api';
import {ModalContainer,ResetSession, Messages as MSG,setMsg, VARIANT, ScrollBar} from '../../global'
import { parseProjList, getApptypePD, getJsonPd} from '../containers/MindmapUtils';
import { useDispatch, useSelector } from 'react-redux';
import {setImportData} from '../designSlice';
import PropTypes from 'prop-types';
import '../styles/ImportMindmap.scss';
import { Link } from 'react-router-dom';




const ImportMindmap = ({setImportPop,setBlockui,displayError,setOptions, isMultiImport}) => {
    const [projList,setProjList] = useState({})
    const [error,setError] = useState('')
    const [submit,setSubmit] = useState(false)
    const [disableSubmit,setDisableSubmit] = useState(true)
    const [mindmapData,setMindmapData] = useState([])
    
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
    <>
        <ModalContainer 
        modalClass = "modal-mmd"
        title='Import Modules'
        close={()=>setImportPop(false)}
        footer={<Footer error={error} disableSubmit={disableSubmit} setSubmit={setSubmit}/>}
        content={<Container submit={submit} setMindmapData={setMindmapData}mindmapData={mindmapData} setDisableSubmit={setDisableSubmit} setSubmit={setSubmit} displayError={displayError} setOptions={setOptions} projList={projList} setImportPop={setImportPop} setError={setError} setBlockui={setBlockui} isMultiImport={isMultiImport}/>} 
      />
    </>
    )
}

const Container = ({projList,setBlockui,setMindmapData,displayError,mindmapData,setDisableSubmit,setError,setSubmit,submit,setOptions,setImportPop,isMultiImport}) => {
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
    const [uploadFileField,setUploadFileField] = useState(false)
    const [uploadFilezip,setUploadFilezip] = useState("") 

    const upload = (e) => {
        let  project = "";
        if(importType === 'zip'){
            project = projRef.current.value;
        if(project=='def-val'){
            displayError({CONTENT:"Please select project",VARIANT:VARIANT.ERROR});
            setDisableSubmit(true)
            return false
            
        }
    }
        setError('')
        setFiledUpload(undefined)
        setBlockui({show:true,content:'Uploading ...'})
        uploadFile({setBlockui,setMindmapData,projList,uploadFileRef,setSheetList,setError,setDisableSubmit,setFiledUpload, selectedProject:project,setUploadFilezip,uploadFilezip})
    }
    const changeImportType = (e) => {
        // projRef.current.value = ""
        if(projRef.current)projRef.current.value = ''
        if(uploadFileRef.current)uploadFileRef.current.value = ''
        setImportType(e.target.value)        
        setFiledUpload(undefined)
        setDisableSubmit(true)
        setError('')
        if(e.target.value==="zip"){ setUploadFileField(false); resetImportModule();}
    }
    const resetImportModule = async() => {
      if(uploadFileRef.current)uploadFileRef.current.value = ''
        if(projRef.current.value) {
            var moduledata = await getModules({"tab":"tabCreate","projectid":projRef.current.value,"moduleid":null,"query":"modLength"})
            if (moduledata.length>0){
                setError('Please select a Project which has no Modules.')                
                setUploadFileField(false)
                setFiledUpload(undefined)
                setDisableSubmit(true)
                return
            }
        }
        if(projRef.current.value) setUploadFileField(true)
        setSheetList([])
        setFiledUpload(undefined)
        setError('')        
    }
    const acceptType = {
        pd:".pd",
        excel:".xls,.xlsx",
        git:".mm",
        zip:".zip",
		json:".json"
    }
    useEffect(()=>{
        if(submit){
            setSubmit(false)                              
            var err = validate({importType,ftypeRef,uploadFileRef,projRef,gitconfigRef,gitBranchRef,gitVerRef,gitPathRef,sheetRef})
            if(err){
                setBlockui({show:false})
                return;
            }
            setError('') 
            setDisableSubmit(true)
            setImportPop(false) 
            var importData = fileUpload;
            (async()=>{
                if(importType === 'git'){
                    // setBlockui({content:'Importing ...',show:true})
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
                    var res = await gitToMindmap(data)
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
                
                if(isMultiImport && importType === 'zip'){
                    // setBlockui({content:'Importing ...',show:true})
                    setMsg(MSG.MINDMAP.SUCC_DATA_IMPORT_NOTIFY)
                    ResetSession.start()          
                    var res = await importMindmap(mindmapData)
                
                    if(res.error){setError(res.error);setBlockui({show:false});ResetSession.end(); return;}
                    if(res === "InProgress"){setMsg(MSG.MINDMAP.WARN_IMPORT_INPROGRESS);setBlockui({show:false,content:''}); ResetSession.end();return;}
                    if(res === "dupMod"){setMsg(MSG.MINDMAP.ERR_DUPLI_ZIP_MOD_DATA);setBlockui({show:false,content:''}); ResetSession.end();return;}
                    if(res === "dupSce"){setMsg(MSG.MINDMAP.ERR_DUPLI_ZIP_SCE_DATA);setBlockui({show:false,content:''}); ResetSession.end();return;}
                    var req={
                        tab:"tabCreate",
                        projectid:mindmapData[0]?mindmapData[mindmapData.length -1]["projectid"]:mindmapData.projectid,
                        version:0,
                        cycId: null,
                        moduleid:Array.isArray(res)?res:res
                    }
                    res = await getModules(req)
                
                    if(res.error){setError(res.error);setBlockui({show:false});ResetSession.end();return;}
                    setFiledUpload(res)
                    setMsg(MSG.MINDMAP.SUCC_DATA_IMPORTED)
                    setBlockui({show:false})
                    ResetSession.end();
                }else if(importType === 'excel'){
                    // setBlockui({content:'Importing ...',show:true})
                    setMsg(MSG.MINDMAP.SUCC_DATA_IMPORT_NOTIFY)
                    ResetSession.start()
                    var importproj=projRef.current ? projRef.current.value: undefined          
                    var res = await excelToMindmap({'content':importData,'flag':'data',sheetname: sheetRef.current? sheetRef.current.value: undefined})
                    if(res.error){displayError(res.error);ResetSession.end();return;}                    
                    else{
                        
                        var importexcel = await jsonToMindmap({"type":"excel","importproj":importproj})
                        if(importexcel.error){displayError(importexcel.error);ResetSession.end();return;}
                        if(importexcel == "InProgress"){setMsg(MSG.MINDMAP.WARN_IMPORT_INPROGRESS);ResetSession.end();return;}
                        setMsg(MSG.MINDMAP.SUCC_DATA_IMPORTED)
                        setBlockui({show:false})
                        ResetSession.end();
                }}else if(importType === 'json'){
                    setMsg(MSG.MINDMAP.SUCC_DATA_IMPORT_NOTIFY)
                    // setBlockui({content:'Importing ...',show:true})
                    ResetSession.start()          
                    var res = await jsonToMindmap({"type":"json","importproj":projRef.current ? projRef.current.value: undefined})
                    if(res.error){displayError(res.error);ResetSession.end();return;}
                    if(res == "InProgress"){setMsg(MSG.MINDMAP.WARN_IMPORT_INPROGRESS);ResetSession.end();return;}
                    setMsg(MSG.MINDMAP.SUCC_DATA_IMPORTED)
                    setBlockui({show:false})
                    ResetSession.end();
            }
                else{
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

                } 
            })()
        }
    },[submit])
    return(
        <div data-test='mp__import-popup' className = 'mp__import-popup'>
            <div>
                <label>Import from: </label>
                <select className='imp-inp' defaultValue={'def-val'} onChange={changeImportType} ref={ftypeRef}>
                    <option value={'def-val'} disabled>Select Import Format</option>
                    {/* <option value={'pd'}>AvoDiscovery (.pd)</option> */}
                    <option value={'excel'}>Structure only - Excel(.xls,.xlsx)</option>
                    {/* <option value={'git'}>Git (.mm)</option>  */}                    
					<option value={'json'}>Structure only - Json (.json)</option>
                    <option value={'zip'}>Complete Module(S) (.zip)</option>
                </select>
            </div>
            {isMultiImport && 
                <Fragment>
                    {(importType==='zip')?
                        <div>
                            <label>
                            Project:   
                            </label>
                            <select className='imp-inp' onChange={resetImportModule} disabled={false} ref={projRef}>
                            <option value={'def-val'}>Select Project</option>
                                {(()=>{
                                    return Object.entries(projList).map((e)=>{
                                            return <option value={e[1].id} key={e[0]}>{e[1].name}</option>
                                    })
                                })()       
                                }
                                {/* <option value={fileUpload.projectID} >{projList[fileUpload.projectID].name}</option> */}
                            </select>
                        </div>
                    :null}
                    
                </Fragment>
            }
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
                        (<>{uploadFileField || (["excel","json"].includes(importType))?<div>
                            <label>Upload File: </label>
                            <input accept={acceptType[importType]} disabled={!uploadFileField && importType==="zip"} type='file' onChange={(e) => upload(e)} ref={uploadFileRef}/>
                            </div>:null}</>)
                    }
                    
                </Fragment>
            }
            {fileUpload && /* !isMultiImport && */
                <Fragment>
                    {(importType==='zip')?
                    <div>
                        <label>Project: </label>
                        <select className='imp-inp' disabled={false} ref={projRef}>
                        <option value={'def-val'}>Select Project</option>
                            {(()=>{
                                return Object.entries(projList).map((e)=>{
                                        return <option value={e[1].id} key={e[0]}>{e[1].name}</option>
                                })
                            })()       
                            }
                            {/* <option value={fileUpload.projectID} >{projList[fileUpload.projectID].name}</option> */}
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
                                    //if(appType === e[1].apptypeName.toLowerCase()){
                                        return <option value={e[1].id} key={e[0]}>{e[1].name}</option>
                                    //}
                                })
                            })()       
                            }
                        </select>
                    </div>:null
                    }
					{(importType==='json')?
                    <div>
                        <label>Project: </label>
                        <select className='imp-inp' defaultValue={'def-val'} ref={projRef}>
                            <option value={'def-val'} disabled>Select Project</option>
                            {Object.entries(projList).map((e,i)=>
                            <option value={e[1].id} key={i}>{e[1].name}</option>
                        )}
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
const Footer = ({error,setSubmit,disableSubmit}) =>{
    return(
      <Fragment>
            <div className='mnode__buttons'>
                <label className='err-message'>{error}</label>                
                <button disabled={disableSubmit} onClick={()=>setSubmit(true)}>Import</button>                
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
    // console.log("ImportProj: " + importProj)
    // setBlockui({content:'Importing ...',show:true})
    // if(importType === 'excel'){
    //     let validateNode = true;
    //     var res = await excelToMindmap({'content':importData,'flag':'data',sheetname: sheet,"importProj":importProj})
    //     if(res.error){displayError(res.error);return;}
    //     else{
    //         var importexcel = await jsonToMindmap({"data":"importexcel","importproj":importProj})
    //     if(importexcel.error){displayError(importexcel.error);return;}}
    //     res.forEach((e, i) =>{
    //         if (!validNodeDetails(e.name)) validateNode = false;
    //     });
    //     if(!validateNode){
    //         changeImportType({target: {value: "excel"}});
    //         displayError(MSG.MINDMAP.ERR_INVALID_MODULE_NAME);return;
    //     }

         
        
    // }
    if(importType === 'pd'){
        var res =  await pdProcess({'projectid':importProj,'file':importData})
        if(res.error){displayError(res.error);return;}
        var data = getJsonPd(res.data)
        mindmapData = {createnew:true,importData:{createdby:'pd',data:data}}
    }
	// if(importType === 'json'){
    //     var res =  await pdProcess({'projectid':importProj,'file':importData})
    //     if(res.error){displayError(res.error);return;}
    //     var data = getJsonPd(res.data)
    //     mindmapData = {createnew:true,importData:{createdby:'file',data:data}}
    // }
        var moduledata = await getModules({"tab":"tabCreate","projectid":importProj,"moduleid":null})
        if(moduledata.error){displayError(moduledata.error);return;}
        var screendata = await getScreens(importProj)
        if(screendata.error){displayError(screendata.error);return;}
        setTimeout(function() {
            dispatch(setImportData({
                selectProj : importProj,
                selectModule : mindmapData,
                screenData : screendata,
                moduleList : moduledata,
            }))
        setImportPop(false)
        setOptions('importmodules')
        // setBlockui({show:false})
        }, 200);
    // }
   
}

const uploadFile = async({setBlockui,uploadFileRef,setMindmapData,setSheetList,setDisableSubmit,setistrue,setError,setFiledUpload,projList,setData,fileImport,selectedProject,setUploadFilezip,uploadFilezip}) =>{
    
    var file = uploadFileRef.current.files[0]
    
    if(!file){
        setBlockui({show:false})
        setError("Please select a file");
        setDisableSubmit(true);
        return;}
    var extension = file.name.substr(file.name.lastIndexOf('.')+1)
    setBlockui({content:'Uploading ...',show:true})
    try{
        
        if(extension === 'pd'){
            const result =  await read(file)
            setDisableSubmit(false)
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
                setBlockui({show:false})
                return;
            }
        }
		else if(extension === 'json'){
            const result =  await read(file)
            var duplicateData = JSON.parse(result);
            if(duplicateData){
                if(duplicateData.length>0){
                    let startData={"status":"start","type":"json"}
                    let endData={"status":"stop"} 
                    const start= await writeFileServer(startData)
                    if(start.error){setDisableSubmit(true);setBlockui({show:false});return}
                    var modules=[]
                    var scenarios=[]                    
                    for (let i=0;i<duplicateData.length;i++){
                        if (i==0){
                            if(duplicateData[i]["name"] && duplicateData[i]["testscenarios"]){
                                duplicateData[i]["status"]="first"
                                
                                if (modules.includes(duplicateData[i]["name"])){
                                    setError("Duplicate Modules found");setDisableSubmit(true);setBlockui({show:false});return;
                                }
                                modules.push(duplicateData[i]["name"])
                                if (Array.isArray(duplicateData[i]["testscenarios"])){
                                    for (let j=0;j<duplicateData[i]["testscenarios"].length;j++){
                                        if (scenarios.includes(duplicateData[i]["testscenarios"][j]["name"])){
                                            setError("Duplicate Scenarios found");setDisableSubmit(true);setBlockui({show:false});return;
                                        }else{scenarios.push(duplicateData[i]["testscenarios"][j]["name"])}
                                    }
                                }else{
                                    setError("Invalid File");setDisableSubmit(true);setBlockui({show:false});return;
                                }
                                const res1= await writeFileServer(duplicateData[i])
                                if(res1.error){setDisableSubmit(true);setBlockui({show:false});return}
                            }else{
                                setError("Invalid file format");setDisableSubmit(true);setBlockui({show:false});return;
                            }
                        }
                        else{
                            if(duplicateData[i]["name"] && duplicateData[i]["testscenarios"]){
                                if (modules.includes(duplicateData[i]["name"])){
                                    setError("Duplicate Modules found");setDisableSubmit(true);setBlockui({show:false});return;
                                }
                                if (Array.isArray(duplicateData[i]["testscenarios"])){
                                    for (let j=0;j<duplicateData[i]["testscenarios"].length;j++){
                                        if (scenarios.includes(duplicateData[i]["testscenarios"][j]["name"])){
                                            setError("Duplicate scenarios found");setDisableSubmit(true);setBlockui({show:false});return;
                                        }else{scenarios.push(duplicateData[i]["testscenarios"][j]["name"])}
                                    }
                                }else{
                                    setError("Invalid File");setDisableSubmit(true);setBlockui({show:false});return;
                                }
                                modules.push(duplicateData[i]["name"])
                                const res1= await writeFileServer(duplicateData[i])
                                if(res1.error){setDisableSubmit(true);setBlockui({show:false});return}
                            }else{
                                setError("Invalid file format");setDisableSubmit(true);setBlockui({show:false});return;
                            }
                        }}
                    
                    
                    const end= await writeFileServer(endData)
                    if(end.error){setDisableSubmit(true);setBlockui({show:false});return}
                    else{setDisableSubmit(false);
                        setBlockui({show:false})}
                    setBlockui({show:false})
                    setFiledUpload(result)
                    setDisableSubmit(false)
                }else{
                    setBlockui({show:false})
                    setError("Invalid file format")
                    return;
                }
            }else{
                setBlockui({show:false})
                setError("File is empty")
                return;
            }
        }
         
		else if(extension === 'xls' || extension === 'xlsx'){
            const result =  await read(file)
             setDisableSubmit(false)
            var res = await excelToMindmap({'content':result,'flag':"sheetname"})
                    setBlockui({show:false})
            if(res.error){setError(res.error);setBlockui({show:false});return;}
            if(res.length>0){
                setFiledUpload(result)
                setSheetList(res)
            }else{
                setBlockui({show:false})
                setError("File is empty")
                return;
                }
        }else if(extension === 'zip'){
            const formData = new FormData();
            formData.append('file',file)
            const res = await writeZipFileServer(formData);
            if(res.error || !res.appType){setError("Invalid Data");;setDisableSubmit(true);setBlockui({show:false});return}
            let selectedAppType = projList[selectedProject].apptypeName;  
            var importedAppType = res.appType;
            if(selectedAppType!==importedAppType){
                setError("Selected project is of different App Type");
                setDisableSubmit(true)
                setBlockui({show:false})
                return
            }
            let data={"apptype":res.appType,
            "projid":selectedProject}
            setMindmapData(data); 
            setDisableSubmit(false);                
            setBlockui({show:false}) 
        }else{
            setError("File is not supported")
            setDisableSubmit(true)
            setBlockui({show:false})
            return;
        }    
        setBlockui({show:false})
    }catch(err){
        setBlockui({show:false})
        setError("invalid File!")
        setDisableSubmit(true)
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

// const validNodeDetails = (value) =>{
//     var nName, flag = !0;
//     nName = value;
//     var regex = /^[a-zA-Z0-9_]*$/;;
//     if (nName.length == 0 || nName.length > 255 || nName.indexOf('_') < 0 || !(regex.test(nName)) || nName== 'Screen_0' || nName == 'Scenario_0' || nName == 'Testcase_0') {
//         flag = !1;
//     }
//     return flag;
// };


ImportMindmap.propTypes={
    setImportPop : PropTypes.func.isRequired,
    setBlockui :  PropTypes.func.isRequired,
    displayError : PropTypes.func.isRequired,
    setOptions :   PropTypes.func.isRequired
}

export default ImportMindmap;