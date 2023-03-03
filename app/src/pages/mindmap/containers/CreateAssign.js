import React, { Fragment, useState, useEffect, useRef} from 'react';
import { useDispatch, useSelector} from 'react-redux';
import ToolbarMenuAssign from '../components/ToolbarMenuAssign';
import ModuleListDrop from '../components/ModuleListDrop';
import CanvasAssign from './CanvasAssign';
import { ScreenOverlay ,setMsg ,ReferenceBar,SetProgressBar} from '../../global'
import {getProjectList} from '../api';
import { ClickFullScreen , parseProjList, ClickSwitchLayout} from './MindmapUtils';
import SaveMapButton from '../components/SaveMapButton';
import Legends from '../components/Legends';
import ExportMapButton from '../components/ExportMapButton';
import * as actionTypes from '../state/action';

/*Component CreateAssign
  use: renders Mindmap assign page
*/
const CreateAssign = () => {
    const dispatch = useDispatch()
    const cycleRef = useRef()
    const releaseRef = useRef()
    const [blockui,setBlockui] = useState({show:false})
    const [fullScreen,setFullScreen] = useState(false)
    const [verticalLayout,setVerticalLayout] = useState(false)
    const [info,setInfo] = useState(undefined)
    const moduleSelect = useSelector(state=>state.mindmap.selectedModule)
    const selectProj = useSelector(state=>state.mindmap.selectedProj)
    const prjList = useSelector(state=>state.mindmap.projectList)
  
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

    useEffect(()=>{(async()=>{
        SetProgressBar("start",dispatch)
        var res = await getProjectList()
        if(res.error){displayError(res.error);return;}
        var data = parseProjList(res)
        dispatch({type:actionTypes.UPDATE_PROJECTLIST,payload:data})
        SetProgressBar("stop",dispatch)
        })()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    },[])
    const displayError = (error) =>{
        setBlockui({show:false})
        SetProgressBar("stop",dispatch)
        setMsg(error)
    }
    return(
        <Fragment>
            {(blockui.show)?<ScreenOverlay content={blockui.content}/>:null}
            <div className='mp__canvas_container'>
            <div className='mp__toolbar__container'>
              <ToolbarMenuAssign cycleRef={cycleRef} releaseRef={releaseRef} setBlockui={setBlockui} />
              <ModuleListDrop cycleRef={cycleRef} isAssign={true}/>
            </div>
            <div id='mp__canvas' className='mp__canvas'>
                {(Object.keys(moduleSelect).length>0 && cycleRef.current)?<CanvasAssign displayError={displayError} setBlockui={setBlockui} releaseRef={releaseRef} cycleRef={cycleRef} module={moduleSelect} verticalLayout={verticalLayout}/>
                :<Fragment>
                    <SaveMapButton disabled={true}/>
                    <ExportMapButton/>
                    <Legends/>
                </Fragment>}
            </div>
            </div>
            <ReferenceBar taskTop={true} taskInfo={info} collapsible={true} collapse={true}>
                <div className="ic_box" title="SwitchLayout" >
                    <img alt={"Switch Layout"} onClick={()=>ClickSwitchLayout(verticalLayout,setVerticalLayout,moduleSelect,setBlockui,dispatch)} style={{height: '55px'}} className={"rb__ic-task thumb__ic " + (verticalLayout?"active_rb_thumb ":"")} src="static/imgs/switch.png"/>
                    <span className="rb_box_title">Switch</span><span className="rb_box_title">Layout</span>
                </div>
                <div className="ic_box" title="Full Screen">
                    <img alt={"Full Screen"} onClick={()=>ClickFullScreen(setFullScreen)} style={{height: '55px'}} className={"rb__ic-task thumb__ic " +(fullScreen?"active_rb_thumb":"")} src="static/imgs/fscr.png"/>
                    <span className="rb_box_title">Full Screen</span>
                </div>
            </ReferenceBar>
        </Fragment>
    )
}

export default CreateAssign;