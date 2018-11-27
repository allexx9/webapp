// Copyright 2016-2017 Rigo Investment Sagl.

import ApplicationExchangeHome from '../ApplicationExchangeHome'
import PropTypes from 'prop-types'
import React, { Component } from 'react'
import TopBarMenu from '../Elements/topBarMenu'

import { Col, Grid, Row } from 'react-flexbox-grid'
import getMuiTheme from 'material-ui/styles/getMuiTheme'

import { connect } from 'react-redux'
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider'
// import TestComponent from '../_atomic/atoms/testComponent'
import ElementBottomStatusBar from '../Elements/elementBottomStatusBar'
import WalletSetup from '../_atomic/organisms/walletSetup'
import styles from './application.module.css'

const muiTheme = getMuiTheme({
  palette: {
    primary1Color: '#054186'
  },
  fontFamily: "'Muli', sans-serif",
  appBar: {
    height: 45,
    fontSize: '20px !important'
  }
})

const muiThemeExchange = getMuiTheme({
  palette: {
    primary1Color: '#054186'
  },
  fontFamily: "'Muli', sans-serif",
  appBar: {
    height: 20,
    fontSize: '15px !important'
  }
})

function mapStateToProps(state) {
  return state
}

class ApplicationExchangePage extends Component {
  // Context
  static childContextTypes = {
    muiTheme: PropTypes.object
  }

  getChildContext() {
    return {
      muiTheme
    }
  }

  static contextTypes = {
    api: PropTypes.object.isRequired
  }

  componentWillUnmount() {}

  static propTypes = {
    location: PropTypes.object.isRequired,
    endpoint: PropTypes.object.isRequired,
    app: PropTypes.object.isRequired
  }

  render() {
    const { location, endpoint } = this.props

    // if (endpoint.networkInfo.id === 42) {
    //   return (
    //     <MuiThemeProvider muiTheme={muiTheme}>
    //       <Grid fluid className={styles.maincontainer}>
    //         <Row>
    //           <Col xs={12}>
    //             <TopBarMenu
    //               handleTopBarSelectAccountType={
    //                 this.handleTopBarSelectAccountType
    //               }
    //               handleToggleNotifications={this.handleToggleNotifications}
    //             />
    //           </Col>
    //         </Row>
    //         <MuiThemeProvider muiTheme={muiThemeExchange}>
    //           <Row className={classNames(styles.content)}>
    //             <Col xs={12}>
    //               <div style={{ textAlign: 'center', marginTop: '25px' }}>
    //                 Exchange only available on Ropsten and Mainnet network.
    //               </div>
    //             </Col>
    //           </Row>
    //         </MuiThemeProvider>
    //       </Grid>
    //     </MuiThemeProvider>
    //   )
    // }
    const allowedNetworks = [3, 1]
    return (
      <MuiThemeProvider muiTheme={muiTheme}>
        <Grid fluid className={styles.maincontainer}>
          <Row>
            <Col xs={12} className={styles.fix}>
              <TopBarMenu
                handleTopBarSelectAccountType={
                  this.handleTopBarSelectAccountType
                }
                transactionsDrawerOpen={this.props.app.transactionsDrawerOpen}
              />
            </Col>
          </Row>
          <MuiThemeProvider muiTheme={muiThemeExchange}>
            {/* <Row className={classNames(styles.content)}>
              <Col xs={12}>
                <div style={{ textAlign: 'center', marginTop: '25px' }}>
                  Coming soon.
                </div>
              </Col>
            </Row> */}
            <Row>
              <Col xs={12}>
                {endpoint.accounts.length === 0 ||
                !endpoint.isMetaMaskNetworkCorrect ? (
                  <WalletSetup />
                ) : (
                  allowedNetworks.includes(endpoint.networkInfo.id) && (
                    <div>
                      <ApplicationExchangeHome
                        key={'Exchange' + endpoint.lastMetaMaskUpdateTime}
                        location={location}
                      />
                    </div>
                  )
                )}
              </Col>
            </Row>
          </MuiThemeProvider>
          <Row>
            <ElementBottomStatusBar
              blockNumber={endpoint.prevBlockNumber}
              networkName={endpoint.networkInfo.name}
              networkError={endpoint.networkError}
              networkStatus={endpoint.networkStatus}
            />
          </Row>
        </Grid>
      </MuiThemeProvider>
    )
  }
}

export default connect(mapStateToProps)(ApplicationExchangePage)
