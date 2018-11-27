import { Col, Row } from 'react-flexbox-grid'
import { fitWidth } from 'react-stockcharts/lib/helper'
import BoxDecorator from '../molecules/boxDecorator'
import BoxTitle from '../atoms/boxTitle'
import CandleStickChartWithMACDIndicator from './CandleStickChartWithMACDIndicator'
import ErrorBoundary from './errorBoundary'
import Loading from '../atoms/loading'
import Paper from 'material-ui/Paper'
import PropTypes from 'prop-types'
import React, { Component } from 'react'
import styles from './chartBox.module.css'
import utils from '../../_utils/utils'

const paperStyle = {
  // paddingLeft: "12px"
}

class ChartBox extends Component {
  static propTypes = {
    data: PropTypes.array.isRequired,
    loading: PropTypes.bool
  }

  static defaultProps = {
    type: 'svg',
    loading: true
  }

  shouldComponentUpdate(nextProps) {
    let propsUpdate = !utils.shallowEqual(this.props.data, nextProps.data)
    return propsUpdate
  }

  render() {
    if (this.props.data.length === 0 || this.props.loading) {
      return (
        <BoxDecorator boxName={'chartBox'}>
          <Row>
            <Col xs={12}>
              <Row className={styles.sectionTitle}>
                <Col xs={12}>
                  <BoxTitle titleText={'MARKET'} />
                  <Paper style={paperStyle} zDepth={1}>
                    <Row className={styles.marketBoxContainer}>
                      <Col xs={12}>
                        <Loading size={35} />
                      </Col>
                    </Row>
                  </Paper>
                </Col>
              </Row>
            </Col>
          </Row>
        </BoxDecorator>
      )
    }

    return (
      <Row>
        <Col xs={12}>
          <Row className={styles.sectionTitle}>
            <Col xs={12}>
              <BoxTitle titleText={'MARKET'} />
              <Paper style={paperStyle} zDepth={1}>
                <Row className={styles.marketBoxContainer}>
                  <Col xs={12}>
                    <ErrorBoundary>
                      <CandleStickChartWithMACDIndicator
                        data={this.props.data}
                      />
                    </ErrorBoundary>
                  </Col>
                </Row>
              </Paper>
            </Col>
          </Row>
        </Col>
      </Row>
    )
  }
}

export default fitWidth(ChartBox)
