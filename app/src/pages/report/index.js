import React, { Fragment, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { useHistory } from 'react-router-dom';
import ReportHome from './container/ReportHome.js';
import { SetProgressBar, RedirectPage } from '../global';
export var history

/*Component Report
  use: direct to Report landing page
*/

const Report = () => {
  history =  useHistory()
  const dispatch = useDispatch();
  useEffect(()=>{
    if(window.localStorage['navigateScreen'] !== "reports"){
        RedirectPage(history);
    }
    SetProgressBar("stop", dispatch);
  }, [dispatch]);
  return (
    <ReportHome/>
  );
}

export default Report;