// Copyright 2016-2017 Gabriele Rigo

import { api } from '../parity';
import * as abis from '../contracts';

import styles from './applicationGabcoin.css';
import bgimage from '../assets/images/blockchainLight.jpg';

import Accounts from '../Accounts';
import { ActionsGabcoin, ActionBuyGabcoin, ActionSellGabcoin/*, ActionTransfer, ActionDeploy */} from '../ActionsGabcoin';
//import EventsGabcoin from '../EventsGabcoin';
import Loading from '../Loading';
import Status from '../Status';

import BigNumber from 'bignumber.js';
import React, { Component, PropTypes } from 'react';

import getMuiTheme from 'material-ui/styles/getMuiTheme';
import lightBaseTheme from 'material-ui/styles/baseThemes/lightBaseTheme';

const muiTheme = getMuiTheme(lightBaseTheme);

const bgstyle = {
  backgroundImage: `url(${bgimage})`
};

const DIVISOR = 10 ** 6;  //amended from 10^6

export default class ApplicationGabcoin extends Component {
  static childContextTypes = {
    api: PropTypes.object,
    //contract: PropTypes.object, //these have been blocked to allow for dynamic content serve
    //instance: PropTypes.object,
    muiTheme: PropTypes.object
  };

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
    //nextGabcoinID: null, //added
    //fee: null, //added
    //remaining: null,
    //totalSupply: null
  }

  componentDidMount () {
    this.attachInterface();
  }

  render () {
    const { accounts, accountsInfo, address, blockNumber, gabBalance, loading, gabcoineventful } = this.state;

    if (loading) {
      return (
        <Loading />
      );
    }

    return (
      <div className={ styles.body } style={ bgstyle }>
        { this.renderModals() }
        <Status
          address={ address }
          blockNumber={ blockNumber }
          gabBalance={ gabBalance }
          //price={ price }
          //remaining={ remaining }
          //nextGabcoinID={ nextGabcoinID }
          //fee={ fee }
          >
          <Accounts
            accounts={ accounts } />
        </Status>
        <ActionsGabcoin
          gabBalance={ gabBalance }
          onAction={ this.onAction } />
      </div>
    );
  }

  /*
  <EventsGabcoin
    accountsInfo={ accountsInfo } />
*/

  renderModals () {
    const { action, accounts, /*price,*/ gabcoinName, gabcoinSymbol } = this.state;

    switch (action) {
      case 'BuyGabcoin':
        return (
          <ActionBuyGabcoin
            accounts={ accounts }
            //price={ price }
            onClose={ this.onActionClose } />
        );
      case 'SellGabcoin':
        return (
          <ActionSellGabcoin
            accounts={ accounts }
            //price={ price }
            onClose={ this.onActionClose } />
        );
      /*
      case 'Transfer':
        return (
          <ActionTransfer
            accounts={ accounts }
            onClose={ this.onActionClose } />
        );
      case 'Deploy':
        return (
          <ActionDeploy
            accounts={ accounts }
            onClose={ this.onActionClose } />
        );*/
      default:
        return null;
    }
  }

  getChildContext () {
    //const { contract, instance } = this.state;

    return {
      api,
      //contract, //in gabcoin app, gabcoin instance is not passed by parent, users interact with different gabcoins
      //instance,
      muiTheme
    };
  }

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
    const {/* instance,*/ accounts } = this.state;

    if (_error) {
      console.error('onNewBlockNumber', _error);
      return;
    }

    Promise
      .all([
        //instance.fee.call(),
        //instance.nextGabcoinID.call(),
        //instance.price.call()
      ])
      .then(([gabcoineventful]) => {
        this.setState({
          blockNumber//,
          //fee,
          //nextGabcoinID,
          //price
        });

        //const gabQueries = accounts.map((account) => instance.balanceOf.call({}, [account.address])); //calling instead of balanceOf()
        const ethQueries = accounts.map((account) => api.eth.getBalance(account.address));

        return Promise.all([
          //Promise.all(gabQueries),
          Promise.all(ethQueries)
        ]);
      })
      .then(([/*gabBalances, */ethBalances]) => {
        this.setState({
          ethBalance: ethBalances.reduce((total, balance) => total.add(balance), new BigNumber(0)),
          //gabBalance: gabBalances.reduce((total, balance) => total.add(balance), new BigNumber(0)),
          accounts: accounts.map((account, index) => {
            const ethBalance = ethBalances[index];
            //const gabBalance = gabBalances[index];

            account.ethBalance = api.util.fromWei(ethBalance).toFormat(3);
            //account.gabBalance = gabBalance.div(DIVISOR).toFormat(6);
            //account.hasGab = gabBalance.gt(0);

            return account;
          })
        });
      })
      .catch((error) => {
        console.warn('onNewBlockNumber', error);
      });
  }

  getAccounts () {
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

  attachInterface = () => {
    api.parity
      .registryAddress()
      .then((registryAddress) => {
        console.log(`the registry was found at ${registryAddress}`);

        //const registry = api.newContract(abis.registry, registryAddress).instance;

        return Promise
          .all([
            //registry.getAddress.call({}, [api.util.sha3('gabcoin'), 'A']),
            this.getAccounts()
          ]);
      })
      .then(([/*address, */accountsInfo]) => {
        //console.log(`your target gabcoin was found at ${address}`);

        //const contract = api.newContract(abis.gabcoin, address);

        this.setState({
          loading: false,
          //address,
          //contract,
          accountsInfo,
          //instance: contract.instance,
          accounts: Object
            .keys(accountsInfo)
            .map((address) => {
              const info = accountsInfo[address] || {};

              return {
                address,
                name: info.name
              };
            })
        });

        api.subscribe('eth_blockNumber', this.onNewBlockNumber);
      })
      .catch((error) => {
        console.warn('attachInterface', error);
      });
  }
}
