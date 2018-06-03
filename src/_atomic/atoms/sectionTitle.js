import HelpIcon from '../../_atomic/atoms/helpIcon'
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Divider from 'material-ui/Divider';
import styles from './sectionTitle.module.css';

export default class SectionTitle extends Component {

  static propTypes = {
    titleText: PropTypes.string.isRequired,
    textStyle: PropTypes.object.isRequired,
    help: PropTypes.bool,
    helpText: PropTypes.string,
    helpReadMoreLink: PropTypes.string,
  };

  static defaultProps = {
    textStyle: {},
    help: false,
  };


  render() {

    const helpIconStyle = {
      height: '20px',
      width: '20px'
    }

    const renderHelp = () => {
      return (
        <div className={styles.help}>
          <HelpIcon style={helpIconStyle} />
        </div>
      )
    }

    return (
      <div>

        <Divider style={{ backgroundColor: '#9E9E9E' }} />
        <div className={styles.title} style={this.props.textStyle}>
          { this.props.help ? renderHelp() : null }
          {this.props.titleText}
        </div>
        <Divider style={{ backgroundColor: '#9E9E9E' }} />
      </div>
    )
  }
}
