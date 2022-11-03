import React, {useEffect} from 'react';
import ExecuteHome from './containers/ExecuteHome'
import { useHistory } from 'react-router-dom';
import {RedirectPage} from '../global';
export var history

/*Component App
  use: defines components for each url
*/

const Execute = () => {
  history = useHistory();

  useEffect(()=>{
      if(window.localStorage['navigateScreen'] !== "TestSuite"){
          RedirectPage(history, { reason: "screenMismatch" });
      }
  }, []);
  
  return (
      <ExecuteHome/>
  );
}

export default Execute;