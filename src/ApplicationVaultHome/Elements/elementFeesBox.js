import  * as Colors from 'material-ui/styles/colors'
import { Grid, Row, Col } from 'react-flexbox-grid';
import AppBar from 'material-ui/AppBar';
import FlatButton from 'material-ui/FlatButton'
import Paper from 'material-ui/Paper'
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import ElementVaultActionDeposit from '../Elements/elementVaultActionDeposit'

// import ElementFundActions from '../Elements/elementFundActions'

import styles from './elementFeesBox.module.css';

export default class ElementFeesBox extends Component {

  static propTypes = {
    vaultDetails: PropTypes.object.isRequired,
    accounts: PropTypes.array,
    handleBuySellButtons: PropTypes.func,
    isManager: PropTypes.bool
  };

  buttonBuyClick = () =>{
    this.props.handleBuySellButtons('buy')
  }
  
  buttonSellClick = () =>{
    this.props.handleBuySellButtons('sell')
  }
  
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
      },
      marketPrice: {
        // backgroundColor: Colors.blue500,
        fontWeight: 500
      },
    }

    const priceBoxHeaderTitleStyle = {
      padding: 0,
      textAlign: 'center',
      fontSize: 25,
      fontWeight: 500,
    }

    const {vaultDetails, accounts, isManager} = this.props

    console.log(isManager)
    if(!isManager) {
      return (
        <div>
          <Row>
            <Col xs={12} className={styles.boxHeader}>
              <AppBar
                title="Fees"
                showMenuIconButton={false}
                style={priceBoxHeader.marketPrice}
                titleStyle={priceBoxHeaderTitleStyle}
              />
            </Col>
          </Row>
          <Row middle="xs">
            <Col xs={12}>
              <div className={styles.price}>{vaultDetails.price} %</div>
            </Col>
          </Row>
          <Row middle="xs">
            <Col xs={6}>
              <div className={styles.actionButton}><FlatButton primary={true} label="Withdraw"
                labelStyle={{ fontWeight: 700, fontSize: '18px' }}
                onClick={this.buttonSellClick}
              /></div>

            </Col>
            <Col xs={6}>
              <div className={styles.actionButton}><FlatButton primary={true} label="Deposit"
                labelStyle={{ fontWeight: 700, fontSize: '18px' }}
                onClick={this.buttonBuyClick}
              /></div>
              {/* <ElementVaultActionDeposit accounts={accounts} 
                vaultDetails={vaultDetails} 
                open={this.state.openDepositDialog}
                snackBar={this.props.snackBar}/> */}
            </Col>
          </Row>
        </div>
      );
    }

    // if(isManager) {
    //   return (
    //     <div>
    //       <Row>
    //         <Col xs={12} className={styles.boxHeader}>
    //           <AppBar
    //             title="Market"
    //             showMenuIconButton={false}
    //             style={priceBoxHeader.marketPrice}
    //             titleStyle={priceBoxHeaderTitleStyle}
    //           />
    //         </Col>
    //       </Row>
    //       <Row middle="xs">
    //         <Col xs={4}>
    //           <div className={styles.buyHeader}>
    //             Ask
    //           </div>
    //         </Col>
    //         <Col xs={7}>
    //           <div className={styles.price}>{vaultDetails.buyPrice} ETH</div>
    //         </Col>
    //       </Row>
    //       <Row middle="xs">
    //         <Col xs={4}>
    //           <div className={styles.sellHeader}>
    //             Bid
    //           </div>
    //         </Col>
    //         <Col xs={7}>
    //           <div className={styles.price}>{vaultDetails.sellPrice} ETH</div>
    //         </Col>
    //       </Row>
    //     </div>
    //   );
    // }


  }
}
