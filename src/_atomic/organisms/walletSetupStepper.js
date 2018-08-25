import { Step, StepContent, StepLabel, Stepper } from 'material-ui/Stepper'
import { connect } from 'react-redux'
import Dialog from 'material-ui/Dialog'
import FlatButton from 'material-ui/FlatButton'
import Looks3 from 'material-ui/svg-icons/image/looks-3'
import LooksOne from 'material-ui/svg-icons/image/looks-one'
import LooksTwo from 'material-ui/svg-icons/image/looks-two'
import PropTypes from 'prop-types'
import RaisedButton from 'material-ui/RaisedButton'
import React, { Component } from 'react'
import SectionHeader from '../atoms/sectionHeader'
import styles from './walletSetupStepper.module.css'

function mapStateToProps(state) {
  return state
}

/**
 * Horizontal steppers are ideal when the contents of one step depend on an earlier step.
 * Avoid using long step names in horizontal steppers.
 *
 * Linear steppers require users to complete one step in order to move on to the next.
 */

class WalletSetupStepper extends Component {
  static propTypes = {
    endpoint: PropTypes.object.isRequired,
    open: PropTypes.bool.isRequired,
    handleClose: PropTypes.func.isRequired
  }

  state = {
    open: false,
    locked: this.props.endpoint.metaMaskLocked,
    correctNetwork: this.props.endpoint.metaMaskNetworkCorrect,
    finished: false,
    steps: [
      {
        index: 0,
        success: false,
        successIcon: '',
        errorIcon: '',
        labelIcon: {}
      },
      {
        index: 1,
        success: false,
        successIcon: '',
        errorIcon: ''
      },
      {
        index: 2,
        success: false,
        successIcon: '',
        errorIcon: ''
      }
    ],
    stepIndex: 0,
    done: false
  }

  static getDerivedStateFromProps(props, state) {
    const locked = props.endpoint.metaMaskLocked
    const correctNetwork = props.endpoint.metaMaskNetworkCorrect
    if (locked !== state.locked) {
      return {
        locked: locked,
        correctNetwork: correctNetwork
      }
    }
    return null
  }

  handleNext = () => {
    const { stepIndex } = this.state
    this.setState({
      stepIndex: stepIndex + 1,
      finished: stepIndex >= 2
    })
  }

  handlePrev = () => {
    const { stepIndex } = this.state
    if (stepIndex > 0) {
      this.setState({ stepIndex: stepIndex - 1 })
    }
  }

  handleFinish = () => {
    this.setState({ stepIndex: 0 })
    this.props.handleClose()
  }

  renderStepActions(step) {
    const { stepIndex } = this.state
    const { locked, correctNetwork } = this.state
    const buttonDisable = () => {
      switch (step) {
        case 0:
          return locked
        case 1:
          return !correctNetwork || locked
        case 2:
          return !correctNetwork || locked
      }
    }
    return (
      <div style={{ margin: '12px 0' }}>
        {step > 0 && (
          <FlatButton
            label="Back"
            disabled={stepIndex === 0}
            disableTouchRipple={true}
            disableFocusRipple={true}
            onClick={this.handlePrev}
            style={{ marginRight: 12 }}
          />
        )}

        {step >= 0 &&
          step < 2 && (
            <RaisedButton
              label={'Next'}
              disabled={buttonDisable(step)}
              disableTouchRipple={true}
              disableFocusRipple={true}
              primary={true}
              onClick={this.handleNext}
              style={{ marginRight: 12 }}
            />
          )}
        {step === 2 && (
          <RaisedButton
            label={'Go'}
            disabled={buttonDisable(step)}
            disableTouchRipple={true}
            disableFocusRipple={true}
            primary={true}
            onClick={this.handleFinish}
            style={{ marginRight: 12 }}
          />
        )}
      </div>
    )
  }

  setActive = step => {
    // console.log(step)
    // console.log(this.state.stepIndex === this.state.steps[step].index ? styles.activeStep : styles.notActiveStep)
    if (this.state.stepIndex === this.state.steps[step].index) {
      return {
        active: true,
        labelClass: styles.activeStep,
        iconStyle: {
          container: {
            marginLeft: '-5px',
            paddingTop: '5px'
          },
          height: '34px',
          width: '34px'
        }
      }
    } else {
      return {
        active: false,
        labelClass: styles.notActiveStep,
        iconStyle: {
          opacity: '0.6'
        }
      }
    }
  }

  renderIcon = (style, number) => {
    const lockedColor = this.state.locked ? '#FF9800' : '#4CAF50'
    const networkColor = !this.state.correctNetwork ? '#FF9800' : '#4CAF50'
    switch (number) {
      case 0:
        return (
          <div style={style.container}>
            <LooksOne style={style} color={lockedColor} />
          </div>
        )
      case 1:
        return (
          <div style={style.container}>
            <LooksTwo style={style} color={networkColor} />
          </div>
        )
      case 2:
        return (
          <div style={style.container}>
            <Looks3 style={style} color="#054186" />
          </div>
        )
    }
  }

  render() {
    const { stepIndex } = this.state
    const { locked, correctNetwork } = this.state
    const { networkInfo } = this.props.endpoint
    // console.log(this.props.app)
    // console.log(this.setActive(0).iconStyle)
    return (
      <Dialog
        title={
          <SectionHeader
            textStyle={{
              fontSize: '32px',
              fontWeight: 700,
              textAlign: 'center',
              borderRadius: '0px'
            }}
            containerStyle={{ marginLeft: '0px', marginRight: '0px' }}
            titleText="WALLET SETUP"
          />
        }
        modal={true}
        open={this.props.open}
        onRequestClose={this.handleFinish}
        repositionOnUpdate={false}
        // contentStyle={{ minHeight: 900 }}
      >
        <div style={{ maxWidth: 380, minHeight: 400, margin: 'auto' }}>
          <Stepper activeStep={stepIndex} orientation="vertical">
            <Step className={this.setActive(0).labelClass}>
              <StepLabel icon={this.renderIcon(this.setActive(0).iconStyle, 0)}>
                <span className={styles.titleStep}>Unlock your wallet</span>
              </StepLabel>
              <StepContent>
                <p>
                  Please make sure that your wallet is unlocked and the correct
                  account selected.
                </p>
                {!locked && (
                  <p>
                    Everything is <b>fine</b>, your wallet is{' '}
                    <span className={styles.unlockedText}>unlocked</span>.
                  </p>
                )}
                {locked && (
                  <p>
                    We have detected that your wallet is{' '}
                    <span className={styles.lockedText}>locked</span>.
                  </p>
                )}

                <a
                  href="https://help.rigoblock.com"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  I need help to set up a wallet!
                </a>
                {this.renderStepActions(0)}
              </StepContent>
            </Step>
            <Step className={this.setActive(1).labelClass}>
              <StepLabel icon={this.renderIcon(this.setActive(1).iconStyle, 1)}>
                <span className={styles.titleStep}>Select a network</span>
              </StepLabel>
              <StepContent>
                {/* <p>
                You need to connect your wallet to <b>Rospen</b> Ethereum
                testnet.
              </p>
              <p>
                RigoBlock also supports Kovan and you will be once finished this
                setup.
              </p> */}
                {correctNetwork && (
                  <div>
                    <p>
                      You are connected to{' '}
                      <b>
                        {networkInfo.name.charAt(0).toUpperCase() +
                          networkInfo.name.slice(1)}
                      </b>{' '}
                      network.
                    </p>
                    <p>Please proceed to the next step.</p>
                  </div>
                )}
                {!correctNetwork && (
                  <div>
                    <p>
                      We have detected that you are not connected to{' '}
                      <b>Rospen</b> network.
                    </p>
                    <p>Please configure your wallet accordingly.</p>
                  </div>
                )}
                <a
                  href="https://help.rigoblock.com"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Tell me more about this.
                </a>
                {this.renderStepActions(1)}
              </StepContent>
            </Step>
            <Step className={this.setActive(2).labelClass}>
              <StepLabel icon={this.renderIcon(this.setActive(2).iconStyle, 2)}>
                <span className={styles.titleStep}>Done!</span>
              </StepLabel>
              <StepContent>
                <p>You are all set.</p>
                {this.renderStepActions(2)}
              </StepContent>
            </Step>
          </Stepper>
        </div>
      </Dialog>
    )
  }
}

export default connect(mapStateToProps)(WalletSetupStepper)
