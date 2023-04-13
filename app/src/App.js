import React, { useEffect, useState } from 'react';
import {v4 as uuid} from 'uuid';
import {Provider} from 'react-redux';
import { createBrowserRouter, RouterProvider, Route, Router, Routes, BrowserRouter, Outlet} from 'react-router-dom';
import ServiceBell from "@servicebell/widget";
// import {store} from './reducer';
import store from './store';
import SideNav from './pages/landing/components/SideNav';
// import HomePage from './pages/landing/containers/HomePage';
import Project from './pages/landing/components/Project';
import Report from './pages/report/components/reports';
import More from './pages/more/more';
import Integration from './pages/integration/Integration';
import Settings from './pages/settings/Settings';
import {ErrorPage} from './pages/global';
import Login, {Base} from './pages/login';
import MenubarDemo from './pages/landing/components/Topbar';
// import ShowTrialVideo from './pages/global/components/ShowTrialVideo';
// import SocketFactory from './SocketFactory';
import 'primeicons/primeicons.css';
import 'primereact/resources/themes/lara-light-indigo/theme.css';
import 'primereact/resources/primereact.css';
import 'primeflex/primeflex.css';
import staticDataForMindMap from './pages/design/staticDataForMindMap';
import './App.css';

import HomePage from './pages/landing/containers/HomePage';
import Topbar from './pages/landing/components/Topbar';
import SideNavBar from './pages/landing/components/SideNav';




const { REACT_APP_DEV } = process.env
/*Component App
  use: defines components for each url
*/

export const url =  REACT_APP_DEV  ? "https://"+window.location.hostname+":8443" : window.location.origin;

const App = () => {
  const [blockui,setBlockui] = useState({show:false})
  useEffect(()=>{
    TabCheck(setBlockui);
    (async()=>{
      const response = await fetch("/getServiceBell")
      let { enableServiceBell } = await response.json();
      if(enableServiceBell) ServiceBell("init", "07e1c4e7d40744869cc8cca1ba485f2c");
    })();
  },[])
 
  return (
    <Provider store={store}>
      {/* {(blockui.show)?<ScreenOverlay content={blockui.content}/>:null} */}
      {/* <ProgressBar /> */}
      {/* <ErrorBoundary> */}
      <div>
        <Topbar/>
        <div className='flex flex-row'>
          <SideNavBar/>
          <HomePage/>
          <RouteApp/>
        </div>
      </div>
      {/* </ErrorBoundary> */}
    </Provider>

  );
}

const RouteApp = () => {
  return(
    <>
      <Routes>
        <Route path="/" element={<Project/>} />
        <Route path="/integration" element={<Integration/>} />
        <Route path="/reports" element={<Report/>} />
        <Route path="/settings" element={<Settings/>} />
        <Route path="/more" element={<more/>} />
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