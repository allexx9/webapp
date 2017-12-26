import React from 'react';
import ReactDOM from 'react-dom';
import {
    HashRouter,
    Route,
    Switch,
    Redirect
  } from 'react-router-dom'

// import App from './App';
import registerServiceWorker from './registerServiceWorker';

// import { 
//     ApplicationHomePage, 
//     ApplicationGabcoinPage, 
//     ApplicationDragoPage, 
//     ApplicationExchangePage,
//     Whoops404 } from './Application/ApplicationPages';

import { 
    ApplicationHomePage, 
    ApplicationGabcoinPage, 
    ApplicationDragoPage, 
    ApplicationConfigPage,
    // ApplicationExchangePage,
    Whoops404 } from './App';

import './index.module.css';

var appHashPath = true;

// window.React = React

// ReactDOM.render(<App />, document.getElementById('root'));

// We set the routes. 
// Component Whoops404 is loaded if a page does not exist.


// console.log(location);
var pathArray = window.location.hash.split( '/' );
// console.log(pathArray[2]);
if (typeof window.parity !== 'undefined') {
    appHashPath = pathArray[2];
    } else {
    appHashPath = 'web';
    }
// console.log(appHashPath);

ReactDOM.render(
    <HashRouter>
        <Switch>
          <Route exact path={ "/app/" + appHashPath + "/home" } component={ApplicationHomePage} />
          <Route path={ "/app/" + appHashPath + "/vault" } component={ApplicationGabcoinPage} />
          {/* <Route exact path={ "/app/" + appHashPath + "/drago/dashboard" } component={ApplicationDragoPage} /> */}
          {/* <Route exact path={ "/app/" + appHashPath + "/drago/funds" } component={ApplicationDragoPage} /> */}
          <Route path={ "/app/" + appHashPath + "/drago" } component={ApplicationDragoPage} />
          <Route path={ "/app/" + appHashPath + "/config" } component={ApplicationConfigPage} />
          {/* <Route path={ "/app/" + appHashPath + "/exchange" } component={ApplicationExchangePage} /> */}
          {/* <Redirect from="/exchange" to={ "/app/" + appHashPath + "/exchange" } />  */}
          <Redirect from="/vault/" to={ "/app/" + appHashPath + "/vault" } />
          <Redirect from="/drago" to={ "/app/" + appHashPath + "/drago" } />
          <Redirect from="/" to={ "/app/" + appHashPath + "/home" } />
          <Route component={Whoops404} />
        </Switch>
    </HashRouter>,
    document.getElementById('root'))

registerServiceWorker()

// Hot Module Reload
if (module.hot) {
    module.hot.accept();
}
