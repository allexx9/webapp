import { Actions } from '../_redux/actions'
import { Col, Row } from 'react-flexbox-grid'
import { connect } from 'react-redux'
import ElementBoxHeadTitle from '../Elements/elementBoxHeadTitle'
import Paper from 'material-ui/Paper'
import PropTypes from 'prop-types'
import React, { Component } from 'react'
import Toggle from 'material-ui/Toggle'
import styles from './pageAppConfig.module.css'

function mapStateToProps(state) {
  return state
}

class PageAppConfig extends Component {
  static contextTypes = {
    api: PropTypes.object.isRequired
  }

  static propTypes = {
    location: PropTypes.object.isRequired,
    dispatch: PropTypes.func.isRequired,
    app: PropTypes.object.isRequired,
    endpoint: PropTypes.object.isRequired
  }

  onToggleMockMode = (event, isInputChecked) => {
    console.log(isInputChecked)
    this.props.dispatch(
      Actions.app.updateAppConfig({
        isMock: isInputChecked
      })
    )
  }

  showMockTroggle = () => {
    const { accounts } = this.props.endpoint
    let allowedAccountsGab = [
      '0xC2B5122381bcddb87e75FAb2e46a70e7C19B69D3'.toLowerCase(),
      '0x9899beaaD8Ded0402C39148AFdD03850DFE29FDA'.toLowerCase()
    ]
    let allowedAccountsDav = [
      '0xc8DCd42e846466F2D2b89F3c54EBa37bf738019B'.toLowerCase(),
      '0x62A35D16E770A3A7DD7017B9544CBA8959A72c79'.toLowerCase()
    ]
    let allowedAccounts = [...allowedAccountsGab, ...allowedAccountsDav]
    let isAllowed = accounts.findIndex(account => {
      return allowedAccounts.includes(account.address.toLowerCase())
    })
    console.log(isAllowed)
    if (isAllowed !== -1) {
      return (
        <div className={styles.mockModeContainer}>
          <p>Enable mock mode</p>
          <Toggle
            label="Mock mode"
            toggled={this.props.app.config.isMock}
            onToggle={this.onToggleMockMode}
          />
        </div>
      )
    }
  }

  render() {
    return (
      <div className={styles.boxContainer}>
        <Row>
          <Col xs={12}>
            <ElementBoxHeadTitle primaryText="Data" />
          </Col>
          <Col xs={12}>
            <Paper className={styles.paperContainer} zDepth={1}>
              {this.showMockTroggle()}
            </Paper>
          </Col>
        </Row>
        {/* <Row>
          <Col xs={12}>
            <ElementBoxHeadTitle primaryText="Endpoint" />
          </Col>
          <Col xs={12}>
            <Paper className={styles.paperContainer} zDepth={1}>
              <p>
                Please select your preferred access point to the blockchain.
              </p>
              <p>
                RigoBlock and Infura provide secure, reliable, and scalable
                access to Ethereum.
              </p>
              <div>
                <DropDownMenu
                  value={this.state.selectedEndpoint}
                  onChange={this.onChangeEndpoint}
                >
                  <MenuItem
                    value={0}
                    disabled={disabledRemote}
                    primaryText="Infura"
                  />
                  <MenuItem
                    value={1}
                    disabled={disabledRemote}
                    primaryText="RigoBlock"
                  />
                  <MenuItem
                    value={2}
                    disabled={disabledLocal}
                    primaryText="Local"
                  />
                </DropDownMenu>
              </div>
              <Row>
                <Col xs={12}>
                  <p>
                    You need to refresh you browser to save and make this
                    setting active. Please proceed:
                  </p>
                </Col>
                <Col xs={12}>
                  <RaisedButton
                    label="Refresh"
                    primary={true}
                    disabled={this.state.save}
                    onClick={this.handleRefresh}
                  />
                </Col>
              </Row>
            </Paper>
          </Col>
        </Row> */}
      </div>
    )
  }
}

export default connect(mapStateToProps)(PageAppConfig)
