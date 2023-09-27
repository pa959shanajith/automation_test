import React,{ useEffect } from 'react';
import MindmapHome from './containers/MindmapHome';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { RedirectPage } from '../global';
export var navigate

/*Component App
  use: defines components for each url
*/

const Design = () => {
  navigate =  useNavigate()
  const dispatch = useDispatch();
  useEffect(()=>{
    if(window.localStorage['navigateScreen'] !== "design"){
        RedirectPage(navigate, { reason: "screenMismatch" });
    }
    // SetProgressBar("stop", dispatch);
  }, [dispatch]);
  return (
      <MindmapHome/>
  );
}
export default Design;