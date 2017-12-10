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
import { formatCoins, formatEth } from '../../format'
import { Grid, Row, Col } from 'react-flexbox-grid'
import AppBar from 'material-ui/AppBar';


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
    allEvents: [],
    minedEvents: [],
    pendingEvents: [],
    subscriptionIDContractDrago: [],
    contract: null
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.notificationsOpen) {
      this.detachInterface()
    }
  }

  componentDidMount () {
    this.attachInterface()
  }

  componentWillUnmount () {
    this.detachInterface()
  }

  handleToggleNotifications = () =>{
    // Setting a small timeout to make sure that the state is updated with 
    // the subscription ID before trying to unsubscribe. Otherwise, if an user opens and closes the element very quickly
    // the state would not be updated fast enough and the element could crash
    // setTimeout(this.detachInterface, 3000)
    this.setState({
      // allEvents: [],
      // minedEvents: [],
      // pendingEvents: []
    });
    this.detachInterface()
    this.props.handleToggleNotifications()
  }

  renderNotification = (events) =>{
    const {api} = this.context
    const eventType = 'transaction'
    var primaryText = null
    var secondaryText = null
    var drgvalue = null
    var symbol = null
    if (events !==null) {
      return events.map( (event, index) => {
        switch(event.type) {
          case "BuyDrago":
            drgvalue = formatEth(event.params.amount,null,api)
            symbol = event.symbol
            primaryText = "Buy " + drgvalue
            secondaryText = event.state.charAt(0).toUpperCase() + event.state.slice(1)
            break;
          case "SellDrago":
            drgvalue = formatCoins(event.params.amount,null,api)
            symbol = event.symbol
            primaryText = "Sell " + drgvalue
            secondaryText = event.state.charAt(0).toUpperCase() + event.state.slice(1)
            break;
            case "DragoCreated":
            symbol = event.params.symbol
            primaryText = "Deploy " + symbol
            secondaryText = event.state.charAt(0).toUpperCase() + event.state.slice(1)
            break;
        } 
        return (
          <ElementNotification key={index}
            primaryText={primaryText}
            secondaryText={secondaryText}
            eventType={eventType}
            > 
            </ElementNotification>)
      })
    } else {
      return (
        <List className={styles.blur}>
        <ListItem className={styles.blur}
          disabled={true}
          primaryText='Transaction'
          secondaryText='Mined'
          leftAvatar={<Avatar src="img/ETH.svg" />}
        >
        </ListItem>
      </List>
      )
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
          <AppBar
            title={<span>Network</span>}
            showMenuIconButton={false}
          />
            <Row>
              <Col xs>
              {this.renderNotification(this.state.allEvents)}
              </Col>
          </Row>
        </Drawer>
      </span>
    )
  }

  attachInterface = () => {
    const { api } = this.context;
    var sourceLogClass = this.constructor.name
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
    // const { contract } = this.context;
    const { api } = this.context;
    console.log(contract);

    const sortEvents = (a, b) => b.blockNumber.cmp(a.blockNumber) || b.logIndex.cmp(a.logIndex)
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
      limit: 5
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
      var sourceLogClass = this.constructor.name
      console.log(`${sourceLogClass}: Subscribed to contract ${contract._address} -> Subscription ID: ${subscriptionID}`);
      this.setState({subscriptionIDContractDrago: subscriptionID});
    });
  }

  detachInterface = () => {
    const { contract } = this.state;
    const { api } = this.context;
    const { subscriptionIDContractDrago } = this.state;
    var sourceLogClass = this.constructor.name
    console.log(`${sourceLogClass} Unsubscribed from contract -> Subscription ID: ${subscriptionIDContractDrago}`);
    console.log(subscriptionIDContractDrago.length)
    if(subscriptionIDContractDrago.length > 0) {
      this.setState({subscriptionIDContractDrago: []}, () => {
        subscriptionIDContractDrago.map(subscription => {
          (typeof subscription !== 'undefined') ? contract.unsubscribe(subscription).catch((error) => {
            console.warn('Unsubscribe error', error);
          }) : null
        })
      })
    }
  }  
}