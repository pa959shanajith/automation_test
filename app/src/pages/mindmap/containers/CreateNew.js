import React ,  { Fragment, useEffect } from 'react';
import {populateProjects} from '../api';
import { useDispatch, useSelector } from 'react-redux';
import * as actionTypes from '../state/action';

/*Component CreateNew
  use: renders create New Mindmap page
  todo: invalid session check
*/
    
const CreateNew = () => {
  const dispatch = useDispatch()
  const projectList = useSelector(state=>state.mindmap.projectList)
  useEffect(()=>{
    (async()=>{
      var res = await populateProjects()
      var data = parseProjList(res)
      dispatch({type:actionTypes.UPDATE_PROJECTLIST,payload:data})
    })()
  },[])
  return (
    <Fragment>
        <div>{projectList.length}</div>
    </Fragment>
  );
}

/*function parseProjList
  use:  parses input value to list of project props
*/

const parseProjList = (res) =>{
  var proj = [];
  res.projectId.forEach((e,i) => {
    proj.push({
      'apptype': res.appType[i],
      'name': res.projectName[i],
      'id': res.projectId[i],
      'releases':res.releases[i],
      'domains':res.domains[i]
    });
  });
  return proj
}

export default CreateNew;