// Copyright 2016-2017 Rigo Investment Sarl.
// By the Power of Grayskull! I Have the Power!

import React from 'react';
import ReactDOM from 'react-dom';
import registerServiceWorker from './registerServiceWorker';
import App from './App';
import { Provider } from 'react-redux';
import { createStore, applyMiddleware } from 'redux';
import promiseMiddleware from 'redux-promise-middleware';
import thunkMiddleware from 'redux-thunk';
import { Reducers } from './reducers/root'
import './index.module.css';
import logger from 'redux-logger'

const middlewares = [thunkMiddleware,
    promiseMiddleware()];

if (process.env.NODE_ENV === `development`) {
  middlewares.push(logger);
}

const store = createStore(Reducers.rootReducer, applyMiddleware(
    ...middlewares
));

ReactDOM.render(
    <Provider store={store}><App /></Provider>,
    document.getElementById('root'))

registerServiceWorker()

// Hot Module Reload
if (module.hot) {
    module.hot.accept();
}
