import { Col, Row } from 'react-flexbox-grid'
import BoxTitle from '../atoms/boxTitle'
import LockedTokensInfo from '../molecules/lockedTokensInfo'
import Paper from 'material-ui/Paper'
import PropTypes from 'prop-types'
import React, { Component } from 'react'
import styles from './chartBox.module.css'

const paperStyle = {
  // paddingLeft: "12px"
}

class TokensLockBox extends Component {
  static propTypes = {}

  static defaultProps = {}

  render() {
    return (
      <Row>
        <Col xs={12}>
          <Row className={styles.sectionTitle}>
            <Col xs={12}>
              <LockedTokensInfo />
            </Col>
          </Row>
        </Col>
      </Row>
    )
  }
}

export default TokensLockBox
