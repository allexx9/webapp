import PropTypes from 'prop-types'
import React, { Component } from 'react'
import styles from './userDashboardHeaderTitle.module.css'

export default class UserDashboardHeaderTitle extends Component {
  static propTypes = {
    userType: PropTypes.string.isRequired,
    textColor: PropTypes.string.isRequired
  }

  static defaultProps = {
    fundType: 'drago',
    textColor: '#ffffff'
  }

  render() {
    const headerStyle = {
      holder: {
        toolBar: {
          backgroundColor: '#054186'
        },
        titleSymbol: {
          color: this.props.textColor,
          letterSpacing: '1px',
          opacity: '1',
          fontSize: '26px',
          fontWeight: 700,
          height: '28px',
          marginTop: 'auto'
        },
        titleName: {
          color: this.props.textColor,
          letterSpacing: '1px',
          opacity: '0.9',
          fontSize: '24px',
          width: '100%',
          marginTop: 'auto'
        },
        subTitleText: {
          color: this.props.textColor,
          opacity: '0.5'
        }
      },
      wizard: {
        toolBar: {
          backgroundColor: '#054186'
        },
        titleSymbol: {
          color: this.props.textColor,
          letterSpacing: '1px',
          opacity: '1',
          fontSize: '26px',
          fontWeight: 700,
          height: '28px',
          marginTop: 'auto'
        },
        titleName: {
          color: this.props.textColor,
          letterSpacing: '1px',
          opacity: '0.9',
          fontSize: '24px',
          width: '100%',
          marginTop: 'auto'
        },
        subTitleText: {
          color: this.props.textColor,
          opacity: '0.5'
        }
      }
      // vault: {
      //   toolBar: {
      //     backgroundColor: '#607D8B'
      //   },
      //   titleSymbol: {
      //     color: this.props.textColor,
      //     letterSpacing: '1px',
      //     opacity: '1',
      //     fontSize: '26px',
      //     fontWeight: 700,
      //     height: '28px',
      //     marginTop: 'auto'
      //   },
      //   titleName: {
      //     color: this.props.textColor,
      //     letterSpacing: '1px',
      //     opacity: '0.9',
      //     fontSize: '24px',
      //     width: '100%',
      //     marginTop: 'auto'
      //   },
      //   subTitleText: {
      //     color: this.props.textColor,
      //     opacity: '0.5'
      //   }
      // }
    }

    return (
      <div>
        <div style={{ width: '100%', display: 'flex' }}>
          <div style={headerStyle[this.props.userType].titleSymbol}>
            {this.props.userType.toUpperCase()}
          </div>
          <div
            className={styles.dragoTitleDivider}
            style={{ borderLeftColor: this.props.textColor }}
          />
          <div style={headerStyle[this.props.userType].titleName}>Home</div>
        </div>
        <small style={headerStyle[this.props.userType].subTitleText}>
          <br />
        </small>
      </div>
    )
  }
}
