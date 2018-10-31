import ChartistGraph from 'react-chartist'
import PropTypes from 'prop-types'
import React, { Component } from 'react'
import moment from 'moment'

class AssetChartChartist extends Component {
  static propTypes = {
    data: PropTypes.object.isRequired
  }

  unpack = data => {
    return Object.keys(data).map(key => {
      return {
        y: data[key].close,
        x: new Date(data[key].date)
      }
    })
  }

  unpackY = data => {
    return Object.keys(data).map(key => {
      return data[key].close
    })
  }

  unpackX = data => {
    return Object.keys(data).map(key => {
      return data[key].date
    })
  }

  render() {
    // console.log(this.props.data.data)
    let formatData = this.unpack(this.props.data.data)
    console.log(formatData)
    // let lineChartData = {
    //   // labels: [1, 2, 3, 4, 5, 6, 7, 8],
    //   series: [this.unpack(this.props.data)]
    // }

    let dataX = this.unpackX(this.props.data.data)
    let dataY = this.unpackY(this.props.data.data)
    let testData2 = {
      labels: dataX,
      series: [{ name: 'series-1', data: dataY }]
    }

    let testData = {
      // labels: ['W1', 'W2', 'W3', 'W4', 'W5', 'W6', 'W7', 'W8', 'W9', 'W10'],
      series: [
        [
          { x: new Date(143134652600), y: 53 },
          { x: new Date(143334652600), y: 40 },
          { x: new Date(143354652600), y: 45 },
          { x: new Date(143356652600), y: 41 },
          { x: new Date(143366652600), y: 40 },
          { x: new Date(143368652600), y: 38 },
          { x: new Date(143378652600), y: 34 },
          { x: new Date(143568652600), y: 32 },
          { x: new Date(143569652600), y: 18 },
          { x: new Date(143579652600), y: 11 }
        ]

        // name: 'remaining',
        // data: [formatData]
        // data: [
        //   { x: new Date('2015-01-27T15:00:00Z'), y: 531 },
        //   { x: new Date('2015-01-27T16:00:00Z'), y: 534 },
        //   { x: new Date('2015-01-27T17:00:00Z'), y: 532 },
        //   { x: new Date('2015-01-27T18:00:00Z'), y: 535 },
        //   { x: new Date('2015-01-27T19:00:00Z'), y: 533 },
        //   { x: new Date('2015-01-27T20:00:00Z'), y: 533 },
        //   { x: new Date('2015-01-27T21:00:00Z'), y: 532 },
        //   { x: new Date('2015-01-27T22:00:00Z'), y: 527 },
        //   { x: new Date('2015-01-27T23:00:00Z'), y: 532 },
        //   { x: new Date('2015-01-28T01:00:00Z'), y: 533 },
        //   { x: new Date('2015-01-28T02:00:00Z'), y: 527 },
        //   { x: new Date('2015-01-28T03:00:00Z'), y: 528 },
        //   { x: new Date('2015-01-28T04:00:00Z'), y: 524 },
        //   { x: new Date('2015-01-28T05:00:00Z'), y: 531 },
        //   { x: new Date('2015-01-28T06:00:00Z'), y: 526 },
        //   { x: new Date('2015-01-28T07:00:00Z'), y: 529 },
        //   { x: new Date('2015-01-28T08:00:00Z'), y: 524 },
        //   { x: new Date('2015-01-28T09:00:00Z'), y: 524 },
        //   { x: new Date('2015-01-28T10:00:00Z'), y: 516 },
        //   { x: new Date('2015-01-28T11:00:00Z'), y: 517 },
        //   { x: new Date('2015-01-28T12:00:00Z'), y: 517 },
        //   { x: new Date('2015-01-28T13:00:00Z'), y: 512 },
        //   { x: new Date('2015-01-28T14:00:00Z'), y: 510 },
        //   { x: new Date('2015-01-28T15:00:00Z'), y: 504 },
        //   { x: new Date('2015-01-28T16:00:00Z'), y: 509 },
        //   { x: new Date('2015-01-28T17:00:00Z'), y: 506 },
        //   { x: new Date('2015-01-28T18:00:00Z'), y: 501 },
        //   { x: new Date('2015-01-28T19:00:00Z'), y: 501 },
        //   { x: new Date('2015-01-28T20:00:00Z'), y: 500 },
        //   { x: new Date('2015-01-28T21:00:00Z'), y: 500 },
        //   { x: new Date('2015-01-28T22:00:00Z'), y: 498 },
        //   { x: new Date('2015-01-28T23:00:00Z'), y: 496 },
        //   { x: new Date('2015-01-29T01:00:00Z'), y: 497 },
        //   { x: new Date('2015-01-29T02:00:00Z'), y: 506 },
        //   { x: new Date('2015-01-29T03:00:00Z'), y: 508 },
        //   { x: new Date('2015-01-29T04:00:00Z'), y: 514 },
        //   { x: new Date('2015-01-29T05:00:00Z'), y: 511 },
        //   { x: new Date('2015-01-29T06:00:00Z'), y: 515 },
        //   { x: new Date('2015-01-29T07:00:00Z'), y: 515 },
        //   { x: new Date('2015-01-29T08:00:00Z'), y: 521 },
        //   { x: new Date('2015-01-29T09:00:00Z'), y: 521 },
        //   { x: new Date('2015-01-29T10:00:00Z'), y: 519 },
        //   { x: new Date('2015-01-29T11:00:00Z'), y: 512 },
        //   { x: new Date('2015-01-29T12:00:00Z'), y: 510 },
        //   { x: new Date('2015-01-29T13:00:00Z'), y: 512 },
        //   { x: new Date('2015-01-29T14:00:00Z'), y: 511 },
        //   { x: new Date('2015-01-29T15:00:00Z'), y: 503 },
        //   { x: new Date('2015-01-29T16:00:00Z'), y: 508 },
        //   { x: new Date('2015-01-29T17:00:00Z'), y: 503 },
        //   { x: new Date('2015-01-29T18:00:00Z'), y: 504 },
        //   { x: new Date('2015-01-29T19:00:00Z'), y: 505 },
        //   { x: new Date('2015-01-29T20:00:00Z'), y: 508 },
        //   { x: new Date('2015-01-29T21:00:00Z'), y: 501 },
        //   { x: new Date('2015-01-29T22:00:00Z'), y: 506 },
        //   { x: new Date('2015-01-29T23:00:00Z'), y: 505 },
        //   { x: new Date('2015-01-30T01:00:00Z'), y: 507 },
        //   { x: new Date('2015-01-30T02:00:00Z'), y: 511 },
        //   { x: new Date('2015-01-30T03:00:00Z'), y: 512 },
        //   { x: new Date('2015-01-30T04:00:00Z'), y: 511 },
        //   { x: new Date('2015-01-30T05:00:00Z'), y: 513 },
        //   { x: new Date('2015-01-30T06:00:00Z'), y: 512 },
        //   { x: new Date('2015-01-30T07:00:00Z'), y: 518 },
        //   { x: new Date('2015-01-30T08:00:00Z'), y: 520 },
        //   { x: new Date('2015-01-30T09:00:00Z'), y: 519 },
        //   { x: new Date('2015-01-30T10:00:00Z'), y: 518 },
        //   { x: new Date('2015-01-30T11:00:00Z'), y: 523 },
        //   { x: new Date('2015-01-30T12:00:00Z'), y: 522 },
        //   { x: new Date('2015-01-30T13:00:00Z'), y: 521 },
        //   { x: new Date('2015-01-30T14:00:00Z'), y: 524 },
        //   { x: new Date('2015-01-30T15:00:00Z'), y: 522 }
        // ]
      ]
    }

    let lineChartOptions = {
      fullWidth: true,
      // showArea: false,
      // lineSmooth: false,
      fullWidth: true,
      axisX: {
        divisor: 5,
        labelInterpolationFnc: function(value) {
          return moment(value).format('H')
        }
      }
      // axisY: {
      //   onlyInteger: true
      // }
      // showArea: true
    }
    return (
      <ChartistGraph
        data={testData2}
        options={lineChartOptions}
        type={'Line'}
      />
    )
  }
}
export default AssetChartChartist
