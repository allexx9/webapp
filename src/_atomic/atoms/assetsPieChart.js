import { Doughnut } from 'react-chartjs-2'
// import ChartistGraph from 'react-chartist'
import PropTypes from 'prop-types'
import React, { Component } from 'react'

export default class AssetsPieChart extends Component {
  static propTypes = {
    data: PropTypes.object.isRequired
  }

  render() {
    // let data, options, type
    // if (Object.keys(this.props.data).length !== 0) {
    //   // console.log(this.props.data)
    //   data = {
    //     // labels: this.props.data.labels,
    //     series: [20, 10, 30, 40]
    //   }
    //   options = {
    //     donut: true,
    //     donutWidth: 60,
    //     donutSolid: true,
    //     startAngle: 270,
    //     showLabel: true
    //   }
    //   type = 'Pie'
    // }
    // console.log(data)
    if (Object.keys(this.props.data).length === 0)
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
    return (
      <div
        style={{
          minHeight: '200px',
          width: '200px',
          textAlign: 'center',
          margin: 'auto'
        }}
      >
        {/* <ChartistGraph data={data} options={options} type={type} /> */}
        <Doughnut
          data={this.props.data}
          width={200}
          height={200}
          options={{
            legend: {
              display: true,
              position: 'bottom'
            }
          }}
        />
      </div>
    )
  }
}
