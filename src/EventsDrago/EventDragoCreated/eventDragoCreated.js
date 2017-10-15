// Copyright 2016-2017 Gabriele Rigo

import Event from '../EventNew';

import React, { Component } from 'react';

// React.PropTypes is deprecated since React 15.5.0, use the npm module prop-types instead
import PropTypes from 'prop-types';

export default class EventDragoCreated extends Component {
  static propTypes = {
    event: PropTypes.object
  }

  render () {
    const { event } = this.props;
    const { drago, group, owner, dragoID, name, symbol } = event.params;
    //ALT: const { drago, group, owner, dragoID, name, symbol } = event.params;

    return (
      <Event
        event={ event }
        fromAddress={ owner }
        dragoAddress={ drago }
        dragosymbol={ symbol }
        dragoname={ name } />
        //dragoSymbol ={ _symbol } //these functions have to be implemented in "Event"
        //dragoID ={ _dragoID }
        //dragoGroup ={ _dragoFactory }
    );
  }
}

//TODO: fix event and create one layout for each event type
