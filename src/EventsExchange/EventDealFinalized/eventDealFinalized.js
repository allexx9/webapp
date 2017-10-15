// Copyright 2016-2017 Gabriele Rigo

import Event from '../Event';

import React, { Component } from 'react';

// React.PropTypes is deprecated since React 15.5.0, use the npm module prop-types instead
import PropTypes from 'prop-types';

export default class EventDealFinalized extends Component {
  static propTypes = {
    event: PropTypes.object
  }

  render () {
    const { event } = this.props;
    const { id, stable, leveraged, price } = event.params;

    return (
      <Event
        event={ event }
        //dealId = { id }
        //fromAddress={ leveraged }
        //dragoAddress={ stable }
        price={ price } />
    );
  }
}

//fromAddress hidden since stable and lev address 0x0000000 for some reason
