import React from 'react';
import { HashRouter as Router, Route ,Switch} from "react-router-dom";
import Login from './pages/login'
import Mindmap from './pages/mindmap'


/*Component App
  use: defines components for each url
*/

const App = () => {
  return (
    <Router>
      <Switch>
        <Route path="/login" component={Login} />
        <Route path="/mindmap" component={Mindmap} />
        <Route component={Login} />
      </Switch>
    </Router>
  );
}

export default App;
