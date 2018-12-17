import * as Colors from 'material-ui/styles/colors'
import {
  AutoSizer,
  Column,
  SortDirection,
  SortIndicator,
  Table
} from 'react-virtualized'
import { Col, Row } from 'react-flexbox-grid'
import { Link, withRouter } from 'react-router-dom'
import { formatPrice } from '../../_utils/format'
import { toUnitAmount } from '../../_utils/format'
import AssetsLineChartWrapper from '../../_atomic/atoms/assetsLineChartWrapper'
import BigNumber from 'bignumber.js'
import FlatButton from 'material-ui/FlatButton'
import PropTypes from 'prop-types'
import React, { PureComponent } from 'react'
import TokenIcon from '../../_atomic/atoms/tokenIcon'
import styles from './elementListAssets.module.css'
import utils from '../../_utils/utils'

class ElementListAssets extends PureComponent {
  static propTypes = {
    list: PropTypes.array.isRequired,
    location: PropTypes.object.isRequired,
    match: PropTypes.object.isRequired,
    renderCopyButton: PropTypes.func.isRequired,
    renderEtherscanButton: PropTypes.func.isRequired,
    dragoDetails: PropTypes.object.isRequired,
    assetsPrices: PropTypes.object.isRequired,
    assetsChart: PropTypes.object.isRequired
  }

  constructor(props, context) {
    super(props, context)
    const { list } = this.props
    const sortDirection = SortDirection.DESC
    const sortedList = list
    const rowCount = list.length
    this.state = {
      disableHeader: false,
      headerHeight: 30,
      height: 390,
      width: 600,
      hideIndexRow: false,
      overscanRowCount: 10,
      rowHeight: 90,
      rowCount: rowCount,
      scrollToIndex: undefined,
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
    const sortedList = list
    const rowCount = list.length
    this.setState({
      sortedList: sortedList,
      rowCount: rowCount
    })
  }

  componentWillUnmount = () => {
    // this.setState({
    //   sortedList: [],
    //   rowCount: 0
    // })
  }

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
    // console.log('render asset list')
    return (
      <Row>
        <Col xs={12}>
          <div
            style={{
              flex: '1 1 auto'
            }}
          >
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
                    label=""
                    cellDataGetter={({ rowData }) => rowData.symbol}
                    dataKey="symbol"
                    className={styles.column}
                    cellRenderer={({ cellData }) => this.renderIcon(cellData)}
                    flexShrink={1}
                  />
                  <Column
                    width={200}
                    disableSort
                    label="NAME"
                    cellDataGetter={({ rowData }) => rowData.name}
                    dataKey="name"
                    className={styles.column}
                    cellRenderer={({ rowData }) => this.renderName(rowData)}
                    flexShrink={1}
                  />
                  <Column
                    width={150}
                    disableSort
                    label={<div>HOLDING</div>}
                    cellDataGetter={({ rowData }) => rowData}
                    dataKey="holding"
                    className={styles.column}
                    cellRenderer={({ rowData }) => this.renderHolding(rowData)}
                    flexShrink={1}
                  />
                  <Column
                    width={125}
                    disableSort
                    label="VALUE"
                    cellDataGetter={({ rowData }) => rowData}
                    dataKey="values"
                    className={styles.columnValue}
                    cellRenderer={({ rowData }) => this.renderValue(rowData)}
                    flexGrow={1}
                  />
                  <Column
                    width={350}
                    disableSort
                    label={
                      <div style={{ width: '100%' }}>
                        <div className={styles.headerMarket}>MARKET 24H</div>
                      </div>
                    }
                    cellDataGetter={({ rowData }) => rowData}
                    dataKey="stats"
                    className={styles.column}
                    cellRenderer={({ rowData }) => this.renderChart(rowData)}
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

  renderChart(token) {
    try {
      if (typeof this.props.assetsChart[token.symbol] !== 'undefined') {
        const data = this.props.assetsChart[token.symbol].data
        return (
          <AssetsLineChartWrapper
            data={data}
            token={token}
            key={'chart' + token.symbol}
            borderWrapper={true}
          />
        )
      }
    } catch (error) {
      console.warn(error)
    }
  }

  actionButton(cellData, rowData) {
    const { match } = this.props
    const url =
      rowData.params.dragoId.value.c +
      '/' +
      utils.dragoISIN(cellData, rowData.params.dragoId.value.c)
    return (
      <FlatButton
        label="View"
        primary={true}
        containerElement={<Link to={match.path + '/' + url} />}
      />
    )
  }

  renderIcon(input) {
    return (
      <div>
        <TokenIcon size={40} symbol={input.toLowerCase()} />{' '}
      </div>
    )
  }

  renderName(token) {
    return (
      <Row>
        <Col xs={12} className={styles.symbolText}>
          <div className={styles.txIcon}> {this.renderTx(token)} </div>{' '}
          {token.symbol.toUpperCase()}{' '}
        </Col>{' '}
        <Col xs={12} className={styles.nameText}>
          {' '}
          {token.name}{' '}
        </Col>{' '}
      </Row>
    )
  }

  renderEthValue(ethValue) {
    return (
      <div>
        {' '}
        {new BigNumber(ethValue).toFixed(4)} <small> ETH </small>{' '}
      </div>
    )
  }

  renderHolding(token) {
    let price
    if (typeof this.props.assetsPrices[token.symbol] !== 'undefined') {
      if (Number(this.props.assetsPrices[token.symbol].priceEth)) {
        price = new BigNumber(
          this.props.assetsPrices[token.symbol].priceEth
        ).toFixed(5)
      } else {
        price = '-'
      }
    } else {
      price = '-'
    }
    return (
      <div key={token.symbol}>
        <Row>
          <Col xs={12}>
            <Row>
              <Col xs={12}>
                <div className={styles.holdingTitleText}> Amount </div>
              </Col>
              <Col xs={12}>
                {formatPrice(
                  toUnitAmount(
                    new BigNumber(token.balances.total),
                    token.decimals
                  ).toFixed(5)
                )}{' '}
                <small className={styles.symbolLegendText}>
                  {token.symbol.toUpperCase()}
                </small>
              </Col>
            </Row>
          </Col>
          <Col xs={12}>
            <Row>
              <Col xs={12}>
                <div className={styles.holdingTitleText}> Price </div>
              </Col>
              <Col xs={12}>
                {price} <small className={styles.symbolLegendText}> ETH </small>
              </Col>
            </Row>
          </Col>
        </Row>
      </div>
    )
  }

  renderBalance(token) {
    return (
      <div>
        {' '}
        {toUnitAmount(new BigNumber(token.balance), token.decimals).toFixed(
          4
        )}{' '}
        <small> {token.symbol.toUpperCase()} </small>{' '}
      </div>
    )
  }

  renderTx(token) {
    return (
      <span>
        {' '}
        {this.props.renderEtherscanButton(
          'token',
          token.address,
          this.props.dragoDetails.address
        )}{' '}
      </span>
    )
  }

  renderPrice(token) {
    if (typeof this.props.assetsPrices[token.symbol] !== 'undefined') {
      return (
        <div>
          {' '}
          {new BigNumber(
            this.props.assetsPrices[token.symbol].priceEth
          ).toFixed(7)}{' '}
        </div>
      )
    }
    return (
      <div>
        <small> - </small>{' '}
      </div>
    )
  }

  renderValue(token) {
    if (typeof this.props.assetsPrices[token.symbol] !== 'undefined') {
      if (!Number(this.props.assetsPrices[token.symbol].priceEth)) {
        return (
          <div className={styles.valueText}>
            <small> - </small>{' '}
          </div>
        )
      }
      return (
        <div className={styles.valueText}>
          {' '}
          {formatPrice(
            new BigNumber(this.props.assetsPrices[token.symbol].priceEth)
              .times(
                toUnitAmount(
                  new BigNumber(token.balances.total),
                  token.decimals
                ).toFixed(5)
              )
              .toFixed(5)
          )}{' '}
          <small className={styles.symbolLegendText}> ETH </small>{' '}
        </div>
      )
    }
    return (
      <div className={styles.valueText}>
        <small> - </small>{' '}
      </div>
    )
  }

  renderAction(action) {
    switch (action) {
      case 'BuyDrago':
        return (
          <span
            style={{
              color: Colors.green300,
              fontWeight: 600
            }}
          >
            {' '}
            BUY{' '}
          </span>
        )
      case 'SellDrago':
        return (
          <span
            style={{
              color: Colors.red300,
              fontWeight: 600
            }}
          >
            {' '}
            SELL{' '}
          </span>
        )
      case 'DragoCreated':
        return (
          <span
            style={{
              color: Colors.blue300,
              fontWeight: 600
            }}
          >
            CREATED{' '}
          </span>
        )
      default:
        return (
          <span
            style={{
              color: Colors.blue300,
              fontWeight: 600
            }}
          >
            UNKNOWN{' '}
          </span>
        )
    }
  }

  renderTime(timestamp) {
    return <span> {utils.dateFromTimeStamp(timestamp)} </span>
  }

  renderDrgValue(rowData) {
    return (
      <div>
        {' '}
        {new BigNumber(rowData.drgvalue).toFixed(4)}{' '}
        <small> {rowData.symbol} </small>{' '}
      </div>
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
        Full Name{' '}
        {sortBy === dataKey && <SortIndicator sortDirection={sortDirection} />}{' '}
      </div>
    )
  }

  _isSortEnabled() {
    const { list } = this.props
    const { rowCount } = this.state

    return rowCount <= list.size
  }

  _noRowsRenderer() {
    return <div className={styles.noRows}> No rows </div>
  }

  _onRowCountChange(event) {
    const rowCount = parseInt(event.target.value, 10) || 0

    this.setState({
      rowCount
    })
  }

  _onScrollToRowChange(event) {
    const { rowCount } = this.state
    let scrollToIndex = Math.min(rowCount - 1, parseInt(event.target.value, 10))

    if (isNaN(scrollToIndex)) {
      scrollToIndex = undefined
    }

    this.setState({
      scrollToIndex
    })
  }

  _rowClassName({ index }) {
    if (index < 0) {
      return styles.headerRow
    } else {
      return index % 2 === 0 ? styles.evenRow : styles.oddRow
    }
  }

  _sort({ sortBy, sortDirection }) {
    const sortedList = this._sortList({
      sortBy,
      sortDirection
    })

    this.setState({
      sortBy,
      sortDirection,
      sortedList
    })
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

export default withRouter(ElementListAssets)
