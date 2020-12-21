import React, { Fragment, useState, useEffect, useRef} from 'react';
import { useDispatch, useSelector} from 'react-redux';
import ToolbarMenuAssign from '../components/ToolbarMenuAssign';
import ModuleListDrop from '../components/ModuleListDrop';
import CanvasAssign from './CanvasAssign';
import { ScreenOverlay ,PopupMsg,ReferenceBar,SetProgressBar} from '../../global'
import {getProjectList,exportToExcel} from '../api';
import { ClickFullScreen , parseProjList} from './MindmapUtils';
import * as actionTypes from '../state/action';
import * as actionTypesLogin from '../../login/state/action';
import {loadUserInfo} from '../../login/api'


const CreateAssign = () => {
    const dispatch = useDispatch()
    const cycleRef = useRef()
    const releaseRef = useRef()
    const [popup,setPopup] = useState({show:false})
    const [blockui,setBlockui] = useState({show:false})
    const [fullScreen,setFullScreen] = useState(false)
    const [verticalLayout,setVerticalLayout] = useState(false)
    const moduleSelect = useSelector(state=>state.mindmap.selectedModule)
    const selectProj = useSelector(state=>state.mindmap.selectedProj)

    useEffect(()=>{(async()=>{
        SetProgressBar("start",dispatch)
        var res = await getProjectList()
        if(res.error){displayError(res.error);return;}
        var data = parseProjList(res)
        dispatch({type:actionTypes.UPDATE_PROJECTLIST,payload:data})
        //var userinfo = await loadUserInfo()
        //dispatch({type:actionTypesLogin.SET_USERINFO, payload: userinfo});
        // dispatch({type:actionTypes.SELECT_PROJECT,payload:res.projectId[0]}) 
        // var moduledata = await getModules({"tab":"endToend","projectid":res.projectId[0],"moduleid":null})
        // if(moduledata.error){displayError(moduledata.error);return;}
        // dispatch({type:actionTypes.SELECT_MODULE,payload:{}})
        // dispatch({type:actionTypes.UPDATE_MODULELIST,payload:moduledata})
        SetProgressBar("stop",dispatch)
        })()
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
                {(Object.keys(moduleSelect).length>0)?<CanvasAssign setBlockui={setBlockui} releaseRef={releaseRef} cycleRef={cycleRef} setPopup={setPopup} module={moduleSelect} verticalLayout={verticalLayout}/>:null}
            </div>
            </div>
            <ReferenceBar collapsible={true} collapse={true}/>
        </Fragment>
    )
}

export default CreateAssign;