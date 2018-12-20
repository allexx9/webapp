import ChartPie from '../../_atomic/atoms/Chartist/ChartPie'
import PropTypes from 'prop-types'
import React, { PureComponent } from 'react'
import styles from './assetsPieChartWrapper.module.css'
import utils from '../../_utils/utils'

class AssetsPieChartWrapper extends PureComponent {
  static propTypes = {
    poolAssetsList: PropTypes.array.isRequired,
    assetsPrices: PropTypes.object.isRequired,
    poolETHBalance: PropTypes.string
  }

  static defaultProps = {
    poolETHBalance: '0'
  }

  componentDidMount = () => {}

  // shouldComponentUpdate = nextProps => {
  //   return true
  // }

  render() {
    const { poolAssetsList, assetsPrices, poolETHBalance } = this.props
    if (!poolETHBalance) {
      return (
        <div
          style={{
            minHeight: '200px',
            width: '200px',
            textAlign: 'center',
            margin: 'auto'
          }}
        />
      )
    }
    let assetsValues = utils.calculatePieChartPortfolioValue(
      poolAssetsList,
      assetsPrices,
      poolETHBalance
    )
    const data = {
      labels: assetsValues.labels,
      series: assetsValues.datasets[0].data
    }

    return (
      <div className={styles.wrapper} id="chartPie">
        <ChartPie data={data} />
      </div>
    )
  }
}

export default AssetsPieChartWrapper
