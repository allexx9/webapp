import Chartist from 'chartist'
import ChartistGraph from 'react-chartist'
import React, { Component } from 'react'
// import dataSerie from './dataSerie.json'
// import dataSerie2 from './dataSerie2.json'
import './assetChartChartis.module.css'
import PropTypes from 'prop-types'
import moment from 'moment'
import styles from './assetChartChartis.module.css'

class AssetChartChartist extends Component {
  // static propTypes = {
  //   data: PropTypes.array.isRequired
  // }

  mapData = arr => {
    return arr.map(el => {
      console.log(el)
      return {
        x: new Date(el[0]),
        y: el[2]
      }
    })
  }
  getHour = (dayOffset, hourOffset) =>
    parseInt(
      moment()
        .startOf('day')
        .add(dayOffset, 'days')
        .add(hourOffset, 'hours')
        .format('x')
    )

  getTicks = () => {
    const oneDayAgo = moment()
      .startOf('hour')
      .subtract(24, 'hours')
      .format('x')
    // calculating timestamps for yesterday and today
    const ticks = [
      this.getHour(-1, 0), // 00:00
      this.getHour(-1, 6), // 06:00
      this.getHour(-1, 12), // 12:00
      this.getHour(-1, 18), // 18:00
      this.getHour(0, 0), // 00:00
      this.getHour(0, 6), // 06:00
      this.getHour(0, 12), // 12:00
      this.getHour(0, 18) // 18:00
    ]
    // return only the tickers relevant to the last 24 hours
    return ticks.filter(tick => tick >= oneDayAgo)
  }
  render() {
    const dataSerie = [
      [
        1540998000000,
        0.00085441,
        0.0008476,
        0.00085441,
        0.0008476,
        233.56335304
      ],
      [
        1540980000000,
        0.00085454,
        0.00085454,
        0.00085454,
        0.00085454,
        972.01405623
      ],
      [
        1540958400000,
        0.00086321,
        0.0008632,
        0.00086321,
        0.0008632,
        1566.59222941
      ],
      [
        1540929600000,
        0.00087003,
        0.00086322,
        0.00087003,
        0.00086322,
        102.63868104
      ],
      [
        1540926000000,
        0.00087008,
        0.00087003,
        0.00087008,
        0.00087003,
        103.59862629
      ],
      [1540922400000, 0.00087008, 0.00087009, 0.00087009, 0.00087008, 636]
    ]
    const dataSerie2 = [
      [1541001600000, 0.0038948, 0.0039, 0.0039, 0.0038926, 1376.37723787],
      [
        1540998000000,
        0.0039051,
        0.0038735,
        0.0039051,
        0.0038735,
        3034.99852747
      ],
      [1540994400000, 0.0039277, 0.0039299, 0.0039299, 0.003907, 7905.73302115],
      [1540983600000, 0.0039292, 0.0039169, 0.0039292, 0.0039169, 7994.29988],
      [1540972800000, 0.0039412, 0.0039412, 0.0039412, 0.0039412, 676.35704018],
      [1540969200000, 0.0039412, 0.0039412, 0.0039412, 0.0039412, 337.4761908],
      [1540962000000, 0.0039257, 0.0039257, 0.0039257, 0.0039257, 52.64],
      [1540954800000, 0.0039412, 0.003933, 0.0039412, 0.003933, 319.14428208],
      [1540951200000, 0.0039412, 0.0039412, 0.0039412, 0.003941, 11217],
      [1540944000000, 0.0039344, 0.0039348, 0.0039354, 0.0039344, 686.53491082],
      [1540940400000, 0.0039314, 0.0039314, 0.0039314, 0.0039314, 25.40714957],
      [1540936800000, 0.0039428, 0.0039425, 0.0039428, 0.0039425, 9812.3193431],
      [1540922400000, 0.0039523, 0.0039514, 0.0039762, 0.0039514, 224.24263975]
    ]
    const type = 'Line'
    let options = {
      axisY: {
        showGrid: false, // removes the grid
        // labelOffset: {
        //   x: 10
        // }
        showLabel: false // removes the Y label
      },
      axisX: {
        type: Chartist.FixedScaleAxis,
        low: parseInt(
          moment()
            .startOf('hour')
            .subtract(24, 'hours')
            .format('x')
        ),
        high: parseInt(
          moment()
            .startOf('hour')
            .format('x')
        ),
        ticks: this.getTicks(),
        labelInterpolationFnc: value => moment(value).format('HH:mm'),
        showGrid: false,
        labelOffset: {
          x: -20
        }
      },
      showPoint: false,
      showArea: true,
      lineSmooth: false
    }
    const firstChart = {
      series: [
        {
          name: 'series-1',
          data: this.mapData(dataSerie)
        }
      ]
    }
    const secondChart = {
      series: [
        {
          name: 'series-2',
          data: this.mapData(dataSerie2)
        }
      ]
    }

    return (
      <div className="divider">
        <div className="chart">
          <ChartistGraph data={firstChart} options={options} type={type} />
          <ChartistGraph data={secondChart} options={options} type={type} />
        </div>
      </div>
    )
  }
}

export default AssetChartChartist
