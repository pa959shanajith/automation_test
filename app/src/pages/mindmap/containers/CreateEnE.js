import React ,  { Fragment, useEffect, useState, useRef} from 'react';
import { getProjectList, getModules, getScreens} from '../api';
import { useDispatch, useSelector} from 'react-redux';
import { ScreenOverlay, PopupMsg, ReferenceBar, SetProgressBar} from '../../global';
import { ClickFullScreen } from './MindmapUtils'
import  ToolbarMenuEnE from '../components/ToolbarMenuEnE'
import CanvasEnE from './CanvasEnE'
import * as actionTypes from '../state/action';
import '../styles/CreateEnE.scss'

const CreateEnE = () =>{
  const dispatch = useDispatch()
  const [popup,setPopup] = useState({show:false})
  const [blockui,setBlockui] = useState({show:false})
  const [fullScreen,setFullScreen] = useState(false)
  const [verticalLayout,setVerticalLayout] = useState(false)
  const moduleSelect = useSelector(state=>state.mindmap.selectedModule)//remove
  useEffect(()=>{(async()=>{
    SetProgressBar("start",dispatch)
    var res = await getProjectList()
    if(res.error){displayError(res.error);return;}
    var data = parseProjList(res)
    dispatch({type:actionTypes.UPDATE_PROJECTLIST,payload:data})
    dispatch({type:actionTypes.SELECT_PROJECT,payload:res.projectId[0]}) 
    var moduledata = await getModules({"tab":"endToend","projectid":res.projectId[0],"moduleid":null})
    if(moduledata.error){displayError(moduledata.error);return;}
    dispatch({type:actionTypes.SELECT_MODULE,payload:{}}) 
    // var screendata = await getScreens(res.projectId[0])
    // if(screendata.error){displayError(screendata.error);return;}
    // dispatch({type:actionTypes.UPDATE_SCREENDATA,payload:screendata})
    dispatch({type:actionTypes.UPDATE_MODULELIST,payload:moduledata})
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
      <div id='ene' className='mp__canvas_container'>
        <ToolbarMenuEnE setBlockui={setBlockui} setPopup={setPopup}/>
        <div id='mp__canvas' className='mp__canvas'>
          {(Object.keys(moduleSelect).length>0)?<CanvasEnE setBlockui={setBlockui} setPopup={setPopup} module={moduleSelect} verticalLayout={verticalLayout}/>:null}
        </div>
        
      </div>
      <ReferenceBar taskTop={true} collapsible={true} collapse={true}>
          <div className="ic_box" >
          <   img onClick={()=>ClickSwitchLayout(verticalLayout,setVerticalLayout,moduleSelect,setPopup,setBlockui,dispatch)} style={{height: '55px'}} className={"rb__ic-task thumb__ic " + (verticalLayout?"active_rb_thumb ":"")} src="static/imgs/switch.png"/>
              <span className="rb_box_title">Switch</span><span className="rb_box_title">Layout</span>
          </div>
          <div className="ic_box" >
              <img onClick={()=>ClickFullScreen(setFullScreen,setPopup)} style={{height: '55px'}} className={"rb__ic-task thumb__ic " +(fullScreen?"active_rb_thumb":"")} src="static/imgs/fscr.png"/>
              <span className="rb_box_title">Full Screen</span>
          </div>
      </ReferenceBar>  
      </Fragment>
  )
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

export default CreateEnE;