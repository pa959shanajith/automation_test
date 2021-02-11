import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Route ,Switch} from "react-router-dom";
import socketIOClient from "socket.io-client";
import {useDispatch, useSelector} from 'react-redux';
import {v4 as uuid} from 'uuid';
import * as actionTypes from './pages/login/state/action';
import {Provider} from 'react-redux';
import {store} from './reducer';
import {ProgressBar} from './pages/global'
import Login, {Base} from './pages/login';
import Admin from './pages/admin';
import Plugin from './pages/plugin';
import Execute from './pages/execute';
import Schedule from './pages/schedule';
import Mindmap from './pages/mindmap';
import Scrape from './pages/scrape';
import Design from './pages/design';
import Utility from './pages/utility';
import Report from './pages/report';
import Integration from './pages/integration';
import {ScreenOverlay} from './pages/global';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'font-awesome/css/font-awesome.min.css';
import 'react-datetime/css/react-datetime.css';

/*Component App
  use: defines components for each url
*/

const App = () => {
  const [blockui,setBlockui] = useState({show:false})
  useEffect(()=>{
    TabCheck(setBlockui);
  },[])
  return (
    <Provider store={store}>
      {(blockui.show)?<ScreenOverlay content={blockui.content}/>:null}
      <ProgressBar />
      <RouteApp/>
    </Provider>
  );
}

const RouteApp = () => {
  const userInfo = useSelector(state=>state.login.userinfo);
  const EndPoint = "https://"+window.location.hostname+":8443";
  const dispatch = useDispatch()
  useEffect(()=>{
      var userName = Buffer.from((userInfo && userInfo.username)?userInfo.username:uuid()).toString('base64')
      var socket = socketIOClient(EndPoint, { forceNew: true, reconnect: true, query: {check: 'notify', key: userName}});
      dispatch({type:actionTypes.SET_SOCKET,payload:socket})
  },[userInfo])
  return(
    <Router>
    <Switch>
      <Route exact path="/" component={Base} />
      <Route path="/login" component={Login} />
      <Route path="/admin" component={Admin} />
      <Route path="/mindmap" component={Mindmap} />
      <Route path="/plugin" component={Plugin} />
      <Route path ="/scrape" component={Scrape}/>
      <Route path ="/design" component={Design}/>
      <Route path ="/utility" component={Utility}/>
      <Route path = "/integration" component={Integration}/>
      <Route path = "/reports" component={Report}/>
      <Route path ="/execute" component={Execute}/>
      <Route path ="/scheduling" component={Schedule}/>
      <Route component={Base} />
    </Switch>
  </Router>
  )
}

//disable duplicate tabs
const TabCheck = (setBlockui) => {
  const storage_Handler = (e) => {
    if (window.location.pathname.includes('/viewreport/')) return false;
      // if tabGUID does not match then more than one tab and GUID
      if (e.key == 'tabUUID' && e.oldValue != '') {
          if (e.oldValue != e.newValue) {
            window.localStorage.clear();
            localStorage["tabValidity"] = "invalid";
            setBlockui({show:true,content:'Duplicate Tabs not allowed, Please Close this Tab and refresh.'})
            window.sessionStorage.clear();
          }
      }else if(e.key == "tabValidity"){
        window.sessionStorage.clear();
      // history.pushState(null, null, document.URL);
      setBlockui({show:true,content:"Duplicate Tabs not allowed, Please Close this Tab and refresh."})
    }
  } 
  // detect local storage available
  if (typeof (Storage) === "undefined") return;
  // get (set if not) tab uuid and store in tab session
  if (window.name == "") window.name = uuid();
  // add eventlistener to session storage
  window.addEventListener("storage", storage_Handler, false);
  // set tab UUID in session storage
  localStorage["tabUUID"] = window.name;
}

export default App;