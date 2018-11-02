import './chart.css'
import Chartist from 'chartist'
import ChartistGraph from 'react-chartist'
import React, { Component } from 'react'
import dataSerie from './dataSerie.json'
import dataSerie2 from './dataSerie2.json'
import moment from 'moment'

class Chart extends Component {
  mapData = arr => {
    return arr.map(el => {
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
    const type = 'Line'
    let options = {
      axisY: {
        showGrid: true, // removes the grid
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
        showGrid: true,
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

export default Chart
