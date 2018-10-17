import PropTypes from 'prop-types'
import React, { Component } from 'react'
import TextField from 'material-ui/TextField'

class FilterFunds extends Component {
  static propTypes = {
    filter: PropTypes.func.isRequired
  }

  filter = (event, newValue) => {
    this.props.filter(newValue.trim().toLowerCase())
  }

  render() {
    return (
      <TextField
        hintText=""
        floatingLabelText="Search pools"
        floatingLabelFixed={true}
        onChange={this.filter}
        style={{
          width: '100%',
          fontSize: '16px'
        }}
      />
    )
  }
}

export default FilterFunds
