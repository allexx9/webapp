import React, { Component } from 'react';


import styles from './elementInfoTable.module.css';

import PropTypes from 'prop-types';
import {
  Table,
  TableBody,
  TableHeader,
  TableHeaderColumn,
  TableRow,
  TableRowColumn,
} from 'material-ui/Table';

export default class InfoTable extends Component {

  static propTypes = {
    rows: PropTypes.array,
    tableHeader: PropTypes.array,
    columnsStyle: PropTypes.array,
    tableStyle: PropTypes.string
  };

  renderColumn = (row) =>{
    const {columnsStyle} = this.props
    return row.map((cell, index) => {
      const key = 'infoTableCol'+index
      const rowCell = index == 0 
        ? <TableRowColumn className={columnsStyle[index]} key={key}>{cell}</TableRowColumn>
        : <TableRowColumn className={columnsStyle[index]} key={key}>{cell}</TableRowColumn>
      return rowCell
    })
  }

  renderRow = (rows) => {
    return rows.map((row, index) => {
      return (<TableRow hoverable={false} key={'infoTableRow'+index}>
        {this.renderColumn(row)}
      </TableRow>)
    })
  }

  render () {
    const {rows} = this.props
    return (
        <Table selectable={false}>
          <TableBody displayRowCheckbox={false}>
          {this.renderRow(rows)}
          </TableBody>
        </Table>
    );
  }
}
