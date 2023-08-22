import React, { Fragment, useRef, useState ,useEffect,useMemo} from 'react';
import {ModalContainer, Messages as MSG, setMsg,ResetSession,VARIANT} from '../../global';
import * as actionTypes from '../state/action';
import {useSelector,useDispatch} from 'react-redux';
import {Link} from 'react-router-dom';
import {readTestSuite_ICE,exportMindmap,exportToExcel,exportToGit,exportToProject,getModules,exportToMMSkel,checkExportVer} from '../api';
import '../styles/ExportMapButton.scss'
import PropTypes from 'prop-types';
import axios from 'axios';
import { dispatch } from 'd3';

/*Component ExportMapButton
  use: renders ExportMapButton and popups for selection on click 
*/

const ExportMapButton = ({setBlockui,displayError,isAssign=true,releaseRef,cycleRef}) => {
    const fnameRef = useRef()
    const ftypeRef = useRef()
    const gitconfigRef = useRef()
    const gitBranchRef =  useRef()
    const gitVerRef =  useRef()
    const gitPathRef =  useRef()
    const [exportBox,setExportBox] = useState(false)    
    const selectedModule = useSelector(state=>state.mindmap.selectedModule)
    const selectedModulelist = useSelector(state=>state.mindmap.selectedModulelist)
    const enableExport = useSelector(state=>state.mindmap.enableExport)
    const exportprojname = useSelector(state=>state.mindmap.exportProjname)
    const enableExportMindmapButton = useSelector(state=>state.mindmap.enableExportMindmapButton)
    const selectedProj = useSelector(state=>state.mindmap.selectedProj)
    const projectList = useSelector(state=>state.mindmap.projectList)
    const [expType,setExpType] = useState(undefined);
    const expTypes = ["custom","git","json","excel"];
    const [error,setError] = useState(false);
    const [currProjId,setCurrProjId] = useState("");
    const [exportProject,setExportProject] = useState(true)
    const [exportFile,setExportFile] = useState(false);
    const userInfo = useSelector(state=>state.login.userinfo);   
    const [showMessage, setShowMessage] = useState(false);    
    const dispatchAction=useDispatch()
    const gitComMsgRef = useRef()
    const [exportVer,setExportVer]=useState([])
     
    const getExportFile = async () => {        
        try {
            
            dispatchAction({type:actionTypes.ENABLE_EXPORT_BUTTON,payload:false})
            const res = await fetch("/downloadExportfile?projName="+exportprojname);            
            await res.json().then(({status})=>{
              
                if (status === "available"){
                    setMsg(MSG.MINDMAP.SUCC_DATA_EXPORTED);                     
                    setExportBox(false);
                    dispatchAction({type:actionTypes.EXPORT_PROJNAME,payload:""})
                    dispatchAction({type:actionTypes.ENABLE_EXPORT,payload:true})
                    setExportProject(true);
                    setExportFile(false);
                    window.location.href = window.location.origin+"/downloadExportfile?projName="+exportprojname+"&file=getExportFile"
                    
                }else {setMsg("error while exporting");
                dispatchAction({type:actionTypes.ENABLE_EXPORT,payload:true}) 
                setExportBox(false); 
                dispatchAction({type:actionTypes.EXPORT_PROJNAME,payload:""})
                setExportProject(true);
                setExportFile(false);                                 
              }     
            })  
        } catch (ex) {
            console.error("Error while exporting", ex);
            setMsg("error while exporting");
            setExportBox(false); 
            dispatchAction({type:actionTypes.EXPORT_PROJNAME,payload:""})
            setExportProject(true);
            setExportFile(false);
            dispatchAction({type:actionTypes.ENABLE_EXPORT,payload:true})
        }

    }
    
    const clickExportProj = ()=>{
        if (currProjId===null || currProjId==="" || currProjId ==="def-val-project"){displayError({CONTENT:"Please select project",VARIANT:VARIANT.ERROR});return;}
        else{let selectedModuleVar = selectedModulelist.length>0?selectedModulelist:selectedModule;
        setExportBox(false)
        setExpType(null) ;setCurrProjId(null);setError(false); setExportProject(true);
        setExportFile(false)
        setBlockui({show:true,content:'Exporting Mindmap ...'})
        exportToProj(selectedModuleVar,currProjId,displayError,setBlockui);}
    }
    const clickExport = () => {
        // if(!selectedModule._id || selectedModulelist.length==0)return;
        var err = validate([fnameRef,ftypeRef,gitconfigRef,gitBranchRef,gitVerRef,gitPathRef,gitComMsgRef])
        if(err)return
        var ftype = ftypeRef.current.value
        if(ftype === 'git' && exportVer.includes(gitVerRef.current.value)){
            displayError({CONTENT:"Version is already used, Please provide a unique version",VARIANT:VARIANT.ERROR});return;
        } 
        let selectedModuleVar = selectedModulelist.length>0?selectedModulelist:selectedModule;
        setExportBox(false);
        setExpType(null) ;setCurrProjId(null);setError(false);setExportProject(true);
        setExportFile(false)        
        var fname=projectList[selectedProj]["name"];
        var exportProjId=projectList[selectedProj]["id"];
        var exportProjAppType=projectList[selectedProj]["apptypeName"];
        if(ftype === 'json') {dispatchAction({type:actionTypes.ENABLE_EXPORT,payload:false});dispatchAction({type:actionTypes.EXPORT_PROJNAME,payload:fname});setShowMessage(true);setBlockui({show:true,content:'Exporting Mindmap ...'});setMsg(MSG.MINDMAP.SUCC_DATA_EXPORTED_NOTIFY);toJSON(selectedModuleVar,fname,displayError,setBlockui,setShowMessage,setMsg,dispatchAction,exportProjId,exportProjAppType);}           
        if(ftype === 'excel') {setBlockui({show:true,content:'Exporting Mindmap ...'});toExcel(selectedProj,selectedModuleVar,fname,displayError,setBlockui)};
        if(ftype === 'custom') {setBlockui({show:true,content:'Exporting Mindmap ...'});toCustom(selectedProj,selectedModuleVar,projectList,releaseRef,cycleRef,fname,displayError,setBlockui)};
        if(ftype === 'git') {setMsg(MSG.MINDMAP.SUCC_DATA_EXPORT_NOTIFY);toGit({selectedProj,projectList,displayError,setBlockui,gitconfigRef,gitVerRef,gitPathRef,gitBranchRef,selectedModuleVar,exportProjAppType,gitComMsgRef,fname})}
    }
    return(
        <Fragment>
            {exportBox?<ModalContainer
            title='Export MindMap'
            close={()=>{setExportBox(false);setExpType(null) ;setCurrProjId(null);setError(false);setExportProject(true);setExportFile(false) }}
            footer={<Footer clickExport={clickExport}  expType ={expType} expTypes ={expTypes} setExpType={setExpType} clickExportProj={clickExportProj} error={error} exportProject={exportProject}  projectList={projectList} selectedProj={selectedProj} enableExportMindmapButton={enableExportMindmapButton}/>}
            content={<Container isEndtoEnd={selectedModule.type === "endtoend"} selectedModulelist={selectedModulelist} gitconfigRef={gitconfigRef} gitBranchRef={gitBranchRef} gitVerRef={gitVerRef} gitPathRef={gitPathRef} fnameRef={fnameRef} ftypeRef={ftypeRef} modName={projectList[selectedProj]["name"]} isAssign={isAssign} projectList={projectList} 
            expType ={expType} expTypes ={expTypes} setExpType={setExpType} setError={setError} selectedProj={selectedProj} currProjId={currProjId} setCurrProjId={setCurrProjId} exportProject={exportProject} setExportProject={setExportProject} exportFile={exportFile} setExportFile={setExportFile} getExportFile={getExportFile} userInfo={userInfo} showMessage={showMessage} enableExport={enableExport} gitComMsgRef ={gitComMsgRef}
            setExportVer={setExportVer}/>} 
            />:null}
            <svg data-test="exportButton" className={"ct-exportBtn"+( enableExport || selectedModulelist.length>0?"":" disableButton")} id="ct-export" onClick={()=>setExportBox((enableExport || selectedModulelist.length>0) ? true : false)} >
                <g id="ct-exportAction" className="ct-actionButton">
                    <rect x="0" y="0" rx="12" ry="12" width="80px" height="25px"></rect>
                    <text x="16" y="18">Export</text>
                </g>
            </svg>
        </Fragment>
    )
}

const validate = (arr) =>{
    var err = false;
    arr.forEach((e)=>{
        if(e.current){
            e.current.style.borderColor = 'black'
            if(!e.current.value || e.current.value ==='def-option'){
                e.current.style.borderColor = 'red'
                err = true
            }
        }
    })
    return err
}


const Container = ({isEndtoEnd,ftypeRef,selectedModulelist,isAssign,gitconfigRef,gitBranchRef,gitVerRef,gitPathRef,projectList,expType,setExpType,setError,selectedProj,setCurrProjId,exportProject,setExportProject,exportFile,setExportFile,getExportFile,showMessage,enableExport,gitComMsgRef,setExportVer}) =>{
    
    const changeExport = (e) => {
        
        setExpType(e.target.value);
        setCurrProjId(e.target.value);
        resetImportModule(e.target.value);
    }
    const changeExportFile=async(e) =>{
        setExpType(e.target.value);
        if (e.target.value == "git"){
            const res= await checkExportVer({"exportname":"exportname","query":"exportgit","projectId":selectedProj})
            setExportVer(res);
        }
    }
    const resetImportModule = async(selProj) => {
          if(selProj) {
              var moduledata = await getModules({"tab":"tabCreate","projectid":selProj,"moduleid":null,"query":"modLength"})
              if (moduledata.length>0){
                 setError(true)                
                  return
              }
              else {
                setError(false)
              }
          }
               
      }
    const check=(e)=>{
      if (e.target.id=="select export to project"&& e.target.checked){
        document.getElementById("Export To File").checked=false;
        setExpType(null)
        setExportProject(true)
        setExportFile(false)
      }
      if (e.target.id=="Export To File" && e.target.checked){
        document.getElementById("select export to project").checked=false;
        setExportProject(false)
        setCurrProjId(null)
        setExportFile(true)
        setError(false)
      }

    }
    return(
        <div>
            <div>
                <div className='export-rec-row'>
             <label> <input type="radio" id ="select export to project"  checked ={exportProject} onChange={check}/> Copy To Project </label>
               {exportProject && <select defaultValue={'def-option'} disabled={exportFile} ref={ftypeRef} onChange={changeExport}>
                <option value={'def-val-project'}>Select Project</option>
                            {(()=>{
                                
                                
                                let appTypeName = ''
                                for (let projects in projectList) {
                                    if(projectList[projects].id == selectedProj) {
                                        appTypeName = projectList[projects]['apptypeName']
                                        break;
                                    }
                                }

                                return Object.entries(projectList).map((e)=>{
                                        if(e[1].apptypeName == appTypeName)return <option value={e[1].id} key={e[0]}>{e[1].name}</option>
                                })
                            })()       
                            }
                        </select>}</div>
                <div className='export-rec-row'>
                <label ><input type="radio" id ="Export To File" onChange={check}/> Export To File </label>
                {exportFile && <select defaultValue={'def-option'} disabled={exportProject} ref={ftypeRef} onChange={changeExportFile}>
                    <option value={""} >Select Export Format</option>
                    {isAssign && <option value={'custom'}>Structure only - Json (.json)</option>}
                    {!isEndtoEnd &&
                    <>
                    <option value={'excel'}>Structure only- Excel (.xlx,.xlsx)</option>
                    <option value={'git'}>Git</option>
                    <option value={'json'}>Complete Module (.zip)</option>
                    </>}
                </select>}
                </div>
            </div>
            {(expType === 'git')?
                <Fragment>
                    {/* <div className='export-row'>
                        <label>Git Configuration: </label>
                        <input onChange={(e)=>e.target.value=e.target.value.replaceAll(" ","")} placeholder={'Git configuration name'} ref={gitconfigRef}/>
                    </div> */}
                    {/* <div className='export-row'>
                        <label>Git Branch: </label>
                        <input onChange={(e)=>e.target.value=e.target.value.replaceAll(" ","")} placeholder={'Branch name'} ref={gitBranchRef}/>
                    </div>*/}
                    <div className='export-row'>
                        <label style={{width:'5.9rem'}}>Version: </label>
                        <input  style={{width:'75%'}} onChange={(e)=>e.target.value=e.target.value.replaceAll(" ","")} placeholder={'Version'} ref={gitVerRef}/>
                    </div>
                    {/*<div className='export-row'>
                        <label>Folder Path: </label>
                        <input onChange={(e)=>e.target.value=e.target.value.replaceAll(" ","")} placeholder={'Projectname/Modulename'} ref={gitPathRef}/>
                    </div> */}
                    <div className='export-row'>
                        <label style={{width:'5.9rem'}} >Comment : </label>
                        <textarea  style={{width:'75%'}} placeholder={'Commit message'} ref={gitComMsgRef}></textarea>
                    </div>
                </Fragment>:null
            }
           {/* {(exportFile && expType && expType !== 'git' &&  expTypes.includes(expType) )?
                <div className='export-file-row'>
                    <label>File Name: </label>
                    <input ref={fnameRef} defaultValue={modName} placeholder={'Enter file name'}></input>
                </div>:null
            } */}
            {showMessage?<div > Export file is being prepared. <br></br> You can come back to this section after few minutes for the download</div> :null}
       {enableExport?<div >Click <span style={{color:'blue',cursor:'pointer',fontWeight:'bold'}} onClick={()=>{getExportFile()}}>here</span> to download the exported file </div>:null} 
       
            
        </div>
    )
}
const Footer = ({clickExport,clickExportProj,error,exportProject,enableExportMindmapButton}) => {
    return ((exportProject)? <div>
       {error && <span style={{color:"red"}}>Please select a project which has no modules</span>}
       <button disabled={ error} onClick={clickExportProj} >Export Project</button>
       </div>:(!exportProject && enableExportMindmapButton)? <div><button onClick={clickExport}>Export</button> </div>:null
       
     
      )} 
       

/*
    function : toExcel()
    Purpose : Exporting Module in json file
    param :
*/
const toExcel = async(projId,module,fname,displayError,setBlockui) => {
    try{
        var data = {
            "projectid":projId,
            "moduleid":Array.isArray(module)?module:module._id
        }
        var result = await exportToExcel(data)
        if(result.error){displayError(result.error);return;}
        var file = new Blob([result], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        var fileURL = URL.createObjectURL(file);
        var a = document.createElement('a');
        a.href = fileURL;
        a.download = fname+'.xlsx';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(fileURL);
        setBlockui({show:false,content:''})
        setMsg(MSG.MINDMAP.SUCC_DATA_EXPORTED)
    }catch(err){
        console.error(err)
        displayError(MSG.MINDMAP.ERR_EXPORT_MINDMAP)
    }
}

/*
    function : toJSON()
    Purpose : Exporting Module in json file
    param :
*/
const toJSON = async(module,fname,displayError,setBlockui,setShowMessage,setMsg,dispatchAction,exportProjId,exportProjAppType) => {
    try{        
        
        let data={
            "projectName":fname,
            "moduleid":Array.isArray(module)?module:module._id,
            "exportProjId":exportProjId,
            "exportProjAppType":exportProjAppType
        }
        ResetSession.start()
        let result = await exportMindmap(data)
        
        if(result.error){displayError(result.error);setBlockui({show:false,content:''});setShowMessage(false);dispatchAction({type:actionTypes.EXPORT_PROJNAME,payload:""});dispatchAction({type:actionTypes.ENABLE_EXPORT_BUTTON,payload:false});dispatchAction({type:actionTypes.ENABLE_EXPORT,payload:true}); ResetSession.end();return;}
        if(result === "InProgress"){setMsg(MSG.MINDMAP.WARN_EXPORT_INPROGRESS);setBlockui({show:false,content:''});setShowMessage(false);dispatchAction({type:actionTypes.EXPORT_PROJNAME,payload:""});dispatchAction({type:actionTypes.ENABLE_EXPORT_BUTTON,payload:false});dispatchAction({type:actionTypes.ENABLE_EXPORT,payload:true}); ResetSession.end();return;}
        
        ResetSession.end()
        setTimeout(()=>{
            dispatchAction({type:actionTypes.ENABLE_EXPORT_BUTTON,payload:true})
            setBlockui({show:false,content:''})
            setShowMessage(false);
            setMsg(MSG.MINDMAP.SUCC_DATA_EXPORTED_ON_FILE)
        },5000)
        
        
             
        
    }catch(err){
        console.error(err)
        ResetSession.end()
        displayError(MSG.MINDMAP.ERR_EXPORT_MINDMAP);
        setShowMessage(false);
        dispatchAction({type:actionTypes.EXPORT_PROJNAME,payload:""})
        dispatchAction({type:actionTypes.ENABLE_EXPORT_BUTTON,payload:false})
        dispatchAction({type:actionTypes.ENABLE_EXPORT,payload:true})
    }
}
const exportToProj = async(module,currProjId,displayError,setBlockui) => {
    try{
        var data = {
            "projectid":currProjId,
            "moduleid":Array.isArray(module)?module:module._id
        }
        ResetSession.start()
        var result =  await exportToProject(data)
        if(result.error){displayError(result.error);ResetSession.end();return;}
        if(result === "InProgress"){setMsg(MSG.MINDMAP.WARN_EXPORT_INPROGRESS);setBlockui({show:false,content:''}); ResetSession.end();return;}
        setBlockui({show:false,content:''})
        setMsg(MSG.MINDMAP.SUCC_DATA_EXPORTED)
        ResetSession.end()
    }catch(err){
        ResetSession.end()
        console.error(err)
        displayError(MSG.MINDMAP.ERR_EXPORT_MINDMAP)
    }
}
/*
    function : toGit()
    Purpose : Exporting testsuite and executiondata in json file
    param :
*/

const toGit = async ({selectedProj,projectList,displayError,setBlockui,gitconfigRef,gitVerRef,gitPathRef,gitBranchRef,selectedModuleVar,exportProjAppType,gitComMsgRef,fname}) => {
    // var gitpath=gitPathRef.current.value;
	// if(!gitpath){
    //     gitpath = 'avoassuretest_artifacts/'+projectList[selectedProj].name+'/';
    // }
    ResetSession.start()
    var res = await exportToGit({
        // gitconfig: gitconfigRef.current.value,
        gitVersion: gitVerRef.current.value,
		// gitFolderPath:gitpath,
		// gitBranch: gitBranchRef.current.value,
		mindmapId: Array.isArray(selectedModuleVar)?selectedModuleVar:selectedModuleVar._id,
        "exportProjAppType":exportProjAppType,
        "projectId":selectedProj,
        "projectName":fname,
        gitComMsgRef:gitComMsgRef.current.value
    })
    if(res.error){displayError(res.error);setBlockui({show:false});ResetSession.end();return;}
    ResetSession.end()
    setBlockui({show:false})
    setMsg(MSG.MINDMAP.SUCC_DATA_EXPORTED)
}

/*
    function : toCustom()
    Purpose : Exporting testsuite and executiondata in json file
    param :
*/
const toCustom = async (selectedProj,module,projectList,releaseRef,cycleRef,fname,displayError,setBlockui) =>{
    try{
        var data = {
            "tab":"createTab",
		    "projectid":selectedProj,
		    "moduleid":Array.isArray(module)?module:module._id,
		    "cycleid":null,
        }
        var result = await exportToMMSkel (data)
        if(result.error){displayError(result.error);return;}
        jsonDownload(fname+'.json', JSON.stringify(result));
        setBlockui({show:false,content:''})
        setMsg(MSG.MINDMAP.SUCC_DATA_EXPORTED)
    }catch(err){
        displayError(MSG.MINDMAP.ERR_EXPORT_DATA);
        console.error(err);
    } 
}

/*
function : jsonDownload()
Purpose : download json file
*/

function jsonDownload(filename, responseData) {
    var blob = new Blob([responseData], { type: 'text/json' });    
    var e = document.createEvent('MouseEvents');
    var a = document.createElement('a');
    a.download = filename;
    a.href = window.URL.createObjectURL(blob);
    a.dataset.downloadurl = ['text/json', a.download, a.href].join(':');
    e.initMouseEvent('click', true, true, window,
        0, 0, 0, 0, 0, false, false, false, false, 0, null);
    a.dispatchEvent(e);
}
ExportMapButton.propTypes={
    isAssign:PropTypes.bool,
    setBlockui:PropTypes.func,
    displayError:PropTypes.func,
    releaseRef:PropTypes.object,
    cycleRef:PropTypes.object
}

export default ExportMapButton;