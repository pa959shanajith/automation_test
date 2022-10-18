import React, { useEffect } from 'react';
import MindmapHome from './containers/MindmapHome';
import { useDispatch } from 'react-redux';
import { useHistory } from 'react-router-dom';
import { SetProgressBar, RedirectPage } from '../global';
import ServiceBell from "@servicebell/widget";
export var history

/*Component Mindmap
  use: direct to mindmap landing page
*/

const Mindmap = () => {
  ServiceBell("init", "07e1c4e7d40744869cc8cca1ba485f2c");
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