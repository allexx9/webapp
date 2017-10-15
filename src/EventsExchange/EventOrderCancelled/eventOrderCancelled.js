// Copyright 2016-2017 Gabriele Rigo

import Event from '../Event';

import React, { Component } from 'react';

// React.PropTypes is deprecated since React 15.5.0, use the npm module prop-types instead
import PropTypes from 'prop-types';

export default class EventOrderCancelled extends Component {
  static propTypes = {
    event: PropTypes.object
  }

  render () {
    const { event } = this.props;
    const { id, who, stake } = event.params;

    return (
      <Event
        event={ event }
        fromAddress={ who }
        dragoAddress={ id }
        dragoname={ stake } />
    );
  }
}
