import React from 'react';
import { HashRouter as Router, Route ,Switch} from "react-router-dom";
import Login from './pages/login';
import Mindmap from './pages/mindmap';
import {createStore,combineReducers} from 'redux';
import {Provider} from 'react-redux';
import mindmapReducer from './pages/mindmap/state/reducer.js'

/* combining multiple domains reducer */
const rootReducer = combineReducers({
  mindmap : mindmapReducer
});

const store = createStore(rootReducer)

/*Component App
  use: defines components for each url
*/

const App = () => {
  return (
    <Provider store={store}>
      <Router>
        <Switch>
          <Route path="/login" component={Login} />
          <Route path="/mindmap" component={Mindmap} />
          <Route component={Login} />
        </Switch>
      </Router>
    </Provider>
  );
}

export default App;