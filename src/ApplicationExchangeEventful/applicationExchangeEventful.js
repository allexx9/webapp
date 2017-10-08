// Copyright 2016-2017 Gabriele Rigo

import { api } from '../parity';
import * as abis from '../contracts';

import Loading from '../Loading';
import Status from '../Status';

import Accounts from '../Accounts';
//import Actions, { ActionBuyIn, ActionRefund, ActionTransfer, ActionDeploy } from '../ActionsGabcoin';
//this is eventful contract only
import { EventsExchange, EventsOrdersPlaced, EventsOrdersCancelled, EventsMatched, EventsFinalized } from '../EventsExchange';

import styles from './application.css';
import bgimage from '../assets/images/blockchainLight.jpg';

import BigNumber from 'bignumber.js';
import React, { Component, PropTypes } from 'react';
import {GridList, GridTile} from 'material-ui/GridList';

import getMuiTheme from 'material-ui/styles/getMuiTheme';
import lightBaseTheme from 'material-ui/styles/baseThemes/lightBaseTheme';

const muiTheme = getMuiTheme(lightBaseTheme);

const bgstyle = {
  backgroundImage: `url(${bgimage})`
};

const DIVISOR = 10 ** 6;  //tokens are divisible by one million

export default class ApplicationExchangeEventful extends Component {
  static childContextTypes = {
    api: PropTypes.object,
    contract: PropTypes.object,
    instance: PropTypes.object,
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
    authority: null,
    loading: true,
    authority: null,
    version: null,
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
    const { accounts, accountsInfo, address, blockNumber, gabBalance, loading, authority, version/*price, nextGabcoinID, fee */} = this.state;

    if (loading) {
      return (
        <Loading />
      );
    }
//{ this.renderModals() } before Status
    return (
      <div className={styles.root}>
        <GridList className={styles.gridlist}>
          <EventsExchange
            accountsInfo = { accountsInfo } />
        </GridList>
        <GridList className={styles.gridlist}>
          <EventsOrdersCancelled
            accountsInfo = { accountsInfo } />
        </GridList>
        <GridList className={styles.gridlist}>
          <EventsOrdersPlaced
            accountsInfo = { accountsInfo } />
        </GridList>
        <GridList className={styles.gridlist}>
          <EventsMatched
            accountsInfo = { accountsInfo } />
        </GridList>
        <GridList className={styles.gridlist}>
          <EventsFinalized
            accountsInfo = { accountsInfo } />
        </GridList>
      </div>
    );
  }

  getChildContext () {
    const { contract, instance } = this.state;

    return {
      api,
      contract,
      instance,
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
    const { instance, accounts } = this.state;

    if (_error) {
      console.error('onNewBlockNumber', _error);
      return;
    }

    Promise
      .all([
        //instance.fee.call(),
        //instance.nextGabcoinID.call(),
        instance.version.call(),
        //instance.authority.call()
      ])
      .then(([version, authority/*fee, nextGabcoinID, price*/]) => {
        this.setState({
          blockNumber,
          version,
          authority
          //fee,
          //nextGabcoinID/*,
          //price*/
        });

        //const gabQueries = accounts.map((account) => instance.gabcoinOf.call({}, [account.address])); //calling instead of balanceOf()
        const gabQueries = accounts.map((account) => api.eth.getBalance(account.address));
        const ethQueries = accounts.map((account) => api.eth.getBalance(account.address));

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

        const registry = api.newContract(abis.registry, registryAddress).instance;

        return Promise
          .all([
            registry.getAddress.call({}, [api.util.sha3('exchangeeventful'), 'A']),
            this.getAccounts()
          ]);
      })
      .then(([address, accountsInfo]) => {
        console.log(`exchange eventful was found at ${address}`);

        const contract = api.newContract(abis.exchangeeventful, address);

        this.setState({
          loading: false,
          address,
          contract,
          accountsInfo,
          instance: contract.instance,
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
