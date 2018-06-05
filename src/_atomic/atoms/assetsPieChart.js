import { Doughnut } from 'react-chartjs-2'
import React, { Component } from "react";
import PropTypes from "prop-types";
import styles from './assetsPieChart.module.css'

export default class AssetsPieChart extends Component {

  static propTypes = {
    data: PropTypes.object.isRequired,
  };

  render() {

    const data = {
      datasets: [{
        data: [10, 20, 30]
      }],

      // These labels appear in the legend and in the tooltips when hovering different arcs
      // labels: [
      //   'Red',
      //   'Yellow',
      //   'Blue'
      // ]
    }

    return (
      <div style={{height: '200px', width: '200px', textAlign: 'center', margin: 'auto'}}>
        <Doughnut
          data={this.props.data}
          width={200}
          height={200}
          options={{
            legend: {
              display: true,
              position: 'bottom',
          }
          }}
        />
      </div>

    )
  }
}