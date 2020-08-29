import React from 'react';
import { BrowserRouter as Router, Route ,Switch} from "react-router-dom";
import Login, {Base} from './pages/login';
import {ProgressBar} from './pages/global'
import Plugin from './pages/plugin';
import Mindmap from './pages/mindmap';
import {createStore,combineReducers} from 'redux';
import {Provider} from 'react-redux';
import mindmapReducer from './pages/mindmap/state/reducer.js';
import progressBarReducer from "./pages/global/state/reducer";
import LoginReducer from './pages/login/state/reducer';

/* combining multiple domains reducer */
const rootReducer = combineReducers({
  mindmap : mindmapReducer,
  progressbar : progressBarReducer,
  login : LoginReducer,
});

const store = createStore(rootReducer)

/*Component App
  use: defines components for each url
  note: right now it does not redirect '/' path to /login automtically
*/

const App = () => {
  
  return (
    <Provider store={store}>
      <ProgressBar />
      <Router>
        <Switch>
          <Route exact path="/" component={Base} />
          <Route path="/login" component={Login} />
          <Route path="/mindmap" component={Mindmap} />
          <Route path="/plugin" component={Plugin} />
          <Route component={Login} />
        </Switch>
      </Router>
    </Provider>
  );
}

export default App;