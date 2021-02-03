import React, { useEffect } from 'react';
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
// import Report from './pages/report';
import Integration from './pages/integration';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'font-awesome/css/font-awesome.min.css';
import 'react-datetime/css/react-datetime.css';

/*Component App
  use: defines components for each url
*/
// window.history.pushState(null, null, document.URL);
// if (!window.localStorage.hiss) window.localStorage.hiss = "";
// window.localStorage.hiss+=";"+document.URL;
// window.addEventListener('popstate', function () {
// 	var currentURL = document.URL.split("/")[0]+'/'+window.localStorage.navigateScreen;
// 	if (!window.localStorage.hiss) window.localStorage.hiss = "";
// 	window.localStorage.hiss+=";"+currentURL;
// 	window.history.pushState(null, null, currentURL);
// });

const App = () => {
  return (
    <Provider store={store}>
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
    var userName = Buffer.from((userInfo)?userInfo.username:uuid()).toString('base64')
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
      {/* <Route path = "/reports" component={Report}/> */}
      <Route path ="/execute" component={Execute}/>
      <Route path ="/scheduling" component={Schedule}/>
      <Route component={Base} />
    </Switch>
  </Router>
  )
}

export default App;