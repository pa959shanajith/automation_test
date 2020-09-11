import React from 'react';
import { BrowserRouter as Router, Route ,Switch} from "react-router-dom";
import {Provider} from 'react-redux';
import {store} from './reducer';
import {ProgressBar} from './pages/global'
import Login, {Base} from './pages/login';
import Admin from './pages/admin';
import Plugin from './pages/plugin';
import Mindmap from './pages/mindmap';
import Scrape from './pages/scrapescreen';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'font-awesome/css/font-awesome.min.css';


/*Component App
  use: defines components for each url
*/

const App = () => {
  return (
    <Provider store={store}>
      <ProgressBar />
      <Router>
        <Switch>
          <Route exact path="/" component={Base} />
          <Route path="/login" component={Login} />
          <Route path="/admin" component={Admin} />
          <Route path="/mindmap" component={Mindmap} />
          <Route path="/plugin" component={Plugin} />
          <Route path ="/scrape" component={Scrape}/>
          <Route component={Base} />
        </Switch>
      </Router>
    </Provider>
  );
}

export default App;