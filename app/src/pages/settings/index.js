import React, { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { useHistory } from 'react-router-dom';
import { SetProgressBar, RedirectPage } from '../global';
import SettingsHome from './containers/SettingsHome';
export var history

/*Component Settings
  use: direct to setting landing page(SettingsHome.js)
*/

const Settings = () => {
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