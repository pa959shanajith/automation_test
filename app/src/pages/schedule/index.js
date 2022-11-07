import React, {useEffect} from 'react';
import ScheduleHome from './containers/ScheduleHome'
import { useHistory } from 'react-router-dom';
import {RedirectPage} from '../global'
export var history

/*Component App
  use: defines components for each url
*/

const Schedule = () => {
  history = useHistory();

  useEffect(()=>{
    if(window.localStorage['navigateScreen'] !== "scheduling"){
        RedirectPage(history, { reason: "screenMismatch" });
    }
  }, []);
  
  return (
      <ScheduleHome/>
  );
}

export default Schedule;