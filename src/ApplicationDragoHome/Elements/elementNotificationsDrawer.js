import {List, ListItem} from 'material-ui/List';
import Avatar from 'material-ui/Avatar';
import Drawer from 'material-ui/Drawer'
import IconButton from 'material-ui/IconButton'
import NotificationWifi from 'material-ui/svg-icons/notification/wifi';
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import Subheader from 'material-ui/Subheader';
import Immutable from 'immutable'
import ElementNotification from './elementNotification'

import * as abis from '../../contracts';

import styles from './elementNotification.module.css';

var menuStyles = {
  profileIcon: {
      color: "#ffffff"
  },
};

export default class ElementNotificationsDrawer extends Component {

  static propTypes = {
    events: PropTypes.array.isRequired,
    handleToggleNotifications: PropTypes.func.isRequired,
    notificationsOpen: PropTypes.bool.isRequired,
  };

  static contextTypes = {
    api: PropTypes.object.isRequired,
    isConnected: PropTypes.func.isRequired
  };

  state = {
    notificationsOpen: false,
    allEvents: null,
    minedEvents: null,
    pendingEvents: null,
    subscriptionIDContractDrago: [],
    contract: null
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.notificationsOpen) {
      this.attachInterface()
    }
  }

  componentWillUnmount () {
    this.detachInterface()
  }

  handleToggleNotifications = () =>{
    // Setting a small timeout to make sure that the state is updated with 
    // the subscription ID before trying to unsubscribe. Otherwise, if an user opens and closes the element very quickly
    // the state would not be updated fast enough and the element could crash
    setTimeout(this.detachInterface, 3000)
    this.props.handleToggleNotifications()
  }

  renderNotification = (events) =>{
    const eventType = 'transaction'
    console.log(events)
    if (events !==null) {
      return events.map( event => {
        console.log(event)
        // switch(event.type ==="BuyDrao") {
        //   case n:
        //       const primaryText = "Buy"
        //       break;
        //   case n:
        //       code block
        //       break;
        //   default:
        //       code block
        // } 
        return (
          <ElementNotification 
            primaryText={event.type}
            secondaryText={event.state}
            eventType={eventType}
            />)
      })
    }

  }

  render () {
    const { notificationsOpen } = this.props
    const { allEvents } = this.state
    return (
      <span>
        <Drawer width={300} openSecondary={true} 
          open={notificationsOpen} zDepth={1} docked={false}
          className={styles.notifications}
          onRequestChange={this.handleToggleNotifications}
          >
          {this.renderNotification(this.state.allEvents)}
          
        </Drawer>
      </span>
    )
  }

  attachInterface = () => {
    const { api } = this.context;
    var sourceLogClass = this.constructor.name
    console.log(api)
    api.parity
      .registryAddress()
      .then((registryAddress) => {
        console.log(`${sourceLogClass} -> The Registry was found at ${registryAddress}`);
        const registry = api.newContract(abis.registry, registryAddress).instance;
        return Promise
          .all([
            registry.getAddress.call({}, [api.util.sha3('eventful'), 'A']),
          ]);
      })
      .then(([address]) => {
        console.log(`${sourceLogClass} -> Drago Eventful was found at ${address}`);
        const contract = api.newContract(abis.eventful, address)
        this.setupFilters (contract)
        // const allAccounts = {...accountsInfo, ...accountsMetaMask}
        // this.setState({
        //   accountsInfo,
        //   loading: false,
        //   contract: contract,
        //   instance: contract.instance,
        //   accounts: Object
        //     .keys(allAccounts)
        //     .map((address) => {
        //       const info = allAccounts[address] || {};
        //       return {
        //         address,
        //         name: info.name,
        //         source: info.source,
        //         ethBalance: "0"
        //       };
        //     })
        // });
        return contract
      })
      .catch((error) => {
        console.warn('attachInterface', error)
      });
  }

  setupFilters (contract) {
    const { api } = this.context;
    // const sortEvents = (a, b) => b.blockNumber.cmp(a.blockNumber) || b.logIndex.cmp(a.logIndex);
    // const sortEvents = (a, b) => {
    //   console.log(a)
    //   // console.log(b.blockNumber)
    // }
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
      limit: 10
    };

    console.log(contract)
    contract.subscribe(null, options, (error, _logs) => {
      if (error) {
        console.error('setupFilters', error);
        return;
      }

      if (!_logs.length) {
        return;
      }

      const logs = _logs.map(logToEvent);
      // console.log(_logs)
      // console.log(logs)

      // const minedEvents = logs
      //   .filter((log) => log.state === 'mined')
      //   .reverse()
      //   .concat(this.state.minedEvents)
      //   // .sort(sortEvents);
      // const pendingEvents = logs
      //   .filter((log) => log.state === 'pending')
      //   .reverse()
      //   .concat(this.state.pendingEvents.filter((event) => {
      //     return !logs.find((log) => {
      //       const isMined = (log.state === 'mined') && (log.transactionHash === event.transactionHash);
      //       const isPending = (log.state === 'pending') && (log.key === event.key);
      //       return isMined || isPending;
      //     });
      //   }))
      //   // .sort(sortEvents);
      // const allEvents = pendingEvents.concat(minedEvents);
      
      const allEvents = Immutable.List(logs)
      console.log(allEvents)
      this.setState({
        allEvents: logs,
        contract: contract
        // minedEvents,
        // pendingEvents
      });
    }).then((subscriptionID) => {
      // Pushing the contract subscription ID into an array to make sure that
      // all subscriptions are terminated when the elementis is closed, see 
      // detachInterface function
      var sourceLogClass = this.constructor.name
      var { subscriptionIDContractDrago } = this.state
      subscriptionIDContractDrago.push(subscriptionID)
      console.log(`${sourceLogClass} Subscribed to contract ${contract._address} -> Subscription ID: ${subscriptionID}`);
      this.setState({subscriptionIDContractDrago: subscriptionIDContractDrago});
    });
  }

  detachInterface = () => {
    const { contract } = this.state;
    const { api } = this.context;
    const { subscriptionIDContractDrago } = this.state;
    var sourceLogClass = this.constructor.name
    console.log(`${sourceLogClass} Unsubscribed from contract -> Subscription ID: ${subscriptionIDContractDrago}`);
    subscriptionIDContractDrago.map(subscription => {
      (typeof subscription !== 'undefined') ? contract.unsubscribe(subscription).catch((error) => {
        console.warn('Unsubscribe error', error);
      }) : null
    })
    this.setState({subscriptionIDContractDrago: []})
  }  
}