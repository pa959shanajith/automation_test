import React ,  { Fragment, useEffect, useState, useRef} from 'react';
import {getProjectList , getModules} from '../api';
import LoadingBar from 'react-top-loading-bar';
import { useDispatch} from 'react-redux';
import MindmapToolbar from './MindmapToolbar';
import 'font-awesome/css/font-awesome.min.css';
import * as actionTypes from '../state/action';
import Canvas from './MindmapCanvas';
import '../styles/CreateNew.scss';

/*Component CreateNew
  use: renders create New Mindmap page
  todo: invalid session check error handling for apis
*/
    
const CreateNew = () => {
  const dispatch = useDispatch()
  const loadref = useRef(null)
  const [loading,setLoading] = useState(true)
  useEffect(()=>{
    (async()=>{
      loadref.current.staticStart()
      var res = await getProjectList()
      var data = parseProjList(res)
      dispatch({type:actionTypes.UPDATE_PROJECTLIST,payload:data})
      dispatch({type:actionTypes.SELECT_PROJECT,payload:res.projectId[0]}) 
      var moduledata = await getModules({"tab":"tabCreate","projectid":res.projectId[0],"moduleid":null})
      dispatch({type:actionTypes.UPDATE_MODULELIST,payload:moduledata})
      loadref.current.complete()
      setLoading(false)
    })()
  },[dispatch])
  return (
    <Fragment>
        <LoadingBar shadow={false} color={'#633690'} className='loading-bar' ref={loadref}/>
        {(!loading)?
          <div className='mp__canvas_container'>
            <MindmapToolbar/>
              <div className='mp__canvas'>
                <Canvas/>
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