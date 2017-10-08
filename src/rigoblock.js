// Copyright 2016-2017 Gabriele Rigo

import ReactDOM from 'react-dom';
import React from 'react';
import Application from './Application';
//import {Web3Provider} from 'react-web3';

import injectTapEventPlugin from 'react-tap-event-plugin';
injectTapEventPlugin();

//import '../assets/fonts/Roboto/font.css';
import './assets/fonts/Roboto/font.css';
import './style.css';
//import './index.html';
import './index.js';

ReactDOM.render(
    <Application />,
  document.querySelector('#container')
);

/*
ReactDOM.render(
  <Web3Provider
    onChangeAccount={() => this.forceUpdate()}
    passive={true}>
      <Application />
  </Web3Provider>,
  document.querySelector('#container')
);
*/
