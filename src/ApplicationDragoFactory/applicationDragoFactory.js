// Copyright 2016-2017 Gabriele Rigo

// import { api } from '../parity';

import * as abis from '../contracts';

import Accounts from '../Accounts';
import { ActionsDragoFactory, ActionDeployDrago } from '../ActionsDragoFactory';
//import Events from '../Events'; //events are watched in eventful
import Loading from '../Loading';
import Status from '../Status';

import styles from './applicationDragoFactory.module.css';

import BigNumber from 'bignumber.js';
import React, { Component } from 'react';

// React.PropTypes is deprecated since React 15.5.0, use the npm module prop-types instead
import PropTypes from 'prop-types';

// import getMuiTheme from 'material-ui/styles/getMuiTheme';
// import lightBaseTheme from 'material-ui/styles/baseThemes/lightBaseTheme';

// const muiTheme = getMuiTheme(lightBaseTheme);

//import bgimage from '../assets/images/blockchainLight.jpg';

/*
const bgstyle = {
  backgroundImage: `url(${bgimage})` 
};
*/

const DIVISOR = 10 ** 6;  //tokens are divisible by one million

export default class ApplicationDragoFactory extends Component {
  

  // We define the properties of the context variables passed down to the children
  static childContextTypes = {
    // api: PropTypes.object,
    contract: PropTypes.object,
    instance: PropTypes.object//,
    // muiTheme: PropTypes.object
  };

  // We check the type of the context variable that we receive by the parent
  static contextTypes = {
    api: PropTypes.object.isRequired,
    muiTheme: PropTypes.object.isRequired
  };

  // We pass down the context variables passed down to the children
  getChildContext () {
    const { contract, instance } = this.state;

    return {
      contract,
      instance
    };
  }

  state = {
    action: null,
    address: null,
    accounts: [],
    accountsInfo: {},
    blockNumber: new BigNumber(-1),
    ethBalance: new BigNumber(0),
    gabBalance: new BigNumber(0),
    instance: null,
    loading: true,
    //price: null,
    //nextDragoID: null, //added
    //fee: null, //added
    version: null
    //remaining: null,
    //totalSupply: null
  }

  componentDidMount () {
    this.attachInterface();
  }

  render () {
    const { accounts, accountsInfo, address, blockNumber, gabBalance, loading, /*price, nextDragoID,*/ version } = this.state;

    if (loading) {
      return (
        <Loading />
      );
    }

    return (
      <div className={ styles.body }>
        { this.renderModals() }
        <ActionsDragoFactory
          gabBalance={ gabBalance }
          onAction={ this.onAction } />
      </div>
    );
  }

  /* took it away just below actions for using it as component in app eventful

  <Status
    address={ address }
    blockNumber={ blockNumber }
    //price={ price } //these should be removed
    //remaining={ remaining }
    //nextDragoID={ nextDragoID }
    gabBalance={ gabBalance }>
    <Accounts
      accounts={ accounts } />
  </Status>


  <Events
    accountsInfo={ accountsInfo } />
    */

  renderModals () {
    const { action, accounts, /*price,*/ dragoName, dragoSymbol } = this.state;

    switch (action) {
      case 'DeployDrago':
        return (
          <ActionDeployDrago
            accounts={ accounts }
            onClose={ this.onActionClose } />
        );
        default:
          return null;
    }
  }

  /*
  switch (action) {
    case 'DeployDrago':
      return (
        <ActionDeployDrago
          accounts={ accounts }
          onClose={ this.onActionClose } />
      );
    default:
      return null;
  }
  */



  onAction = (action) => {
    this.setState({
      action
    });
  }

  onActionClose = () => {
    this.setState({
      action: null
    });
  }

  onNewBlockNumber = (_error, blockNumber) => {
    const { instance, accounts } = this.state;
    const { api } = this.context;

    if (_error) {
      console.error('onNewBlockNumber', _error);
      return;
    }

    Promise
      .all([
        //instance.data.fee.call(), //wrong call
        //instance.nextDragoID.call(),
        instance.version.call()
      //  instance.price.call()
      ])
      .then(([version/*, nextDragoID, price*/]) => {
        this.setState({
          blockNumber,
          //fee,
          version
          //nextDragoID/*,
          //price*/
        });

        //const gabQueries = accounts.map((account) => instance.dragoOf.call({}, [account.address])); //calling instead of balanceOf()
        const gabQueries = accounts.map((account) => api.eth.getBalance(account.address));
        // const ethQueries = accounts.map((account) => api.eth.getBalance(account.address));
        const ethQueries = gabQueries;
        accounts.map((account) => {
          console.log('API call getBalance -> applicationDragoFactory: Getting balance of account', account.name);
          }
        )
        return Promise.all([
          Promise.all(gabQueries),
          Promise.all(ethQueries)
        ]);
      })
      .then(([gabBalances, ethBalances]) => {
        this.setState({
          ethBalance: ethBalances.reduce((total, balance) => total.add(balance), new BigNumber(0)),
          gabBalance: gabBalances.reduce((total, balance) => total.add(balance), new BigNumber(0)),
          accounts: accounts.map((account, index) => {
            const ethBalance = ethBalances[index];
            const gabBalance = gabBalances[index];

            account.ethBalance = api.util.fromWei(ethBalance).toFormat(3);
            account.gabBalance = gabBalance.div(DIVISOR).toFormat(6);
            account.hasGab = gabBalance.gt(0);

            return account;
          })
        });
      })
      .catch((error) => {
        console.warn('onNewBlockNumber', error);
      });
  }

  getAccounts () {
    const { api } = this.context;
    return api.parity
      .accountsInfo()
      .catch((error) => {
        console.warn('getAccounts', error);

        return api.parity
          .accounts()
          .then((accountsInfo) => {
            return Object
              .keys(accountsInfo)
              .filter((address) => accountsInfo[address].uuid)
              .reduce((ret, address) => {
                ret[address] = {
                  name: accountsInfo[address].name
                };
                return ret;
              }, {});
          });
      })
      .then((accountsInfo) => {
        console.log('getAccounts', accountsInfo);

        return accountsInfo;
      });
  }

  // attachInterface = () => {
  //   const { api } = this.context;
  //   api.parity
  //     .registryAddress()
  //     .then((registryAddress) => {
  //       console.log(`the registry was found at ${registryAddress}`);

  //       const registry = api.newContract(abis.registry, registryAddress).instance;

  //       return Promise
  //         .all([
  //           registry.getAddress.call({}, [api.util.sha3('dragofactory'), 'A']),
  //           this.getAccounts()
  //         ]);
  //     })
  //     .then(([address, accountsInfo]) => {
  //       console.log(`drago factory was found at ${address}`);

  //       const contract = api.newContract(abis.dragofactory, address);

  //       this.setState({
  //         loading: false,
  //         address,
  //         contract,
  //         accountsInfo,
  //         instance: contract.instance,
  //         accounts: Object
  //           .keys(accountsInfo)
  //           .map((address) => {
  //             const info = accountsInfo[address] || {};

  //             return {
  //               address,
  //               name: info.name
  //             };
  //           })
  //       });

  //       // Getting the accounts balances. The AccountSelector will need this information.
  //       // I have moved this code here from the onNewBlockNumber function.
  //       const { accounts } = this.state;
  //       const gabQueries = accounts.map((account) => api.eth.getBalance(account.address));
  //       const ethQueries = accounts.map((account) => api.eth.getBalance(account.address));

  //       Promise.all([
  //         Promise.all(gabQueries),
  //         Promise.all(ethQueries)
  //       ]).then(([gabBalances, ethBalances]) => {
  //         this.setState({
  //           ethBalance: ethBalances.reduce((total, balance) => total.add(balance), new BigNumber(0)),
  //           gabBalance: gabBalances.reduce((total, balance) => total.add(balance), new BigNumber(0)),
  //           accounts: accounts.map((account, index) => {
  //             const ethBalance = ethBalances[index];
  //             const gabBalance = gabBalances[index];
  
  //             account.ethBalance = api.util.fromWei(ethBalance).toFormat(3);
  //             account.gabBalance = gabBalance.div(DIVISOR).toFormat(6);
  //             account.hasGab = gabBalance.gt(0);
  
  //             return account;
  //           })
  //         });
  //       });
  //       console.log(`Accounts: ${accounts}`);
        
  //       // Removed unnecessary connections to the RPC server.
  //       // api.subscribe('eth_blockNumber', this.onNewBlockNumber);
  //     })
  //     .catch((error) => {
  //       console.warn('attachInterface', error);
  //     });
  // }

  attachInterface = () => {
    const { api } = this.context;
    api.parity
      .registryAddress()
      .then((registryAddress) => {
        console.log(`the registry was found at ${registryAddress}`);

        const registry = api.newContract(abis.registry, registryAddress).instance;

        return Promise
          .all([
            registry.getAddress.call({}, [api.util.sha3('dragofactory'), 'A']),
            // this.getAccounts()
          ]);
      })
      .then(([address]) => {
        console.log(`drago factory was found at ${address}`);

        const contract = api.newContract(abis.dragofactory, address);
        var testAccount = [
          {
              address : '0x00a79Fa87cFb12A05205CaEa3870C1A9C322ae5C',
              name: 'DAVID2',
              ethBalance : '11.166'
          }
        ]
        this.setState({
          loading: false,
          address,
          contract,
          // accountsInfo,
          instance: contract.instance,
          accounts: testAccount
        });


        // Getting the accounts balances. The AccountSelector will need this information.
        // I have moved this code here from the onNewBlockNumber function.
        const { accounts } = this.state;
        const gabQueries = accounts.map((account) => api.eth.getBalance(account.address));
        const ethQueries = accounts.map((account) => api.eth.getBalance(account.address));

        Promise.all([
          Promise.all(gabQueries),
          Promise.all(ethQueries)
        ]).then(([gabBalances, ethBalances]) => {
          this.setState({
            ethBalance: ethBalances.reduce((total, balance) => total.add(balance), new BigNumber(0)),
            gabBalance: gabBalances.reduce((total, balance) => total.add(balance), new BigNumber(0)),
            accounts: accounts.map((account, index) => {
              const ethBalance = ethBalances[index];
              const gabBalance = gabBalances[index];
  
              account.ethBalance = api.util.fromWei(ethBalance).toFormat(3);
              account.gabBalance = gabBalance.div(DIVISOR).toFormat(6);
              account.hasGab = gabBalance.gt(0);
  
              return account;
            })
          });
        });
        console.log(`Accounts: ${accounts}`);
        
        // Removed unnecessary connections to the RPC server.
        // api.subscribe('eth_blockNumber', this.onNewBlockNumber);
      })
      .catch((error) => {
        console.warn('attachInterface', error);
      });
  }

}
