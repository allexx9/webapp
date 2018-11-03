import './App.css'
import 'chartist/dist/chartist.min.css'
import Chart from './Chart'
import React, { Component } from 'react'

class App extends Component {
  render() {
    return (
      <div className="App">
        <h2>Chartist test</h2>
        <Chart />
      </div>
    )
  }
}

export default App
