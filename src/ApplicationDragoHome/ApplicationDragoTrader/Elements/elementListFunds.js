import { Grid, Row, Col } from 'react-flexbox-grid';
import { Link, Route, withRouter, HashRouter } from 'react-router-dom'
import { List, Column, Table, AutoSizer, SortDirection, SortIndicator } from 'react-virtualized';
import FlatButton from 'material-ui/FlatButton';
import moment from 'moment';
import PropTypes from 'prop-types';
import React, {PureComponent} from 'react';

import { generateRandomList } from './utils';
import {LabeledInput, InputRow} from './labeledInput';
import utils from '../../../utils/utils'

import styles from './elementListFunds.module.css';
import 'react-virtualized/styles.css'

// const list = Immutable.List(generateRandomList());

class ElementListFunds extends PureComponent {

  static PropTypes = {
    allEvents: PropTypes.object.isRequired,
    accountsInfo: PropTypes.object.isRequired, 
    list: PropTypes.object.isRequired,
    location: PropTypes.object.isRequired,
    match: PropTypes.object.isRequired,
  };

  constructor(props, context) {
    super(props, context);
    const { accountsInfo, list } = this.props
    const sortBy = 'symbol';
    const sortDirection = SortDirection.ASC;
    const sortedList = this._sortList({sortBy, sortDirection});
    const rowCount = list.size

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
      useDynamicRowHeight: false
    };

    this._getRowHeight = this._getRowHeight.bind(this);
    this._headerRenderer = this._headerRenderer.bind(this);
    this._noRowsRenderer = this._noRowsRenderer.bind(this);
    this._onRowCountChange = this._onRowCountChange.bind(this);
    this._onScrollToRowChange = this._onScrollToRowChange.bind(this);
    this._rowClassName = this._rowClassName.bind(this);
    this._sort = this._sort.bind(this);
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

    const { accountsInfo } = this.props

    // console.log(allEvents)

    // // var obj = {"1":5,"2":7,"3":0,"4":0,"5":0,"6":0,"7":0,"8":0,"9":0,"10":0,"11":0,"12":0}
    // var result = Object.keys(allEvents).map(function(key) {
    //   return [Number(key), allEvents[key]];
    // });
    
    // console.log(result);

    const rowGetter = ({index}) => this._getDatum(sortedList, index);


    return (
      
        <Row>
          <Col xs={12}>
          <div style={{ flex: '1 1 auto' }}>
          {/* <label className={styles.checkboxLabel}>
            <input
              aria-label="Use dynamic row heights?"
              checked={useDynamicRowHeight}
              className={styles.checkbox}
              type="checkbox"
              onChange={event =>
                this._updateUseDynamicRowHeight(event.target.checked)}
            />
            Use dynamic row heights?
          </label> */}

          {/* <label className={styles.checkboxLabel}>
            <input
              aria-label="Hide index?"
              checked={hideIndexRow}
              className={styles.checkbox}
              type="checkbox"
              onChange={event =>
                this.setState({hideIndexRow: event.target.checked})}
            />
            Hide index?
          </label>

          <label className={styles.checkboxLabel}>
            <input
              aria-label="Hide header?"
              checked={disableHeader}
              className={styles.checkbox}
              type="checkbox"
              onChange={event =>
                this.setState({disableHeader: event.target.checked})}
            />
            Hide header?
          </label> */}
        
        {/* <InputRow>
          <LabeledInput
            label="Num rows"
            name="rowCount"
            onChange={this._onRowCountChange}
            value={rowCount}
          />
          <LabeledInput
            label="Scroll to"
            name="onScrollToRow"
            placeholder="Index..."
            onChange={this._onScrollToRowChange}
            value={scrollToIndex || ''}
          />
          <LabeledInput
            label="List height"
            name="height"
            onChange={event =>
              this.setState({height: parseInt(event.target.value, 10) || 1})}
            value={height}
          />
          <LabeledInput
            disabled={useDynamicRowHeight}
            label="Row height"
            name="rowHeight"
            onChange={event =>
              this.setState({
                rowHeight: parseInt(event.target.value, 10) || 1,
              })}
            value={rowHeight}
          />
          <LabeledInput
            label="Header height"
            name="headerHeight"
            onChange={event =>
              this.setState({
                headerHeight: parseInt(event.target.value, 10) || 1,
              })}
            value={headerHeight}
          />
          <LabeledInput
            label="Overscan"
            name="overscanRowCount"
            onChange={event =>
              this.setState({
                overscanRowCount: parseInt(event.target.value, 10) || 0,
              })}
            value={overscanRowCount}
          />
        </InputRow> */}


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
                {!hideIndexRow && (
                  <Column
                    label="Index"
                    cellDataGetter={({rowData}) => rowData.params.dragoID.value.c}
                    dataKey="index"
                    disableSort={!this._isSortEnabled()}
                    width={60}
                  />
                )}
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
                  label="Drago Code"
                  cellDataGetter={({rowData}) => rowData.params.symbol.value}
                  dataKey="dragocode"
                  className={styles.exampleColumn}
                  cellRenderer={({cellData, rowData}) => utils.dragoISIN(cellData, rowData.params.dragoID.value.c)}
                  flexGrow={1}
                />
                <Column
                  width={100}
                  label="Symbol"
                  cellDataGetter={({rowData}) => rowData.params.symbol.value.toUpperCase()}
                  dataKey="symbol"
                  className={styles.exampleColumn}
                  cellRenderer={({cellData}) => cellData}
                />
                <Column
                  width={210}
                  disableSort
                  label="Name"
                  cellDataGetter={({rowData}) => rowData.params.name.value}
                  dataKey="name"
                  className={styles.exampleColumn}
                  cellRenderer={({cellData}) => cellData}
                  flexGrow={1}
                />
                <Column
                  width={210}
                  disableSort
                  label="Actions"
                  cellDataGetter={({rowData}) => rowData.params.symbol.value}
                  dataKey="actions"
                  className={styles.exampleColumn}
                  cellRenderer={({cellData, rowData}) => this.actionButton(cellData, rowData)}
                  flexShrink={1}
                />
              </Table>
            )}
          </AutoSizer>
          </div>
      </Col>
      </Row>
      
    );
  }

  actionButton (cellData, rowData) {
    const { match} = this.props;
    const url =  rowData.params.dragoID.value.c + "/" + utils.dragoISIN(cellData, rowData.params.dragoID.value.c)
    return <FlatButton label="View" primary={true} containerElement={<Link to={match.path+"/"+url} />} />
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
    const {list} = this.props;
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

    this.setState({sortBy, sortDirection, sortedList});
  }

  _sortList({sortBy, sortDirection}) {
    const {list} = this.props;
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

export default withRouter(ElementListFunds)