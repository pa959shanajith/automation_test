import React from 'react';
import AdminHome from './containers/AdminHome'
import { useHistory } from 'react-router-dom';
export var history

/*Component App
  use: defines components for each url
*/

const Admin = () => {
  history =  useHistory()
  return (
      <AdminHome/>
  );
}

export default Admin;