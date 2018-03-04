import { Row, Col } from 'react-flexbox-grid';
import { Link, withRouter } from 'react-router-dom'
import { Column, Table, AutoSizer, SortDirection, SortIndicator } from 'react-virtualized';
import FlatButton from 'material-ui/FlatButton';
import BigNumber from 'bignumber.js';

import PropTypes from 'prop-types';
import React, {PureComponent} from 'react';
import utils from '../../utils/utils'

import styles from './elementListVaults.module.css';
import 'react-virtualized/styles.css'


class ElementListVaults extends PureComponent {

  static propTypes = {
    list: PropTypes.object.isRequired,
    location: PropTypes.object.isRequired,
    match: PropTypes.object.isRequired,
    poolType: PropTypes.string.isRequired
  };

  constructor(props, context) {
    super(props, context);
    const { list } = this.props

    // Saving the list in the state
    this.state = {
      list: list,
    };

    // Preparing the sorted list to be displayed
    const sortBy = 'symbol';
    const sortDirection = SortDirection.ASC;
    const sortedList = this._sortList({sortBy, sortDirection, });
    const rowCount = list.size

    // Initializing the state
    this.state = {
      disableHeader: false,
      headerHeight: 30,
      height: 600,
      hideIndexRow: false,
      overscanRowCount: 10,
      rowHeight: 40,
      rowCount: rowCount,
      scrollToIndex: undefined,
      sortBy,
      sortDirection,
      sortedList,
      useDynamicRowHeight: false,
      list: list
    };

    this._getRowHeight = this._getRowHeight.bind(this);
    this._headerRenderer = this._headerRenderer.bind(this);
    this._noRowsRenderer = this._noRowsRenderer.bind(this);
    this._onRowCountChange = this._onRowCountChange.bind(this);
    this._onScrollToRowChange = this._onScrollToRowChange.bind(this);
    this._rowClassName = this._rowClassName.bind(this);
    this._sort = this._sort.bind(this);
  }

  componentWillReceiveProps(nextProps) {
    // Updating the list
    const rowCount = nextProps.list.size
    const {list, sortDirection, sortBy} = nextProps
    const sortedList = list
      .sortBy(item => item.params.symbol.value)
      .update(
        list => (sortDirection === SortDirection.DESC ? list.reverse() : list),
      );
    this.setState({
      sortedList, sortedList,
      rowCount: rowCount,
      list: nextProps.list
    })
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
    } = this.state;

    const rowGetter = ({index}) => this._getDatum(sortedList, index);
    const label = this.props.poolType === 'vault' ? "VAULT CODE" : "FUND CODE"

    return (
      <Row>
        <Col xs={12}>
          <AutoSizer disableHeight>
            {({width}) => (
              <Table
                ref="Table"
                disableHeader={disableHeader}
                headerClassName={styles.headerColumn}
                headerHeight={headerHeight}
                height={height}
                noRowsRenderer={this._noRowsRenderer}
                overscanRowCount={overscanRowCount}
                rowClassName={this._rowClassName}
                rowHeight={useDynamicRowHeight ? this._getRowHeight : rowHeight}
                rowGetter={rowGetter}
                rowCount={rowCount}
                scrollToIndex={scrollToIndex}
                sort={this._sort}
                sortBy={sortBy}
                sortDirection={sortDirection}
                width={width}>
                {/* {!hideIndexRow && (
                  <Column
                    label="Index"
                    cellDataGetter={({rowData}) => rowData.params.dragoId.value.c}
                    dataKey="index"
                    // disableSort={!this._isSortEnabled()}
                    width={60}
                  />
                )} */}
                {/* <Column
                  width={100}
                  disableSort
                  label="Blocknumber"
                  cellDataGetter={({rowData}) => rowData.blockNumber.c[0]}
                  dataKey="blocknumber"
                  className={styles.exampleColumn}
                  cellRenderer={({cellData}) => cellData}
                /> */}
                <Column
                  width={100}
                  disableSort
                  label="VAULT CODE"
                  cellDataGetter={({rowData}) => rowData.params.symbol.value}
                  dataKey="vaultcode"
                  className={styles.exampleColumn}
                  cellRenderer={({rowData}) => this.renderISIN(rowData)}
                  flexGrow={1}
                />
                <Column
                  width={100}
                  label="SYMBOL"
                  cellDataGetter={({rowData}) => rowData.params.symbol.value.toUpperCase()}
                  dataKey="symbol"
                  className={styles.exampleColumn}
                  cellRenderer={({cellData}) => cellData}
                />
                <Column
                  width={210}
                  disableSort
                  label="NAME"
                  cellDataGetter={({rowData}) => rowData.params.name.value}
                  dataKey="name"
                  className={styles.exampleColumn}
                  cellRenderer={({rowData}) => this.renderName(rowData.params.name.value)}
                  flexGrow={1}
                />
                <Column
                  width={210}
                  disableSort
                  label="ACTIONS"
                  cellDataGetter={({rowData}) => rowData.params.symbol.value}
                  dataKey="actions"
                  className={styles.exampleColumn}
                  cellRenderer={({cellData, rowData}) => this.actionButton(rowData)}
                  flexShrink={1}
                />
              </Table>
            )}
          </AutoSizer>
        </Col>
      </Row>
      
    );
  }

  renderISIN(rowData) {
    console.log(rowData)
    const vaultId = new BigNumber(rowData.params.vaultId.value).toFixed()
    const symbol = rowData.params.symbol.value
    return (
      utils.dragoISIN(symbol, vaultId)
    )
  }

  actionButton (rowData) {
    const { match} = this.props;
    const vaultId = new BigNumber(rowData.params.vaultId.value).toFixed()
    const symbol = rowData.params.symbol.value
    console.log(match.path)
    const url =  vaultId + "/" + utils.dragoISIN(symbol, vaultId)
    return <FlatButton label="View" primary={true} containerElement={<Link to={match.path+"/"+url} />} />
  }

  renderLabel(rowData) {
    console.log(rowData)
    if(typeof rowData.params.vaultId !== 'undefined') {
      return "bla"
    }
    return (
      <div>DRAGO CODE</div>
    )
  }

  renderName(drgname) {
    const name = drgname.trim()
    return (
      <div>{name.charAt(0).toUpperCase() + name.slice(1)}</div>
    )
  }

  _getDatum(list, index) {
    return list.get(index % list.size);
  }

  _getRowHeight({index}) {
    const {list} = this.state;

    return this._getDatum(list, index).size;
  }

  _headerRenderer({dataKey, sortBy, sortDirection}) {
    return (
      <div>
        Full Name
        {sortBy === dataKey && <SortIndicator sortDirection={sortDirection} />}
      </div>
    );
  }

  _isSortEnabled() {
    const {list} = this.state;
    const {rowCount} = this.state;

    return rowCount <= list.size;
  }

  _noRowsRenderer() {
    return <div className={styles.noRows}>No rows</div>;
  }

  _onRowCountChange(event) {
    const rowCount = parseInt(event.target.value, 10) || 0;

    this.setState({rowCount});
  }

  _onScrollToRowChange(event) {
    const {rowCount} = this.state;
    let scrollToIndex = Math.min(
      rowCount - 1,
      parseInt(event.target.value, 10),
    );

    if (isNaN(scrollToIndex)) {
      scrollToIndex = undefined;
    }

    this.setState({scrollToIndex});
  }

  _rowClassName({index}) {
    if (index < 0) {
      return styles.headerRow;
    } else {
      return index % 2 === 0 ? styles.evenRow : styles.oddRow;
    }
  }

  _sort({sortBy, sortDirection}) {
    const sortedList = this._sortList({sortBy, sortDirection});

    this.setState({ 
      sortBy, 
      sortDirection, 
      sortedList
    });
  }

  _sortList({sortBy, sortDirection}) {
    const {list} = this.state
    return list
      .sortBy(item => item.params.symbol.value)
      .update(
        list => (sortDirection === SortDirection.DESC ? list.reverse() : list),
      );
  }

  _updateUseDynamicRowHeight(value) {
    this.setState({
      useDynamicRowHeight: value,
    });
  }
}

export default withRouter(ElementListVaults)