import React, { Fragment, useRef, useState } from 'react';
import {ModalContainer, Messages as MSG, setMsg} from '../../global';
import {useSelector} from 'react-redux'
import {readTestSuite_ICE,exportMindmap,exportToExcel,exportToGit} from '../api';
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
    const selectedModule = useSelector(state=>state.mindmap.selectedModule)
    const selectedProj = useSelector(state=>state.mindmap.selectedProj)
    const projectList = useSelector(state=>state.mindmap.projectList)
    const openExport = ()=>{
        if(!selectedProj || !selectedModule || !selectedModule._id){
            return;
        }
        setExportBox(true)
    }
    const clickExport = () => {
        if(!selectedModule._id)return;
        var err = validate([fnameRef,ftypeRef,gitconfigRef,gitBranchRef,gitVerRef])
        if(err)return
        let selectedModuleVar = selectedModulelist.length>0?selectedModulelist:selectedModule;
        setExportBox(false)
        setBlockui({show:true,content:'Exporting Mindmap ...'})
        var ftype = ftypeRef.current.value

        
        if(ftype === 'excel') toExcel(selectedProj,selectedModulelist.length>0?selectedModulelist[0]:selectedModule,fnameRef.current.value,displayError,setBlockui);
        if(ftype === 'json') toJSON(selectedModule,fnameRef.current.value,displayError,setBlockui);
        if(ftype === 'custom') toCustom(selectedProj,selectedModule,projectList,releaseRef,cycleRef,fnameRef.current.value,displayError,setBlockui);
        if(ftype === 'git') toGit({selectedProj,projectList,displayError,setBlockui,gitconfigRef,gitVerRef,gitPathRef,gitBranchRef,selectedModule:selectedModulelist.length>0?selectedModulelist[0]:selectedModule});
    }
    return(
        <Fragment>
            {exportBox?<ModalContainer
            title='Export MindMap'
            close={()=>setExportBox(false)}
            footer={<Footer clickExport={clickExport}/>}
            content={<Container isEndtoEnd={selectedModule.type === "endtoend"} selectedModulelist={selectedModulelist} gitconfigRef={gitconfigRef} gitBranchRef={gitBranchRef} gitVerRef={gitVerRef} gitPathRef={gitPathRef} fnameRef={fnameRef} ftypeRef={ftypeRef} modName={selectedModule.name} isAssign={isAssign}/>} 
            />:null}
            <svg data-test="exportButton" className={"ct-exportBtn"+(selectedModulelist.length>0?"":" disableButton")} id="ct-export" onClick={()=>setExportBox(true)}>
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

const Container = ({fnameRef,isEndtoEnd,ftypeRef,modName,selectedModulelist,isAssign,gitconfigRef,gitBranchRef,gitVerRef,gitPathRef}) =>{
    const [expType,setExpType] = useState(undefined)
    const changeExport = (e) => {
        setExpType(e.target.value)
    }
    return(
        <div>
            <div className='export-row'>
                <label>Export As: </label>
                <select defaultValue={'def-option'} ref={ftypeRef} onChange={changeExport}>
                    <option value={'def-option'} disabled>Select Export Format</option>
                    {isAssign && <option value={'custom'}disabled={selectedModulelist.length>1}>Custom (.json)</option>}
                    {!isEndtoEnd &&
                    <>
                    <option value={'excel'}disabled={selectedModulelist.length>1}>Excel Workbook (.xlx,.xlsx)</option>
                    <option value={'git'}disabled={selectedModulelist.length>1}>Git (.mm)</option>
                    <option value={'json'}>MindMap (.mm)</option>
                    </>}
                </select>
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
            {(expType && expType !== 'git')?
                <div className='export-row'>
                    <label>File Name: </label>
                    <input ref={fnameRef} defaultValue={modName} placeholder={'Enter file name'}></input>
                </div>:null
            }
        </div>
    )
}
const Footer = ({clickExport}) => <div><button onClick={clickExport}>Export</button></div>

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
const toJSON = async(modId,fname,displayError,setBlockui) => {
    try{
        var result =  await exportMindmap(modId._id)
        if(result.error){displayError(result.error);return;}
        jsonDownload(fname+'.mm', JSON.stringify(result));
        setBlockui({show:false,content:''})
        setMsg(MSG.MINDMAP.SUCC_DATA_EXPORTED)
    }catch(err){
        console.error(err)
        displayError(MSG.MINDMAP.ERR_EXPORT_MINDMAP)
    }
}

/*
    function : toGit()
    Purpose : Exporting testsuite and executiondata in json file
    param :
*/

const toGit = async ({projectList,displayError,setBlockui,gitconfigRef,gitVerRef,gitPathRef,gitBranchRef,selectedModule,selectedProj}) => {
    var gitpath=gitPathRef.current.value;
	if(!gitpath){
        gitpath = 'avoassuretest_artifacts/'+projectList[selectedProj].name+'/'+selectedModule.name;
    }
    var res = await exportToGit({
        gitconfig: gitconfigRef.current.value,
        gitVersion: gitVerRef.current.value,
		gitFolderPath:gitpath,
		gitBranch: gitBranchRef.current.value,
		mindmapId: selectedModule
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