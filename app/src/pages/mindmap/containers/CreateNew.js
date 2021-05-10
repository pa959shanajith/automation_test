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
import {ScreenOverlay, PopupMsg, ReferenceBar} from '../../global';
import '../styles/CreateNew.scss';

/*Component CreateNew
  use: renders create New Mindmap page
*/
    
const CreateNew = ({importRedirect}) => {
  const dispatch = useDispatch()
  const [popup,setPopup] = useState({show:false})
  const [blockui,setBlockui] = useState({show:false})
  const [fullScreen,setFullScreen] = useState(false)
  const [verticalLayout,setVerticalLayout] = useState(false)
  const [loading,setLoading] = useState(true)
  const moduleSelect = useSelector(state=>state.mindmap.selectedModule)

  useEffect(()=>{
    (async()=>{
        setBlockui({show:true,content:'Loading modules ...'})
        var res = await getProjectList()
        if(res.error){displayError(res.error);return;}
        var data = parseProjList(res)
        dispatch({type:actionTypes.UPDATE_PROJECTLIST,payload:data})
        if(!importRedirect){
            dispatch({type:actionTypes.SELECT_PROJECT,payload:res.projectId[0]}) 
            var moduledata = await getModules({"tab":"tabCreate","projectid":res.projectId[0],"moduleid":null})
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
                        <ExportMapButton/>
                        <SaveMapButton disabled={true}/>
                        <Legends/>
                    </Fragment>}
                </div>
            </div>:null
        }
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

export default CreateNew;