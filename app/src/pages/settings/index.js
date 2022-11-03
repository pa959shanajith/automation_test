import React, { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { useHistory } from 'react-router-dom';
import { SetProgressBar, RedirectPage } from '../global';
import SettingsHome from './containers/SettingsHome';
import ServiceBell from "@servicebell/widget";
export var history

/*Component Settings
  use: direct to setting landing page(SettingsHome.js)
*/

const Settings = () => {
  ServiceBell("init", "07e1c4e7d40744869cc8cca1ba485f2c");
  history = useHistory()
  const dispatch = useDispatch();
  useEffect(() => {
    if (window.localStorage['navigateScreen'] !== "settings") {
      RedirectPage(history, { reason: "screenMismatch" });
    }
    SetProgressBar("stop", dispatch);
  }, [dispatch]);
  return (
    <SettingsHome />
  );
}

export default Settings;