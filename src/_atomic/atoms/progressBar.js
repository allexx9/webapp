import LinearProgress from 'material-ui/LinearProgress'
import PropTypes from 'prop-types'
import React, { Component } from 'react'
import styles from './progressBar.module.css'

export default class ProgressBar extends Component {
  static propTypes = {
    progress: PropTypes.number.isRequired
  }

  render() {
    const { progress } = this.props
    return (
      <div className={styles.progressBarContainer}>
        <LinearProgress mode="determinate" value={progress} />
      </div>
    )
  }
}
