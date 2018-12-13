import { Col, Row } from 'react-flexbox-grid'
import ContentLoader from 'react-content-loader'
import FilterPoolsField from '../_atomic/atoms/filterPoolsField'
import Pagination from 'material-ui-pagination'
import PropTypes from 'prop-types'
import React, { Component } from 'react'
import SearchIcon from '../_atomic/atoms/searchIcon'
import styles from './elementListWrapper.module.css'
import utils from '../_utils/utils'

class ElementListWrapper extends Component {
  static propTypes = {
    list: PropTypes.array.isRequired,
    children: PropTypes.object.isRequired,
    loading: PropTypes.bool,
    autoLoading: PropTypes.bool,
    pagination: PropTypes.object,
    tableHeight: PropTypes.number,
    renderOptimization: PropTypes.bool,
    filterTool: PropTypes.bool,
    filterKeys: PropTypes.array
  }

  static defaultProps = {
    list: [],
    loading: false,
    autoLoading: true,
    pagination: {
      display: 5,
      number: 1
    },
    filterTool: false,
    filterKeys: [],
    tableHeight: 650,
    renderOptimization: true
  }

  state = {
    total: Math.ceil(this.props.list.length / 5),
    display: this.props.pagination.display,
    number: this.props.pagination.number,
    loading: true,
    filter: ''
  }

  td = null

  static getDerivedStateFromProps = (props, state) => {
    if (props.list !== state.list) {
      return {
        total: Math.ceil(props.list.length / state.display)
      }
    }
    return null
  }

  componentDidMount = () => {
    if (this.state.autoLoading)
      this.td = setTimeout(() => {
        this.setState({
          loading: false
        })
      }, 5000)
  }

  componentWillUnmount = () => {
    clearTimeout(this.td)
  }

  shouldComponentUpdate(nextProps, nextState) {
    let stateUpdate = true
    let propsUpdate = true
    if (nextProps.renderOptimization) {
      propsUpdate = !utils.shallowEqual(this.props.list, nextProps.list)
      stateUpdate = !utils.shallowEqual(this.state, nextState)
    }

    return stateUpdate || propsUpdate
  }

  filter = filter => {
    console.log(filter)
    this.setState(
      {
        filter
      },
      this.filterFunds
    )
  }

  filterPools = list => {
    const { filter } = this.state
    const filterValue = filter.trim().toLowerCase()
    const filterLength = filterValue.length
    return filterLength === 0
      ? list
      : list.filter(item =>
          this.props.filterKeys.reduce((acc, key) => {
            return (
              acc ||
              item[key].toLowerCase().slice(0, filterLength) === filterValue
            )
          }, false)
        )
  }

  render() {
    // Exstracting the list form props
    // and checking if the list === null
    const { list, ...rest } = this.props
    const { filter } = this.state
    if (
      Object.keys(list).length === 0 &&
      this.state.loading &&
      this.props.autoLoading
    ) {
      return (
        <div className={styles.loadingText}>
          Loading...
          <ContentLoader
            height={100}
            width={400}
            speed={2}
            primaryColor="#f3f3f3"
            secondaryColor="#ecebeb"
          >
            <rect x="0" y="10" rx="5" ry="5" width="400" height="10" />
            <rect x="0" y="25" rx="5" ry="5" width="400" height="10" />
            <rect x="0" y="40" rx="5" ry="5" width="400" height="10" />
            <rect x="0" y="55" rx="5" ry="5" width="400" height="10" />
            <rect x="0" y="70" rx="5" ry="5" width="400" height="10" />
            <rect x="0" y="85" rx="5" ry="5" width="400" height="10" />
            <rect x="0" y="100" rx="5" ry="5" width="400" height="10" />
          </ContentLoader>
        </div>
      )
    }
    // const slicedList = this.filterPools(
    //   list.slice(
    //     this.state.number * this.state.display - this.state.display,
    //     this.state.number * this.state.display
    //   )
    // )

    const slicedList =
      filter === ''
        ? list.slice(
            this.state.number * this.state.display - this.state.display,
            this.state.number * this.state.display
          )
        : this.filterPools(list)

    const newProps = { list: slicedList, ...rest }
    return (
      <Row>
        <Col xs={12}>
          <div className={styles.toolsContainer}>
            <div className={styles.paginatorTool}>
              <Pagination
                total={this.state.total}
                current={this.state.number}
                display={this.state.display}
                onChange={number => this.setState({ number })}
              />
            </div>
            <div className={styles.filterTool}>
              {this.props.filterTool && (
                <FilterPoolsField
                  filter={this.filter}
                  hintText={<SearchIcon text={'Search...'} />}
                  floatingLabelText=""
                />
              )}
            </div>
          </div>
        </Col>
        <Col xs={12} className={styles.list}>
          <div>{React.cloneElement(this.props.children, newProps)}</div>
        </Col>
      </Row>
    )
  }
}

export default ElementListWrapper
