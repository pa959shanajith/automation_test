import React, { useEffect } from 'react';
import MindmapHome from './containers/MindmapHome';
import { useDispatch } from 'react-redux';
import { useHistory } from 'react-router-dom';
import { SetProgressBar, RedirectPage } from '../global';
export var history
/*Component Mindmap
  use: direct to mindmap landing page
  todo: 
    add user permission check 
*/

const Mindmap = () => {
  history =  useHistory()
  const dispatch = useDispatch();
  useEffect(()=>{
    if(window.localStorage['navigateScreen'] !== "mindmap"){
        RedirectPage(history);
    }
    SetProgressBar("stop", dispatch);
  }, []);
  return (
    <MindmapHome/>
  );
}

export default Mindmap;