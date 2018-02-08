// Copyright 2016-2017 Rigo Investment Sarl.
// By the Power of Grayskull! I Have the Power!

import React from 'react';
import ReactDOM from 'react-dom';
import {
    HashRouter,
    Route,
    Switch,
    Redirect
} from 'react-router-dom'

import registerServiceWorker from './registerServiceWorker';
import App from './App';
import './index.module.css';

ReactDOM.render(
    <App />,
    document.getElementById('root'))

registerServiceWorker()

// Hot Module Reload
if (module.hot) {
    module.hot.accept();
}
