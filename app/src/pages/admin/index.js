import React from 'react';
import AdminHome from './containers/AdminHome'
import { useHistory } from 'react-router-dom';
import TokenManagement from './containers/TokenMangement';
import IceProvision from './containers/IceProvision'
import GitConfig from './containers/GitConfig';
import ServiceBell from "@servicebell/widget";
export var history

/*Component App
  use: defines components for each url
*/

const Admin = () => {
  ServiceBell("init", "07e1c4e7d40744869cc8cca1ba485f2c");
  history =  useHistory()
  return (
      <AdminHome/>
  );
}
export {TokenManagement, IceProvision, GitConfig};
export default Admin;