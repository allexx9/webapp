import './chart.css'
import ChartistGraph from 'react-chartist'
import React, { Component } from 'react'
// import dataSerie from './dataSerie.json'
// import dataSerie2 from './dataSerie2.json'
// import 'chartist/dist/chartist.min.css'
import PropTypes from 'prop-types'
// import styles from './assetChartChartis.module.css'

class ChartPie extends Component {
  static propTypes = {
    data: PropTypes.object.isRequired,
    width: PropTypes.number,
    height: PropTypes.number
  }

  static defaultProps = {
    width: 400,
    height: 250
  }

  render() {
    const { data, width, height } = this.props
    if (Object.keys(this.props.data).length === 0)
      return (
        <div
          style={{
            minHeight: height,
            width: width,
            textAlign: 'center',
            margin: 'auto'
          }}
        />
      )

    let total = data.series.reduce(function sum(prev, curr) {
      return Number(prev) + Number(curr)
    })

    let options = {
      labelInterpolationFnc: function(label, index) {
        // Only display labels on slices > 5%
        const perc = (data.series[index] / total) * 100
        return perc > 5 ? label + ' ' + perc.toFixed(2) + '%' : ''
      },
      chartPadding: 20,
      labelOffset: 30,
      labelDirection: 'explode',
      width: width,
      height: height,
      donut: true,
      donutWidth: 30,
      donutSolid: true
    }

    const type = 'Pie'

    return <ChartistGraph data={data} options={options} type={type} />
  }
}

export default ChartPie
