// Copyright 2016-2017 Gabriele Rigo

import React, { Component } from 'react';
import * as abis from '../contracts';


import Accounts from '../Accounts';
import ApplicationDragoTrader from './ApplicationDragoTrader';
import Loading from '../Loading';
import Status from '../Status';

import styles from './applicationDragoHome.module.css';
import BigNumber from 'bignumber.js';

import { Grid, Row, Col } from 'react-flexbox-grid';
import LeftSideDrawer from '../elements/leftSideDrawer';
import PropTypes from 'prop-types';

const DIVISOR = 10 ** 6;  //tokens are divisible by one million

export default class ApplicationDragoHome extends Component {

  // Checking the type of the context variable that we receive by the parent
  static contextTypes = {
    api: PropTypes.object.isRequired,
    muiTheme: PropTypes.object.isRequired
  };
  
  static PropTypes = {
    location: PropTypes.object.isRequired,
  };

  state = {
    accounts: [],
    accountsInfo: null,
    blockNumber: new BigNumber(-1),
    ethBalance: new BigNumber(0),
    loading: true,
    subscriptionIDDrago: null,
    subscriptionIDContractDrago: null,
    contract: null,
    instance: null,
    allEvents: [],
    minedEvents: [],
    pendingEvents: [],
  }

  componentDidMount () {
    this.attachInterface();
    // this.setupFilters();
  }

  componentWillUnmount() {
    // Unsubscribing to the event when the the user moves away from this page
    this.detachInterface();
  }

  render () {
    const { ethBalance, loading, blockNumber, accounts, allEvents, accountsInfo } = this.state;
    const {isManager, location} = this.props
    if (loading) {
      return (
        <Loading />
      );
    }

    if (isManager) {
      return (
        <Loading />
      );
    }

    if (!isManager) {
      return (

        <Row className={styles.maincontainer}>
          <Col xs={2}>
            <LeftSideDrawer location={location}/>
          </Col>
          <Col xs={10}>
            <ApplicationDragoTrader 
              blockNumber={blockNumber}
              accounts={accounts}
              ethBalance={ethBalance}
              allEvents={allEvents}
              accountsInfo={accountsInfo}
            />
          </Col>
        </Row>

      );
    }
  }

//the following function should be used in drago status application, user has to select her own drago
//think about creating component FindDragoFromNameSymbol  and then use it in the different parts of the dapp

  onNewBlockNumber = (_error, blockNumber) => {
    const { accounts } = this.state;
    const { api } = this.context;
    if (_error) {
      console.error('onNewBlockNumber', _error);
      return;
    }

    Promise
      .all([
      ])
      .then(() => {
        this.setState({
          blockNumber: blockNumber.c[0]
        });
        const ethQueries = accounts.map((account) => api.eth.getBalance(account.address));
        accounts.map((account) => {
          console.log('API call getBalance -> applicationDragoHome: Getting balance of account', account.name);
          }
        )
        return Promise.all([
          Promise.all(ethQueries)
        ]);
      })
      .then(([ethBalances]) => {
        console.log(ethBalances);
        this.setState({
          ethBalance: ethBalances.reduce((total, balance) => total.add(balance), new BigNumber(0)),
          accounts: accounts.map((account, index) => {
            const ethBalance = ethBalances[index];
            account.ethBalance = api.util.fromWei(ethBalance).toFormat(3);
            return account;
          })
        });
        console.log(this.state.ethBalance);
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

  attachInterface = () => {
    const { api } = this.context;
    api.parity
      .registryAddress()
      .then((registryAddress) => {
        console.log(`The Registry was found at ${registryAddress}`);
        const registry = api.newContract(abis.registry, registryAddress).instance;
        return Promise
          .all([
            registry.getAddress.call({}, [api.util.sha3('eventful'), 'A']),
            this.getAccounts()
          ]);
      })
      .then(([address, accountsInfo]) => {
        // console.log(accountsInfo);
        console.log(`Drago Eventful was found at ${address}`);
        const contract = api.newContract(abis.eventful, address);
        this.setState({
          accountsInfo,
          loading: false,
          contract: contract,
          instance: contract.instance,
          accounts: Object
            .keys(accountsInfo)
            .map((address) => {
              const info = accountsInfo[address] || {};

              return {
                address,
                name: info.name,
                source: "parity"
              };
            })
        });
        console.log(contract);
        // this.setupFilters();
        // console.log(this.state.accounts)
        api.subscribe('eth_blockNumber', this.onNewBlockNumber)
        .then((subscriptionID) => {
          console.log(`applicationDragoHome: Subscribed to eth_blockNumber -> Subscription ID: ${subscriptionID}`);
          this.setState({subscriptionIDDrago: subscriptionID});
        }).then(() => {
          this.setupFilters();
        })
      })
      .catch((error) => {
        console.warn('attachInterface', error);
      });
  }

  setupFilters () {
    const { contract } = this.state;
    const { api } = this.context;

    const sortEvents = (a, b) => b.blockNumber.cmp(a.blockNumber) || b.logIndex.cmp(a.logIndex);
    const logToEvent = (log) => {
      const key = api.util.sha3(JSON.stringify(log));
      const { blockNumber, logIndex, transactionHash, transactionIndex, params, type } = log;

      return {
        type: log.event,
        state: type,
        blockNumber,
        logIndex,
        transactionHash,
        transactionIndex,
        params: Object.keys(params).reduce((data, name) => {
          data[name] = params[name].value;
          return data;
        }, {}),
        key
      };
    };

    const options = {
      fromBlock: 0,
      toBlock: 'pending',
      limit: 50
    };

    contract.subscribe(null, options, (error, _logs) => {
      if (error) {
        console.error('setupFilters', error);
        return;
      }

      if (!_logs.length) {
        return;
      }

      const logs = _logs.map(logToEvent);

      const minedEvents = logs
        .filter((log) => log.state === 'mined')
        .reverse()
        .concat(this.state.minedEvents)
        .sort(sortEvents);
      const pendingEvents = logs
        .filter((log) => log.state === 'pending')
        .reverse()
        .concat(this.state.pendingEvents.filter((event) => {
          return !logs.find((log) => {
            const isMined = (log.state === 'mined') && (log.transactionHash === event.transactionHash);
            const isPending = (log.state === 'pending') && (log.key === event.key);
            return isMined || isPending;
          });
        }))
        .sort(sortEvents);
      const allEvents = pendingEvents.concat(minedEvents);
      this.setState({
        allEvents,
        minedEvents,
        pendingEvents
      });
    }).then((subscriptionID) => {
      console.log(`applicationDragoHome: Subscribed to contract ${contract._address} -> Subscription ID: ${subscriptionID}`);
      this.setState({subscriptionIDContractDrago: subscriptionID});
    });
  }

  // attachInterface = () => {
  //   const { api } = this.context;
  //   api.parity
  //     .registryAddress()
  //     .then((registryAddress) => {
  //       console.log(`The registry was found at ${registryAddress}`);
  //       // return Promise
  //       //   .all([
  //       //     this.getAccounts() //THIS FUNCTION RETURNS THE ACCOUNTS OF THE USER
  //       //   ]);
  //       var testAccount = [
  //         {
  //             address : '0x00a79Fa87cFb12A05205CaEa3870C1A9C322ae5C',
  //             name: 'DAVID2',
  //             ethBalance : '11.166'
  //         }
  //       ]
  //       console.log(testAccount);
  //       this.setState({
  //         loading: false,
  //         //address,
  //         //contract,
  //         //accountsInfo,
  //         //instance: contract.instance,
  //         accounts: testAccount
  //       });
  //     })
  //     // .then(([accountsInfo]) => {
  //     //   console.log(accountsInfo);
  //     //   this.setState({
  //     //     loading: false,
  //     //     //address,
  //     //     //contract,
  //     //     accountsInfo,
  //     //     //instance: contract.instance,
  //     //     accounts: Object
  //     //       .keys(accountsInfo)
  //     //       .map((address) => {
  //     //         const info = accountsInfo[address] || {};

  //     //         return {
  //     //           address,
  //     //           name: info.name
  //     //         };
  //     //       })
  //     //   });
  //     //   var test = [
  //     //     {
  //     //         address : '0x00a79Fa87cFb12A05205CaEa3870C1A9C322ae5C',
  //     //         name: 'DAVID2',
  //     //         ethBalance : '11.166'
              
  //     //     }
  //     //   ];
  //     //   console.log(test)
  //     //   console.log(this.state.accounts)
  //     //   api.subscribe('eth_blockNumber', this.onNewBlockNumber)
  //     //   .then((subscriptionID) => {
  //     //     console.log(`applicationDrago: Subscribed to eth_blockNumber -> Subscription ID: ${subscriptionID}`);
  //     //     this.setState({subscriptionIDDrago: subscriptionID});
  //     //   })
  //     // })
  //     .catch((error) => {
  //       console.warn('attachInterface', error);
  //     });
  // }

  detachInterface = () => {
    const { subscriptionIDDrago, contract, subscriptionIDContractDrago } = this.state;
    const { api } = this.context;
    console.log(`applicationDragoHome: Unsubscribed to eth_blockNumber -> Subscription ID: ${subscriptionIDDrago}`);
    api.unsubscribe(subscriptionIDDrago).catch((error) => {
      console.warn('Unsubscribe error', error);
    });
    console.log(`applicationDragoHome: Unsubscribed from contract ${contract._address} -> Subscription ID: ${subscriptionIDContractDrago}`);
    contract.unsubscribe(subscriptionIDContractDrago).catch((error) => {
      console.warn('Unsubscribe error', error);
    });
    console.log(this.context);
  } 
}
