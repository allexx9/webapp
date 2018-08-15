import HelpIcon from '../../_atomic/atoms/helpIcon'
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Divider from 'material-ui/Divider';
import styles from './sectionHeader.module.css';


export default class SectionHeader extends Component {

  static propTypes = {
    titleText: PropTypes.string.isRequired,
    textStyle: PropTypes.object.isRequired,
    help: PropTypes.bool,
    helpText: PropTypes.string,
    helpReadMoreLink: PropTypes.string,
  };

  static defaultProps = {
    help: false,
    helpText: '',
    textStyle: { backgroundColor: '#054186' },
    helpReadMoreLink: ''
  };

  

  render() {

    const helpIconStyle = {
      height: '20px',
      width: '20px',
      color: 'white'
    }

    const renderHelp = () => {
      return (
        <div className={styles.help}>
          <HelpIcon 
          style={helpIconStyle} 
          helpText={this.props.helpText}
          />
        </div>
      )
    }

    return (
      <div className={styles.container} 
          >
          <div className={styles.actionButtonContainer}>
            {this.props.actionButton}
          </div>
          <div className={styles.title} style={this.props.textStyle}>
            {this.props.help ? renderHelp() : null}
            {this.props.titleText}
          </div>
          <Divider style={{
            backgroundColor: this.props.textStyle.backgroundColor
          }} />
      </div>
    )
  }
}