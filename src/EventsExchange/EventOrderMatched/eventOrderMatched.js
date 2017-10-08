// Copyright 2016-2017 Gabriele Rigo

import Event from '../Event';

import React, { Component, PropTypes } from 'react';

export default class EventOrderMatched extends Component {
  static propTypes = {
    event: PropTypes.object
  }

  render () {
    const { event } = this.props;
    const { id, stable, leveraged, is_stable, deal, strike, stake } = event.params;

    return (
      <Event
        event={ event }
        fromAddress={ stable }
        dragoAddress={ id }
        price = { strike }
        dragoname={ is_stable } />
    );
  }
}
