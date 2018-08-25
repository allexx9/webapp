import {
  AutoSizer,
  Column,
  SortDirection,
  SortIndicator,
  Table
} from 'react-virtualized'
import { Col, Row } from 'react-flexbox-grid'
import { Link, withRouter } from 'react-router-dom'
import FlatButton from 'material-ui/FlatButton'
import PropTypes from 'prop-types'
import React, { PureComponent } from 'react'

import { DS } from '../../_utils/const.js'
import utils from '../../_utils/utils'

import styles from './elementListTransactions.module.css'

// const list = Immutable.List(generateRandomList());

class ElementListSupply extends PureComponent {
  static propTypes = {
    list: PropTypes.object.isRequired,
    location: PropTypes.object.isRequired,
    match: PropTypes.object.isRequired
  }

  constructor(props, context) {
    super(props, context)
    const { list } = this.props
    // const sortBy = 'symbol';
    const sortDirection = SortDirection.ASC
    const sortedList = list
      .sortBy(item => item.symbol)
      .update(
        list => (sortDirection === SortDirection.ASC ? list : list.reverse())
      )
    const rowCount = list.size

    this.state = {
      disableHeader: false,
      headerHeight: 30,
      height: 500,
      hideIndexRow: false,
      overscanRowCount: 10,
      rowHeight: 40,
      rowCount: rowCount,
      scrollToIndex: undefined,
      // sortBy,
      sortDirection,
      sortedList,
      useDynamicRowHeight: false
    }

    this._getRowHeight = this._getRowHeight.bind(this)
    this._headerRenderer = this._headerRenderer.bind(this)
    this._noRowsRenderer = this._noRowsRenderer.bind(this)
    this._onRowCountChange = this._onRowCountChange.bind(this)
    this._onScrollToRowChange = this._onScrollToRowChange.bind(this)
    this._rowClassName = this._rowClassName.bind(this)
    this._sort = this._sort.bind(this)
  }

  UNSAFE_componentWillReceiveProps(nextProps) {
    const { list } = nextProps
    // const sortBy = 'symbol';
    const sortDirection = SortDirection.ASC
    const sortedList = list
      .sortBy(item => item.symbol)
      .update(
        list => (sortDirection === SortDirection.ASC ? list : list.reverse())
      )
    const rowCount = list.size
    this.setState({
      sortedList: sortedList,
      rowCount: rowCount
    })

    console.log(`${this.constructor.name} -> UNSAFE_componentWillReceiveProps`)
  }

  render() {
    const {
      disableHeader,
      headerHeight,
      height,
      hideIndexRow,
      overscanRowCount,
      rowHeight,
      rowCount,
      scrollToIndex,
      sortBy,
      sortDirection,
      sortedList,
      useDynamicRowHeight,
      list
    } = this.state

    const rowGetter = ({ index }) => this._getDatum(sortedList, index)

    return (
      <Row>
        <Col xs={12}>
          <div style={{ flex: '1 1 auto' }}>
            <AutoSizer disableHeight>
              {({ width }) => (
                <Table
                  ref="Table"
                  disableHeader={disableHeader}
                  headerClassName={styles.headerColumn}
                  headerHeight={headerHeight}
                  height={height}
                  noRowsRenderer={this._noRowsRenderer}
                  overscanRowCount={overscanRowCount}
                  rowClassName={this._rowClassName}
                  rowHeight={
                    useDynamicRowHeight ? this._getRowHeight : rowHeight
                  }
                  rowGetter={rowGetter}
                  rowCount={rowCount}
                  scrollToIndex={scrollToIndex}
                  sort={this._sort}
                  sortBy={sortBy}
                  sortDirection={sortDirection}
                  width={width}
                >
                  <Column
                    width={150}
                    disableSort
                    label="SYMBOL"
                    cellDataGetter={({ rowData }) => rowData.symbol}
                    dataKey="symbol"
                    className={styles.exampleColumn}
                    cellRenderer={({ cellData }) => cellData}
                    flexShrink={1}
                  />
                  <Column
                    width={width}
                    disableSort
                    label="NAME"
                    cellDataGetter={({ rowData }) => rowData.name}
                    dataKey="name"
                    className={styles.exampleColumn}
                    cellRenderer={({ cellData }) => cellData}
                    flexShrink={1}
                  />
                  <Column
                    width={250}
                    disableSort
                    label="SUPPLY"
                    cellDataGetter={({ rowData }) => rowData.supply}
                    dataKey="drg"
                    className={styles.exampleColumn}
                    cellRenderer={({ rowData }) =>
                      this.renderDrgValue(rowData.supply)
                    }
                    flexShrink={1}
                  />
                  <Column
                    width={210}
                    disableSort
                    label="ACTIONS"
                    cellDataGetter={({ rowData }) => rowData.symbol}
                    dataKey="actions"
                    className={styles.exampleColumn}
                    cellRenderer={({ cellData, rowData }) =>
                      this.actionButton(cellData, rowData)
                    }
                    flexShrink={1}
                  />
                </Table>
              )}
            </AutoSizer>
          </div>
        </Col>
      </Row>
    )
  }

  actionButton(cellData, rowData) {
    const { match } = this.props
    const url =
      rowData.vaultId + '/' + utils.dragoISIN(cellData, rowData.vaultId)
    return (
      <FlatButton
        label="View"
        primary={true}
        containerElement={
          <Link to={utils.rootPath(match.path) + DS + 'vault/pools/' + url} />
        }
      />
    )
  }

  renderEthValue(ethValue) {
    return (
      <div>
        {ethValue} <small>ETH</small>
      </div>
    )
  }
  renderDrgValue(drgvalue) {
    return (
      <div>
        {drgvalue} <small>DRG</small>
      </div>
    )
  }

  _getDatum(list, index) {
    return list.get(index % list.size)
  }

  _getRowHeight({ index }) {
    const { list } = this.state

    return this._getDatum(list, index).size
  }

  _headerRenderer({ dataKey, sortBy, sortDirection }) {
    return (
      <div>
        Full Name
        {sortBy === dataKey && <SortIndicator sortDirection={sortDirection} />}
      </div>
    )
  }

  _isSortEnabled() {
    const { list } = this.props
    const { rowCount } = this.state

    return rowCount <= list.size
  }

  _noRowsRenderer() {
    return <div className={styles.noRows}>No rows</div>
  }

  _onRowCountChange(event) {
    const rowCount = parseInt(event.target.value, 10) || 0

    this.setState({ rowCount })
  }

  _onScrollToRowChange(event) {
    const { rowCount } = this.state
    let scrollToIndex = Math.min(rowCount - 1, parseInt(event.target.value, 10))

    if (isNaN(scrollToIndex)) {
      scrollToIndex = undefined
    }

    this.setState({ scrollToIndex })
  }

  _rowClassName({ index }) {
    if (index < 0) {
      return styles.headerRow
    } else {
      return index % 2 === 0 ? styles.evenRow : styles.oddRow
    }
  }

  _sort({ sortBy, sortDirection }) {
    const sortedList = this._sortList({ sortBy, sortDirection })

    this.setState({ sortBy, sortDirection, sortedList })
  }

  _sortList({ sortBy, sortDirection }) {
    const { list } = this.props
    return list
      .sortBy(item => {
        item.symbol
      })
      .update(
        list => (sortDirection === SortDirection.ASC ? list : list.reverse())
      )
  }

  _updateUseDynamicRowHeight(value) {
    this.setState({
      useDynamicRowHeight: value
    })
  }
}

export default withRouter(ElementListSupply)
