import React ,  { Fragment, useEffect, useState, useRef} from 'react';
import {getProjectList, getModules, getScreens} from '../api';
import { useHistory } from 'react-router-dom';
import LoadingBar from 'react-top-loading-bar';
import { useDispatch, useSelector} from 'react-redux';
import MindmapToolbar from './MindmapToolbar';
import * as actionTypes from '../state/action';
import Canvas from './MindmapCanvas';
import '../styles/CreateNew.scss';
import { ScreenOverlay, PopupMsg } from '../../global';
export var history

/*Component CreateNew
  use: renders create New Mindmap page
  todo: invalid session check error handling for apis
*/
    
const CreateNew = () => {
  const dispatch = useDispatch()
  const [popup,setPopup] =  useState({show:false})
  const [blockui,setBlockui] =  useState({show:false})
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
              {(Object.keys(moduleSelect).length>0)?<Canvas setBlockui={setBlockui} setPopup={setPopup} module={moduleSelect}/>:null}
            </div>
          </div>:null
        }      
    </Fragment>
  );
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