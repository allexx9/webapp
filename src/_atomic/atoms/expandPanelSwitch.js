import NavigationChevronRight from 'material-ui/svg-icons/navigation/chevron-right'
import NavigationExpandMore from 'material-ui/svg-icons/navigation/expand-more'
import PropTypes from 'prop-types'
import React, { Component } from 'react'
// import styles from './helpIcon.module.css'

export default class ExpandPanelSwitch extends Component {
  static propTypes = {
    style: PropTypes.object,
    expanded: PropTypes.bool,
    onToggleSwitch: PropTypes.func
  }

  static defaultProps = {
    style: {},
    expanded: true,
    onToggleSwitch: () => {}
  }

  toggleSwitch(event) {
    console.log(event)
  }

  render() {
    return this.props.expanded ? (
      <div style={{ cursor: 'pointer' }}>
        <NavigationExpandMore style={this.props.style} />
      </div>
    ) : (
      <div style={{ cursor: 'pointer' }}>
        <NavigationChevronRight style={this.props.style} />
      </div>
    )
  }
}
