import PropTypes from "prop-types";
import React, { Component } from "react";
import { Col, Row } from 'react-flexbox-grid';
import IdentityIcon from '../../_atomic/atoms/identityIcon';
import styles from './fundHeader.module.css';
import * as Colors from 'material-ui/styles/colors';
import { Toolbar, ToolbarGroup } from 'material-ui/Toolbar';

export default class FundHeader extends Component {

  static propTypes = {
    fundDetails: PropTypes.object.isRequired,
    actions: PropTypes.object,
    fundType: PropTypes.string.isRequired
  };

  static defaulProps = {
    fundType: 'drago'
  }

  render() {

    const headerStyle = {
      drago: {
        toolBar:
        {
          backgroundColor: '#054186'
        },
        titleSymbol: {
          color: '#ffffff',
          letterSpacing: '1px',
          opacity: '1',
          fontSize: '26px',
          fontWeight: 700,
          height: '28px',
          marginTop: 'auto'
        },
        titleName: {
          color: '#ffffff',
          letterSpacing: '1px',
          opacity: '0.9',
          fontSize: '24px',
          width: '100%',
          marginTop: 'auto'
        },
        subTitleText: {
          color: '#ffffff',
          opacity: '0.5'
        }
      },
      vault: {
        toolBar:
        {
          backgroundColor: '#607D8B'
        },
        titleSymbol: {
          color: '#ffffff',
          letterSpacing: '1px',
          opacity: '1',
          fontSize: '26px',
          fontWeight: 700,
          height: '28px',
          marginTop: 'auto'
        },
        titleName: {
          color: '#ffffff',
          letterSpacing: '1px',
          opacity: '0.9',
          fontSize: '24px',
          width: '100%',
          marginTop: 'auto'
        },
        subTitleText: {
          color: '#ffffff',
          opacity: '0.5'
        }
      }
    }

    const { fundDetails, actions } = this.props
    if (!fundDetails.address) {
      return <p>empty</p>;
    } return (
      <Toolbar className={styles.detailsToolbar} style={headerStyle[this.props.fundType].toolBar}>
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

              <div style={{ width: '100%', display: 'flex' }}>
                <div style={headerStyle[this.props.fundType].titleSymbol}>
                  {fundDetails.symbol}
                </div>
                <div className={styles.dragoTitleDivider}></div>
                <div style={headerStyle[this.props.fundType].titleName}>
                  {fundDetails.name}
                </div>

              </div>
              {/* <p style={headerStyle[this.props.fundType].titleText}>{fundDetails.symbol} | {fundDetails.name} </p> */}
              <small style={headerStyle[this.props.fundType].subTitleText}>{fundDetails.address}</small>
            </Col>


          </Row>
        </ToolbarGroup>
      </Toolbar>

    );
  }
}