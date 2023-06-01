import React, { Fragment, useRef, useState } from 'react';
import {ModalContainer, Messages as MSG, setMsg} from '../../global';
import {useSelector} from 'react-redux'
import {readTestSuite_ICE,exportMindmap,exportToExcel,exportToGit,exportToProject,getModules} from '../api';
import '../styles/ExportMapButton.scss'
import PropTypes from 'prop-types'

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
    const [expType,setExpType] = useState(undefined);
    const expTypes = ["custom","git","json","excel"];
    const [error,setError] = useState(false);
    const [currProjId,setCurrProjId] = useState("");
    const [exportProject,setExportProject] = useState(true)
    const [exportFile,setExportFile] = useState(false) 
    const openExport = ()=>{
        setExportBox(true)
    }
    const clickExportProj = ()=>{
        if (currProjId===null || currProjId===""){return;}
        else{let selectedModuleVar;
        setExportBox(false)
        setExpType(null) ;setCurrProjId(null);setError(false); setExportProject(true);
        setExportFile(false)
        setBlockui({show:true,content:'Exporting Mindmap ...'})
        exportToProj(selectedModuleVar,currProjId,displayError,setBlockui);}
    }
    const clickExport = () => {
        // if(!selectedModule._id || selectedModulelist.length==0)return;
        var err = validate([fnameRef,ftypeRef,gitconfigRef,gitBranchRef,gitVerRef])
        if(err)return
        let selectedModuleVar;
        setExportBox(false)
        setExpType(null) ;setCurrProjId(null);setError(false);setExportProject(true);
        setExportFile(false)
        setBlockui({show:true,content:'Exporting Mindmap ...'})
        var ftype = ftypeRef.current.value
        if(ftype === 'json') {
            toJSON(selectedModuleVar,fnameRef.current.value,displayError,setBlockui);
        }
        
        if(ftype === 'excel') toExcel(fnameRef.current.value,displayError,setBlockui);
        if(ftype === 'custom') toCustom(releaseRef,cycleRef,fnameRef.current.value,displayError,setBlockui);
        if(ftype === 'git') toGit({displayError,setBlockui,gitconfigRef,gitVerRef,gitPathRef,gitBranchRef});
    }
    return(
        <Fragment>
            {exportBox?<ModalContainer
            title='Export MindMap'
            close={()=>{setExportBox(false);setExpType(null) ;setCurrProjId(null);setError(false);setExportProject(true);setExportFile(false) }}
            footer={<Footer clickExport={clickExport}  expType ={expType} expTypes ={expTypes} setExpType={setExpType} clickExportProj={clickExportProj} error={error} exportProject={exportProject}/>}
            content={<Container gitconfigRef={gitconfigRef} gitBranchRef={gitBranchRef} gitVerRef={gitVerRef} gitPathRef={gitPathRef} fnameRef={fnameRef} ftypeRef={ftypeRef}  isAssign={isAssign}  
            expType ={expType} expTypes ={expTypes} setExpType={setExpType} setError={setError}  currProjId={currProjId} setCurrProjId={setCurrProjId} exportProject={exportProject} setExportProject={setExportProject} exportFile={exportFile} setExportFile={setExportFile} />} 
            />:null}
            <svg data-test="exportButton" className={"ct-exportBtn"} id="ct-export" onClick={()=>setExportBox(false)}>
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

const Container = ({fnameRef,isEndtoEnd,ftypeRef,modName,selectedModulelist,isAssign,gitconfigRef,gitBranchRef,gitVerRef,gitPathRef,projectList,expType,expTypes,setExpType,setError,selectedProj,currProjId,setCurrProjId,exportProject,setExportProject,exportFile,setExportFile}) =>{
    
    const changeExport = (e) => {
        
        setExpType(e.target.value);
        setCurrProjId(e.target.value)
        resetImportModule(e.target.value);
    }
    const changeExportFile=(e) =>{
        setExpType(e.target.value);
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
                <label ><input type="radio" id ="Export To File" onChange={check}/>Export To File </label>
                {exportFile && <select defaultValue={'def-option'} disabled={exportProject} ref={ftypeRef} onChange={changeExportFile}>
                    <option value={""} >Select Export Format</option>
                    {isAssign && <option value={'custom'}disabled={selectedModulelist.length>1}>Structure only - Custom (.json)</option>}
                    {!isEndtoEnd &&
                    <>
                    <option value={'excel'}disabled={selectedModulelist.length>1}>Structure only- Excel(.xlx,.xlsx)</option>
                    {/* <option value={'git'}disabled={selectedModulelist.length>1}>Git (.mm)</option> */}
                    <option value={'json'}>Complete Module(s) (.mm)</option>
                    </>}
                </select>}
                </div>
            </div>
            {(expType === 'git')?
                <Fragment>
                    <div className='export-row'>
                        <label>Git Configuration: </label>
                        <input onChange={(e)=>e.target.value=e.target.value.replaceAll(" ","")} placeholder={'Git configuration name'} ref={gitconfigRef}/>
                    </div>
                    <div className='export-row'>
                        <label>Git Branch: </label>
                        <input onChange={(e)=>e.target.value=e.target.value.replaceAll(" ","")} placeholder={'Branch name'} ref={gitBranchRef}/>
                    </div>
                    <div className='export-row'>
                        <label>Version: </label>
                        <input onChange={(e)=>e.target.value=e.target.value.replaceAll(" ","")} placeholder={'Version'} ref={gitVerRef}/>
                    </div>
                    <div className='export-row'>
                        <label>Folder Path: </label>
                        <input placeholder={'Projectname/Modulename (optional)'} ref={gitPathRef}/>
                    </div>
                </Fragment>:null
            }
           {(exportFile && expType && expType !== 'git' &&  expTypes.includes(expType) )?
                <div className='export-file-row'>
                    <label>File Name: </label>
                    <input ref={fnameRef} defaultValue={modName} placeholder={'Enter file name'}></input>
                </div>:null
            }
        </div>
    )
}
const Footer = ({clickExport,expType,expTypes,setExpType,clickExportProj,error,exportProject}) => {
    return (exportProject) ? <div>
       {error && <span>Please select a project which has no modules</span>}
       <button disabled={ error} onClick={clickExportProj} >Export Project</button>
       </div> : <div><button onClick={clickExport}>Export</button>
       </div>
       
       }

/*
    function : toExcel()
    Purpose : Exporting Module in json file
    param :
*/
const toExcel = async(projId,module,fname,displayError,setBlockui) => {
    try{
        var data = {
            "projectid":projId,
            "moduleid":module
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
const toJSON = async(module,fname,displayError,setBlockui) => {
    try{
        var result =  await exportMindmap(Array.isArray(module)?module:module._id)
        if(result.error){displayError(result.error);return;}
        jsonDownload(fname+'.mm', JSON.stringify(result));
        setBlockui({show:false,content:''})
        setMsg(MSG.MINDMAP.SUCC_DATA_EXPORTED)
    }catch(err){
        console.error(err)
        displayError(MSG.MINDMAP.ERR_EXPORT_MINDMAP)
    }
}
const exportToProj = async(module,currProjId,displayError,setBlockui) => {
    try{
        var data = {
            "projectid":currProjId,
            "moduleid":Array.isArray(module)?module:module._id
        }
        // ResetSession.start()
        var result =  await exportToProject(data)
        if(result.error){displayError(result.error);return;}
        setBlockui({show:false,content:''})
        setMsg(MSG.MINDMAP.SUCC_DATA_EXPORTED)
        // ResetSession.end()
    }catch(err){
        // ResetSession.end()
        console.error(err)
        displayError(MSG.MINDMAP.ERR_EXPORT_MINDMAP)
    }
}
/*
    function : toGit()
    Purpose : Exporting testsuite and executiondata in json file
    param :
*/

const toGit = async ({projectList,displayError,setBlockui,gitconfigRef,gitVerRef,gitPathRef,gitBranchRef,selectedProj}) => {
    var gitpath=gitPathRef.current.value;
	if(!gitpath){
        gitpath = 'avoassuretest_artifacts/'+projectList[selectedProj].name+'/';
    }
    var res = await exportToGit({
        gitconfig: gitconfigRef.current.value,
        gitVersion: gitVerRef.current.value,
		gitFolderPath:gitpath,
		gitBranch: gitBranchRef.current.value,
    })
    if(res.error){displayError(res.error);return;}
    setBlockui({show:false})
    setMsg(MSG.MINDMAP.SUCC_DATA_EXPORTED)
}

/*
    function : toCustom()
    Purpose : Exporting testsuite and executiondata in json file
    param :
*/
const toCustom = async (selectedProj,selectedModule,projectList,releaseRef,cycleRef,fname,displayError,setBlockui) =>{
    try{
        var suiteDetailsTemplate = { "condition": 0, "dataparam": [""], "scenarioId": "", "scenarioName": "" };
        var moduleData = { "testsuiteName": "", "testsuiteId": "", "versionNumber": "", "appType": "", "domainName": "", "projectName": "", "projectId": "", "releaseId": "", "cycleName": "", "cycleId": "", "suiteDetails": [suiteDetailsTemplate] };
        var executionData = { "executionData": { "source": "api", "exectionMode": "serial", "executionEnv": "default", "browserType": ["1"], "integration":{"alm": {"url":"","username":"","password":""}, "qtest": {"url":"","username":"","password":"","qteststeps":""}, "zephyr": {"url":"","username":"","password":"","apitoken":"","authtype":""}}, "gitInfo": {"gitConfiguration":"","gitbranch":"","folderPath":"","gitVersion":""}, "batchInfo": [JSON.parse(JSON.stringify(moduleData))] } };
        var moduleInfo = { "batchInfo": [] };
        moduleData.appType = projectList[selectedProj].apptypeName;
        moduleData.domainName = projectList[selectedProj].domains;
        moduleData.projectName = projectList[selectedProj].name;
        moduleData.projectId = projectList[selectedProj].id;
        moduleData.releaseId = projectList[selectedProj].releases[0].name;
        moduleData.cycleName = projectList[selectedProj].releases[0].cycles[0].name;
        moduleData.cycleId = projectList[selectedProj].releases[0].cycles[0]._id;
        const reqObject = [{
            "releaseid": moduleData.releaseId,
            "cycleid": moduleData.cycleId,
            "testsuiteid": selectedModule._id,
            "testsuitename": selectedModule.name,
            "projectidts": moduleData.projectId
            // "versionnumber": parseFloat(version_num)
        }];
        var moduleObj = await readTestSuite_ICE(reqObject)
        if(moduleObj.error){displayError(moduleObj.error);return;}
        moduleObj = moduleObj[selectedModule._id];
        if(moduleObj && moduleObj.testsuiteid != null) {
            moduleData.testsuiteId = moduleObj.testsuiteid;
            moduleData.testsuiteName = moduleObj.testsuitename;
            moduleData.versionNumber = moduleObj.versionnumber;
            moduleData.suiteDetails = [];
            for (var j = 0; j < moduleObj.scenarioids.length; j++) {
                var s_data = JSON.parse(JSON.stringify(suiteDetailsTemplate));
                s_data.condition = moduleObj.condition[j];
                s_data.dataparam = [moduleObj.dataparam[j]];
                s_data.scenarioName = moduleObj.scenarionames[j];
                s_data.scenarioId = moduleObj.scenarioids[j];
                moduleData.suiteDetails.push(s_data);
            }
            moduleInfo.batchInfo.push(moduleData);
            jsonDownload(fname+'_moduleinfo.json', JSON.stringify(moduleInfo));
            jsonDownload(fname+'_executiondata.json', JSON.stringify(executionData));
            setBlockui({show:false,content:''})
            setMsg(MSG.MINDMAP.SUCC_DATA_EXPORTED)
        } else {
            displayError(MSG.MINDMAP.ERR_EXPORT_DATA);
        }
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