import { Col, Row } from 'react-flexbox-grid'
import Checkbox from 'material-ui/Checkbox'
import Divider from 'material-ui/Divider'
import FlatButton from 'material-ui/FlatButton'
import PropTypes from 'prop-types'
import React from 'react'
import styles from './joyrideMainIntro.module.css'

class JoyrideMainIntro extends React.Component {
  static propTypes = {
    content: PropTypes.string.isRequired,
    onCheck: PropTypes.func.isRequired,
    hasGRGBalance: PropTypes.bool.isRequired
  }

  static defaultProps = {
    content: ''
  }

  checkWalletBalance = async () => {
    // Modern dapp browsers...
    if (window.ethereum) {
      try {
        await window.ethereum.enable()
      } catch (error) {}
    } else if (window.web3) {
    }
    // Non-dapp browsers...
    else {
      console.log(
        'Non-Ethereum browser detected. You should consider trying MetaMask!'
      )
    }
  }

  render() {
    const buttonCreateDrago = {
      border: '2px solid',
      borderColor: '#054186',
      fontWeight: '600',
      height: '45px',
      borderRadius: '4px',
      width: '210px',
      backgroundColor: '#054186'
    }
    const { hasGRGBalance } = this.props
    return (
      <div className={styles.container}>
        <div className={styles.rbLogo}>
          <img
            style={{ height: '38px' }}
            src="/img/rb-logo-final.png"
            alt="logo"
          />
        </div>
        <Row>
          <div className={styles.projectDescription}>
            <Col xs={12}>
              <h2>RigoBlock</h2>
              <div className={styles.efxDescriptionTxt}>
                RigoBlock is a blockchain protocol for{' '}
                <b>decentralized asset management</b>. It is an abstracted and
                generalized standard, built and deployed on the <b>Ethereum</b>{' '}
                public blockchain and portable to multiple blockchains, which
                streamlines the <b>creation and management</b> of complex
                applications for <b>asset</b> management.
              </div>
              <div className={styles.efxDescriptionMore}>
                <a
                  href="https://community.rigoblock.com/t/rigoblock-dapp/52"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  &#62;&#62; Read more &#60;&#60;
                </a>
              </div>
            </Col>
            <Col xs={12}>
              {!hasGRGBalance && (
                <div className={styles.minimumBalance}>
                  You need a minimum balance of 1 GRG to access RigoBlock
                  platform. <br />
                  Please follow the REGISTER link below to receive 1 airdropped
                  GRG.
                </div>
              )}
            </Col>
          </div>
        </Row>
        <div className={styles.communityContainer}>
          <Row>
            <div className={styles.communityContainerTitle}>
              <Col xs={12}>Resources</Col>
            </div>
          </Row>
          <Divider />
          <div className={styles.communityContainerBody}>
            <Row>
              <Col xs={6}>
                <div className={styles.communityLink}>
                  {/* <div className={styles.imgLink}>
                  <ContentLink />
                </div> */}
                  <div>
                    <a
                      href="https://www.rigoblock.com"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      RigoBlock.com
                    </a>
                    <br />
                    Explore and learn more about our project.
                  </div>
                </div>
                <br />
                <div className={styles.communityLink}>
                  {/* <div className={styles.imgLink}>
                  <ContentLink />
                </div> */}
                  <div>
                    <a
                      href="https://community.rigoblock.com"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Community
                    </a>
                    <br />
                    Join our community and contribute to the decentralized
                    ecosystem.
                  </div>
                </div>
              </Col>
              <Col xs={6}>
                <div className={styles.communityLink}>
                  {/* <div className={styles.imgLink}>
                  <ContentLink />
                </div> */}
                  <div style={{ fontWeight: 700 }}>
                    <a
                      href="https://tokenmarket.net/blockchain/ethereum/assets/rigoblock/"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      RigoBlock ICO
                    </a>
                    <br />
                    Token sale: 18. Dec 2018 - 18. Jan 2019
                    <div className={styles.icoButton}>
                      <FlatButton
                        href="https://tokenmarket.net/preregistration/rigoblock/enter"
                        target="_blank"
                        labelPosition="before"
                        label="Register"
                        labelStyle={{
                          color: '#ffffff',
                          fontWeight: '600',
                          fontSize: '20px'
                        }}
                        id="joyride-efx-create-pool"
                        style={buttonCreateDrago}
                        // icon={<Chat color="#ffca57" />}
                        // hoverColor={Colors.blue300}
                      />
                    </div>
                  </div>
                </div>
              </Col>
            </Row>
            <div className={styles.showTick}>
              <Row>
                <Col xs={12}>
                  <Checkbox
                    label="Don't show next time."
                    labelPosition="left"
                    iconStyle={{ width: '14px' }}
                    onCheck={this.props.onCheck}
                  />
                </Col>
              </Row>
            </div>
          </div>
        </div>
      </div>
    )
  }
}

export default JoyrideMainIntro
