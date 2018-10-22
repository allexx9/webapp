// import Plot from 'react-plotly.js'
import PropTypes from 'prop-types'
import React, { Component } from 'react'
// import moment from 'moment'
import Plotly from 'plotly.js-finance-dist'
import createPlotlyComponent from 'react-plotly.js/factory'

const Plot = createPlotlyComponent(Plotly)

class AssetChartPlotly extends Component {
  static propTypes = {
    data: PropTypes.array.isRequired
  }

  // static defaultProps = {
  //   titleText: ''
  // }

  unpack = (rows, key) => {
    return rows.map(function(row) {
      return row[key]
    })
  }

  render() {
    // console.log(this.props.data)
    // let now = moment().toDate()
    // let yesterday = moment()
    // .subtract(1, 'days')
    // .toDate()
    let dataChart = Object.values(this.props.data)
    let trace1 = {
      type: 'scatter',
      mode: 'lines',
      x: this.unpack(dataChart, 'date'),
      y: this.unpack(dataChart, 'close'),
      line: { color: 'rgb(5, 64, 135)' }
    }
    let layout = {
      // autosize: true,
      width: 320,
      height: 80,
      margin: {
        l: 5,
        r: 10,
        b: 15,
        t: 0,
        pad: 0
      },
      font: {
        family: 'Courier New, monospace',
        size: 10,
        color: '#7f7f7f'
      },
      xaxis: {
        showgrid: false,
        showline: false,
        tickformat: '%H:%M'
        // range: [yesterday, now]
      },
      yaxis: {
        showticklabels: false,
        showgrid: false
      }
    }
    // console.log(dataChart)
    return (
      <Plot
        data={[trace1]}
        layout={layout}
        config={{ displayModeBar: false, staticPlot: true }}
      />
    )
  }
}

export default AssetChartPlotly
