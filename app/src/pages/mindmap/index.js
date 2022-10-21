import React, { useEffect } from 'react';
import MindmapHome from './containers/MindmapHome';
import { useDispatch } from 'react-redux';
import { useHistory } from 'react-router-dom';
import { SetProgressBar, RedirectPage } from '../global';
export var history

/*Component Mindmap
  use: direct to mindmap landing page
*/

const Mindmap = () => {
  history =  useHistory()
  const dispatch = useDispatch();
  useEffect(()=>{
    if(window.localStorage['navigateScreen'] !== "mindmap"){
        RedirectPage(history, { reason: "screenMismatch" });
    }
    SetProgressBar("stop", dispatch);
  }, [dispatch]);
  return (
    <MindmapHome/>
  );
}

export default Mindmap;