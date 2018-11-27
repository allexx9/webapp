import ChartLine from '../../_atomic/atoms/Chartist/ChartLine'
import PropTypes from 'prop-types'
import React, { Component } from 'react'
import styles from './assetsLineChartWrapper.module.css'

class AssetsLineChartWrapper extends Component {
  static propTypes = {
    data: PropTypes.array.isRequired,
    token: PropTypes.object,
    pool: PropTypes.object,
    borderWrapper: PropTypes.bool
  }

  static defaultProps = {
    token: {},
    pool: {},
    borderWrapper: true
  }

  state = {
    prevLastPointEpoch: {}
  }

  componentDidMount = () => {
    const data = this.props.data
    this.setState({
      prevLastPointEpoch: data[data.length - 1].epoch
    })
  }

  shouldComponentUpdate = nextProps => {
    const nextData = nextProps.data
    if (nextData[nextData.length - 1].epoch === this.state.prevLastPointEpoch) {
      return false
    }
    this.setState({
      prevLastPointEpoch: nextData[nextData.length - 1].epoch
    })
    // console.log('NEW data in chart')
    return false
  }

  mapData = arr => {
    return arr.map(el => {
      return {
        x: new Date(el.date),
        y: el.close
      }
    })
  }

  render() {
    const { data, token, borderWrapper } = this.props
    if (data.length < 2) {
      return <div className={styles.noDataChart}> No data </div>
    }

    if (token.symbol === 'WETH' || token.symbol === 'ETHW') {
      return <div className={styles.noDataChart}> No data </div>
    }

    const dataChart = {
      series: [
        {
          data: this.mapData(data)
        }
      ]
    }
    return (
      <div className={borderWrapper ? styles.chartWrapper : ''}>
        <ChartLine data={dataChart} />
      </div>
    )
  }
}

export default AssetsLineChartWrapper
