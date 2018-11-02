import { Col, Row } from 'react-flexbox-grid'
import Drawer from 'material-ui/Drawer'
import PropTypes from 'prop-types'
import React, { Component } from 'react'
import classNames from 'classnames'
import styles from './topMenuLinkDrawer.module.css'
import utils from '../../_utils/utils'

class TopMenuLinkDrawer extends Component {
  static propTypes = {}

  static contextTypes = {}

  state = {}

  handleToggleDrawer = () => {
    // Setting a small timeout to make sure that the state is updated with
    // the subscription ID before trying to unsubscribe. Otherwise, if an user opens and closes the element very quickly
    // the state would not be updated fast enough and the element could crash
    // setTimeout(this.detachInterface, 3000)
    // this.props.handleToggleNotifications()
  }

  render() {
    let drawerHeight = 450
    // if (recentTransactions.size !== 0) {
    //   drawerHeight = 72 * recentTransactions.size
    // }
    return (
      <div className={styles.drawerContainer}>
        <Drawer
          // width={300}
          // openSecondary={true}
          open={true}
          zDepth={1}
          docked={false}
          containerClassName={styles.drawer}
          onRequestChange={this.handleToggleDrawer}
          containerStyle={{ height: drawerHeight.toString() }}
        >
          bla bla bla bla blab bla bla
          <br />
          bla bla bla bla blab bla bla
          <br />
          bla bla bla bla blab bla bla
          <br />
          bla bla bla bla blab bla bla
          <br />
          bla bla bla bla blab bla bla
          <br />
        </Drawer>
      </div>
    )
  }
}

export default TopMenuLinkDrawer
