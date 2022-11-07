import React from 'react';
import AdminHome from './containers/AdminHome'
import { useHistory } from 'react-router-dom';
import TokenManagement from './containers/TokenMangement';
import IceProvision from './containers/IceProvision'
import GitConfig from './containers/GitConfig'
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
export {TokenManagement, IceProvision, GitConfig};
export default Admin;