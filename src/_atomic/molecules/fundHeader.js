import PropTypes from "prop-types";
import React, { Component } from "react";
import { Col, Row } from 'react-flexbox-grid';
import IdentityIcon from '../atoms/identityIcon';
import styles from './fundHeader.module.css';
import * as Colors from 'material-ui/styles/colors';
import { Toolbar, ToolbarGroup } from 'material-ui/Toolbar';
import FundHeaderNameSymbol from '../atoms/fundHeaderNameSymbol'
import { THEME_COLOR } from './../../_utils/const'

export default class FundHeader extends Component {

  static propTypes = {
    fundDetails: PropTypes.object.isRequired,
    actions: PropTypes.object,
    fundType: PropTypes.string.isRequired
  };

  static defaultProps = {
    fundType: 'drago'
  }

  render() {

    const headerStyle = {
      drago: {
        toolBar:
        {
          background: THEME_COLOR.drago
        },
      },
      vault: {
        toolBar:
        {
          backgroundColor: '#607D8B'
        },
      }
    }

    const { fundDetails, actions, fundType } = this.props
    if (!fundDetails.address) {
      return <p>empty</p>;
    } return (
      <Toolbar className={styles.detailsToolbar} style={headerStyle[fundType].toolBar}>
        {actions
          ? <div className={styles.managerButtonContainer}>
            {actions}
          </div>
          : null}
        <ToolbarGroup className={styles.detailsToolbarGroup}>
          <Row className={styles.detailsToolbarGroup} >
            <div className={styles.identityIconContainer}>
              <IdentityIcon
                address={fundDetails.address}
                size={'60px'}
                customStyle={{ borderStyle: 'solid', borderColor: Colors.grey400 }}
              />
            </div>
            <Col xs={12} className={styles.dragoTitle}>
              <FundHeaderNameSymbol
                fundDetails={fundDetails}
                fundType={fundType}
              />
            </Col>
          </Row>
        </ToolbarGroup>
      </Toolbar>
    );
  }
}