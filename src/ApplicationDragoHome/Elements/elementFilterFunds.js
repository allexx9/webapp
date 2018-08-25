import PropTypes from 'prop-types'
import React, { Component } from 'react'
import TextField from 'material-ui/TextField'

class FilterFunds extends Component {
  static propTypes = {
    list: PropTypes.object,
    filterList: PropTypes.func
  }

  static defaultProps = {
    list: {},
    filterList: val => val
  }

  filterFunds = (event, newValue) => {
    const { list, filterList } = this.props
    const inputValue = newValue.trim().toLowerCase()
    const inputLength = inputValue.length
    const funds = list.toJS()
    const filteredFunds = () => {
      return inputLength === 0
        ? list.toJS()
        : funds.filter(
            fund =>
              fund.params.name.value.toLowerCase().slice(0, inputLength) ===
              inputValue
          )
    }
    filterList(filteredFunds())
  }

  render() {
    return (
      <TextField
        hintText=""
        floatingLabelText="Search pools"
        floatingLabelFixed={true}
        onChange={this.filterFunds}
        style={{
          width: '100%',
          fontSize: '16px'
        }}
      />
    )
  }
}

export default FilterFunds
