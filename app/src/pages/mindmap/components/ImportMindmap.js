import React, { useRef, Fragment, useState, useEffect } from 'react';
import {excelToMindmap, getProjectList, getModules, getScreens, importMindmap ,gitToMindmap, pdProcess, importGitMindmap} from '../api';
import {ModalContainer, Messages as MSG,setMsg, VARIANT, ScrollBar} from '../../global'
import { parseProjList, getApptypePD, getJsonPd} from '../containers/MindmapUtils';
import { useDispatch, useSelector } from 'react-redux';
import * as actionTypes from '../state/action';
import PropTypes from 'prop-types';
import '../styles/ImportMindmap.scss';
import { Link } from 'react-router-dom';

const ImportMindmap = ({setImportPop,setBlockui,displayError,setOptions, isMultiImport}) => {
    const [projList,setProjList] = useState({})
    const [error,setError] = useState('')
    const [submit,setSubmit] = useState(false)
    const [disableSubmit,setDisableSubmit] = useState(true)
    const [mindmapData,setMindmapData] = useState([])
    const [duplicateModuleList,setDuplicateModuleList] = useState([]);
    const [duplicateFlag,setDuplicateFlag] = useState(false);
    
    useEffect(()=>{
        (async()=>{
            setBlockui({show:true,content:'Loading ...'})
            var res = await getProjectList()
            if(res.error){displayError(res.error);return;}
            var data = parseProjList(res)
            setProjList(data)
            setBlockui({show:false})
            setDuplicateModuleList([])
        })()
    },[]) 
    if(!Object.keys(projList).length >0) return null
    return(
    <>
        <ModalContainer 
        modalClass = "modal-mmd"
        title='Import Modules'
        close={()=>setImportPop(false)}
        footer={<Footer error={error} disableSubmit={disableSubmit} duplicateModuleList={duplicateModuleList} setDuplicateFlag={setDuplicateFlag} setSubmit={setSubmit}/>}
        content={<Container submit={submit} setMindmapData={setMindmapData} setDuplicateModuleList={setDuplicateModuleList}mindmapData={mindmapData} setDisableSubmit={setDisableSubmit} setSubmit={setSubmit} displayError={displayError} setOptions={setOptions} projList={projList} setImportPop={setImportPop} setError={setError} setBlockui={setBlockui} isMultiImport={isMultiImport}/>} 
      />
      {duplicateFlag && 
        <ModalContainer
        modalClass='modal-md'
        title={"Duplicate Modules Names"}
        content={<ScrollBar thumbColor="#321e4f">
                  <div style={{maxHeight:440, display:"flex", flexDirection:"column"}}>
                    {Array.from(duplicateModuleList).map((module_name,idx)=> {return <li key={idx+module_name}>{module_name}</li>})} 
                  </div>
                </ScrollBar>}
        close={()=>{setDuplicateFlag(false)}}
        />
        }
    </>
    )
}

const Container = ({projList,setBlockui,setMindmapData,setDuplicateModuleList,displayError,mindmapData,setDisableSubmit,setError,setSubmit,submit,setOptions,setImportPop,isMultiImport}) => {
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
    
    const upload = () => {
        let  project = "";
        if(importType === 'json'){
            project = projRef.current.value;
        if(project=='def-val'){
            displayError({CONTENT:"Please select project",VARIANT:VARIANT.WARNING});
            setDisableSubmit(true)
            return false
            
        }
    }
        setError('')
        setFiledUpload(undefined)
        setDisableSubmit(false)
        setDuplicateModuleList([])
        uploadFile({setBlockui,setMindmapData,setDuplicateModuleList,projList,uploadFileRef,setSheetList,setError,setDisableSubmit,setFiledUpload, selectedProject:project})
    }
    const changeImportType = (e) => {
        // projRef.current.value = ""
        if(projRef.current)projRef.current.value = ''
        if(uploadFileRef.current)uploadFileRef.current.value = ''
        setImportType(e.target.value)        
        setFiledUpload(undefined)
        setDisableSubmit(true)
        setError('')
        if(e.target.value==="json"){ setUploadFileField(false); resetImportModule();}
    }
    const resetImportModule = async() => {
      if(uploadFileRef.current)uploadFileRef.current.value = ''
        if(projRef.current.value) {
            var moduledata = await getModules({"tab":"tabCreate","projectid":projRef.current.value,"moduleid":null,"query":"modLength"})
            if (moduledata.length>0){
                setError('Please select a Project which has no Modules.')                
                setUploadFileField(false)
                setFiledUpload(undefined)
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
        json:".mm",
		sel:".sel"
    }
    useEffect(()=>{
        if(submit){
            setSubmit(false)
            setDisableSubmit(true)
            setImportPop(false)
            setError('')           
            var err = validate({importType,ftypeRef,uploadFileRef,projRef,gitconfigRef,gitBranchRef,gitVerRef,gitPathRef,sheetRef})
            if(err){
                setBlockui({show:false})
                return;
            }
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
                
                if(isMultiImport && importType === 'json'){
                    setBlockui({content:'Importing ...',show:true})
                    
                    var res = await importMindmap(mindmapData)
                
                    if(res.error){setError(res.error);setBlockui({show:false});return;}
                    var req={
                        tab:"tabCreate",
                        projectid:mindmapData[0]?mindmapData[mindmapData.length -1]["projectid"]:mindmapData.projectid,
                        version:0,
                        cycId: null,
                        moduleid:Array.isArray(res)?res:res
                    }
                    res = await getModules(req)
                
                    if(res.error){setError(res.error);setBlockui({show:false});return;}
                    setFiledUpload(res)
                    setMsg(MSG.MINDMAP.SUCC_DATA_IMPORTED)
                    setImportPop(false);
                    setBlockui({show:false})
                }else{
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
                <label>Import As: </label>
                <select className='imp-inp' defaultValue={'def-val'} onChange={changeImportType} ref={ftypeRef}>
                    <option value={'def-val'} disabled>Select Import Format</option>
                    {/* <option value={'pd'}>AvoDiscovery (.pd)</option> */}
                    <option value={'excel'}>Excel Workbook (.xls,.xlsx)</option>
                    <option value={'git'}>Git (.mm)</option> 
                    <option value={'json'}>MindMap (.mm)</option>
					<option value={'sel'}>Selenium To Avo (.sel)</option>
                </select>
            </div>
            {isMultiImport && 
                <Fragment>
                    {(importType==='json')?
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
                        (<>{uploadFileField || (["excel","sel"].includes(importType))?<div>
                            <label>Upload File: </label>
                            <input accept={acceptType[importType]} disabled={!uploadFileField && importType==="json"} type='file' onChange={upload} ref={uploadFileRef}/>
                            </div>:null}</>)
                    }
                    
                </Fragment>
            }
            {fileUpload && /* !isMultiImport && */
                <Fragment>
                    {(importType==='json')?
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
const Footer = ({error,setSubmit,disableSubmit,duplicateModuleList,setDuplicateFlag}) =>{
    return(
      <Fragment>
            <div className='mnode__buttons'>
                <label className='err-message'>{error}
                {error && duplicateModuleList?.size>0 && error.indexOf("duplicate")>-1 && <><br/><Link className="tcView" to="#" onClick={()=>setDuplicateFlag(true)}>View Duplicate Modules</Link></>}</label>                
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
        setTimeout(function() {
            dispatch({type:actionTypes.IMPORT_MINDMAP,payload:{
                selectProj : importProj,
                selectModule : mindmapData,
                screenData : screendata,
                moduleList : moduledata,
            }
        })
        setImportPop(false)
        setOptions('importmodules')
        // setBlockui({show:false})
        }, 200);
    // }
   
}

const uploadFile = async({uploadFileRef,setMindmapData,setDuplicateModuleList,setSheetList,setDisableSubmit,setistrue,setError,setFiledUpload,projList,setData,fileImport,setBlockui,selectedProject}) =>{
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
            var projFlag = false
            var duplicateData = JSON.parse(result);
            let selectedAppType = projList[selectedProject].apptypeName;  
            var importedAppType=duplicateData[duplicateData.length -2]["apptype"];
            if(selectedAppType!==importedAppType){
                setError("Selected project is of different App Type");
                setDisableSubmit(true)
                return false
            }
            // var existingModulesInSelectedProject = await getModules({"tab":"tabCreate","projectid":selectedProject,"moduleid":null})
            // var uniqueModuleNames = new Set();
            // existingModulesInSelectedProject.map((m) => {
            //     uniqueModuleNames.add(m.name)
            // })
            // console.log('existingModulesInSelectedProject: ', JSON.stringify(existingModulesInSelectedProject))
            // console.log('uniqueModuleNames: ', JSON.stringify(uniqueModuleNames))

            
            // var duplicateModuleNames = new Set();
            // console.log('duplicateData',duplicateData);
            duplicateData[duplicateData.length -1]["projectid"]=selectedProject
            // var data = duplicateData[2]
            //     // if(uniqueModuleNames.has(d.name)){
            //     //     duplicateModuleNames.add(d.name);
            //     //     return false;
            //     // }else{
            //     //     return true;
            //     // }
            // // })
            // .map((d)=>{
            //     // Override projectId with the selected projectId
            //     d.projectid = selectedProject;
            //     // uniqueModuleNames.add(d.name);
            //     return d;
            // })
            
            // setDuplicateModuleList(duplicateModuleNames)
            // console.log('data',data);
            // var totallength=duplicateData.length;
            // var uniqlength=data.length;
            // var duplicatelength=totallength-uniqlength
            
            
            // if(duplicatelength ==0){
            //     setError("All "+(uniqlength)+" modules are unique and will be imported");
            // }
            // else    if(duplicatelength == totallength) {
            //     setError("All "+(duplicatelength)+" modules are duplicate and none will be imported");
            //     setBlockui({show:false});
            //     setMsg(MSG.MINDMAP.ERR_IMPORT_DATA)
            // }
            // else if(duplicatelength > 0) {
            //     setError((duplicatelength)+" modules are duplicate. Only"+ (uniqlength)+" will be imported");
                
            // }
            
               
            
            // if( !data  || data.length == 0){
            //     setDisableSubmit(true)
            //     return;
            // }
            // else {
            //     setDisableSubmit(false)
            setMindmapData(duplicateData)
                
            // }

            // var isMultiMindmap = Array.isArray(data);
            // var hasError = false,hasNoScenarios= false;
            // if(isMultiMindmap){
            //     hasError = data.find(element => !('testscenarios' in element))!=undefined;   
            //     if(!hasError){
            //         hasNoScenarios = data.find(element => element.testscenarios.length === 0)!=undefined;
            //     }             
            // }
            // if (!isMultiMindmap && !('testscenarios' in data) || hasError){
            //     setError("Incorrect JSON imported. Please check the contents!!");
            //     setDisableSubmit(true) 
            // // }else if((!isMultiMindmap && data.testscenarios.length === 0) || hasNoScenarios){
            // //     setError("The file has no node structure to import, please check!!");
            // //     setDisableSubmit(true)
            // }else{
            //     var importProj = data[0].projectid
            //     if(!importProj || !projList[importProj]){
            //         setError(MSG.MINDMAP.WARN_PROJECT_ASSIGN_USER)
            //         setBlockui({show:false})
            //         return;
            //     }
            // } 
        }else{
            setError("File is not supported")
            setDisableSubmit(true)
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