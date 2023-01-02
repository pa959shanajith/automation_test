import React, { useState, useRef, Fragment, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {getModules,getScreens} from '../api';
import {readTestSuite_ICE,exportMindmap,exportToExcel,exportToGit} from '../api';
import '../styles/ToolbarMenu.scss';
import * as d3 from 'd3';
import * as actionTypes from '../state/action';
import * as actionTypesPlugin from '../../plugin/state/action';
import {Messages as MSG, ModalContainer, setMsg} from '../../global';
import PropTypes from 'prop-types';
import Legends from '../components/Legends'




/*Component ToolbarMenu
  use: renders tool bar menus of create new page
*/

const Toolbarmenu = ({setBlockui,displayError,isAssign}) => {
    const dispatch = useDispatch()
    const SearchInp = useRef()
    const fnameRef = useRef()
    const ftypeRef = useRef()
    const gitconfigRef = useRef()
    const gitBranchRef =  useRef()
    const gitVerRef =  useRef()
    const gitPathRef =  useRef()
    const moduleSelect = useSelector(state=>state.mindmap.selectedModule)
    const selectBox = useSelector(state=>state.mindmap.selectBoxState)
    const selectNodes = useSelector(state=>state.mindmap.selectNodes)
    const copyNodes = useSelector(state=>state.mindmap.copyNodes)
    const prjList = useSelector(state=>state.mindmap.projectList)
    const initProj = useSelector(state=>state.plugin.PN)
    const selectedProj = useSelector(state=>state.plugin.PN)
    const moduleList = useSelector(state=>state.mindmap.moduleList)
    const selectedModule = useSelector(state=>state.mindmap.selectedModule)    
    const selectedModulelist = useSelector(state=>state.mindmap.selectedModulelist)
    const [modlist,setModList] = useState(moduleList)
    const [exportBox,setExportBox] = useState(false);
    const initEnEProj = useSelector(state=>state.mindmap.initEnEProj)
    const [isCreateE2E, setIsCreateE2E] = useState(initEnEProj && initEnEProj.isE2ECreate?true:false)
    

    // const [selectedProjectNameForDropdown,setselectedProjectNameForDropdown] = useState(initProj);
    useEffect(() => {
        setIsCreateE2E(initEnEProj && initEnEProj.isE2ECreate?true:false);
        
      },[initEnEProj]);
    
    const selectProj = async(proj) => {
        setBlockui({show:true,content:'Loading Modules ...'})
        dispatch({type:actionTypes.SELECT_PROJECT,payload:proj})
        // setselectedProjectNameForDropdown(proj);
        dispatch({type: actionTypesPlugin.SET_PN, payload:proj})
        dispatch({type:actionTypes.UPDATE_MODULELIST,payload:[]})
        // dispatch({type:actionTypes.SELECT_MODULE,payload:{}})
        var moduledata = await getModules({"tab":"endToend","projectid":proj,"moduleid":null})
        if(moduledata.error){displayError(moduledata.error);return;}
        var screendata = await getScreens(proj)
        if(screendata.error){displayError(screendata.error);return;}
        setModList(moduledata)
        dispatch({type:actionTypes.UPDATE_MODULELIST,payload:moduledata})
        dispatch({ type: actionTypes.SELECT_MODULELIST, payload: [] })
        // dispatch({type:actionTypes.UPDATE_SCREENDATA,payload:screendata});
        if(screendata)dispatch({type:actionTypes.UPDATE_SCREENDATA,payload:screendata})
        // if(SearchInp){
        //     SearchInp.current.value = ""
        // }
        
        setBlockui({show:false})
        
    }
   
    const searchModule = (val) =>{
        var filter = modlist.filter((e)=>e.name.toUpperCase().indexOf(val.toUpperCase())!==-1)
        dispatch({type:actionTypes.UPDATE_MODULELIST,payload:filter})
    }
    const CreateNew = () =>{
        dispatch({type:actionTypes.SELECT_MODULE,payload:{createnew:true}})
    }
    const clickExport = () => {
        // if(!selectedModule._id || selectedModulelist.length==0)return;
        var err = validate([fnameRef,ftypeRef,gitconfigRef,gitBranchRef,gitVerRef])
        if(err)return
        let selectedModuleVar = selectedModulelist.length>0?selectedModulelist:selectedModule;
        setExportBox(false)
        setBlockui({show:true,content:'Exporting Mindmap ...'})
        var ftype = ftypeRef.current.value
        if(ftype === 'json') {
            toJSON(selectedModuleVar,fnameRef.current.value,displayError,setBlockui);
        }
        
        if(ftype === 'excel') toExcel(selectedProj,selectedModulelist.length>0?selectedModulelist[0]:selectedModule,fnameRef.current.value,displayError,setBlockui);
        if(ftype === 'git') toGit({selectedProj,projectList,displayError,setBlockui,gitconfigRef,gitVerRef,gitPathRef,gitBranchRef,selectedModule:selectedModulelist.length>0?selectedModulelist[0]:selectedModule});
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
    const clickSelectBox = () =>{
        d3.select('#pasteImg').classed('active-map',false)
        d3.select('#copyImg').classed('active-map',false)
        d3.selectAll('.ct-node').classed('node-selected',false)
        dispatch({type:actionTypes.UPDATE_COPYNODES,payload:{nodes:[],links:[]}})
        dispatch({type:actionTypes.UPDATE_SELECTNODES,payload:{nodes:[],links:[]}})
        dispatch({type:actionTypes.SELECT_SELECTBOX,payload:!selectBox})
    }
    const clickCopyNodes = () =>{
        if (d3.select('#pasteImg').classed('active-map')) {
            setMsg(MSG.MINDMAP.ERR_PASTEMAP_ACTIVE_COPY)
            return;
        }
        var val = copy({...selectNodes},copyNodes)
        if(val){
            d3.select('#copyImg').classed('active-map',true)
            dispatch({type:actionTypes.UPDATE_COPYNODES,payload:selectNodes})
            dispatch({type:actionTypes.SELECT_SELECTBOX,payload:false})
            dispatch({type:actionTypes.UPDATE_SELECTNODES,payload:{nodes:[],links:[]}})
        }
    }

    const clickPasteNodes = () =>{
        if(d3.select('#pasteImg').classed('active-map')){
            //close paste
            dispatch({type:actionTypes.UPDATE_COPYNODES,payload:{nodes:[],links:[]}})
            d3.select('#pasteImg').classed('active-map',false)
            d3.selectAll('.ct-node').classed('node-selected',false)
            return;
        }
        if (!d3.select('#copyImg').classed('active-map')){
            setMsg(MSG.MINDMAP.WARN_COPY_STEP_FIRST)
            return;
        }
        d3.select('#copyImg').classed('active-map',false)
        paste({...copyNodes})
    }
    var projectList = Object.entries(prjList)
    return(
        <Fragment>
            {exportBox?<ModalContainer
            title='Export Modules'
            close={()=>setExportBox(false)}
            footer={<Footer clickExport={clickExport}/>}
            content={<Container isEndtoEnd={selectedModule.type === "endtoend"} gitconfigRef={gitconfigRef} gitBranchRef={gitBranchRef} gitVerRef={gitVerRef} gitPathRef={gitPathRef} fnameRef={fnameRef} ftypeRef={ftypeRef} modName={prjList[initProj]["name"]} isAssign={isAssign}/>} 
            />:null} 
                    
        <div className='toolbar__header'>    
            <label data-test="projectLabel">Project:</label>
            <select data-test="projectSelect" value={initProj} onChange={(e)=>{selectProj(e.target.value)}}>
                {projectList.map((e,i)=><option value={e[1].id} key={i}>{e[1].name}</option>)}
            </select>
            <span data-test="headerMenu" className='toolbar__header-menus'>
                <i className={"fa fa-crop fa-lg"+(selectBox?' active-map':'')} title="Select" onClick={clickSelectBox}></i>
                <i className="fa fa-files-o fa-lg" title="Copy selected map" id='copyImg' onClick={clickCopyNodes}></i>
                <i className="fa fa-clipboard fa-lg" title="Paste map" id="pasteImg" onClick={clickPasteNodes}></i>
            </span>
            {!isCreateE2E ?<Fragment><Legends/></Fragment>:<Fragment><Legends isEnE={true}/> </Fragment>} 
        </div>
        

        </Fragment>
    )
}
const Container = ({fnameRef,isEndtoEnd,ftypeRef,modName,isAssign,gitconfigRef,gitBranchRef,gitVerRef,gitPathRef}) =>{
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
                    {isAssign && <option value={'custom'}>Custom (.json)</option>}
                    {!isEndtoEnd &&
                    <>
                    <option value={'excel'}>Excel Workbook (.xlx,.xlsx)</option>
                    <option value={'git'}>Git (.mm)</option>
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
        moduleData.releaseId = releaseRef.current.selectedOptions[0].innerText;
        moduleData.cycleName = cycleRef.current.selectedOptions[0].innerText;
        moduleData.cycleId = cycleRef.current.value;
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

//check for paste errors and paste action
const paste = (copyNodes) =>{
    var dNodes_c = copyNodes.nodes
    var module_check_flag = false
    if(dNodes_c.length === 0){
        setMsg(MSG.MINDMAP.ERR_NOTHING_PASTE)
        return false;
    }
    d3.select('#pasteImg').classed('active-map',true)
    d3.selectAll('.ct-node').classed('node-selected',false)
    module_check_flag = dNodes_c.some(e => e.type === 'scenarios'); // then check for dangling screen
    if (module_check_flag) {
        //highlight module
        d3.selectAll('[data-nodetype=modules]').classed('node-selected',true);
    } else {
        //highlight scenarios
        d3.selectAll('[data-nodetype=scenarios]').classed('node-selected',true);
    }
}

//check for dangling errors and and copy action
const copy = (selectNodes,copyNodes) =>{
    var dNodes_c = selectNodes.nodes
    var dLinks_c = selectNodes.links
    var dangling_screen_check_flag = false
    var dangling_screen ;
    var dangling_screen_flag = false
    var ds_list = [];
    if(dNodes_c.length === 0){
        if(copyNodes.nodes.length>0){
            setMsg(MSG.MINDMAP.WARN_CLICK_PASTEMAP)
            return false
        }
        setMsg(MSG.MINDMAP.ERR_NOTHING_COPY)
        return false;
    }
    dangling_screen_check_flag = dNodes_c.some(e => e.type === 'scenarios'); // then check for dangling screen
    if (dangling_screen_check_flag) {
        dNodes_c.forEach((e)=>{
            if (e.type === 'screens') {
                dangling_screen = true;
                dLinks_c.forEach((f)=>{
                    if (parseFloat(e.id) === parseFloat(f.target.id))
                        dangling_screen = false;
                })
                if (dangling_screen) {
                    dangling_screen_flag = true;
                    ds_list.push(e);
                }
            }
        })
    }
    if (dangling_screen_flag) {
        setMsg(MSG.MINDMAP.ERR_DANGLING_SCREEN)
        ds_list.forEach((e) =>{
            d3.select('#node_' + e.id).classed('node-error',true);
        });
        return false;
    }
    setMsg(MSG.MINDMAP.SUCC_DATA_COPIED)
    return true;
}
Toolbarmenu.propTypes={
    setBlockui:PropTypes.func,
    displayError:PropTypes.func
}
export default Toolbarmenu;


         