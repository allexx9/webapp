import { Col, Grid, Row } from 'react-flexbox-grid'
import { connect } from 'react-redux'
import { withRouter } from 'react-router-dom'
import ActionShowChart from 'material-ui/svg-icons/editor/show-chart'
import ElementListWrapper from '../../Elements/elementListWrapper'
import FilterPoolsField from '../../_atomic/atoms/filterPoolsField'
import Paper from 'material-ui/Paper'
import ProgressBar from '../../_atomic/atoms/progressBar'
import PropTypes from 'prop-types'
import React, { Component } from 'react'
import TablePoolsList from '../../_atomic/molecules/tablePoolsList'
import UserDashboardHeader from '../../_atomic/atoms/userDashboardHeader'
import utils from '../../_utils/utils'

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
      this.filterPools
    )
  }

  filterPools = () => {
    const { poolsList } = this.props
    const { filter } = this.state
    return utils.filterPools(poolsList, filter, 'vault')
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
                        list={this.filterPools()}
                        autoLoading={false}
                        location={location}
                        pagination={{
                          display: 10,
                          number: 1
                        }}
                      >
                        <TablePoolsList />
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
