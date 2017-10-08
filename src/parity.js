// Copyright 2016-2017 Gabriele Rigo

//import Api from '@parity/api';
import Api from '@parity/parity.js';

//const provider = new Api.Provider.Http('https://srv03.blconsulting.co.uk:8545');
//the below is a --public-node
//const provider = new Api.Provider.Http('https://wallet.parity.io');
//const provider = new Api.Provider.Http('https://node.rigoblock.com');
const provider = new Api.Provider.Http('http://45.79.159.114:8545/');
const api = new Api(provider);
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
