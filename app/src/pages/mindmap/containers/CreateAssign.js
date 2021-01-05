import React, { Fragment, useState, useEffect, useRef} from 'react';
import { useDispatch, useSelector} from 'react-redux';
import ToolbarMenuAssign from '../components/ToolbarMenuAssign';
import ModuleListDrop from '../components/ModuleListDrop';
import CanvasAssign from './CanvasAssign';
import { ScreenOverlay ,PopupMsg,ReferenceBar,SetProgressBar} from '../../global'
import {getProjectList} from '../api';
import { ClickFullScreen , parseProjList, ClickSwitchLayout} from './MindmapUtils';
import * as actionTypes from '../state/action';

/*Component CreateAssign
  use: renders Mindmap assign page
*/
const CreateAssign = () => {
    const dispatch = useDispatch()
    const cycleRef = useRef()
    const releaseRef = useRef()
    const [popup,setPopup] = useState({show:false})
    const [blockui,setBlockui] = useState({show:false})
    const [fullScreen,setFullScreen] = useState(false)
    const [verticalLayout,setVerticalLayout] = useState(false)
    const moduleSelect = useSelector(state=>state.mindmap.selectedModule)

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
        SetProgressBar("stop",dispatch)
        setPopup({
            title:'ERROR',
            content:error,
            submitText:'Ok',
            show:true
        })
    }
    return(
        <Fragment>
            {(blockui.show)?<ScreenOverlay content={blockui.content}/>:null}
            {(popup.show)?<PopupMsg submit={()=>setPopup({show:false})} close={()=>setPopup({show:false})} title={popup.title} content={popup.content} submitText={popup.submitText}/>:null}
            <div className='mp__canvas_container'>
            <div className='mp__toolbar__container'>
              <ToolbarMenuAssign cycleRef={cycleRef} releaseRef={releaseRef} setBlockui={setBlockui} setPopup={setPopup}/>
              <ModuleListDrop cycleRef={cycleRef} setPopup={setPopup} isAssign={true}/>
            </div>
            <div id='mp__canvas' className='mp__canvas'>
                {(Object.keys(moduleSelect).length>0 && cycleRef.current)?<CanvasAssign setBlockui={setBlockui} releaseRef={releaseRef} cycleRef={cycleRef} setPopup={setPopup} module={moduleSelect} verticalLayout={verticalLayout}/>:null}
            </div>
            </div>
            <ReferenceBar collapsible={true} collapse={true}>
                <div className="ic_box" >
                    <img alt={"Switch Layout"} onClick={()=>ClickSwitchLayout(verticalLayout,setVerticalLayout,moduleSelect,setPopup,setBlockui,dispatch)} style={{height: '55px'}} className={"rb__ic-task thumb__ic " + (verticalLayout?"active_rb_thumb ":"")} src="static/imgs/switch.png"/>
                    <span className="rb_box_title">Switch</span><span className="rb_box_title">Layout</span>
                </div>
                <div className="ic_box" >
                    <img alt={"Full Screen"} onClick={()=>ClickFullScreen(setFullScreen,setPopup)} style={{height: '55px'}} className={"rb__ic-task thumb__ic " +(fullScreen?"active_rb_thumb":"")} src="static/imgs/fscr.png"/>
                    <span className="rb_box_title">Full Screen</span>
                </div>
            </ReferenceBar>
        </Fragment>
    )
}

export default CreateAssign;