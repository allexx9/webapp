import React from 'react';
import {
  Step,
  Stepper,
  StepLabel,
  StepContent,
} from 'material-ui/Stepper';
import RaisedButton from 'material-ui/RaisedButton';
import FlatButton from 'material-ui/FlatButton';
import styles from './walletSetupStepper.module.css'
import { blue500, red500, greenA200 } from 'material-ui/styles/colors';
import LooksOne from 'material-ui/svg-icons/image/looks-one';
import LooksTwo from 'material-ui/svg-icons/image/looks-two';
import Looks3 from 'material-ui/svg-icons/image/looks-3';
import SvgIcon from 'material-ui/SvgIcon';

/**
 * Horizontal steppers are ideal when the contents of one step depend on an earlier step.
 * Avoid using long step names in horizontal steppers.
 *
 * Linear steppers require users to complete one step in order to move on to the next.
 */


class WalletSetupStepper extends React.Component {

  state = {
    finished: false,
    steps: [
      {
        index: 0,
        success: false,
        successIcon: '',
        errorIcon: '',
        labelIcon: {

        }
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
      },
    ],
    stepIndex: 0,
  };

  handleNext = () => {
    const { stepIndex } = this.state;
    this.setState({
      stepIndex: stepIndex + 1,
      finished: stepIndex >= 2,
    });
  };

  handlePrev = () => {
    const { stepIndex } = this.state;
    if (stepIndex > 0) {
      this.setState({ stepIndex: stepIndex - 1 });
    }
  };

  renderStepActions(step) {
    const { stepIndex } = this.state;
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

        <RaisedButton
          label={stepIndex === 2 ? 'Go!' : 'Next'}
          disableTouchRipple={true}
          disableFocusRipple={true}
          primary={true}
          onClick={this.handleNext}
          style={{ marginRight: 12 }}
        />
      </div>
    );
  }

  setActive = (step) => {
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
          width: '34px',
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
    switch (number) {
      case 0:
        return <div style={style.container}>
          <LooksOne
            style={style}
            color='#054186' />
        </div>
      case 1:
        return <div style={style.container}>
          <LooksTwo
            style={style}
            color='#054186' />
        </div>
      case 2:
        return <div style={style.container}>
          <Looks3
            style={style}
            color='#054186' />
        </div>
    }
  }

  render() {
    const { finished, stepIndex } = this.state;
    console.log(this.setActive(0).iconStyle)
    return (
      <div style={{ maxWidth: 380, maxHeight: 400, margin: 'auto' }}>
        <Stepper activeStep={stepIndex} orientation="vertical">
          <Step className={this.setActive(0).labelClass}>
            <StepLabel icon={this.renderIcon(this.setActive(0).iconStyle, 0)}><span className={styles.titleStep}>Unlock your wallet</span></StepLabel>
            <StepContent>
              <p>
                Please make sure that your wallet is unlocked and the correct account selected.
              </p>
              <a href="https://help.rigoblock.com" target="_blank" rel="noopener noreferrer">I need help to set up a wallet!</a>
              {this.renderStepActions(0)}
            </StepContent>
          </Step>
          <Step className={this.setActive(1).labelClass}>
            <StepLabel icon={this.renderIcon(this.setActive(1).iconStyle, 1)}><span className={styles.titleStep}>Select a network</span></StepLabel>
            <StepContent>
              <p>
                You need to select a network. We currently support <b>Kovan</b> and <b>Rospen</b> Ethereum test nets.
              </p>
              <a href="https://help.rigoblock.com" target="_blank" rel="noopener noreferrer">Tell me more about this.</a>
              {this.renderStepActions(1)}
            </StepContent>
          </Step>
          <Step className={this.setActive(2).labelClass}>
            <StepLabel icon={this.renderIcon(this.setActive(2).iconStyle, 2)}><span className={styles.titleStep}>All done!</span></StepLabel>
            <StepContent>
            <p>
                You are all set.
              </p>
              {this.renderStepActions(2)}
            </StepContent>
          </Step>
        </Stepper>
        {finished && (
          <p style={{ margin: '20px 0', textAlign: 'center' }}>
            <a
              href="#"
              onClick={(event) => {
                event.preventDefault();
                this.setState({ stepIndex: 0, finished: false });
              }}
            >
              Click here
            </a> to reset the example.
          </p>
        )}
      </div>
    );
  }
}

export default WalletSetupStepper;