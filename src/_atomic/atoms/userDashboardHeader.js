import * as Colors from 'material-ui/styles/colors'
import { Col, Row } from 'react-flexbox-grid'
import { THEME_COLOR } from './../../_utils/const'
import { Toolbar, ToolbarGroup } from 'material-ui/Toolbar'
import ActionHome from 'material-ui/svg-icons/action/home'
import Avatar from 'material-ui/Avatar'
import PropTypes from 'prop-types'
import React, { Component } from 'react'
import UserDashboardHeaderTitle from './userDashboardHeaderTitle'
import styles from './userDashboardHeader.module.css'

export default class UserDashboardHeader extends Component {
  static propTypes = {
    fundType: PropTypes.string.isRequired,
    userType: PropTypes.string.isRequired,
    icon: PropTypes.object
  }

  static defaultProps = {
    fundType: 'drago',
    userType: 'holder',
    icon: <ActionHome />
  }

  render() {
    const headerStyle = {
      drago: {
        toolBar: {
          // backgroundColor: '#054186'
          background: THEME_COLOR.drago
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
        toolBar: {
          background: THEME_COLOR.vault
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
      <Toolbar
        className={styles.detailsToolbar}
        style={headerStyle[fundType].toolBar}
      >
        <ToolbarGroup className={styles.detailsToolbarGroup}>
          <Row className={styles.detailsToolbarGroup}>
            <div className={styles.identityIconContainer}>
              <Avatar
                color="#ffad00"
                backgroundColor="#ffffff"
                size={60}
                icon={this.props.icon}
                className={styles.avatar}
                style={{
                  borderStyle: 'solid',
                  borderColor: Colors.grey400
                }}
              />
            </div>
            <Col xs={12} className={styles.dragoTitle}>
              <UserDashboardHeaderTitle userType={userType} />
              {/* <p style={headerStyle[fundType].titleText}>{userType}</p> */}
            </Col>
          </Row>
        </ToolbarGroup>
      </Toolbar>
    )
  }
}
