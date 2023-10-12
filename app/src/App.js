import React, { useEffect, useState } from 'react';
import { v4 as uuid } from 'uuid';
import { Route, Routes, useLocation } from 'react-router-dom';
import ServiceBell from "@servicebell/widget";
// import {store} from './reducer';
import store from './store';
// import HomePage from './pages/landing/containers/HomePage';
import HomePage from './pages/landing/containers/HomePage';
import TagManager from 'react-gtm-module';
import Report from './pages/report/components/reports';
import More from './pages/more/more';
import {ScreenOverlay,ErrorBoundary} from './pages/global';
// import Integration from './pages/integration/Integration';
// import Settings from './pages/settings/Settings';
import Utility from './pages/utilities/containers/UtilityHome'
import { ErrorPage } from './pages/global';
import Login from './pages/login/containers/LoginPage';
import BasePage from './pages/login/containers/BasePage';
// import ShowTrialVideo from './pages/global/components/ShowTrialVideo';
import SocketFactory from './SocketFactory';
import 'primeicons/primeicons.css';
import 'primereact/resources/themes/lara-light-indigo/theme.css';
import 'primereact/resources/primereact.css';
import 'primeflex/primeflex.css';
// import StaticDataForMindMap from './pages/design/containers/staticDataForMindMap';
import ConfigurePage from './pages/execute/components/ConfigurePage';
import './App.css';
import Topbar from './pages/landing/components/Topbar';
import SideNavBar from './pages/landing/components/SideNav';
import Overview from './pages/landing/components/ProjectCreation';
import Analysis from './pages/landing/components/Analysis';
import MindmapHome from './pages/design/containers/MindmapHome';
import Profile from './pages/report/components/Profile';
import ReportTestTable from './pages/report/components/ReportTestTable';
import AdminContainer from './pages/admin/containers/AdminHome';
import GeniusDialog from './pages/global/components/GeniusDialog';




const { REACT_APP_DEV } = process.env
/*Component App
  use: defines components for each url
*/

export const url = REACT_APP_DEV ? "https://" + window.location.hostname + ":8443" : window.location.origin;

const App = () => {
  const [blockui,setBlockui] = useState({show:false});
  const location = useLocation();
  const [gtmToken, setGtmToken] = useState("");
  const [gtmEnable, setGtmEnable] = useState(false);
  
  const tagManagerArgs = {
    gtmId: gtmToken
  }
  if(gtmEnable){
    TagManager.initialize(tagManagerArgs)
  }

  useEffect(()=>{
    (async()=>{
      const response = await fetch("/getGTM")
      let { enableGTM, gtmToken } = await response.json();
      setGtmToken(gtmToken);
      setGtmEnable(enableGTM);
    })();
  },[])

  useEffect(()=>{
    TabCheck(setBlockui);
    (async () => {
      const response = await fetch("/getServiceBell")
      let { enableServiceBell } = await response.json();
      if (enableServiceBell) ServiceBell("init", "07e1c4e7d40744869cc8cca1ba485f2c");
    })();
  }, [])

  return (<>
    {(blockui.show)?<ScreenOverlay content={blockui.content}/>:null}
    {/* <ProgressBar /> */}
    {/* <ErrorBoundary> */}
    <div className="main_content">
      {!['/login', '/','/undefined','/viewReports'].includes(location.pathname) && <Topbar />}
      <SocketFactory/>
      <RouteApp/>
    </div>
    {/* </ErrorBoundary> */}
  </>
  );
}

const RouteApp = () => {
  return (
    <>
    <GeniusDialog />
      <Routes>
      
        <Route path="/login" element={<Login />} />
        <Route path="/verify" element={<Login />} />
        <Route path="/reset" element={<Login />} />
        <Route path="/" element={<BasePage />} />
        <Route path="/landing" element={<HomePage />} />
        {/* <Route path="/integration" element={<Integration />} /> */}
        <Route path="/reports" element={<Report />} />
        <Route path="/profile" element={<Profile />} />
        {/* <Route path="/settings" element={<Settings />} /> */}
        <Route path="/itdm" element={<itdm />} />
        <Route path="/design" element={<MindmapHome />} />
        <Route path="/execute" element={<ConfigurePage />} />
        <Route path='/viewReports' element={<ReportTestTable/>}/>
        <Route path="/admin" element={<AdminContainer />} />
        <Route path="/utility" element={<Utility />} />
        
      </Routes>
    </>
  )
}


//disable duplicate tabs
const TabCheck = (setBlockui) => {
  const storage_Handler = (e) => {
    if (window.location.pathname.includes('/executionReport') || window.location.pathname.includes('/accessibilityReport') || window.location.pathname.includes('/devOpsReport') || window.location.pathname.includes('/viewReports') || window.location.pathname.includes('/profile')) return false;
    // if tabGUID does not match then more than one tab and GUID
    if (e.key === 'tabUUID' && e.oldValue !== '') {
      if (e.oldValue !== e.newValue) {
        window.localStorage.clear();
        localStorage["tabValidity"] = "invalid";
        setBlockui({ show: true, content: 'Duplicate Tabs not allowed, Please Close this Tab and refresh.' })
        window.sessionStorage.clear();
      }
    } else if (e.key === "tabValidity") {
      window.sessionStorage.clear();
      // history.pushState(null, null, document.URL);
      setBlockui({ show: true, content: "Duplicate Tabs not allowed, Please Close this Tab and refresh." })
    }
  }
  // detect local storage available
  if (typeof (Storage) === "undefined") return;
  // get (set if not) tab uuid and store in tab session
  if (window.name === "") window.name = uuid();
  // add eventlistener to session storage
  window.addEventListener("storage", storage_Handler, false);
  // set tab UUID in session storage
  localStorage["tabUUID"] = window.name;
}

export default App;