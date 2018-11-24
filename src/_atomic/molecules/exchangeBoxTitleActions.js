import { Actions } from '../../_redux/actions'
import { connect } from 'react-redux'
import ExpandPanelSwitch from '../atoms/expandPanelSwitch'
import HelpIcon from '../atoms/helpIcon'
import PropTypes from 'prop-types'
import React, { Component } from 'react'
import styles from './exchangeBoxTitleActions.module.css'

function mapStateToProps(state) {
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

  updateUi = (ui, boxName) => {
    return {
      toggleExpandSwitch: () => {
        return {
          ...ui,
          panels: {
            ...ui.panels,
            [this.props.boxName]: {
              ...ui.panels[boxName],
              ...{ expanded: !ui.panels[boxName].expanded }
            }
          }
        }
      }
    }
  }

  onActionClick = () => {
    const { ui } = this.props.exchange
    const newUi = this.updateUi(ui, this.props.boxName).toggleExpandSwitch()
    this.props.dispatch(Actions.exchange.updateUiPanelProperties(newUi))
  }

  render() {
    const { panels } = this.props.exchange.ui
    if (!this.props.boxName) return <div />
    return (
      <div>
        {typeof panels[this.props.boxName].expanded !== 'undefined' && (
          <div
            className={styles.expandSwitch}
            onClick={this.onActionClick}
            id={this.props.boxName + 'ExpandSwitch'}
          >
            <ExpandPanelSwitch
              style={{ color: '#ffffff', height: '20px' }}
              expanded={panels[this.props.boxName].expanded}
            />
          </div>
        )}
        {this.props.helpIcon && (
          <div className={styles.helpIcon}>
            <HelpIcon style={{ color: '#ffffff', height: '20px' }} />
          </div>
        )}
      </div>
    )
  }
}

export default connect(state => mapStateToProps(state.exchange.ui))(
  ExchangeBoxTitleActions
)
