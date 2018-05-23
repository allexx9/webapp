// Copyright 2016-2017 Rigo Investment Sarl.

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Toggle from 'material-ui/Toggle';
import * as Colors from 'material-ui/styles/colors'
import ReactTooltip from 'react-tooltip'

export default class ToggleSwitch extends Component {

  static propTypes = {
    label: PropTypes.string.isRequired,
    onToggle: PropTypes.func.isRequired,
    toggled: PropTypes.bool.isRequired,
    toolTip: PropTypes.string
  }

  static defaultProps = {
    toolTip: 'Activate trading'
  }

  render() {
    const aggregatedTogglestyles = {
      block: {
        maxWidth: 150,
        marginLeft: 'auto'
      },
      toggle: {
        // paddingRight: '5px',
      },
      trackSwitched: {
        backgroundColor: '#bdbdbd',
      },
      thumbSwitched: {
        backgroundColor: Colors.blue500,
      },
      labelStyle: {
        fontSize: '12px',
        opacity: '0.5',
        textAlign: 'right'
      },
    };

    return (
        <div data-tip={this.props.toolTip} style={aggregatedTogglestyles.block}>
          <Toggle
            label={this.props.label}
            style={aggregatedTogglestyles.toggle}
            // thumbStyle={aggregatedTogglestyles.thumbOff}
            trackStyle={aggregatedTogglestyles.trackOff}
            thumbSwitchedStyle={aggregatedTogglestyles.thumbSwitched}
            trackSwitchedStyle={aggregatedTogglestyles.trackSwitched}
            labelStyle={aggregatedTogglestyles.labelStyle}
            onToggle={this.props.onToggle}
            toggled={this.props.toggled}
          />
          <ReactTooltip effect="solid" place="top" />
        </div>
      

    )
  }
}