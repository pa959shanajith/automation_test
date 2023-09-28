import React, { useRef, Fragment, useState, useEffect } from 'react';
import {excelToMindmap, getProjectList, getModules,getScreens, importMindmap ,gitToMindmap, pdProcess, importGitMindmap, writeFileServer, writeZipFileServer, jsonToMindmap,singleExcelToMindmap ,checkExportVer} from '../api';
import {ModalContainer,ResetSession, Messages as MSG,setMsg, VARIANT, ScrollBar} from '../../global'
import { parseProjList, getApptypePD, getJsonPd} from '../containers/MindmapUtils';
import { useDispatch, useSelector } from 'react-redux';
import {setImportData,dontShowFirstModule,selectedModuleReducer} from '../designSlice';
import PropTypes from 'prop-types';
import '../styles/ImportMindmap.scss';
import { Link } from 'react-router-dom';
import { Dialog } from 'primereact/dialog';
import { Button } from 'primereact/button';
import { Dropdown } from 'primereact/dropdown';
// import { Toast } from 'primereact/Toast';





const ImportMindmap = ({setImportPop,setBlockui,displayError,setOptions, isMultiImport, importPop, toast}) => {
    const [projList,setProjList] = useState({})
    const [error,setError] = useState('')
    const [submit,setSubmit] = useState(false)
    const [disableSubmit,setDisableSubmit] = useState(true)
    const [mindmapData,setMindmapData] = useState([])
    const [gitExportDetails,setGitExportDetails] =useState([])
    
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
        {/* <Toast  ref={toast} position="bottom-center" baseZIndex={1000}/> */}
        <Dialog className='ImportDialog' header='Import Test Suite' onHide={()=>setImportPop(false)} visible={importPop} style={{ width: '50vw' }} footer={<Footer error={error} disableSubmit={disableSubmit} setSubmit={setSubmit}/>}>
            <Container submit={submit} setMindmapData={setMindmapData}mindmapData={mindmapData} setDisableSubmit={setDisableSubmit} setSubmit={setSubmit} displayError={displayError} setOptions={setOptions} projList={projList} setImportPop={setImportPop} setError={setError} setBlockui={setBlockui} isMultiImport={isMultiImport}
             setGitExportDetails={setGitExportDetails} gitExportDetails={gitExportDetails} Toast={toast}/>
        </Dialog>
    </>
    )
}

const Container = ({projList,setBlockui,setMindmapData,displayError,mindmapData,setDisableSubmit,setError,setSubmit,submit,setOptions,setImportPop,isMultiImport,setGitExportDetails,gitExportDetails,Toast}) => {
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
    const [uploadFilezip,setUploadFilezip] = useState("");
    const [selectedImport, setSelectedImport] = useState(null);
    const [projectValue, setProjectValue] = useState(null);
    const [SheetValue, setSheetValue] = useState(null);
    const [projectId, setProjectId] = useState(null);
    const [comMsgRef,setComMsgRef]=useState("")
    const expProjRef =useRef()
    const [VersionItemValue, setVersionItemValue] = useState(null)
    const [ImportValue, setImportValue] = useState(null)
    const [projectImportId, setProjectImportId] = useState(null);
    const upload = (e) => {
        let  project = "";
        if(importType === 'zip'){
            project = projectId;
            if(project==='def-val'){
                Toast.current.show({severity:'error', summary: 'Error', detail:"Please select project", life: 3000});
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
        setSelectedImport(e.value);
        if(projRef.current)projRef.current.value = ''
        if(uploadFileRef.current)uploadFileRef.current.value = ''
        setImportType(e.value)        
        setFiledUpload(undefined)
        setDisableSubmit(true)
        setProjectValue(null)
        setError('')
        if(e.target.value==="zip"){ setUploadFileField(false); resetImportModule();}
        if (e.target.value==="git"){ resetImportModules();setComMsgRef("");
            setDisableSubmit(false)
        }
    }
    const resetImportModule = async(e) => {
      if(uploadFileRef.current)uploadFileRef.current.value = ''
        setProjectValue(e?.value);
        var id = '';
        for(var i = 0; e?.target.name.length>i; i++){
            if (e.value === e.target.name[i].value){
                id = e.target.name[i].key
                setProjectId(e.target.name[i].key);
            }
        }
        if(id) {
            var moduledata = await getModules({"tab":"tabCreate","projectid":id,"moduleid":null,"query":"modLength"})
            if (moduledata.length>0){
                setError('Please select a Project which has no Modules.')
                gitVerRef.current.value= null                             
                setUploadFileField(false)
                setFiledUpload(undefined)
                setDisableSubmit(true)
                setComMsgRef("")
                return
            }else if(importType==="git"){
                setDisableSubmit(false)
            }
            else{if (importType==="git"){setDisableSubmit(false)}
        }
        if(id) {setUploadFileField(true)
        setSheetList([])
        setFiledUpload(undefined)
        setError('')  }      
    }        
    }
    const resetImportModules = async(e) => {
        if(uploadFileRef.current)uploadFileRef.current.value = ''
          setImportValue(e?.value)
          var id = '';
          for(var i = 0; e?.target.name.length>i; i++){
              if (e.value === e.target.name[i].value){
                  id = e.target.name[i].key
                  setProjectImportId(e.target.name[i].key);
              }
          }
          if(id) {
              var moduledata = await getModules({"tab":"tabCreate","projectid":id,"moduleid":null,"query":"modLength"})
              if (moduledata.length>0){
                  setError('Please select a Project which has no Modules.')
                  gitVerRef.current.value= null                             
                  setUploadFileField(false)
                  setFiledUpload(undefined)
                  setDisableSubmit(true)
                  setComMsgRef("")
                  return
              }else if(importType==="git"){
                  setDisableSubmit(false)
              }
              else{if (importType==="git"){setDisableSubmit(false)}
          }
          if(id) {setUploadFileField(true)
          setSheetList([])
          setFiledUpload(undefined)
          setError('')  }      
      }        
      }
    const resetcommsg = (e) => {
        setVersionItemValue(e.value)
        let version=e.target.value
        for(let i=0;i<gitExportDetails.length;i++){
            if (gitExportDetails[i]["version"]===version){
                setComMsgRef(gitExportDetails[i]["commitmessage"])
            }
        }              
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
            var err = validate({importType,ftypeRef,uploadFileRef,projRef,gitconfigRef,gitVerRef,sheetRef,expProjRef})
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
                    setBlockui({content:'Importing ...',show:true})
                    Toast.current.show({severity:"success", summary:"Success",detail:MSG.MINDMAP.SUCC_DATA_IMPORT_NOTIFY.CONTENT,life:3000})
                    ResetSession.start() 
                    var data = await importGitMindmap ({
                        expProj: projectId,
                        projectid : projectImportId,
                        projectName:projList[projectImportId].name,
                        // gitname : gitconfigRef.current.value,
                        // gitbranch : gitBranchRef.current.value,
                         gitversion : gitVerRef.current.props.value,
                        // gitfolderpath : gitPathRef.current.value,
                        appType: projList[projectImportId].apptypeName
                    })
                    if(data.error){ 
                        if (data.error === "No entries"){displayError(data.error);ResetSession.end();
                        return;}
                        else{                       
                        displayError(data.error.CONTENT);}
                        ResetSession.end();
                        return;
                    }

                    if(data === "InProgress"){Toast.current.show({severity:'warn', summary: 'Warning', detail:MSG.MINDMAP.WARN_IMPORT_INPROGRESS.CONTENT, life: 2000});setBlockui({show:false,content:''}); ResetSession.end();return;}
                    if(data === "dupMod"){Toast.current.show({severity:'error', summary: 'Error', detail:MSG.MINDMAP.ERR_DUPLI_ZIP_MOD_DATA.CONTENT, life: 2000});setBlockui({show:false,content:''}); ResetSession.end();return;}
                    if(data === "dupSce"){Toast.current.show({severity:'error', summary: 'Error', detail:MSG.MINDMAP.ERR_DUPLI_ZIP_SCE_DATA.CONTENT, life: 2000});setBlockui({show:false,content:''}); ResetSession.end();return;}
                    if(data === "appType"){Toast.current.show({severity:'error', summary: 'Error', detail:MSG.MINDMAP.ERR_DIFF_APP_TYPE.CONTENT, life: 2000});setBlockui({show:false,content:''}); ResetSession.end();return;}
                    // var importProj = data.projectid
                    // if(!importProj || !projList[importProj]){
                    //     displayError(MSG.MINDMAP.WARN_PROJECT_ASSIGN_USER)
                    //     return;
                    // }
                    // var res = await gitToMindmap(data)
                    // if(res.error){setError(res.error);setBlockui({show:false});return;}
                    var req={
                        tab:"tabCreate",
                        projectid:data.projectid,
                        version:0,
                        cycId: null,
                        moduleid:data._id
                    }
                    var res = await getModules(req)
                    if(res.error){displayError(res.error.CONTENT);ResetSession.end();return;}
                    importData = res
                    setBlockui({show:false})
                    Toast.current.show({severity:'success', summary: 'Success', detail:MSG.MINDMAP.SUCC_DATA_IMPORTED.CONTENT, life: 3000})         
                    ResetSession.end();
                }
                
                else if(isMultiImport && importType === 'zip'){
                    setBlockui({content:'Importing ...',show:true})
                    Toast.current.show({severity:'success', summary: 'Success', detail:MSG.MINDMAP.SUCC_DATA_IMPORT_NOTIFY.CONTENT, life: 3000})
                    ResetSession.start()          
                    var res = await importMindmap(mindmapData)
                
                    if(res.error){setError(res.error);setBlockui({show:false});ResetSession.end(); return;}
                    if(res === "InProgress"){Toast.current.show({severity:'warn', summary: 'Warning', detail:MSG.MINDMAP.WARN_IMPORT_INPROGRESS.CONTENT, life: 2000});setBlockui({show:false,content:''}); ResetSession.end();return;}
                    if(res === "dupMod"){Toast.current.show({severity:'error', summary: 'Error', detail:MSG.MINDMAP.ERR_DUPLI_ZIP_MOD_DATA.CONTENT, life: 2000});setBlockui({show:false,content:''}); ResetSession.end();return;}
                    if(res === "dupSce"){Toast.current.show({severity:'error', summary: 'Error', detail:MSG.MINDMAP.ERR_DUPLI_ZIP_SCE_DATA.CONTENT, life: 2000});setBlockui({show:false,content:''}); ResetSession.end();return;}
                    var req={
                        tab:"tabCreate",
                        projectid:mindmapData[0] !== undefined?mindmapData[mindmapData.length -1]["projectid"]:mindmapData.projectid !== undefined?mindmapData.projectid:mindmapData.projid,
                        version:0,
                        cycId: null,
                        moduleid:Array.isArray(res)?res[0]:res
                    }
                    res = await getModules(req)
                
                    if(res.error){displayError(res.error);setBlockui({show:false});ResetSession.end();return;}
                    setFiledUpload(res)
                    Toast.current.show({severity:'success', summary: 'Success', detail:MSG.MINDMAP.SUCC_DATA_IMPORTED.CONTENT, life: 3000})
                    setBlockui({show:false})
                    ResetSession.end();
                }else if(importType === 'excel'){
                    setBlockui({content:'Importing ...',show:true})
                    Toast.current.show({severity:'success', summary: 'Success', detail:MSG.MINDMAP.SUCC_DATA_IMPORT_NOTIFY.CONTENT, life: 3000})
                    ResetSession.start()
                    var importproj= projectId          
                    var res = await excelToMindmap({'content':importData,'flag':'data',sheetname: SheetValue})
                    if(res.error){displayError(res.error.CONTENT);ResetSession.end();return;}                    
                    else{
                        
                        var importexcel = await jsonToMindmap({"type":"excel","importproj":importproj})
                        if(importexcel.error){displayError(importexcel.error.CONTENT);ResetSession.end();return;}
                        var excelModule = await getModules({tab:"tabCreate",
                        projectid:importproj,
                        version:0,
                        cycId: null,
                        moduleid:Array.isArray(importexcel)?importexcel[0]:importexcel})
                        if(excelModule.error){displayError(excelModule.error);ResetSession.end();return;}
                        var excelScreen = await getScreens(importproj) 
                        if(excelScreen.error){displayError(excelScreen.error);ResetSession.end();return;}
                        setTimeout(function() {
                            dispatch(selectedModuleReducer(excelModule))
                        setImportPop(false)
                        setOptions('importmodules')
                        // setBlockui({show:false})
                        }, 100);
                        if(importexcel === "InProgress"){Toast.current.show({severity:'warn', summary: 'Warning', detail:MSG.MINDMAP.WARN_IMPORT_INPROGRESS.CONTENT, life: 2000});ResetSession.end();return;}
                        Toast.current.show({severity:'success', summary: 'Success', detail:MSG.MINDMAP.SUCC_DATA_IMPORTED.CONTENT, life: 3000})
                        setBlockui({show:false})
                        ResetSession.end();
                }}else if(importType === 'json'){
                    Toast.current.show({severity:'success', summary: 'Success', detail:MSG.MINDMAP.SUCC_DATA_IMPORT_NOTIFY.CONTENT, life: 3000})
                    setBlockui({content:'Importing ...',show:true})
                    ResetSession.start()          
                    var res = await jsonToMindmap({"type":"json","importproj":projectId})
                    if(res.error){displayError(res.error.CONTENT);ResetSession.end();return;}
                    var dataModule = await getModules( {tab:"tabCreate",
                    projectid:projectId,
                    version:0,
                    cycId: null,
                    moduleid:Array.isArray(res)?res[0]:res})
                    if(dataModule.error){displayError(dataModule.error);ResetSession.end();return;}
                    var datascreen = await getScreens(projectId) 
                    if(datascreen.error){displayError(datascreen.error);ResetSession.end();return;}
                    setTimeout(function() {
                        dispatch(selectedModuleReducer(dataModule))
                    setImportPop(false)
                    setOptions('importmodules')
                    // setBlockui({show:false})
                    }, 100);
                    if(res == "InProgress"){Toast.current.show({severity:'warn', summary: 'Warning', detail:MSG.MINDMAP.WARN_IMPORT_INPROGRESS.CONTENT, life: 2000});ResetSession.end();return;}
                    Toast.current.show({severity:'success', summary: 'Success', detail:MSG.MINDMAP.SUCC_DATA_IMPORTED.CONTENT, life: 3000})
                    setBlockui({show:false})
                    ResetSession.end();
            }
                else{
                        loadImportData({
                            importType,
                            importData, 
                            importProj:projectId,
                            sheet:SheetValue,
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
    },[submit])

    const items = [
        { name: 'Select Import Format', code: 'NY', value:'def-val', disabled:true },
        { name: 'Multi Test Suite Structure only - Excel(.xls,.xlsx)', code: 'RM', value:'excel'},
        { name: 'Single test Suite Structure only - Excel(.xls,.xlsx)', code: 'RM', value:'xls'},
        { name:'Git',code:'GT',value:'git'},
        { name: 'Structure only - Json (.json)', code: 'LDN', value:'json' },
        { name: 'Complete Test Suite(S) (.zip)', code: 'IST', value:'zip' }
    ]
    const projectItem  = Object.entries(projList).map((e)=>{
           return { value:e[1].name,
                    key:e[0]
           }
    });
    const excelSheetItem = sheetList.map((e,i)=>{
        return {value:e, key:i}
    })
    const VersionItem = Object.entries(gitExportDetails).map((e,i)=>{
    return {
        value:e[1].version,
        key:e[0]
    }
    });
    const ImportItem = Object.entries(projList).map((e,i)=>{
        return{
            value:e[1].name,
            key:e[0]
        }
    });

    function changeProject(e){
       setProjectValue(e.value);
       for(var i = 0; e.target.name.length>i; i++){
            if (e.value === e.target.name[i].value){
                setProjectId(e.target.name[i].key);
            }
       }
    }
    const resetVersions = async(e) => {
        setComMsgRef("");
        setProjectValue(e.value);
        let Id = null;
        for(var i = 0; e.target.name.length>i; i++){
            if (e.value === e.target.name[i].value){
                Id=e.target.name[i].key
                setProjectId(e.target.name[i].key)
            }
        }
        gitVerRef.current.props.value= 'def-val'
        setGitExportDetails([]);
        var res = await checkExportVer({"query":"importgit","projectId": Id})
            if(res.error){displayError(res.error.CONTENT);return;}
            setGitExportDetails(res);setDisableSubmit(false)}  

    return(
        <>
        {/* <Toast  ref={Toast} position="bottom-center" baseZIndex={1000}/> */}
        <div data-test='mp__import-popup' className = 'mp__import-popup'>
            <div className='paddingLabel'>
            <label htmlFor='import'>Import format: </label>
                <Dropdown
                inputId="import"
                name="import"
                ref={ftypeRef}
                value={selectedImport}
                options={items}
                optionLabel="name"
                placeholder="Select Import Format"
                className="imp-inp"
                style={{width:'20rem', marginLeft:'2.6rem'}}
                onChange={(e) => {
                    changeImportType(e);
                }}
                />
                {/* <label>Import from: </label>
                <select className='imp-inp' defaultValue={'def-val'} onChange={changeImportType} ref={ftypeRef}>
                    <option value={'def-val'} disabled>Select Import Format</option>
                    {/* <option value={'pd'}>AvoDiscovery (.pd)</option> */}
                    {/*<option value={'excel'}>Multi module Structure only - Excel(.xls,.xlsx)</option>
                    <option value={'xls'}> Single module Structure only - Excel(.xls,.xlsx)</option>
                    <option value={'git'}>Git</option>                     
					<option value={'json'}>Structure only - Json (.json)</option>
                    <option value={'zip'}>Complete Module(S) (.zip)</option>
                </select> */}
            </div>
            {isMultiImport && 
                <Fragment>
                    {(importType==='zip')?
                        <div className='paddingLabel'>
                             <label htmlFor='project'>Project: </label>
                        <Dropdown
                                    inputId="project"
                                    name={projectItem}
                                    ref={projRef}
                                    value={projectValue}
                                    options={projectItem}
                                    optionLabel="value"
                                    placeholder="Select Project"
                                    className="imp-inp"
                                    style={{width:'20rem', marginLeft:'6rem'}}
                                    defaultValue={'def-val'}
                                    onChange={(e)=>resetImportModule(e)}
                                />
                            {/* <label>
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
                                <option value={fileUpload.projectID} >{projList[fileUpload.projectID].name}</option>
                            </select> */}
                        </div>
                    :null}
                    
                </Fragment>
            }
            {importType &&
                <Fragment>
                    {(importType==='git')?
                        <Fragment>
                            <div className='paddingLabel'>
                            <label htmlFor='project'>Project: </label>
                        <Dropdown
                                    inputId="project"
                                    name={projectItem}
                                    ref={expProjRef}
                                    value={projectValue}
                                    options={projectItem}
                                    optionLabel="value"
                                    placeholder="Select Project"
                                    className="imp-inp"
                                    style={{width:'20rem', marginLeft:'6rem'}}
                                    defaultValue={'def-val'}
                                    onChange={(e)=>resetVersions(e)}
                                />
                                {/* <label>Project: </label>
                                <select className='imp-inp' defaultValue={'def-val'} ref={projRef}>
                                    <option value={'def-val'} disabled>Select Project</option>
                                    {Object.entries(projList).map((e,i)=>
                                    <option value={e[1].id} key={i}>{e[1].name}</option>
                                )}
                                </select> */}
                            </div>
                            {/* <div>
                                <label>Git Configuration: </label>
                                <input onChange={(e)=>e.target.value=e.target.value.replaceAll(" ","")} placeholder={'Git configuration name'} ref={gitconfigRef}/>
                            </div> */}
                            {/* <div>
                                <label>Git Branch: </label>
                                <input onChange={(e)=>e.target.value=e.target.value.replaceAll(" ","")} placeholder={'Branch name'} ref={gitBranchRef}/>
                            </div> */}
                            <div className='paddingLabel'>
                                <label htmlFor='version'>Version: </label>
                                <Dropdown 
                                   inputId="version"
                                   name={VersionItem}
                                   ref={gitVerRef}
                                   value={VersionItemValue}
                                   options={VersionItem}
                                   optionLabel="value"
                                   placeholder="Select Version"
                                   className="imp-inp"
                                   title={comMsgRef}
                                   style={{width:'20rem', marginLeft:'6rem'}}
                                   defaultValue={'def-val'}
                                   onChange={(e)=>resetcommsg(e)}
                                />
                                {/* <select className='imp-inp'  onChange={resetcommsg} defaultValue={'def-val'} ref={gitVerRef} title= {comMsgRef}>
                                <option value={'def-val'} disabled>Select Version</option>
                                    {Object.entries(gitExportDetails).map((e,i)=>
                                    <option value={e[1].id} key={i}>{e[1].version}</option>
                                    )}
                                </select> */}
                            </div>
                            <div className='paddingLabel'>
                                <label htmlFor='importItem'>Import into: </label>
                                <Dropdown 
                                   inputId="importItem"
                                   name={ImportItem}
                                   ref={projRef}
                                   value={ImportValue}
                                   options={ImportItem}
                                   optionLabel="value"
                                   placeholder="Select Import Project"
                                   className="imp-inp"
                                   title={comMsgRef}
                                   style={{width:'20rem', marginLeft:'4rem'}}
                                   defaultValue={'def-val'}
                                   onChange={(e)=>resetImportModules(e)}
                                />
                                
                                {/* <select className='imp-inp'  onChange={resetImportModule} defaultValue={'def-val'} ref={projRef}>
                                    <option value={'def-val'} disabled>Select Import Project</option>
                                    {Object.entries(projList).map((e,i)=>
                                    <option value={e[1].id} key={i}>{e[1].name}</option>
                                )}
                                </select> */}
                            </div>
                            {/* <div>
                                <label>Version: </label>
                                <select className='imp-inp'  onChange={resetcommsg} defaultValue={'def-val'} ref={gitVerRef} title= {comMsgRef}>
                                <option value={'def-val'} disabled>Select Version</option>
                                    {Object.entries(gitExportDetails).map((e,i)=>
                                    <option value={e[1].id} key={i}>{e[1].version}</option>
                                    )}
                                </select>
                            </div>
                            <div>
                                <label>Import into: </label>
                                <select className='imp-inp'  onChange={resetImportModule} defaultValue={'def-val'} ref={projRef}>
                                    <option value={'def-val'} disabled>Select Import Project</option>
                                    {Object.entries(projList).map((e,i)=>
                                    <option value={e[1].id} key={i}>{e[1].name}</option>
                                )}
                                </select>
                            </div>
                            {/*<div>
                                <label>Folder Path: </label>
                                <input placeholder={'Ex: Projectname/Modulename'} ref={gitPathRef}/>
                            </div> */}
                        </Fragment>:
                            (<>{uploadFileField || (["excel","json","xls"].includes(importType))?<div className='paddingLabel'>
                            <label>Upload File: </label>
                            <input accept={acceptType[importType]} disabled={!uploadFileField && importType==="zip"} type='file' onChange={(e) => upload(e)} ref={uploadFileRef}/>
                            </div>:null}</>)
                    }
                    
                </Fragment>
            }
            {fileUpload && /* !isMultiImport && */
                <Fragment>
                    {(importType==='zip')?
                    <div className='paddingLabel'>
                        <label htmlFor='project'>Project: </label>
                        <Dropdown
                                    inputId="project"
                                    name={projectItem}
                                    ref={projRef}
                                    value={projectValue}
                                    options={projectItem}
                                    optionLabel="value"
                                    placeholder="Select Project"
                                    className="imp-inp"
                                    style={{width:'20rem', marginLeft:'6rem'}}
                                    defaultValue={'def-val'}
                                    onChange={(e)=>changeProject(e)}
                                />
                        {/* <label>Project: </label>
                        <select className='imp-inp' disabled={false} ref={projRef}>
                        <option value={'def-val'}>Select Project</option>
                            {(()=>{
                                return Object.entries(projList).map((e)=>{
                                        return <option value={e[1].id} key={e[0]}>{e[1].name}</option>
                                })
                            })()       
                            }
                            {/* <option value={fileUpload.projectID} >{projList[fileUpload.projectID].name}</option> */}
                        {/* </select> */}
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
                    <div className='paddingLabel'>
                        <label htmlFor='project'>Project: </label>
                        <Dropdown
                                    inputId="project"
                                    name={projectItem}
                                    ref={projRef}
                                    value={projectValue}
                                    options={projectItem}
                                    optionLabel="value"
                                    placeholder="Select Project"
                                    className="imp-inp"
                                    style={{width:'20rem', marginLeft:'6rem'}}
                                    defaultValue={'def-val'}
                                    onChange={(e)=>changeProject(e)}
                                />
                    </div>:null
                    }
                    {(importType==='excel')?
                    <Fragment>
                    <div className='paddingLabel'>
                    <label htmlFor='project'>Project: </label>
                        <Dropdown
                                    inputId="project"
                                    name={projectItem}
                                    ref={projRef}
                                    value={projectValue}
                                    options={projectItem}
                                    optionLabel="value"
                                    placeholder="Select Project"
                                    className="imp-inp"
                                    style={{width:'20rem', marginLeft:'6rem'}}
                                    defaultValue={'def-val'}
                                    onChange={(e)=>changeProject(e)}
                                />
                    </div>
                    <div className='paddingLabel'>
                    <label htmlFor='Sheet'>Select Sheet:</label>
                        <Dropdown
                                    inputId="Sheet"
                                    name="Sheet"
                                    ref={sheetRef}
                                    value={SheetValue}
                                    options={excelSheetItem}
                                    optionLabel="value"
                                    placeholder="Please Select Sheet"
                                    className="imp-inp"
                                    style={{width:'20rem', marginLeft:'4rem'}}
                                    defaultValue={'def-val'}
                                    onChange={(e)=>setSheetValue(e.value)}
                                />
                        {/* <label>Select Sheet: </label>
                        <select defaultValue={"def-val"} ref={sheetRef}>
                            <option value="def-val" disabled>Please Select Sheet</option>
                            {sheetList.map((e,i)=><option value={e} key={i}>{e}</option>)}
                        </select> */}
                    </div>
                    </Fragment>
                    :null}
                    {(importType==='xls')?
                    <Fragment>
                    <div className='paddingLabel'>
                    <label htmlFor='project'>Project: </label>
                        <Dropdown
                                    inputId="project"
                                    name={projectItem}
                                    ref={projRef}
                                    value={projectValue}
                                    options={projectItem}
                                    optionLabel="value"
                                    placeholder="Select Project"
                                    className="imp-inp"
                                    style={{width:'20rem', marginLeft:'6rem'}}
                                    defaultValue={'def-val'}
                                    onChange={(e)=>changeProject(e)}
                                />
                    </div>
                    <div className='paddingLabel'>
                    <label htmlFor='Sheet'>Select Sheet:</label>
                        <Dropdown
                                    inputId="Sheet"
                                    name="Sheet"
                                    ref={sheetRef}
                                    value={SheetValue}
                                    options={excelSheetItem}
                                    optionLabel="value"
                                    placeholder="Please Select Sheet"
                                    className="imp-inp"
                                    style={{width:'20rem', marginLeft:'4rem'}}
                                    defaultValue={'def-val'}
                                    onChange={(e)=>setSheetValue(e.value)}
                                />
                        {/* <label>Select Sheet: </label>
                        <select defaultValue={"def-val"} ref={sheetRef}>
                            <option value="def-val" disabled>Please Select Sheet</option>
                            {sheetList.map((e,i)=><option value={e} key={i}>{e}</option>)}
                        </select> */}
                    </div>
                    </Fragment>
                    :null}
                    {/* {/* {(importType==='xls')?
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
                    :null} */}
                </Fragment>
            }
        </div>
        </>
    )
}
// Footer for sheet choose popup
const Footer = ({error,setSubmit,disableSubmit}) =>{
    return(
      <Fragment>
            <div className='mnode__buttons'>
                <label className='err-message'>{error}</label>                
                <Button disabled={disableSubmit} onClick={()=>setSubmit(true)} label='Import'/>                
            </div>
      </Fragment>
    )
}

const validate = ({ftypeRef,uploadFileRef,projRef,gitconfigRef,gitVerRef,sheetRef,expProjRef}) =>{
    var err = false;
    [ftypeRef,uploadFileRef,projRef,gitconfigRef,gitVerRef,sheetRef,expProjRef].forEach((e)=>{
        if(e.current){
            // e.current.style.border = '1px solid black';
            if(e.current.props){
                if(e.current.props.value === 'def-val' || e.current.props.value === ''){
                    err = true
                }
            }
            else if(e.current.value === 'def-val' || e.current.value === ''){
                e.current.style.border = '1px solid red';
                err = true
            }
            if(e.current.type === 'file' || !e.current.props.__TYPE === 'Dropdown'){
                if(!uploadFileRef.current.files[0]){
                    e.current.style.border = '1px solid red';
                    err = true
                }
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
    if(importType === 'xls'){
        let validateNode = true;
        var res = await singleExcelToMindmap({'content':importData,'flag':'data',sheetname: sheet})
        if(res.error){displayError(res.error.CONTENT);return;}
        res.forEach((e, i) =>{
            if (!validNodeDetails(e.name)) validateNode = false;
        });
        if(!validateNode){
            changeImportType({target: {value: "excel"}});
            displayError(MSG.MINDMAP.ERR_INVALID_MODULE_NAME.CONTENT);return;
        }
        mindmapData = {createnew:true,importData:{createdby:'excel',data:res}} 
        
    }
    // if(importType === 'pd'){
    //     var res =  await pdProcess({'projectid':importProj,'file':importData})
    //     if(res.error){displayError(res.error);return;}
    //     var data = getJsonPd(res.data)
    //     mindmapData = {createnew:true,importData:{createdby:'pd',data:data}}
    // }
	// if(importType === 'sel'){
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
            dispatch(dontShowFirstModule(true))
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
                        if (i===0){
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

const validNodeDetails = (value) =>{
    var nName, flag = !0;
    nName = value;
    var regex = /^[a-zA-Z0-9_]*$/;;
    if (nName.length === 0 || nName.length > 255 || !(regex.test(nName)) || nName=== 'Screen0' || nName === 'Testcase0' || nName === 'TestSteps0') {
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