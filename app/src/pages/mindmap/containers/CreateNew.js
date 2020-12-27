import React, {Fragment, useEffect, useState} from 'react';
import {getProjectList, getModules, getScreens, pdProcess, importMindmap} from '../api';
import {useDispatch, useSelector} from 'react-redux';
import SaveMapButton from '../components/SaveMapButton';
import Toolbarmenu from '../components/ToolbarMenu';
import ModuleListDrop from '../components/ModuleListDrop';
import Legends from '../components/Legends'
import * as actionTypes from '../state/action';
import CanvasNew from './CanvasNew';
import {getApptypePD, getJsonPd, ClickFullScreen, ClickSwitchLayout} from './MindmapUtils';
import {ScreenOverlay, PopupMsg, ReferenceBar, ModalContainer} from '../../global';
import '../styles/CreateNew.scss';

/*Component CreateNew
  use: renders create New Mindmap page
  todo: invalid session check error handling for apis
*/
    
const CreateNew = () => {
  const dispatch = useDispatch()
  const [popup,setPopup] = useState({show:false})
  const [blockui,setBlockui] = useState({show:false})
  const [fullScreen,setFullScreen] = useState(false)
  const [verticalLayout,setVerticalLayout] = useState(false)
  const [loading,setLoading] = useState(true)
  const [importProj,setImportProj] = useState(false)
  const [selectProj,setSelectProj] = useState(false)
  const prjList = useSelector(state=>state.mindmap.projectList)
  const moduleSelect = useSelector(state=>state.mindmap.selectedModule)
  const importData = useSelector(state=>state.mindmap.importData)

  useEffect(()=>{
    (async()=>{
        setBlockui({show:true,content:'Loading modules ...'})
        var res = await getProjectList()
        if(res.error){displayError(res.error);return;}
        var data = parseProjList(res)
        dispatch({type:actionTypes.UPDATE_PROJECTLIST,payload:data})
        dispatch({type:actionTypes.SELECT_PROJECT,payload:res.projectId[0]}) 
        var moduledata = await getModules({"tab":"tabCreate","projectid":res.projectId[0],"moduleid":null})
        if(moduledata.error){displayError(moduledata.error);return;}
        var screendata = await getScreens(res.projectId[0])
        if(screendata.error){displayError(screendata.error);return;}
        dispatch({type:actionTypes.UPDATE_SCREENDATA,payload:screendata})
        dispatch({type:actionTypes.UPDATE_MODULELIST,payload:moduledata})
        setBlockui({show:false,content:''})
        setLoading(false)
    })()
    return (()=>{setSelectProj(false);setImportProj(false)})
    // eslint-disable-next-line react-hooks/exhaustive-deps
  },[])

  useEffect(()=>{
    if(importData.data && Object.keys(prjList).length>0){
        if(importData.createdby === "mm"){
            setBlockui({show:true,content:"Importing File.. Please Wait.."});
            importFromMm({...importData},importProj,prjList,dispatch,displayError,setBlockui,setImportProj)
        }else if(!importProj){
            setSelectProj(true)
        }else if(importData.createdby === "pd"){
            setBlockui({show:true,content:"Importing File.. Please Wait.."});
            importFromPd({...importData},importProj,prjList,dispatch,displayError,setBlockui,setImportProj)
        }else{
            setBlockui({show:true,content:"Importing File.. Please Wait.."});
            loadImportData({...importData},importProj,dispatch,displayError,setBlockui,setImportProj)
        }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  },[importData,importProj,prjList])

  const closeImport = () => {
    setSelectProj(false)
    setImportProj(false)
    dispatch({type:actionTypes.UPDATE_IMPORTDATA,payload:{createdby:undefined,data:undefined}})
  }

  const displayError = (error) =>{
    setBlockui(false)
    setLoading(false)
    setPopup({
        title:'ERROR',
        content:error,
        submitText:'Ok',
        show:true
    })
  }
  
  return (
    <Fragment>
        {(blockui.show)?<ScreenOverlay content={blockui.content}/>:null}
        {(popup.show)?<PopupMsg submit={()=>setPopup({show:false})} close={()=>setPopup({show:false})} title={popup.title} content={popup.content} submitText={popup.submitText}/>:null}
        {(!loading)?
            <div className='mp__canvas_container'>
                <div className='mp__toolbar__container'>
                    <Toolbarmenu setBlockui={setBlockui} setPopup={setPopup} displayError={displayError}/>
                </div>
                <ModuleListDrop setPopup={setPopup}/>
                <div id='mp__canvas' className='mp__canvas'>
                    {(Object.keys(moduleSelect).length>0)?
                    <CanvasNew displayError={displayError} setBlockui={setBlockui} setPopup={setPopup} module={moduleSelect} verticalLayout={verticalLayout}/>
                    :<Fragment>
                        <SaveMapButton disabled={true}/>
                        <Legends/>
                    </Fragment>}
                </div>
            </div>:null
        }
        {selectProj ?<ModalContainer 
        modalClass = 'modal-sm'
        title='Select Project'
        close={closeImport}
        footer={<Footer setSelectProj={setSelectProj} setImportProj={setImportProj}/>}
        content={<Container prjList={prjList}/>} 
        />:null}
        <ReferenceBar taskTop={true} collapsible={true} collapse={true}>
            <div className="ic_box" >
                <img onClick={()=>ClickSwitchLayout(verticalLayout,setVerticalLayout,moduleSelect,setPopup,setBlockui,dispatch)} alt='Switch Layout' style={{height: '55px'}} className={"rb__ic-task thumb__ic " + (verticalLayout?"active_rb_thumb ":"")} src="static/imgs/switch.png"/>
                <span className="rb_box_title">Switch</span><span className="rb_box_title">Layout</span>
            </div>
            <div className="ic_box" >
                <img onClick={()=>ClickFullScreen(setFullScreen,setPopup)} style={{height: '55px'}} alt='Full Screen' className={"rb__ic-task thumb__ic " +(fullScreen?"active_rb_thumb":"")} src="static/imgs/fscr.png"/>
                <span className="rb_box_title">Full Screen</span>
            </div>
        </ReferenceBar>
    </Fragment>
  );
}

//container for select project popup
const Container = (props) => {
  var projectList = Object.entries(props.prjList)
  return(
    <div className = 'mp__sheet-popup'>
        <select id='mp__import-proj'>
            <option value="" disabled selected>Please Select Project</option>
            {projectList.map((e,i)=><option value={e[1].id} key={i}>{e[1].name}</option>)}
        </select>
    </div>
  )
}

//footer for select project popup
const Footer = (props) =>{
    const [errMsg,setErrMsg] = useState('')
    const submit = () => {
        var projid = document.getElementById('mp__import-proj').value
        if(projid !== ""){
            props.setSelectProj(false)
            props.setImportProj(projid)
        }else{
            setErrMsg("Project not selected")
        }
    }
    return(
        <Fragment>
            <div className='mnode__buttons'>
                <label className='err-message'>{errMsg}</label>
                <button onClick={submit}>OK</button>
            </div>
        </Fragment>
    )
}


// function parseProjList:
// parses input value to list of project props

const parseProjList = (res) =>{
    var proj = {};
    res.projectId.forEach((e,i) => {
    proj[res.projectId[i]]= {
        'apptype': res.appType[i],
        'apptypeName':res.appTypeName[i],
        'name': res.projectName[i],
        'id': res.projectId[i],
        'releases':res.releases[i],
        'domains':res.domains[i]
        };
    });
    return proj
}

// importFromMm :
// basic import data's app type and project check if success calls loadImportData

const importFromMm = async(importData,importProj,prjList,dispatch,displayError,setBlockui,setImportProj) => {
    var data = JSON.parse(importData.data)
    importProj = data.projectid
    if(!importProj|| !prjList[importProj]){
        displayError('This project is not assigned to user')
        return;
    }
    var res = await importMindmap(data)
    if(res.error){displayError(res.error);return;}
    var req={
        tab:"tabCreate",
        projectid:importData.projectid ,
        version:0,
        cycId: null,
        moduleid:res._id
    }
    res = await getModules(req)
    if(res.error){displayError(res.error);return;}
    importData.data = res
    loadImportData(importData,importProj,dispatch,displayError,setBlockui,setImportProj)
    return;
}

// importFromPd :
// basic import data's app type check if success calls loadImportData

const importFromPd = async(importData,importProj,prjList,dispatch,displayError,setBlockui,setImportProj) => {
    var appType = getApptypePD(importData.data)
    if(appType !== prjList[importProj].apptypeName.toLowerCase()){
        displayError("App Type Error", "AppType doesn't match, please check!!")
        return;
    }else{
        var res =  await pdProcess({'projectid':importProj,'file':importData.data})
        if(res.error){displayError(res.error);return;}
        var data = getJsonPd(res.data)
        importData.data = data
        loadImportData(importData,importProj,dispatch,displayError,setBlockui,setImportProj)
    }
}

// loadImportData :
// imports all the data to mindmapCanvas by setting moduleData based on type
// createnew should be true for all import except mm because nodes will be not created it will be revoked from saved data

const loadImportData = async(importData,importProj,dispatch,displayError,setBlockui,setImportProj) =>{
    var mindmapData = importData.data
    if(importData.createdby !== 'mm'){
        mindmapData = {createnew:true,importData:importData}
    }
    var moduledata = await getModules({"tab":"tabCreate","projectid":importProj,"moduleid":null})
    if(moduledata.error){displayError(moduledata.error);return;}
    var screendata = await getScreens(importProj)
    if(screendata.error){displayError(screendata.error);return;}
    dispatch({type:actionTypes.SELECT_PROJECT,payload:importProj})
    dispatch({type:actionTypes.SELECT_MODULE,payload:mindmapData})
    dispatch({type:actionTypes.UPDATE_SCREENDATA,payload:screendata})
    dispatch({type:actionTypes.UPDATE_MODULELIST,payload:moduledata})
    dispatch({type:actionTypes.UPDATE_IMPORTDATA,payload:{createdby:undefined,data:undefined}})
    setImportProj(false)
}

export default CreateNew;