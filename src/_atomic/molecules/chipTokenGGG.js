import Chip from 'material-ui/Chip'
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import Avatar from 'material-ui/Avatar'

import styles from './chipTokenGGG.module.css'

class ChipTokenGGG extends Component {

  static propTypes = {
    account: PropTypes.object.isRequired,
  };

  render() {
    const { account } = this.props;
    return (
      <Chip style={{ border: "1px solid", borderColor: "#E0E0E0", padding: "1px" }}
        backgroundColor="#FFFFFF">
        <Avatar src="img/GGG.png" style={{border: "1px solid" }} backgroundColor="#E0E0E0"/>
        {account.rigoTokenBalance} <span className={styles.tokensSymbolText}>GRG</span>
      </Chip>
    )
  }
}

export default ChipTokenGGG