// Copyright 2016-2017 Gabriele Rigo

//const { api } = window.parity;

// API reference: https://gitlab.parity.io/parity/parity/blob/d2394d3ac30b589f92676eec401c50d6b388f911/js/npm/parity/README.md
// Converted rpc calls to use provider

import { Api } from '@parity/parity.js';

// Debugging
var keys = Object.keys(Api);
console.log(keys);

if(!window.parity) {
  var transport = new Api.Transport.Http('https://srv03.endpoint.network:8545');

  // Debugging
  var keys = Object.keys(transport);
  console.log(keys);

  var api = new Api(transport);
} else {
  var { api } = window.parity;
}

// Debugging
console.log(api);

export {
  api
};

//const ethereumProvider = window.ethereum || window.parent.ethereum;

//if (!ethereumProvider) {
//  throw new Error('Unable to locate EthereumProvider, object not attached');
  //const api = new Api('https://kovan.infura.io/oTRuD7vcUjsqn1pFIyMS');
//}

//const api = new Api(ethereumProvider);

/*
import { Web3Provider } from 'react-web3';

// ...

// Ensure that <App /> doesn't render until we confirm web3 is available
ReactDOM.render(rootEl,
  <Web3Provider>
    <App />
  </Web3Provider>
);


//import { Api } from '@parity/parity.js';
import { Api } from '@parity/parity.js';

// do the setup
const { transport } = new Api.Transport.Http('http://localhost:8545');
const { api } = new Api(transport);

export {
  api
};
*/

/*
import Api from '@parity/api';

const ethereumProvider = window.ethereum || window.parent.ethereum;

if (!ethereumProvider) {
  throw new Error('Unable to locate EthereumProvider, object not attached');
}

const api = new Api(ethereumProvider);

export {
  api
};
*/

/*
const Parity = require('@parity/parity.js');

function injectedTransport() {
	if (window && window.parity && window.parity.api.transport._url) {
		return new Parity.Api.Transport.Http(
			window.parity.api.transport._url[0] === '/'
				? window.location.protocol + '//' + window.location.host + window.parity.api.transport._url
			: window.parity.api.transport._url.contains('://')
				? window.parity.api.transport._url
				: window.location.href + window.parity.api.transport._url
		);
	}
	return null;
}
*/
