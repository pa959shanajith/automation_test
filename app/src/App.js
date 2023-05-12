import React, { useEffect, useState} from 'react';
import {v4 as uuid} from 'uuid';
import {Provider, useSelector} from 'react-redux';
import { createBrowserRouter, RouterProvider, Route, Router, Routes, BrowserRouter, Outlet,useLocation} from 'react-router-dom';
import ServiceBell from "@servicebell/widget";
// import {store} from './reducer';
import store from './store';
// import HomePage from './pages/landing/containers/HomePage';
import HomePage from './pages/landing/containers/HomePage';
import Report from './pages/report/components/reports';
import Execute from './pages/execute/Components/Execute';
import More from './pages/more/more';
import Integration from './pages/integration/Integration';
import Settings from './pages/settings/Settings';
import {ErrorPage} from './pages/global';
import Login from './pages/login/containers/LoginPage';
import MenubarDemo from './pages/landing/components/Topbar';
// import ShowTrialVideo from './pages/global/components/ShowTrialVideo';
// import SocketFactory from './SocketFactory';
import 'primeicons/primeicons.css';
import 'primereact/resources/themes/lara-light-indigo/theme.css';
import 'primereact/resources/primereact.css';
import 'primeflex/primeflex.css';
import StaticDataForMindMap from './pages/design/containers/staticDataForMindMap';
import './App.css';

import Topbar from './pages/landing/components/Topbar';
import SideNavBar from './pages/landing/components/SideNav';
import Overview from './pages/landing/components/ProjectCreation';
import Analysis from './pages/landing/components/Analysis';





const { REACT_APP_DEV } = process.env
/*Component App
  use: defines components for each url
*/

export const url =  REACT_APP_DEV  ? "https://"+window.location.hostname+":8443" : window.location.origin;

const App = () => {
  const isLoggedIn = useSelector((state) => state.login.isLoggedIn);
  const [blockui,setBlockui] = useState({show:false});
  useEffect(()=>{
    TabCheck(setBlockui);
    (async()=>{
      const response = await fetch("/getServiceBell")
      let { enableServiceBell } = await response.json();
      if(enableServiceBell) ServiceBell("init", "07e1c4e7d40744869cc8cca1ba485f2c");
    })();
  },[])
  const location = useLocation();
    useEffect(() => {
     if (["/design", "/execute", "/reports"].includes(location.pathname))
       {
          setShowExtraItem(false);
        }
         else {
          setShowExtraItem(true);
        }
      }, [location]);
      const [showExtraItem, setShowExtraItem] = useState(true);
 
  return (<>
      {/* {(blockui.show)?<ScreenOverlay content={blockui.content}/>:null} */}
      {/* <ProgressBar /> */}
      {/* <ErrorBoundary> */}
      <div className="main_content">
      { !isLoggedIn && <Login/> }
      { isLoggedIn && <>
        <Topbar/>
        <div className="sidebar_sidepanel_homepage">
          {/* {}['integrations'] */}

          {showExtraItem && <SideNavBar/>}
          <RouteApp/>
        </div>
      </>
      }
      </div>
      {/* </ErrorBoundary> */}
    </>
  );
}

const RouteApp = () => {
  return(
    <>
      <Routes>
        <Route exact path="/" element={<HomePage/>} />
        <Route path="/integration" element={<Integration/>} />
        <Route path="/reports" element={<Report/>} />
        <Route path="/settings" element={<Settings/>} />
        <Route path="/itdm" element={<itdm/>} />
        <Route path="/design" element={<StaticDataForMindMap/>}/>
        <Route path="/execute" element={<Execute/>}/>
      </Routes>
    </>
  )
}


//disable duplicate tabs
const TabCheck = (setBlockui) => {
  const storage_Handler = (e) => {
    if (window.location.pathname.includes('/executionReport') || window.location.pathname.includes('/accessibilityReport') || window.location.pathname.includes('/devOpsReport')) return false;
      // if tabGUID does not match then more than one tab and GUID
      if (e.key === 'tabUUID' && e.oldValue !== '') {
          if (e.oldValue !== e.newValue) {
            window.localStorage.clear();
            localStorage["tabValidity"] = "invalid";
            setBlockui({show:true,content:'Duplicate Tabs not allowed, Please Close this Tab and refresh.'})
            window.sessionStorage.clear();
          }
      }else if(e.key === "tabValidity"){
        window.sessionStorage.clear();
      // history.pushState(null, null, document.URL);
      setBlockui({show:true,content:"Duplicate Tabs not allowed, Please Close this Tab and refresh."})
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