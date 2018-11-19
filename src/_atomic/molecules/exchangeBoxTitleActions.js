import PropTypes from 'prop-types'
import React, { Component } from 'react'
// import styles from './helpIcon.module.css'
import { Actions } from '../../_redux/actions'
import { connect } from 'react-redux'
import ExpandPanelSwitch from '../atoms/expandPanelSwitch'
import HelpIcon from '../atoms/helpIcon'
// import shallowEqualObjects from 'shallow-equal/objects'
import styles from './exchangeBoxTitleActions.module.css'
import utils from '../../_utils/utils'

function mapStateToProps(state) {
  // console.log(state)
  return {
    exchange: {
      ui: state
    }
  }
}

class ExchangeBoxTitleActions extends Component {
  static propTypes = {
    boxName: PropTypes.string.isRequired,
    exchange: PropTypes.object.isRequired,
    helpIcon: PropTypes.bool,
    dispatch: PropTypes.func.isRequired
  }

  static defaultProps = {
    helpIcon: true
  }

  // shouldComponentUpdate(nextProps) {
  //   if (this.props.boxName === 'relayBox') {
  //     console.log(
  //       shallowEqualObjects(
  //         this.props.exchange.ui.panels,
  //         nextProps.exchange.ui.panels
  //       )
  //     )
  //     console.log(
  //       this.props.exchange.ui.panels[this.props.boxName].expanded,
  //       nextProps.exchange.ui.panels[this.props.boxName].expanded
  //     )
  //     let propsUpdate = shallowEqualObjects(
  //       this.props.exchange.ui.panels,
  //       nextProps.exchange.ui.panels
  //     )
  //     return propsUpdate
  //   }
  //   return true
  // }

  onActionClick = action => {
    const { ui } = this.props.exchange
    this.props.dispatch(
      Actions.exchange.setUiPanelProperties(
        utils.updateUi(ui, this.props.boxName).toggleExpandSwitch()
      )
    )
  }

  render() {
    const { panels } = this.props.exchange.ui
    // console.log(panels)

    if (!this.props.boxName) return <div />
    // console.log(panels[this.props.boxName].expanded)
    return (
      <div>
        {typeof panels[this.props.boxName].expanded !== 'undefined' && (
          <div
            className={styles.expandSwitch}
            onClick={() => this.onActionClick('ExpandSwitch')}
            id={this.props.boxName + 'ExpandSwitch'}
          >
            <ExpandPanelSwitch
              // style={this.props.style}
              style={{ color: '#ffffff', height: '20px' }}
              expanded={panels[this.props.boxName].expanded}
            />
          </div>
        )}
        {this.props.helpIcon && (
          <div className={styles.helpIcon}>
            <HelpIcon
              // style={this.props.style}
              style={{ color: '#ffffff', height: '20px' }}
              // onClick={this.onExpandSwitch}
            />
          </div>
        )}
      </div>
    )
  }
}

export default connect(state => mapStateToProps(state.exchange.ui))(
  ExchangeBoxTitleActions
)
