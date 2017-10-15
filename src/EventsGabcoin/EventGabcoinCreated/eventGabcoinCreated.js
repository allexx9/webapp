// Copyright 2016-2017 Gabriele Rigo

import Event from '../EventNew';

import React, { Component } from 'react';

// React.PropTypes is deprecated since React 15.5.0, use the npm module prop-types instead
import PropTypes from 'prop-types';

export default class EventGabcoinCreated extends Component {
  static propTypes = {
    event: PropTypes.object
  }

  render () {
    const { event } = this.props;
    const { gabcoin, group, owner, gabcoinID, name, symbol } = event.params;

    return (
      <Event
        event={ event }
        fromAddress={ owner }
        gabcoinAddress={ gabcoin }
        gabcoinsymbol={ symbol }
        gabcoinname={ name } />
        //gabcoinSymbol ={ _symbol } //these functions have to be implemented in "Event"
        //gabcoinID ={ _gabcoinID }
        //gabcoinGroup ={ _gabcoinFactory }
    );
  }
}

//TODO: fix event and create one layout for each event type
