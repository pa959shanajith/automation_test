import React from 'react';
import ExecuteHome from './containers/ExecuteHome'
import { useHistory } from 'react-router-dom';
export var history

/*Component App
  use: defines components for each url
*/

const Execute = () => {
  history =  useHistory()
  return (
      <ExecuteHome/>
  );
}

export default Execute;