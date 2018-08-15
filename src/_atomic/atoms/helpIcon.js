import React, { Component } from 'react';
import PropTypes from 'prop-types';
import HelpOutline from 'material-ui/svg-icons/action/help-outline'
import ReactTooltip from 'react-tooltip'
import styles from './helpIcon.module.css';

export default class HelpIcon extends Component {
  
  static propTypes = {
    style: PropTypes.object,
    helpText: PropTypes.string.isRequired,
    helpReadMoreLink: PropTypes.string,
  };

  static defaultProps = {
    style: {},
    helpText: '',
    helpReadMoreLink: '',
  };


  render() {
    return (
      <div data-tip={this.props.helpText}> 
        <HelpOutline style={this.props.style} />
        <ReactTooltip 
        effect="solid" 
        place="top" 
        type="light"
        multiline={true}
        // border={true}
        className={styles.helpicon}
        delayHide={500}
        />
      </div>
      
    )
  }
}
