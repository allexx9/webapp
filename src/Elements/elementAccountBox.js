import { Grid, Row, Col } from 'react-flexbox-grid'
import {Card, CardHeader, CardText} from 'material-ui/Card'
import Avatar from 'material-ui/Avatar'
import Chip from 'material-ui/Chip'
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import ReactDOM from 'react-dom'
import {CopyToClipboard} from 'react-copy-to-clipboard'
import CopyContent from 'material-ui/svg-icons/content/content-copy'
import { Link } from 'react-router-dom'
import Search from 'material-ui/svg-icons/action/search'
import Paper from 'material-ui/Paper'

import IdentityIcon from '../IdentityIcon';

import styles from './elementAccountBox.module.css'

const style = {
  chip: {
    margin: 4,
  },
  wrapper: {
    display: 'flex',
    flexWrap: 'wrap',
  },
};

class ElementAccountBox extends Component {

  static contextTypes = {
    ethereumNetworkName: PropTypes.string.isRequired,
  };

  static propTypes = {
    account: PropTypes.object.isRequired,
    snackBar: PropTypes.func
  };

  renderCopyButton = (accountAddress) =>{
    if (!accountAddress ) {
      return null;
    }
    
    return (
      <CopyToClipboard text={accountAddress}
          onCopy={() => this.props.snackBar('Copied to clilpboard')}>
          <Link to={'#'} ><CopyContent className={styles.copyAddress}/></Link>
      </CopyToClipboard>
    );
  }

  renderEtherscanButton = (type, text) =>{
    if (!text ) {
      return null;
    }
    const { ethereumNetworkName } = this.context
    
    return (
    <a href={'https://'+ethereumNetworkName+'.etherscan.io/'+type+'/' + text} target='_blank'><Search className={styles.copyAddress}/></a>
    );
  }

  renderTitle = () =>{
    const {account} = this.props;
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

  renderSubTitle = () =>{
    const {account} = this.props;
    return (
      <Row>
        <Col xs={12} className={styles.subTitle}>
        {account.address}
        </Col>
      </Row>
    )
  }

  render() {
    const {account} = this.props;
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
              <Col xs={2} >
                <div style={style.wrapper}>
                  <Chip className={styles.accountChip}>
                    <Avatar size={32}>W</Avatar>
                    {account.source.charAt(0).toUpperCase() + account.source.slice(1)}
                  </Chip>
                </div>
              </Col>
              <Col xs={12} md={10} className={styles.accountAmount}>
                ETH {account.ethBalance}
              </Col>
            </Row>
          </Col>
        </Row>
      </Paper>
    )
    
  }
}

export default ElementAccountBox