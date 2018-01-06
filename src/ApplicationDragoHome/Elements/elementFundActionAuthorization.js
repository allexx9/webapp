// Copyright 2016-2017 Gabriele Rigo

import { Dialog, FlatButton, TextField } from 'material-ui';
import { Grid, Row, Col } from 'react-flexbox-grid';
import BigNumber from 'bignumber.js';
import DropDownMenu from 'material-ui/DropDownMenu';
import MenuItem from 'material-ui/MenuItem';
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import IdentityIcon from '../../IdentityIcon';
import  * as Colors from 'material-ui/styles/colors';

import AccountSelector from '../Elements/elementAccountSelector';
import ElementDialogHeadTitle from '../../Elements/elementDialogHeadTitle'
import ElementDialogAddressTitle from '../../Elements/elementDialogAddressTitle'
import InfoTable from '../Elements/elementInfoTable'

import styles from './elementFundActionAuthorization.module.css';


export default class ElementFundActionAuthorization extends Component {

  static contextTypes = {
    api: PropTypes.object.isRequired,
  };

  static propTypes = {
    account: PropTypes.object.isRequired,
  }

  state = {
    open: true,
  }

  buttonsStyle = {
    marginTop: 12,
    marginBottom: 12,
    color: 'white',
  }


  handleClose = () => {
    this.setState({
      open: false,
    });
  }

  renderHeader = () => {
  }

  renderHeader = () => {
    const { dragoDetails } = this.props
    return (
      <div>
          <ElementDialogHeadTitle primaryText='Authorize action' />
          <ElementDialogAddressTitle tokenDetails={dragoDetails} />
      </div>

    )
  }

  render () {
    const { authMsg, account } = this.props
    const titleStyle = {
      padding: 0,
      lineHeight: '20px',
      fontSize: 16
    }
    const actions = [
      <FlatButton
        label="Close"
        primary={true}
        onClick={this.handleClose}
      />,
    ];
    return (
      <Dialog
        title={this.renderHeader()}
        titleStyle={titleStyle}
        modal
        open={this.state.open}
        actions={actions}>

        <Row className={styles.container}>
          <Col xs={12}>
          { authMsg }
        </Col>          
        <Col xs={12}>
          Please check your { account.source.charAt(0).toUpperCase() + account.source.slice(1) } wallet and authorize this transaction.
        </Col>
        </Row>
      </Dialog>

    )
  }

}