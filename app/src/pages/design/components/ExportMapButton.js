import React, { Fragment, useRef, useState ,useEffect,useMemo} from 'react';
import {ModalContainer, Messages as MSG, setMsg,ResetSession,VARIANT} from '../../global';
import {EnableExport,ExportProjname,EnableExportMindmapButton} from '../designSlice';
import {useSelector,useDispatch} from 'react-redux';
import {Link} from 'react-router-dom';
import {readTestSuite_ICE,exportMindmap,exportToExcel,exportToGit,exportToProject,getModules,exportToMMSkel,checkExportVer} from '../api';
import '../styles/ExportMapButton.scss'
import PropTypes from 'prop-types';
import axios from 'axios';
import { dispatch } from 'd3';
import { Dialog } from 'primereact/dialog';
import { Button } from 'primereact/button';
import { Dropdown } from 'primereact/dropdown';
import { Tooltip } from 'primereact/tooltip';
import { Toast } from 'primereact/toast';

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
    const selectedModule = useSelector(state=>state.design.selectedModule)
    const selectedModulelist = useSelector(state=>state.design.selectedModulelist)
    const enableExport = useSelector(state=>state.design.enableExport)
    const exportprojname = useSelector(state=>state.design.exportProjname)
    const enableExportMindmapButton = useSelector(state=>state.design.enableExportMindmapButton)
    const selectedProj = useSelector(state=>state.design.selectedProj)
    const projectList = useSelector(state=>state.design.projectList)
    const [expType,setExpType] = useState(undefined);
    const expTypes = ["custom","git","json","excel"];
    const [error,setError] = useState(false);
    const [currProjId,setCurrProjId] = useState("");
    const [exportProject,setExportProject] = useState(true)
    const [exportFile,setExportFile] = useState(false);
    const userInfo = useSelector(state=>state.landing.userinfo);   
    const [showMessage, setShowMessage] = useState(false);    
    const dispatchAction=useDispatch()
    const gitComMsgRef = useRef()
    const [exportVer,setExportVer]=useState([])
    const toast = useRef()
    const showSuccess = (Success) => {
        toast.current.show({severity:'success', summary: 'Success', detail:Success.CONTENT, life: 3000});
    }
    
    const showWarn = (Warn) => {
        toast.current.show({severity:'warn', summary: 'Warning', detail:Warn.CONTENT, life: 2000});
    }
    const getExportFile = async () => {        
        try {
            
            dispatchAction(EnableExport(false))
            const res = await fetch("/downloadExportfile?projName="+exportprojname);            
            await res.json().then(({status})=>{
              
                if (status === "available"){ 
                    toast.current.show({severity:'success', summary: 'Success', detail:MSG.MINDMAP.SUCC_DATA_EXPORTED.CONTENT, life: 3000});                    
                     setExportBox(false);
                     dispatchAction(ExportProjname(""))
                     dispatchAction(EnableExportMindmapButton(true))
                     setExportProject(true);
                     setExportFile(false);
                    window.location.href = window.location.origin+"/downloadExportfile?projName="+exportprojname+"&file=getExportFile"
                    
                }else {toast.current.show({severity:'error', summary: 'Error', detail:"error while exporting", life: 2000});
                dispatchAction(EnableExportMindmapButton(true)) 
                setExportBox(false); 
                dispatchAction(ExportProjname(""))
                setExportProject(true);
                setExportFile(false);                                 
              }     
            })  
        } catch (ex) {
            console.error("Error while exporting", ex);
            toast.current.show({severity:'error', summary: 'Error', detail:"error while exporting", life: 2000});
            setExportBox(false); 
            dispatchAction(ExportProjname(""))
            setExportProject(true);
            setExportFile(false);
            dispatchAction(EnableExportMindmapButton(true))
        }

    }
    
    const clickExportProj = ()=>{
        if (currProjId===null || currProjId==="" || currProjId ==="def-val-project"){toast.current.show({severity:'error', summary: 'Error', detail:"Please select project", life: 2000});return;}
        else{let selectedModuleVar = selectedModulelist.length>0?selectedModulelist:selectedModule;
        setExportBox(false)
        setExpType(null) ;setCurrProjId(null);setError(false); setExportProject(true);
        setExportFile(false)
        setBlockui({show:true,content:'Exporting Mindmap ...'})
        exportToProj(selectedModuleVar,currProjId,displayError,setBlockui,showSuccess,showWarn);}
    }
    const clickExport = () => {
        // if(!selectedModule._id || selectedModulelist.length==0)return;
        var err = validate([fnameRef,ftypeRef,gitconfigRef,gitBranchRef,gitVerRef,gitPathRef,gitComMsgRef])
        if(err)return
        var ftype = ftypeRef.current.props.value
        if(ftype === 'git' && exportVer.includes(gitVerRef.current.value)){
            toast.current.show({severity:'error', summary: 'Error', detail:"Version is already used, Please provide a unique version", life: 3000});return;
        } 
        let selectedModuleVar = selectedModulelist.length>0?selectedModulelist:selectedModule;
        setExportBox(false);
        setExpType(null) ;setCurrProjId(null);setError(false);setExportProject(true);
        setExportFile(false)        
        var fname=projectList[selectedProj]["name"];
        var exportProjId=projectList[selectedProj]["id"];
        var exportProjAppType=projectList[selectedProj]["apptypeName"];
        
        if(ftype === 'json') {dispatchAction(EnableExportMindmapButton(false));dispatchAction(ExportProjname(fname));setShowMessage(true);setBlockui({show:true,content:'Exporting Mindmap ...'});toast.current.show({severity:'success', summary: 'Success', detail:MSG.MINDMAP.SUCC_DATA_EXPORTED_NOTIFY.CONTENT, life: 3000});toJSON(selectedModuleVar,fname,displayError,setBlockui,setShowMessage,showSuccess,showWarn,dispatchAction,exportProjId,exportProjAppType);}           
        if(ftype === 'excel') {setBlockui({show:true,content:'Exporting Mindmap ...'});toExcel(selectedProj,selectedModuleVar,fname,displayError,setBlockui,showSuccess)};
        if(ftype === 'custom') {setBlockui({show:true,content:'Exporting Mindmap ...'});toCustom(selectedProj,selectedModuleVar,projectList,releaseRef,cycleRef,fname,displayError,setBlockui,showSuccess)};
        if(ftype === 'git') {toast.current.show({severity:'success', summary: 'Success', detail:MSG.MINDMAP.SUCC_DATA_EXPORT_NOTIFY.CONTENT, life: 3000});toGit({selectedProj,projectList,displayError,setBlockui,gitconfigRef,gitVerRef,gitPathRef,gitBranchRef,selectedModuleVar,exportProjAppType,gitComMsgRef,fname,showSuccess})}
    }
    return(
        <Fragment>
            <Toast  ref={toast} position="bottom-center" baseZIndex={1000}/>
            <Dialog className='exportDialog' header='Export MindMap' onHide={()=>{setExportBox(false);setExpType(null) ;setCurrProjId(null);setError(false);setExportProject(true);setExportFile(false) }}  visible={exportBox} style={{ width: '50vw' }} footer={<Footer clickExport={clickExport}  expType ={expType} expTypes ={expTypes} setExpType={setExpType} clickExportProj={clickExportProj} error={error} exportProject={exportProject}  projectList={projectList} selectedProj={selectedProj} enableExportMindmapButton={enableExportMindmapButton}/>} >
                    <Container isEndtoEnd={selectedModule.type === "endtoend"} selectedModulelist={selectedModulelist} gitconfigRef={gitconfigRef} gitBranchRef={gitBranchRef} gitVerRef={gitVerRef} gitPathRef={gitPathRef} fnameRef={fnameRef} ftypeRef={ftypeRef} modName={projectList[selectedProj]["name"]} isAssign={isAssign} projectList={projectList} expType ={expType} expTypes ={expTypes} setExpType={setExpType} setError={setError} selectedProj={selectedProj} currProjId={currProjId} setCurrProjId={setCurrProjId} exportProject={exportProject} setExportProject={setExportProject} exportFile={exportFile} setExportFile={setExportFile} getExportFile={getExportFile} userInfo={userInfo} showMessage={showMessage} enableExport={enableExport}  gitComMsgRef ={gitComMsgRef}
            setExportVer={setExportVer} />
            </Dialog>
            <svg data-test="exportButton" className={"ct-exportBtn"+( enableExport || selectedModulelist.length>0?"":" disableButton")} id="ct-export" onClick={()=>setExportBox((enableExport || selectedModulelist.length>0) ? true : false)}   title= "export">
                <g id="ct-exportAction" className="ct-actionButton" title="export">
                    <rect x="0" y="0" rx="12" ry="12" width="80px" height="25px" ></rect>
                    {/* <title>{enableExport || selectedModulelist.length>0?"export":" Select module(s) to export"}</title> */}
                    <Tooltip target=".exportButton" position="left" content="export"/>
                    <text x="16" y="18"  >Export</text>
                </g>
            </svg>
        </Fragment>
    )
}

const validate = (arr) =>{
    var err = false;
    arr.forEach((e)=>{
        if(e.current){
            // e.current.style.borderColor = 'black'
            if(e.current.props){
                if(e.current.props.value === 'def-option' || e.current.props.value === ''){
                    err = true
                }
            }
            else if(!e.current.value || e.current.props.value ==='def-option'){
                e.current.style.borderColor = 'red'
                err = true
            }
        }
    })
    return err
}


const Container = ({isEndtoEnd,ftypeRef,selectedModulelist,isAssign,gitconfigRef,gitBranchRef,gitVerRef,gitPathRef,projectList,expType,setExpType,setError,selectedProj,setCurrProjId,exportProject,setExportProject,exportFile,setExportFile,getExportFile,showMessage,enableExport,gitComMsgRef,setExportVer}) =>{
    const [selectedExport, setSelectedExport] = useState(null);
    const [projectValue, setProjectValue] = useState(null);
    const changeExport = (e) => {
        
        setExpType(e.target.value);
        setCurrProjId(e.target.value);
        resetImportModule(e.target.value);
        setProjectValue(e.value)
    }
    const changeExportFile=async(e) =>{
        setExpType(e.target.value);
        setSelectedExport(e.value)
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
    const exportItem = [
        { name: 'Select Import Format', code: 'NY', value:'def-val', disabled:true },
        { name: 'Structure only - Excel(.xls,.xlsx)', code: 'RM', value:'excel',disabled:!isEndtoEnd?false:true},
        { name: 'Structure only - Json (.json)', code: 'LDN', value:'custom', disabled:isAssign?false:true },
        { name: 'Git', code:'GT', value:'git',disabled:!isEndtoEnd?false:true},
        { name: 'Complete Module(S) (.zip)', code: 'IST', value:'json' , disabled:!isEndtoEnd?false:true}
    ]
    const exportProjectItem = Object.entries(projectList).map((e)=>{
                    let appTypeName = ''
                    for (let projects in projectList) {
                        if(projectList[projects].id === selectedProj) {
                            appTypeName = projectList[projects]['apptypeName']
                            break;
                        }
                    }
                    if(e[1].apptypeName === appTypeName)return { name:e[1].name, value:e[1].id, key:e[0]}      
        })
        
    return(
        <div>
            <div>
                <div className='export-rec-row'>
             <label htmlFor='ExportProject'> <input type="radio" id ="select export to project"  checked ={exportProject} onChange={check}/> Copy To Project </label>
               {exportProject && <>
               <Dropdown
                    inputId="ExportProject"
                    name="project"
                    ref={ftypeRef}
                    value={projectValue}
                    options={exportProjectItem}
                    optionLabel="name"
                    placeholder="Select Project"
                    className="imp-inp"
                    disabled={exportFile}
                    style={{width:'20rem', marginLeft:'4rem'}}
                    defaultValue={'def-option'}
                    onChange={(e)=>changeExport(e)}
                />
            {/* //    <select defaultValue={'def-option'} disabled={exportFile} ref={ftypeRef} onChange={changeExport}>
            //     <option value={'def-val-project'}>Select Project</option>
            //                 {(()=>{
                                 */}
                                
            {/* //                     let appTypeName = ''
            //                     for (let projects in projectList) {
            //                         if(projectList[projects].id == selectedProj) {
            //                             appTypeName = projectList[projects]['apptypeName']
            //                             break;
            //                         }
            //                     }

            //                     return Object.entries(projectList).map((e)=>{
            //                             if(e[1].apptypeName == appTypeName)return <option value={e[1].id} key={e[0]}>{e[1].name}</option>
            //                     })
            //                 })()       
            //                 }
            //             </select> */}
                       </> }
                    </div>
                <div className='export-rec-row'>
                <label htmlFor='Export'><input type="radio" id ="Export To File" onChange={check}/> Export To File </label>
                {exportFile && <>
                            <Dropdown
                                inputId="Export"
                                name="export"
                                ref={ftypeRef}
                                value={selectedExport}
                                options={exportItem}
                                optionLabel="name"
                                placeholder="Select Export Format"
                                className="imp-inp"
                                disabled={exportProject}
                                style={{width:'20rem', marginLeft:'4rem'}}
                                defaultValue={'def-option'}
                                onChange={(e)=>changeExportFile(e)}
                            
                            />
                        {/* // <select defaultValue={'def-option'} disabled={exportProject} ref={ftypeRef} onChange={changeExportFile}>
                        //     <option value={""} >Select Export Format</option>
                        //     {isAssign && <option value={'custom'}>Structure only - Json (.json)</option>}
                        //     {!isEndtoEnd && */}
                        {/* //     <>
                        //     <option value={'excel'}>Structure only- Excel (.xlx,.xlsx)</option>
                        //     //<option value={'git'}disabled={selectedModulelist.length>1}>Git (.mm)</option>
                        //     <option value={'json'}>Complete Module (.zip)</option>
                        //     </>} */}
                        {/* // </select>} */}
                        </>}
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
                        <input  style={{width:'50%',marginLeft:'6.3rem',height:'2rem',borderRadius:'4px'}} onChange={(e)=>e.target.value=e.target.value.replaceAll(" ","")} placeholder={' Version'} ref={gitVerRef}/>
                    </div>
                    {/*<div className='export-row'>
                        <label>Folder Path: </label>
                        <input onChange={(e)=>e.target.value=e.target.value.replaceAll(" ","")} placeholder={'Projectname/Modulename'} ref={gitPathRef}/>
                    </div> */}
                    <div className='export-row'>
                        <label style={{width:'5.9rem'}} >Comment : </label>
                        <textarea  style={{width:'100%',borderRadius:'4px'}} placeholder={' Commit message'} ref={gitComMsgRef}></textarea>
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
       {error && <span style={{color:"red", position: 'absolute',left: '3rem'}}>Please select a project which has no modules</span>}
       <Button disabled={ error} onClick={clickExportProj} label='Export Project' />
       </div>:(!exportProject && enableExportMindmapButton)? <div><Button onClick={clickExport} label ='Export'/> </div>:null
      )} 
       

/*
    function : toExcel()
    Purpose : Exporting Module in json file
    param :
*/
const toExcel = async(projId,module,fname,displayError,setBlockui,showSuccess) => {
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
        showSuccess(MSG.MINDMAP.SUCC_DATA_EXPORTED)
    }catch(err){
        console.error(err)
        displayError(MSG.MINDMAP.ERR_EXPORT_MINDMAP.CONTENT)
    }
}

/*
    function : toJSON()
    Purpose : Exporting Module in json file
    param :
*/
const toJSON = async(module,fname,displayError,setBlockui,setShowMessage,showSuccess,showWarn,dispatchAction,exportProjId,exportProjAppType) => {
    try{        
        
        let data={
            "projectName":fname,
            "moduleid":Array.isArray(module)?module:module._id,
            "exportProjId":exportProjId,
            "exportProjAppType":exportProjAppType
        }
        ResetSession.start()
        let result = await exportMindmap(data)
        
        if(result.error){displayError(result.error);setBlockui({show:false,content:''});setShowMessage(false);dispatchAction(ExportProjname(""));dispatchAction(EnableExport(false));dispatchAction(EnableExportMindmapButton(true)); ResetSession.end();return;}
        if(result === "InProgress"){showWarn(MSG.MINDMAP.WARN_EXPORT_INPROGRESS);setBlockui({show:false,content:''});setShowMessage(false);dispatchAction(ExportProjname(""));dispatchAction(EnableExportMindmapButton(true));dispatchAction(EnableExport(true)); ResetSession.end();return;}
        
        ResetSession.end()
        setTimeout(()=>{
            dispatchAction(EnableExport(true))
            setBlockui({show:false,content:''})
            setShowMessage(false);
            showSuccess(MSG.MINDMAP.SUCC_DATA_EXPORTED_ON_FILE)
        },5000)
        
        
             
        
    }catch(err){
        console.error(err)
        ResetSession.end()
        displayError(MSG.MINDMAP.ERR_EXPORT_MINDMAP.CONTENT);
        setShowMessage(false);
        dispatchAction(ExportProjname(""))
        dispatchAction(EnableExport(false))
        dispatchAction(EnableExportMindmapButton(true))
    }
}
const exportToProj = async(module,currProjId,displayError,setBlockui,showSuccess,showWarn) => {
    try{
        var data = {
            "projectid":currProjId,
            "moduleid":Array.isArray(module)?module:module._id
        }
        ResetSession.start()
        var result =  await exportToProject(data)
        if(result.error){displayError(result.error);ResetSession.end();return;}
        if(result === "InProgress"){showWarn(MSG.MINDMAP.WARN_EXPORT_INPROGRESS);setBlockui({show:false,content:''}); ResetSession.end();return;}
        setBlockui({show:false,content:''})
        showSuccess(MSG.MINDMAP.SUCC_DATA_EXPORTED)
        ResetSession.end()
    }catch(err){
        ResetSession.end()
        console.error(err)
        displayError(MSG.MINDMAP.ERR_EXPORT_MINDMAP.CONTENT)
    }
}
/*
    function : toGit()
    Purpose : Exporting testsuite and executiondata in json file
    param :
*/

const toGit = async ({selectedProj,projectList,displayError,setBlockui,gitconfigRef,gitVerRef,gitPathRef,gitBranchRef,selectedModuleVar,exportProjAppType,gitComMsgRef,fname,showSuccess}) => {
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
    showSuccess(MSG.MINDMAP.SUCC_DATA_EXPORTED)
}

/*
    function : toCustom()
    Purpose : Exporting testsuite and executiondata in json file
    param :
*/
const toCustom = async (selectedProj,module,projectList,releaseRef,cycleRef,fname,displayError,setBlockui,showSuccess) =>{
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
        showSuccess(MSG.MINDMAP.SUCC_DATA_EXPORTED)
    }catch(err){
        displayError(MSG.MINDMAP.ERR_EXPORT_DATA.CONTENT);
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