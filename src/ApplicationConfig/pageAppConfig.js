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
    app: PropTypes.object.isRequired
  }

  onToggleMockMode = (event, isInputChecked) => {
    console.log(isInputChecked)
    this.props.dispatch(
      Actions.app.updateAppConfig({
        isMock: isInputChecked
      })
    )
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
              <div className={styles.mockModeContainer}>
                <p>Enable mock mode</p>
                <Toggle
                  label="Mock mode"
                  toggled={this.props.app.config.isMock}
                  onToggle={this.onToggleMockMode}
                />
              </div>
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
