import React, {Fragment, useEffect, useRef, useState} from 'react';
import {getProjectList, getModules, getScreens} from '../api';
import {useDispatch, useSelector} from 'react-redux';
import SaveMapButton from '../components/SaveMapButton';
import Toolbarmenu from '../components/ToolbarMenu';
import ModuleListSidePanel from '../components/ModuleListSidePanel';
import CanvasNew from './CanvasNew';
import ExportMapButton from '../components/ExportMapButton';
import {ClickFullScreen, ClickSwitchLayout, parseProjList} from './MindmapUtils';
import {ScreenOverlay, setMsg} from '../../global';
import '../styles/CreateNew.scss';
import DeleteScenarioPopUp from '../components/DeleteScenarioPopup';
import CanvasEnE from './CanvasEnE';
import { Navigate } from 'react-router-dom';
import { projectList, selectedProj, screenData, moduleList,AnalyzeScenario  } from '../designSlice';
import ModuleListDrop from '../components/ModuleListDrop';
import { Toast } from 'primereact/toast';

/*Component CreateNew
  use: renders create New Mindmap page
*/
    
const CreateNew = ({importRedirect}) => {
   const [redirectTo, setRedirectTo] = useState("");
  const dispatch = useDispatch();
  const toast = useRef();
  const [blockui,setBlockui] = useState({show:false})
  const [fullScreen,setFullScreen] = useState(false)
  const [verticalLayout,setVerticalLayout] = useState(true)
  const [loading,setLoading] = useState(true)
  const [info,setInfo] = useState(undefined)
  const moduleSelect = useSelector(state=>state.design.selectedModule)
  const selectProj = useSelector(state=>state.design.selectedProj);  
  const analyzeScenario = useSelector(state=>state.design.analyzeScenario); 
  const prjList = useSelector(state=>state.design.projectList)
  const initEnEProj = useSelector(state=>state.design.initEnEProj)
  const [delSnrWarnPop,setDelSnrWarnPop] = useState(false)
  const [isCreateE2E, setIsCreateE2E] = useState(initEnEProj && initEnEProj.isE2ECreate?true:false)
  const isEnELoad = useSelector(state=>state.design.isEnELoad);
  const reduxDefaultselectedProject = useSelector((state) => state.landing.defaultSelectProject);
  let Proj = reduxDefaultselectedProject;

  const localStorageDefaultProject = localStorage.getItem('DefaultProject');
  if (localStorageDefaultProject) {
    Proj = JSON.parse(localStorageDefaultProject);
  }

  // useEffect(()=>{
  //   if(selectProj && prjList[selectProj]){
  //       var dict= {
  //           "AppType": prjList[selectProj].apptypeName,
  //           "Domain": prjList[selectProj].domains,
  //           "Project":prjList[selectProj].name
  //       }
  //       setInfo(dict);
  //       // dispatch({type:actionTypes.APP_TYPE_FOR_PROJECT,payload:prjList[selectProj].apptypeName})
  //   }
  // },[selectProj,prjList])
  // useEffect(() => {
  //   setIsCreateE2E(initEnEProj && initEnEProj.isE2ECreate?true:false);
    
  // },[initEnEProj]);
  useEffect(()=>{
    (async()=>{
        setBlockui({show:true,content:'Loading modules ...'})
        var res = await getProjectList()
        if(res.error){displayError(res.error);return;}
        var data = parseProjList(res)
        dispatch(projectList(data))
        
        if(!importRedirect){
            dispatch(selectedProj(selectProj?selectProj:res.projectId[0])) 
            var req={
                tab:"endToend" || "tabCreate",
                projectid:Proj?Proj.projectId:res.projectId[0],
                version:0,
                cycId: null,
                modName:"",
                moduleid:null
            }
            var moduledata = await getModules(req);

            if(moduledata.error){displayError(moduledata.error);return;}
            var screendata = await getScreens(res.projectId[0])
            if(screendata.error){displayError(screendata.error);return;}
            dispatch(screenData(screendata))
            dispatch(moduleList(moduledata))
        }
        setBlockui({show:false,content:''})
        setLoading(false)
    })()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  },[])

  useEffect(()=>{
    if(!analyzeScenario){(async()=>{
        setBlockui({show:true,content:'Loading modules ...'})
        var res = await getProjectList()
        if(res.error){displayError(res.error);return;}
        var data = parseProjList(res)
        dispatch(projectList(data))
        
        if(!importRedirect){
            dispatch(selectedProj(selectProj?selectProj:res.projectId[0])) 
            var req={
                tab:"endToend" || "tabCreate",
                projectid:Proj?Proj.projectId:res.projectId[0],
                version:0,
                cycId: null,
                modName:"",
                moduleid:null
            }
            var moduledata = await getModules(req);

            if(moduledata.error){displayError(moduledata.error);return;}
            var screendata = await getScreens(Proj?Proj.projectId:res.projectId[0])
            if(screendata.error){displayError(screendata.error);return;}
            dispatch(screenData(screendata))
            dispatch(moduleList(moduledata))
        }
        setBlockui({show:false,content:''})
        setLoading(false)
    })()
  }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  },[analyzeScenario])
  const displayError = (error) =>{
    setBlockui({show:false})
    setLoading(false)
    toast.current.show({severity: 'error', summary: 'Error', detail:error, life:2000})
  }
  
  return (
    <>
    {/* { redirectTo && <Navigate data-test="redirectTo" to={redirectTo} />} */}
    <Fragment>
      <Toast  ref={toast} position="bottom-center" baseZIndex={1000}/>
        {(blockui.show)?<ScreenOverlay content={blockui.content}/>:null}
        {(delSnrWarnPop)? <DeleteScenarioPopUp setBlockui={setBlockui} setDelSnrWarnPop ={setDelSnrWarnPop} displayError={displayError}/>:null}
        {(!loading)?
            <div className='mp__canvas_container'>
                <div className='mp__toolbar__container'>
                    <Toolbarmenu setBlockui={setBlockui} displayError={displayError}/>
                </div>
                <div style={{display:'flex',height: '85.5vh',maxHeight: '100%'}}>
                <ModuleListDrop  setBlockui={setBlockui} appType={Proj.appType} module={moduleSelect}/>
                </div>
              <div id='mp__canvas' className='mp__canvas'>
                     {!isEnELoad ? ((Object.keys(moduleSelect).length>0)?
                     <CanvasNew setBlockui={setBlockui} module={moduleSelect} verticalLayout={verticalLayout} setDelSnrWarnPop={setDelSnrWarnPop} displayError={displayError} toast={toast} appType={Proj.appType}/>
                    :<Fragment>
                        <ExportMapButton/>
                        <SaveMapButton disabled={true}/>
                     </Fragment>
                    )
                     : ((Object.keys(moduleSelect).length>0)?
                    <CanvasEnE setBlockui={setBlockui} module={moduleSelect} verticalLayout={verticalLayout} displayError={displayError}/>
                     :<Fragment>
                        <SaveMapButton disabled={true}/>
                      </Fragment>)}      
              </div>
            </div>:null
        }
    </Fragment>
    </>
  );
}

export default CreateNew;