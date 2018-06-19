import PropTypes from "prop-types";
import React, { Component } from "react";
import { Col, Row } from 'react-flexbox-grid';
import styles from './userDashboardHeader.module.css';
import * as Colors from 'material-ui/styles/colors';
import ActionHome from 'material-ui/svg-icons/action/home'
import { Toolbar, ToolbarGroup } from 'material-ui/Toolbar';
import Avatar from 'material-ui/Avatar'

export default class UserDashboardHeader extends Component {

  static propTypes = {
    fundType: PropTypes.string.isRequired,
    userType: PropTypes.string.isRequired
  };

  static defaultProps = {
    fundType: 'drago',
    userType: 'holder'
  }

  render() {

    const headerStyle = {
      drago: {
        toolBar:
        {
          backgroundColor: '#054186'
        },
        titleText: {
          color: '#ffffff',
          letterSpacing: '1px',
          opacity: '1',
          textTransform: 'uppercase'
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
        titleText: {
          color: '#ffffff',
          letterSpacing: '1px',
          opacity: '1',
          textTransform: 'uppercase'
        },
        subTitleText: {
          color: '#ffffff',
          opacity: '0.5'
        }
      }
    }

    const { userType, fundType } = this.props
    return (
      <Toolbar className={styles.detailsToolbar} style={headerStyle[fundType].toolBar}>
        <ToolbarGroup className={styles.detailsToolbarGroup}>

          <Row className={styles.detailsToolbarGroup} >
            <div className={styles.identityIconContainer}>
              <Avatar size={60} icon={<ActionHome />} className={styles.avatar}/>  
            </div>

            <Col xs={12} className={styles.userTitle}>
              <p style={headerStyle[fundType].titleText}>{userType}</p>
            </Col>


          </Row>
        </ToolbarGroup>
      </Toolbar>

    );
  }
}