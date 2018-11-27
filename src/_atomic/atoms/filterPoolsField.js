import PropTypes from 'prop-types'
import React, { Component } from 'react'
import TextField from 'material-ui/TextField'

class FilterPoolsField extends Component {
  static propTypes = {
    filter: PropTypes.func.isRequired,
    floatingLabelText: PropTypes.string.isRequired,
    hintText: PropTypes.oneOfType([PropTypes.string, PropTypes.object])
  }

  static defaultProps = {
    floatingLabelText: 'Search pools',
    hintText: ''
  }

  filter = (event, newValue) => {
    this.props.filter(newValue.trim().toLowerCase())
  }

  render() {
    return (
      <TextField
        hintText={this.props.hintText}
        floatingLabelText={this.props.floatingLabelText}
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

export default FilterPoolsField
