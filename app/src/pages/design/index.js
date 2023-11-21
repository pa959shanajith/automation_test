import React,{ useEffect } from 'react';
import MindmapHome from './containers/MindmapHome';
import { useNavigate } from 'react-router-dom';
import { RedirectPage } from '../global';
export var navigate

/*Component App
  use: defines components for each url
*/

const Design = () => {
  navigate =  useNavigate()
  useEffect(()=>{
    if(window.localStorage['navigateScreen'] !== "design"){
        RedirectPage(navigate, { reason: "screenMismatch" });
    }
  }, []);
  return (
      <MindmapHome/>
  );
}
export default Design;