// import { APP, DS } from '../../_utils/const.js'
import { Link } from 'react-router-dom'
// import PropTypes from 'prop-types'
import React, { Component } from 'react'
import TopMenuButtonLong from '../atoms/topMenuButtonLong'
import styles from './topMenuLinkLong.module.css'
// import utils from '../../_utils/utils'

class TopMenuLinkLong extends Component {
  static propTypes = {
    // buttonProps: PropTypes.object.isRequired
    // dropDownContentProps: PropTypes.object.iseRequired
  }
  shouldComponentUpdate(nextProps) {
    let propsUpdate = false
    this.props.label !== nextProps.label
      ? (propsUpdate = true)
      : (propsUpdate = false)
    return propsUpdate
  }

  render() {
    const { selected, link, ...other } = this.props
    let containerElement = ''
    if (link !== null) {
      containerElement = <Link to={link} />
    }
    let buttonStyle
    selected
      ? (buttonStyle = styles.topBarButtonSelected)
      : (buttonStyle = styles.topBarButton)
    return (
      <div>
        {' '}
        <TopMenuButtonLong
          {...other}
          className={buttonStyle}
          containerElement={containerElement}
          labelStyle={{ fontWeight: 700, fontSize: '14px' }}
        />
      </div>
    )
  }
}

export default TopMenuLinkLong
