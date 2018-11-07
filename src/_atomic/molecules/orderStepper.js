import { Step, StepContent, StepLabel, Stepper } from 'material-ui/Stepper'
import Looks3 from 'material-ui/svg-icons/image/looks-3'
import Looks4 from 'material-ui/svg-icons/image/looks-4'
import LooksOne from 'material-ui/svg-icons/image/looks-one'
import LooksTwo from 'material-ui/svg-icons/image/looks-two'
import OrderJsonView from './orderJsonView'
import PropTypes from 'prop-types'
import React, { Component } from 'react'
import styles from './orderStepper.module.css'

class OrderStepper extends Component {
  static propTypes = {
    stepIndex: PropTypes.number.isRequired,
    orderJson: PropTypes.object.isRequired
  }

  static contextTypes = {
    api: PropTypes.object.isRequired
  }

  state = {
    orderSigned: false,
    orderChecked: false,
    orderSubmitted: false,
    finished: false,
    errorMsg: '',
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
    done: false
  }

  static getDerivedStateFromProps(props) {
    return {
      orderSigned: props.stepIndex > 0 ? true : false,
      orderChecked: props.stepIndex > 1 ? true : false,
      orderSubmitted: props.stepIndex > 2 ? true : false
    }
  }
  handleNext = () => {
    const { stepIndex } = this.state
    this.setState({
      stepIndex: stepIndex + 1,
      finished: stepIndex >= 2
    })
  }

  setActive = step => {
    if (this.props.stepIndex === this.state.steps[step].index) {
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
    const signedColor = !this.state.orderSigned ? '#FF9800' : '#4CAF50'
    const checkedColor = !this.state.orderChecked ? '#FF9800' : '#4CAF50'
    const submittedColor = !this.state.orderSubmitted ? '#FF9800' : '#4CAF50'
    switch (number) {
      case 0:
        return (
          <div style={style.container}>
            <LooksOne style={style} color={signedColor} />
          </div>
        )
      case 1:
        return (
          <div style={style.container}>
            <LooksTwo style={style} color={checkedColor} />
          </div>
        )
      case 2:
        return (
          <div style={style.container}>
            <Looks3 style={style} color={submittedColor} />
          </div>
        )
      case 3:
        return (
          <div style={style.container}>
            <Looks4 style={style} color="#054186" />
          </div>
        )
    }
  }

  render() {
    const { stepIndex } = this.props
    return (
      <div style={{ margin: 'auto' }}>
        <Stepper activeStep={stepIndex} orientation="vertical">
          <Step className={this.setActive(0).labelClass}>
            <StepLabel icon={this.renderIcon(this.setActive(0).iconStyle, 0)}>
              <span className={styles.titleStep}>Sign and authorize</span>
            </StepLabel>
            <StepContent>
              <p>Check your wallet and sign this order.</p>
            </StepContent>
          </Step>
          <Step className={this.setActive(1).labelClass}>
            <StepLabel icon={this.renderIcon(this.setActive(1).iconStyle, 1)}>
              <span className={styles.titleStep}>Check your order</span>
            </StepLabel>
            <StepContent>
              <div className={styles.orderContainer}>
                <OrderJsonView orderJson={this.props.orderJson} />
              </div>
            </StepContent>
          </Step>
          <Step className={this.setActive(2).labelClass}>
            <StepLabel icon={this.renderIcon(this.setActive(2).iconStyle, 2)}>
              <span className={styles.titleStep}>Submit</span>
            </StepLabel>
            <StepContent>
              <p>Submit order to the exchange.</p>
            </StepContent>
          </Step>
        </Stepper>
      </div>
    )
  }
}

export default OrderStepper
