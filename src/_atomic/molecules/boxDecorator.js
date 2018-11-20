// import Immutable from 'immutable'
// import { Col, Grid, Row } from 'react-flexbox-grid'
import { connect } from 'react-redux'
import PropTypes from 'prop-types'
import React, { Component } from 'react'
import classNames from 'classnames'
import styles from './boxDecorator.module.css'

function mapStateToProps(state) {
  return {
    exchange: {
      ui: state.exchange.ui
    }
  }
}

class BoxDecorator extends Component {
  static propTypes = {
    boxName: PropTypes.string.isRequired,
    children: PropTypes.object.isRequired,
    exchange: PropTypes.object.isRequired
  }

  static defaultProps = {}

  state = {}

  componentDidMount = () => {}

  createClassesArray = () => {
    const {
      boxName,
      exchange: {
        ui: { panels }
      }
    } = this.props
    const { disabled = true } = panels[boxName]
    let classes = Array(0)
    if (disabled) {
      classes.push(styles.disabledBox)
    }
    return classes
  }

  render() {
    // console.log(this.props)
    const {
      boxName,
      exchange: {
        ui: { panels }
      }
    } = this.props
    const { disabledMsg = true } = panels[boxName]
    return (
      <div style={{ width: '100%', position: 'relative' }}>
        <div className={styles.messageContainer}>
          <div id={'disabledMessage' + boxName}>{disabledMsg}</div>
        </div>
        <div
          id={'boxDecoratorContainer' + boxName}
          className={classNames(this.createClassesArray())}
        >
          {React.cloneElement(this.props.children)}
        </div>
      </div>
    )
  }
}

export default connect(mapStateToProps)(BoxDecorator)
