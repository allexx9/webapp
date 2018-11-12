import AppBar from 'material-ui/AppBar'
import ExchangeBoxTitleActions from '../molecules/exchangeBoxTitleActions'
import PropTypes from 'prop-types'
import React from 'react'
import styles from './boxTitle.module.css'

class BoxTitle extends React.Component {
  static propTypes = {
    titleText: PropTypes.string.isRequired,
    boxName: PropTypes.string.isRequired
  }

  static defaultProps = {
    titleText: '',
    boxName: ''
  }

  render() {
    return (
      <div>
        <AppBar
          key={'title_key_' + this.props.titleText}
          title={this.props.titleText}
          showMenuIconButton={false}
          className={styles.appBar}
          iconStyleRight={{ marginTop: '0px', marginRight: '-20px' }}
          iconElementRight={
            <ExchangeBoxTitleActions boxName={this.props.boxName} />
          }
          titleStyle={{ fontSize: 14, fontWeight: 700 }}
        />
      </div>
    )
  }
}

export default BoxTitle
