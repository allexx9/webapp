// import Immutable from 'immutable'
import Loading from '../_atomic/atoms/loading'
import Pagination from 'material-ui-pagination'
import PropTypes from 'prop-types'
import React, { Component } from 'react'
import styles from './elementListWrapper.module.css'
import utils from '../_utils/utils'

class ElementListWrapper extends Component {
  static propTypes = {
    list: PropTypes.array.isRequired,
    children: PropTypes.object.isRequired,
    loading: PropTypes.bool,
    pagination: PropTypes.object
  }

  static defaultProps = {
    loading: false,
    pagination: {
      display: 5,
      number: 1
    }
  }

  state = {
    total: Math.ceil(this.props.list.length / 5),
    display: this.props.pagination.display,
    number: this.props.pagination.number
  }

  static getDerivedStateFromProps = (props, state) => {
    if (props.list !== state.list) {
      return {
        total: Math.ceil(props.list.length / state.display)
      }
    }
    return null
  }

  shouldComponentUpdate(nextProps, nextState) {
    let stateUpdate = true
    let propsUpdate = true
    propsUpdate = !utils.shallowEqual(this.props.list, nextProps.list)
    stateUpdate = !utils.shallowEqual(this.state, nextState)
    return stateUpdate || propsUpdate
  }

  render() {
    // Exstracting the list form props
    // and checking if the list === null
    const { list, ...rest } = this.props
    if (Object.keys(list).length === 0 || this.props.loading) {
      return <Loading />
    }
    const slicedList = list.slice(
      this.state.number * this.state.display - this.state.display,
      this.state.number * this.state.display
    )
    const newProps = { list: slicedList, ...rest }
    return (
      <div>
        <div className={styles.paginatorContainer}>
          <Pagination
            total={this.state.total}
            current={this.state.number}
            display={this.state.display}
            onChange={number => this.setState({ number })}
          />
        </div>
        <div>{React.cloneElement(this.props.children, newProps)}</div>
      </div>
    )
  }
}

export default ElementListWrapper
