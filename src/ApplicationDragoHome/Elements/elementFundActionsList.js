// Copyright 2016-2017 Rigo Investment Sagl.
import ButtonManage from '../../_atomic/atoms/buttonManage'
import ElementFundActionSetPrice from '../Elements/elementFundActionSetPrice'
import ElementFundActionWrapETH from '../Elements/elementFundActionWrapETH'
import ElementFundActionSelfCustody from '../Elements/elementFundActionSelfCustody'
import Menu from 'material-ui/Menu'
import MenuItem from 'material-ui/MenuItem'
import Popover, { PopoverAnimationVertical } from 'material-ui/Popover'
import PropTypes from 'prop-types'
import React, { Component } from 'react'
import Subheader from 'material-ui/Subheader'

export default class ElementFundActionsList extends Component {
  static propTypes = {
    accounts: PropTypes.array.isRequired,
    dragoDetails: PropTypes.object.isRequired
  }

  state = {
    openMenuActions: false,
    showActionMenuItem: {
      wrapETH: false,
      deposit: false,
      withdraw: false,
      placeOrder: false,
      cancelOrder: false,
      finalizeOrder: false,
      setPrice: false,
      selfCustody:false
    }
  }

  handleOpenMenuActions = event => {
    this.setState({
      openMenuActions: true,
      anchorEl: event.currentTarget
    })
  }

  handleRequestClose = () => {
    this.setState({
      openMenuActions: !this.state.openMenuActions
    })
  }

  openActionForm = (event, value) => {
    this.setState({
      openMenuActions: false
    })

    switch (value) {
      case 'wrapETH':
        this.setState({
          showActionMenuItem: {
            wrapETH: !this.state.showActionMenuItem.wrapETH
          }
        })
        break
      case 'withdraw':
        this.setState({
          showActionMenuItem: {
            withdraw: !this.state.showActionMenuItem.withdraw
          }
        })
        break
      case 'placeOrder':
        this.setState({
          showActionMenuItem: {
            placeOrder: !this.state.showActionMenuItem.placeOrder
          }
        })
        break
      case 'cancelOrder':
        this.setState({
          showActionMenuItem: {
            cancelOrder: !this.state.showActionMenuItem.cancelOrder
          }
        })
        break
      case 'finalizeOrder':
        this.setState({
          showActionMenuItem: {
            finalizeOrder: !this.state.showActionMenuItem.finalizeOrder
          }
        })
        break
      case 'setPrice':
        this.setState({
          showActionMenuItem: {
            setPrice: !this.state.showActionMenuItem.setPrice
          }
        })
        break
      case 'selfCustody':
        this.setState({
          showActionMenuItem: {
            selfCustody: !this.state.showActionMenuItem.selfCustody
          }
        })
        break
      default:
        return null
    }
    return null
  }

  render() {
    const { dragoDetails } = this.props
    // Selectiong only the account which is the owner of the Drago
    const accounts = this.props.accounts.filter(account => {
      return account.address === dragoDetails.addressOwner
    })
    return (
      <div>
        <ButtonManage handleOpenMenuActions={this.handleOpenMenuActions} />
        <Popover
          open={this.state.openMenuActions}
          anchorEl={this.state.anchorEl}
          anchorOrigin={{ horizontal: 'left', vertical: 'bottom' }}
          targetOrigin={{ horizontal: 'left', vertical: 'top' }}
          onRequestClose={this.handleRequestClose}
          animation={PopoverAnimationVertical}
        >
          <Menu desktop={true} onChange={this.openActionForm}>
            <Subheader inset={false}>Drago</Subheader>
            <MenuItem value="setPrice" primaryText="Set Prices" />
            <MenuItem value="selfCustody" primaryText="Self Custody" />
            {/*}
            <Subheader inset={false}>WETH</Subheader>
            <MenuItem value="wrapETH" primaryText="Wrap Unwrap" />
            {*/}
          </Menu>
        </Popover>
        {/*}
        {this.state.showActionMenuItem.wrapETH ? (
          <ElementFundActionWrapETH
            accounts={accounts}
            dragoDetails={dragoDetails}
            openActionForm={this.openActionForm}
          />
        ) : null}
        {*/}
        {this.state.showActionMenuItem.setPrice ? (
          <ElementFundActionSetPrice
            accounts={accounts}
            dragoDetails={dragoDetails}
            openActionForm={this.openActionForm}
          />
        ) : null}
        {this.state.showActionMenuItem.selfCustody ? (
          <ElementFundActionSelfCustody
            accounts={accounts}
            dragoDetails={dragoDetails}
            openActionForm={this.openActionForm}
          />
        ) : null}
      </div>
    )
  }
}
