import React ,  { Fragment, useEffect, useState, useRef} from 'react';
import {getProjectList, getModules, getScreens} from '../api';
import { useHistory } from 'react-router-dom';
import LoadingBar from 'react-top-loading-bar';
import { useDispatch, useSelector} from 'react-redux';
import MindmapToolbar from './MindmapToolbar';
import SaveMapButton from '../components/SaveMapButton'
import Legends from '../components/Legends'
import * as actionTypes from '../state/action';
import Canvas from './MindmapCanvas';
import '../styles/CreateNew.scss';
import { ScreenOverlay, PopupMsg, ReferenceBar, ActionBar} from '../../global';
export var history

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
  history =  useHistory()
  const loadref = useRef(null)
  const [loading,setLoading] = useState(true)
  const moduleSelect = useSelector(state=>state.mindmap.selectedModule)
  useEffect(()=>{
    (async()=>{
      loadref.current.staticStart()
      var res = await getProjectList()
      var data = parseProjList(res)
      dispatch({type:actionTypes.UPDATE_PROJECTLIST,payload:data})
      dispatch({type:actionTypes.SELECT_PROJECT,payload:res.projectId[0]}) 
      var moduledata = await getModules({"tab":"tabCreate","projectid":res.projectId[0],"moduleid":null})
      var screendata = await getScreens(res.projectId[0])
      dispatch({type:actionTypes.UPDATE_SCREENDATA,payload:screendata})
      dispatch({type:actionTypes.UPDATE_MODULELIST,payload:moduledata})
      loadref.current.complete()
      setLoading(false)
    })()
  },[dispatch])
  return (
    <Fragment>
        {(blockui.show)?<ScreenOverlay content={blockui.content}/>:null}
        {(popup.show)?<PopupMsg submit={()=>setPopup({show:false})} close={()=>setPopup({show:false})} title={popup.title} content={popup.content} submitText={popup.submitText}/>:null}
        <LoadingBar shadow={false} color={'#633690'} className='loading-bar' ref={loadref}/>
        {(!loading)?
          <div className='mp__canvas_container'>
            <MindmapToolbar/>
            <div id='mp__canvas' className='mp__canvas'>
              {(Object.keys(moduleSelect).length>0)?
              <Canvas setBlockui={setBlockui} setPopup={setPopup} module={moduleSelect} verticalLayout={verticalLayout}/>
              :<Fragment>
                <SaveMapButton disabled={true}/>
                <Legends/>
              </Fragment>}
            </div>
          </div>:null
        }
        <ReferenceBar taskTop={true} collapsible={true} collapse={true}>
            <div className="ic_box" >
              <img onClick={()=>ClickSwitchLayout(verticalLayout,setVerticalLayout,moduleSelect,setPopup,setBlockui,dispatch)} style={{height: '55px'}} className={"rb__ic-task thumb__ic " + (verticalLayout?"active_rb_thumb ":"")} src="static/imgs/switch.png"/>
                <span className="rb_box_title">Switch</span><span className="rb_box_title">Layout</span>
            </div>
            <div className="ic_box" >
              <img onClick={()=>ClickFullScreen(setFullScreen,setPopup)} style={{height: '55px'}} className={"rb__ic-task thumb__ic " +(fullScreen?"active_rb_thumb":"")} src="static/imgs/fscr.png"/>
              <span className="rb_box_title">Full Screen</span>
            </div>
          </ReferenceBar>  
    </Fragment>
  );
}

const ClickSwitchLayout = (verticalLayout,setVerticalLayout,moduleSelect,setPopup,setBlockui,dispatch) =>{
  if(verticalLayout){
    setBlockui({show:true,content:'Switching Layout...'})
    // dispatch({type:actionTypes.SELECT_MODULE,payload:{switchlayout:true}})
    setVerticalLayout(false)
    return;
  }
  if(Object.keys(moduleSelect).length<1){
    setPopup({
      title:'Warning',
      content:'Please select a module first',
      submitText:'Ok',
      show:true
    })
    return;
  }
  setBlockui({show:true,content:'Switching Layout...'})
  // dispatch({type:actionTypes.SELECT_MODULE,payload:{switchlayout:true}})
  setVerticalLayout(true)
}


const ClickFullScreen = (setFullScreen,setPopup) => {
  var elt = document.querySelector("html");
  if ((window.fullScreen) || (window.innerWidth == window.screen.width && (window.screen.height - window.innerHeight) <= 1)) {
    if (document.cancelFullScreen) {
      document.cancelFullScreen();
    } else if (document.mozCancelFullScreen) {
      document.mozCancelFullScreen();
    } else if (document.webkitCancelFullScreen) {
      document.webkitCancelFullScreen();
    }
    setFullScreen(false)
  } else {
    if (elt.requestFullscreen) {
      elt.requestFullscreen();
    } else if (elt.msRequestFullscreen) {
      elt.msRequestFullscreen();
    } else if (elt.mozRequestFullScreen) {
      elt.mozRequestFullScreen();
    } else if (elt.webkitRequestFullscreen) {
      elt.webkitRequestFullscreen();
    } else {
      setPopup({
        title:'ERROR',
        content:'"Fullscreen not available"',
        submitText:'Ok',
        show:true
      })
      return;
    }
    setFullScreen(true)
  }
} 

/*function parseProjList
  use:  parses input value to list of project props
*/

const parseProjList = (res) =>{
  var proj = {};
  res.projectId.forEach((e,i) => {
    proj[res.projectId[i]]= {
      'apptype': res.appType[i],
      'name': res.projectName[i],
      'id': res.projectId[i],
      'releases':res.releases[i],
      'domains':res.domains[i]
    };
  });
  return proj
}

export default CreateNew;