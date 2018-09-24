import { Col, Row } from 'react-flexbox-grid'
import BoxTitle from '../atoms/boxTitle'
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
              <BoxTitle titleText={'MARKET'} />
              <Paper style={paperStyle} zDepth={1}>
                <Row className={styles.marketBoxContainer}>
                  <Col xs={12} />
                </Row>
              </Paper>
            </Col>
          </Row>
        </Col>
      </Row>
    )
  }
}

export default TokensLockBox
