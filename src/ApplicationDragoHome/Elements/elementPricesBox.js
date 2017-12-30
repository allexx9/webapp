import  * as Colors from 'material-ui/styles/colors'
import AppBar from 'material-ui/AppBar';
import Paper from 'material-ui/Paper'
import PropTypes from 'prop-types';
import React, { Component } from 'react';

import styles from './elementPricesBox.module.css';

export default class ElementPriceBox extends Component {

  static propTypes = {
    dragoDetails: PropTypes.object.isRequired
  };


  
  render () {
    const buyText = {
      color: Colors.green300,
    }

    const sellText = {
      color: Colors.red300,
    }

    const priceBox = {
      padding: 0,
      textAlign: 'center',
      fontSize: 25,
    }

    const priceBoxHeader = {
      buy: {
        backgroundColor: Colors.green300
      },
      sell: {
        backgroundColor: Colors.red300
      }
    }

    const priceBoxHeaderTitleStyle = {
      padding: 0,
      textAlign: 'center',
      fontSize: 25,
      fontWeight: 600,
    }

    const {dragoDetails} = this.props
    return (
      <span>
          <Paper style={priceBox} zDepth={1}>
            <AppBar
                title="BUY"
                showMenuIconButton={false}
                style={priceBoxHeader.buy}
                titleStyle={priceBoxHeaderTitleStyle}
              />
              <div className={styles.price}>{dragoDetails.buyPrice} ETH</div>
            </Paper>
            <Paper style={priceBox} zDepth={1}>
            <AppBar
                title="SELL"
                showMenuIconButton={false}
                style={priceBoxHeader.sell}
                titleStyle={priceBoxHeaderTitleStyle}
              />
              <div className={styles.price}>{dragoDetails.sellPrice} ETH</div>
            </Paper>
        </span>
    );
  }
}
