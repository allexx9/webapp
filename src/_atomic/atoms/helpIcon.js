import React, { Component } from 'react';
import PropTypes from 'prop-types';
import HelpOutline from 'material-ui/svg-icons/action/help-outline'

export default class HelpIcon extends Component {
  
  static propTypes = {
    style: PropTypes.object,
    helpText: PropTypes.string.isRequired,
    helpReadMoreLink: PropTypes.string,
    color: PropTypes.string
  };

  static defaultProps = {
    style: {},
    helpText: '',
    helpReadMoreLink: '',
  };


  render() {
    return (
      <div> 
        <HelpOutline style={this.props.style} />
      </div>
      
    )
  }
}
