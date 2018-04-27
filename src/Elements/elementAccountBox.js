import { Row, Col } from 'react-flexbox-grid'
// import  * as Colors from 'material-ui/styles/colors'
import Avatar from 'material-ui/Avatar'
// import FlatButton from 'material-ui/FlatButton'
import RaisedButton from 'material-ui/RaisedButton'
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { CopyToClipboard } from 'react-copy-to-clipboard'
import CopyContent from 'material-ui/svg-icons/content/content-copy'
import { Link } from 'react-router-dom'
import Search from 'material-ui/svg-icons/action/search'
import Paper from 'material-ui/Paper'
import ChipTokenGGG from '../_atomic/molecules/chipTokenGGG.js'
import ChipTokenETH from '../_atomic/molecules/chipTokenETH.js'
import ElementAccountActionTransfer from './elementAccountActionTransfer'

import IdentityIcon from '../_atomic/atoms/identityIcon';

import styles from './elementAccountBox.module.css'


class ElementAccountBox extends Component {
  
  static propTypes = {
    account: PropTypes.object.isRequired,
    etherscanUrl: PropTypes.string.isRequired,
    snackBar: PropTypes.func
  };

  state = {
    transferOpen: false,
  }

  renderCopyButton = (accountAddress) => {
    if (!accountAddress) {
      return null;
    }

    return (
      <CopyToClipboard text={accountAddress}
        onCopy={() => this.props.snackBar('Copied to clilpboard')}>
        <Link to={'#'} ><CopyContent className={styles.copyAddress} /></Link>
      </CopyToClipboard>
    );
  }

  renderEtherscanButton = (type, text) => {
    if (!text) {
      return null;
    }
    return (
      <a href={this.props.etherscanUrl + type + '/' + text} target='_blank'><Search className={styles.copyAddress} /></a>
    );
  }

  renderTitle = () => {
    const { account } = this.props;
    return (
      <Row>
        <Col xs={8} className={styles.title}>
          {account.name}
        </Col>
        <Col xs={4} className={styles.actionButtons}>
          {this.renderCopyButton(account.address)} {this.renderEtherscanButton('address', account.address)}
        </Col>
      </Row>
    )
  }

  renderSubTitle = () => {
    const { account } = this.props;
    return (
      <Row>
        <Col xs={12} className={styles.subTitle}>
          {account.address}
        </Col>
      </Row>
    )
  }

  onTransferOpen =() =>{
    this.setState({
      transferOpen: !this.state.transferOpen
    });
  }

  render() {
    const { account } = this.props;
    return (
      <Paper className={styles.paperContainer} zDepth={1}>
        <Row>
          <Col xs={12}>
            <Row className={styles.accountTitleContainer}>
              <Col xs={2} >
                <div>
                  <IdentityIcon address={account.address} />
                </div>
              </Col>
              <Col xs={12} md={10}>
                <Row>
                  <Col xs={12}>
                    {this.renderTitle()}
                  </Col>
                  <Col xs={12}>
                    {this.renderSubTitle()}
                  </Col>
                </Row>
              </Col>
            </Row>
            <Row className={styles.accountBodyContainer}>
              <Col xs={12} md={10}>
                <Row end="xs">
                  <Col xs={12}>
                    <div className={styles.accountChipTokenETH}>
                      <ChipTokenETH account={account} />
                    </div>
                    <div className={styles.accountChipTokenGGG}>
                      <ChipTokenGGG account={account} />
                    </div>
                  </Col>
                </Row>

              </Col>
              <Col xs={2} >
                {account.source == 'MetaMask'
                  ?
                  <Avatar src="img/metamask.png" size={32} backgroundColor="#FFFFFF" alt="MetaMask" />
                  :
                  <Avatar src="img/parity.png" size={32} backgroundColor="#FFFFFF" />
                }
              </Col>
            </Row>
            <Row className={styles.accountBodyContainer}>
              <Col xs={12}>
                <RaisedButton
                  label="TRANSFER"
                  // labelColor={Colors.indigo500}
                  labelStyle={{ fontWeight: 600 }}
                  onClick={this.onTransferOpen}
                />
                <ElementAccountActionTransfer
                  open={this.state.transferOpen}
                  onTransferOpen={this.onTransferOpen}
                  account={account}
                  snackBar={this.props.snackBar} />
              </Col>
            </Row>
          </Col>
        </Row>
      </Paper>
    )

  }
}

export default ElementAccountBox