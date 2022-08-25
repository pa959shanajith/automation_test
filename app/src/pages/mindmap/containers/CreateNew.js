import React, {Fragment, useEffect, useState} from 'react';
import {getProjectList, getModules, getScreens} from '../api';
import {useDispatch, useSelector} from 'react-redux';
import SaveMapButton from '../components/SaveMapButton';
import Toolbarmenu from '../components/ToolbarMenu';
import ModuleListDrop from '../components/ModuleListDrop';
import Legends from '../components/Legends'
import * as actionTypes from '../state/action';
import CanvasNew from './CanvasNew';
import ExportMapButton from '../components/ExportMapButton';
import {ClickFullScreen, ClickSwitchLayout, parseProjList} from './MindmapUtils';
import {ScreenOverlay, setMsg, ReferenceBar} from '../../global';
import '../styles/CreateNew.scss';
import DeleteScenarioPopUp from '../components/DeleteScenarioPopup';



/*Component CreateNew
  use: renders create New Mindmap page
*/
    
const CreateNew = ({importRedirect}) => {
  const dispatch = useDispatch()
  const [blockui,setBlockui] = useState({show:false})
  const [fullScreen,setFullScreen] = useState(false)
  const [verticalLayout,setVerticalLayout] = useState(false)
  const [loading,setLoading] = useState(true)
  const [info,setInfo] = useState(undefined)
  const moduleSelect = useSelector(state=>state.mindmap.selectedModule)
  const selectProj = useSelector(state=>state.mindmap.selectedProj)
  const prjList = useSelector(state=>state.mindmap.projectList)
  const [delSnrWarnPop,setDelSnrWarnPop] = useState(false)


  useEffect(()=>{
    if(selectProj && prjList[selectProj]){
        var dict= {
            "AppType": prjList[selectProj].apptypeName,
            "Domain": prjList[selectProj].domains,
            "Project":prjList[selectProj].name
        }
        setInfo(dict)
    }
  },[selectProj,prjList])
  useEffect(()=>{
    (async()=>{
        setBlockui({show:true,content:'Loading modules ...'})
        var res = await getProjectList()
        if(res.error){displayError(res.error);return;}
        var data = parseProjList(res)
        dispatch({type:actionTypes.UPDATE_PROJECTLIST,payload:data})
        if(!importRedirect){
            dispatch({type:actionTypes.SELECT_PROJECT,payload:selectProj?selectProj:res.projectId[0]}) 
            var moduledata = await getModules({"tab":"tabCreate","projectid":selectProj?selectProj:res.projectId[0],"moduleid":null})
            if(moduledata.error){displayError(moduledata.error);return;}
            var screendata = await getScreens(res.projectId[0])
            if(screendata.error){displayError(screendata.error);return;}
            dispatch({type:actionTypes.UPDATE_SCREENDATA,payload:screendata})
            dispatch({type:actionTypes.UPDATE_MODULELIST,payload:moduledata})
        }
        setBlockui({show:false,content:''})
        setLoading(false)
    })()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  },[])

  const displayError = (error) =>{
    setBlockui({show:false})
    setLoading(false)
    setMsg(error)
  }
  
  return (
    <Fragment>
        {(blockui.show)?<ScreenOverlay content={blockui.content}/>:null}
        {(delSnrWarnPop)? <DeleteScenarioPopUp setBlockui={setBlockui} setDelSnrWarnPop ={setDelSnrWarnPop} displayError={displayError}/>:null}
        {(!loading)?
            <div className='mp__canvas_container'>
                <div className='mp__toolbar__container'>
                    <Toolbarmenu setBlockui={setBlockui} displayError={displayError}/>
                </div>
                <ModuleListDrop />
                <div id='mp__canvas' className='mp__canvas'>
                    {(Object.keys(moduleSelect).length>0)?
                    <CanvasNew displayError={displayError} setBlockui={setBlockui} module={moduleSelect} verticalLayout={verticalLayout} setDelSnrWarnPop={setDelSnrWarnPop}/>
                    :<Fragment>
                        <ExportMapButton/>
                        <SaveMapButton disabled={true}/>
                        <Legends/>
                    </Fragment>}
                </div>
            </div>:null
        }
        <ReferenceBar taskInfo={info} taskTop={true} collapsible={true} collapse={true}>
            <div className="ic_box" title="SwitchLayout" >
                <img onClick={()=>ClickSwitchLayout(verticalLayout,setVerticalLayout,moduleSelect,setBlockui,dispatch)} alt='Switch Layout' style={{height: '55px'}} className={"rb__ic-task thumb__ic " + (verticalLayout?"active_rb_thumb ":"")} src="static/imgs/switch.png"/>
                <span className="rb_box_title">Switch</span><span className="rb_box_title">Layout</span>
            </div>
            <div className="ic_box" title="Full Screen" >
                <img onClick={()=>ClickFullScreen(setFullScreen)} style={{height: '55px'}} alt='Full Screen' className={"rb__ic-task thumb__ic " +(fullScreen?"active_rb_thumb":"")} src="static/imgs/fscr.png"/>
                <span className="rb_box_title">Full Screen</span>
            </div>
        </ReferenceBar>
    </Fragment>
  );
}

export default CreateNew;