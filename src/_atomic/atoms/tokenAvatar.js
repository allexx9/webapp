import Avatar from 'material-ui/Avatar'
import PropTypes from 'prop-types'
import React from 'react'

class TokenAvatar extends React.Component {
  static propTypes = {
    size: PropTypes.number.isRequired,
    tokenSymbol: PropTypes.string.isRequired
  }

  static defaultProps = {
    size: 22,
    tokenSymbol: 'ETH'
  }

  render() {
    const { size, tokenSymbol } = this.props
    let imgSrc
    switch (tokenSymbol) {
      case 'ETH':
        imgSrc = '/img/ethereum-black-64x64.png'
        break
      case 'GRG':
        imgSrc = '/img/Logo-RigoblockRGB-OUT-02.png'
        break
      default:
        imgSrc = '/img/ethereum-black-64x64.png'
        break
    }
    return (
      <Avatar
        size={size}
        src={imgSrc}
        style={{ border: '1px solid', verticalAlign: 'middle' }}
        backgroundColor="#FFFFFF"
      />
    )
  }
}

export default TokenAvatar
