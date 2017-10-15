// Copyright 2016 Gavin Wood

import Event from '../Event';

import React, { Component } from 'react';

// React.PropTypes is deprecated since React 15.5.0, use the npm module prop-types instead
import PropTypes from 'prop-types';

export default class EventTransfer extends Component {
  static propTypes = {
    event: PropTypes.object
  }

  render () {
    const { event } = this.props;
    const { from, to, _amount } = event.params;

    return (
      <Event
        event={ event }
        fromAddress={ from }
        toAddress={ to }
        value={ _amount } />
    );
  }
}

//event transfer of tokens from/to minter has to be ported to dragoFactory to be visible
