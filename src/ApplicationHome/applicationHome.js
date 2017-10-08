// Copyright 2016-2017 Gabriele Rigo

import styles from './applicationHome.css';
import bgimage from '../assets/images/blockchainLight.jpg';

import React, { Component, PropTypes } from 'react';
import Slider from 'material-ui/Slider';
import Drawer from 'material-ui/Drawer';
import AppBar from 'material-ui/AppBar';
import RaisedButton from 'material-ui/RaisedButton';

import ApplicationDragoFactory from '../ApplicationDragoFactory';
import ApplicationGabcoinFactory from '../ApplicationGabcoinFactory';

import getMuiTheme from 'material-ui/styles/getMuiTheme';
import lightBaseTheme from 'material-ui/styles/baseThemes/lightBaseTheme';

const muiTheme = getMuiTheme(lightBaseTheme);

const bgstyle = {
  backgroundImage: `url(${bgimage})`
};

//backgroundColor: `#E8EAF6`

export default class ApplicationHome extends Component {

  state = {
        open: false,
  }

// style={ bgstyle }

  static childContextTypes = {
    muiTheme: PropTypes.object
  };

  render() {
    return (
      <div className={ styles.body } style={ bgstyle }>
        <h1 className={styles.headline}>RigoBlock: Decentralized Pools of Digital Tokens </h1>
        <div className={styles.content}>
          <h2>create your own decentralized pool of tokens</h2>
          <p>
            ever dreamed of running your own hedge fund?
          </p>
          <p>
            RigoBlock is serverless and built on top of our in-house smart contracts protocol
          </p>
          <p>
            RigoBlock Vault: Pools of Ether and Proof-of-Stake mining
          </p>
          <p>
            RigoBlock Drago: Pools of Ether and trading on decentalized exchanges
          </p>
          <p>
            RigoBlock Exchange: trade derivatives contracts with leverage
          </p>
          <p>
            <div>RigoBlock offers a diverse set of tools and the Proof-of-Performance algorithm</div>
            <div>
              download our whitepaper at<a href='https://rigoblock.com'> www.rigoblock.com </a>
            </div>
            <div> Give us a shout!
              <a href="mailto:admin@rigoblock.com?Subject=RigoBlock%20contact" target="_top">admin@rigoblock.com</a>
            </div>
          </p>
        </div>
        <div>
          <RaisedButton
            label='create your own pool'
            onTouchTap={this.handleToggle} />
          <Drawer
            width={200}
            openSecondary={true}
            open={this.state.open}>
            <AppBar title="pool types"
              onTouchTap={this.handleToggle} />
            <div className={styles.space}>
              <ApplicationGabcoinFactory />
            </div>
            <div className={styles.space}>
              <ApplicationDragoFactory />
            </div>
          </Drawer>
        </div>
      </div>
    );
  }

  handleToggle = () => {
    this.setState({
      open: !this.state.open,
    });
  }

  getChildContext () {
    return {
      muiTheme
    };
  }
}

//<Slider name='slider0' defaultValue={0.5} />
