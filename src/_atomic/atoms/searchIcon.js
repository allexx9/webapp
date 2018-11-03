import PropTypes from 'prop-types'
import React, { Component } from 'react'
import Search from 'material-ui/svg-icons/action/search'
import styles from './searchIcon.module.css'

export default class SearchIcon extends Component {
  static propTypes = {
    text: PropTypes.string.isRequired
  }

  static defaultProps = {
    text: 'Search...'
  }

  render() {
    return (
      <div>
        <div className={styles.icon}>
          <Search color="#0000004d" />
        </div>
        <div className={styles.text}> {this.props.text}</div>
      </div>
    )
  }
}
