// Copyright 2016-2017 Gabriele Rigo

import Event from '../Event';

import React, { Component, PropTypes } from 'react';

export default class EventNewTranch extends Component {
  static propTypes = {
    event: PropTypes.object
  }

  render () {
    const { event } = this.props;
    const { price } = event.params;

    return (
      <Event
        event={ event }
        price={ price } />
    );
  }
}
