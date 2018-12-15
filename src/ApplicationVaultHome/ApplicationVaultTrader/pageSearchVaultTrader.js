import { Col, Grid, Row } from 'react-flexbox-grid'
import { connect } from 'react-redux'
import { withRouter } from 'react-router-dom'
import ActionShowChart from 'material-ui/svg-icons/editor/show-chart'
import ElementListFunds from '../Elements/elementListVaults'
import ElementListWrapper from '../../Elements/elementListWrapper'
import FilterPoolsField from '../../_atomic/atoms/filterPoolsField'
import Paper from 'material-ui/Paper'
import ProgressBar from '../../_atomic/atoms/progressBar'
import PropTypes from 'prop-types'
import React, { Component } from 'react'
import UserDashboardHeader from '../../_atomic/atoms/userDashboardHeader'
import _ from 'lodash'

import styles from './pageSearchVaultTrader.module.css'

function mapStateToProps(state) {
  return state
}

class PageSearchVaultTrader extends Component {
  static contextTypes = {
    api: PropTypes.object.isRequired
  }

  static propTypes = {
    location: PropTypes.object.isRequired,
    endpoint: PropTypes.object.isRequired,
    poolsList: PropTypes.object.isRequired,
    dispatch: PropTypes.func.isRequired
  }

  state = {
    filter: ''
  }

  scrollPosition = 0

  componentDidMount() {}

  filter = filter => {
    this.setState(
      {
        filter
      },
      this.filterFunds
    )
  }

  filterFunds = () => {
    const { poolsList } = this.props
    const { filter } = this.state
    const list = Object.values(poolsList.list)
    list.sort(function(a, b) {
      if (a.symbol < b.symbol) return -1
      if (a.symbol > b.symbol) return 1
      return 0
    })
    const filterValue = filter.trim().toLowerCase()
    const filterLength = filterValue.length
    return filterLength === 0
      ? list.filter(item => item.poolType === 'vault')
      : list.filter(
          item =>
            (item.name.toLowerCase().slice(0, filterLength) === filterValue ||
              item.symbol.toLowerCase().slice(0, filterLength) ===
                filterValue) &&
            item.poolType === 'vault'
        )
  }

  render() {
    let { location, poolsList } = this.props
    const detailsBox = {
      padding: 20
    }
    const listLoadingProgress = poolsList.lastFetchRange.chunk.progress * 100
    return (
      <Row>
        <Col xs={12}>
          <div className={styles.pageContainer}>
            <Paper zDepth={1}>
              <UserDashboardHeader
                fundType="vault"
                userType="holder"
                icon={<ActionShowChart />}
              />
            </Paper>
            <Paper zDepth={1}>
              <div className={styles.detailsBoxContainer}>
                <Grid fluid>
                  <Row className={styles.filterBox}>
                    <Col xs={12}>
                      <Paper style={detailsBox} zDepth={1}>
                        <FilterPoolsField filter={this.filter} />
                      </Paper>
                    </Col>
                    <Col xs={12}>
                      <ProgressBar progress={listLoadingProgress} />
                    </Col>
                  </Row>
                  <Row className={styles.transactionsStyle}>
                    <Col xs={12}>
                      <ElementListWrapper
                        list={this.filterFunds()}
                        autoLoading={false}
                        location={location}
                        pagination={{
                          display: 10,
                          number: 1
                        }}
                      >
                        <ElementListFunds />
                      </ElementListWrapper>
                    </Col>
                  </Row>
                </Grid>
              </div>
            </Paper>
          </div>
        </Col>
      </Row>
    )
  }
}

export default withRouter(connect(mapStateToProps)(PageSearchVaultTrader))
