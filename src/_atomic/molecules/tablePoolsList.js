import { Actions } from '../../_redux/actions'
import {
  AutoSizer,
  Column,
  SortDirection,
  SortIndicator,
  Table,
  createTableMultiSort
} from 'react-virtualized'
import { Col, Row } from 'react-flexbox-grid'
import { Link, withRouter } from 'react-router-dom'
import { connect } from 'react-redux'
import BlokiesIcon from '../atoms/blokiesIcon'
import FlatButton from 'material-ui/FlatButton'
import PoolCode from '../atoms/poolCode'
import PropTypes from 'prop-types'
import React, { PureComponent } from 'react'
import styles from './tablePoolsList.module.css'
import utils from '../../_utils/utils'

class TablePoolsList extends PureComponent {
  static propTypes = {
    list: PropTypes.array.isRequired,
    location: PropTypes.object.isRequired,
    match: PropTypes.object.isRequired,
    tableHeight: PropTypes.number,
    tableWidth: PropTypes.number,
    getInfoOnListUpdate: PropTypes.bool,
    dispatch: PropTypes.func.isRequired
  }

  static defaultProps = {
    tableHeight: 650,
    tableWidth: 600,
    getInfoOnListUpdate: true
  }

  constructor(props, context) {
    super(props, context)
    this._getRowHeight = this._getRowHeight.bind(this)
    this._headerRenderer = this._headerRenderer.bind(this)
    this._noRowsRenderer = this._noRowsRenderer.bind(this)
    this._onRowCountChange = this._onRowCountChange.bind(this)
    this._onScrollToRowChange = this._onScrollToRowChange.bind(this)
    this._rowClassName = this._rowClassName.bind(this)
    this._sort = this._sort.bind(this)
  }

  state = {}

  static getDerivedStateFromProps(props) {
    const { list } = props
    const sortedList = list
    const rowCount = list.length
    const sortDirection = SortDirection.DESC
    props.dispatch(Actions.pools.getPoolsGroupDetails([1, 2, 3]))
    return {
      sortedList,
      rowCount,
      disableHeader: false,
      headerHeight: 30,
      height: props.tableHeight,
      width: props.tableWidth,
      hideIndexRow: false,
      overscanRowCount: 10,
      rowHeight: 60,
      scrollToIndex: undefined,
      sortDirection,
      useDynamicRowHeight: false
    }
  }

  // const headerRenderer = ({ dataKey, label }) => {
  //   const showSortIndicator = sortState.sortBy.includes(dataKey);
  //   return (
  //     <>
  //       <span title={label}>{label}</span>
  //       {showSortIndicator && (
  //         <SortIndicator sortDirection={sortState.sortDirection[dataKey]} />
  //       )}
  //     </>
  //   );
  // };

  render() {
    const {
      disableHeader,
      headerHeight,
      height,
      overscanRowCount,
      rowHeight,
      rowCount,
      scrollToIndex,
      sortBy,
      sortDirection,
      sortedList,
      useDynamicRowHeight
    } = this.state

    const rowGetter = ({ index }) => this._getDatum(sortedList, index)

    return (
      <Row>
        <Col xs={12}>
          <div style={{ flex: '1 1 auto' }}>
            <AutoSizer disableHeight>
              {({ width }) => (
                <Table
                  id={'assets-table'}
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
                    width={50}
                    disableSort
                    label="&nbsp;"
                    cellDataGetter={({ rowData }) => rowData.address}
                    dataKey="symbol"
                    className={styles.exampleColumn}
                    cellRenderer={({ rowData }) => this.renderIcon(rowData)}
                    flexShrink={1}
                  />
                  <Column
                    width={200}
                    disableSort
                    label="NAME"
                    cellDataGetter={({ rowData }) => rowData.name}
                    dataKey="name"
                    className={styles.exampleColumn}
                    cellRenderer={({ rowData }) => this.renderName(rowData)}
                    flexShrink={1}
                  />
                  <Column
                    width={150}
                    disableSort
                    label="CODE"
                    cellDataGetter={({ rowData }) => rowData}
                    dataKey="code"
                    className={styles.exampleColumn}
                    cellRenderer={({ rowData }) => this.renderISIN(rowData)}
                    flexShrink={1}
                  />
                  <Column
                    width={210}
                    disableSort
                    label="ACTIONS"
                    cellDataGetter={({ rowData }) => rowData.symbol}
                    dataKey="actions"
                    headerStyle={{ textAlign: 'right', paddingRight: '25px' }}
                    className={styles.exampleColumn}
                    cellRenderer={({ rowData }) => this.actionButton(rowData)}
                    flexGrow={1}
                  />
                </Table>
              )}
            </AutoSizer>
          </div>
        </Col>
      </Row>
    )
  }

  renderISIN = rowData => {
    const id = rowData.details.dragoId || rowData.details.id
    return <PoolCode symbol={rowData.details.symbol} id={id} />
  }

  actionButton(rowData) {
    const { match } = this.props
    const id = rowData.details.dragoId || rowData.details.id
    const url = id + '/' + utils.poolISIN(rowData.details.symbol, id)
    let poolType = match.path.includes('vault') ? 'vault' : 'drago'
    return (
      <div className={styles.actionButtonContainer}>
        <FlatButton
          label="View"
          primary={true}
          containerElement={
            <Link
              to={utils.rootPath(match.path) + '/' + poolType + '/pools/' + url}
            />
          }
        />
      </div>
    )
  }

  renderIcon(rowData) {
    return (
      <div className={styles.fundIcon}>
        <BlokiesIcon seed={rowData.details.name} size={12} scale={3} />
      </div>
    )
  }

  renderName(rowData) {
    return (
      <Row>
        <Col xs={12} className={styles.symbolText}>
          {rowData.details.symbol.toUpperCase()}
        </Col>
        <Col xs={12} className={styles.nameText}>
          {rowData.details.name}
        </Col>
      </Row>
    )
  }

  _getDatum(list, index) {
    return list[index]
  }

  _getRowHeight({ index }) {
    const { list } = this.state
    return this._getDatum(list, index).length
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
      .sortBy(item => item.timestamp)
      .update(list =>
        sortDirection === SortDirection.DESC ? list : list.reverse()
      )
  }

  _updateUseDynamicRowHeight(value) {
    this.setState({
      useDynamicRowHeight: value
    })
  }
}

export default withRouter(connect()(TablePoolsList))
