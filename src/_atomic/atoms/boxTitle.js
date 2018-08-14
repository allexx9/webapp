import React from "react";
import PropTypes from "prop-types";
import styles from './boxTitle.module.css'
import AppBar from 'material-ui/AppBar'

class BoxTitle extends React.Component {

  static propTypes = {
    titleText: PropTypes.string.isRequired,
  };

  static defaultProps = {
    titleText: '',
  };

  render() {

    return (
      <AppBar
        title={this.props.titleText}
        showMenuIconButton={false}
        className={styles.appBar}
        titleStyle={{ fontSize: 14, fontWeight: 700 }}
      />
    )
  }
}

export default BoxTitle;