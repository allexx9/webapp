import { Col, Row } from 'react-flexbox-grid'
import Checkbox from 'material-ui/Checkbox'
import FlatButton from 'material-ui/FlatButton'
import PropTypes from 'prop-types'
import React from 'react'
import styles from './joyrideMainIntro.module.css'

class JoyrideEfxIntro extends React.Component {
  static propTypes = {
    content: PropTypes.string.isRequired,
    onCheck: PropTypes.func.isRequired,
    hasGRGBalance: PropTypes.bool.isRequired,
    showHideOption: PropTypes.bool
  }

  static defaultProps = {
    content: '',
    showHideOption: true
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
    const { hasGRGBalance, showHideOption } = this.props
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
          <Col xs={12}>
            <div className={styles.projectDescription}>
              <h2>
                <span>RigoBlock</span> +{' '}
                <span className={styles.logoTextEfx}>ETHFINEX</span>
              </h2>
            </div>
          </Col>
          <Col xs={8}>
            <div className={styles.projectDescription}>
              <div className={styles.efxDescriptionTxt}>
                In an <b>industry-first</b>, we are pleased to unveil the full
                integration of the Rigoblock <b>asset management</b>{' '}
                infrastructure on{' '}
                <b className={styles.efxDotted}>Ethfinex Trustless</b>. With
                just a few clicks, traders can now <b>deploy</b> fully
                transparent and auditable <b>digital asset pools</b>, based
                around trust and with minimal start up costs.
                <br />
                <br /> <b className={styles.rbDotted}>RigoBlock </b>is a{' '}
                <b>blockchain protocol</b> for <b>decentralized</b> asset
                management. It is an abstracted and generalized standard, built
                and deployed on the Ethereum public blockchain and portable to
                multiple blockchains, which streamlines the creation and
                management of complex <b>applications for asset management</b>.
              </div>
            </div>
          </Col>
          <Col xs={4}>
            {!hasGRGBalance && (
              <div className={styles.minimumBalance}>
                Participate to the Public Sale, get 1 free GRG and access the platform
              </div>
            )}

            <div className={styles.communityLink}>
              <div style={{ fontWeight: 700 }}>
                {hasGRGBalance && (
                  <div className={styles.icoDate}>
                    <a
                      href="https://tokenmarket.net/blockchain/ethereum/assets/rigoblock/"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      RigoBlock ICO:
                    </a>{' '}
                    18. Dec 2018 - 18. Jan 2019
                  </div>
                )}
                <div className={styles.icoButton}>
                  <FlatButton
                    href="https://www.ethfinex.com/token-sales/5c18bcc6af5c05cd089adb9d/RigoBlock"
                    target="_blank"
                    labelPosition="before"
                    label="Contribute"
                    labelStyle={{
                      color: '#ffffff',
                      fontWeight: '600',
                      fontSize: '20px'
                    }}
                    id="joyride-efx-create-pool"
                    style={buttonCreateDrago}
                  />
                </div>
                <div className={styles.showTick}>
                  <Row>
                    <Col xs={12}>
                      {showHideOption && (
                        <Checkbox
                          label="Don't show next time."
                          labelPosition="left"
                          iconStyle={{ width: '14px' }}
                          onCheck={this.props.onCheck}
                        />
                      )}
                    </Col>
                  </Row>
                </div>
              </div>
            </div>
          </Col>
          <Col xs={12}>
            {' '}
            <div className={styles.efxDescriptionMore}>
              <a
                href="https://rigoblock.com"
                target="_blank"
                rel="noopener noreferrer"
              >
                &#62;&#62; Read more &#60;&#60;
              </a>
            </div>
          </Col>
        </Row>
      </div>
    )
  }
}

export default JoyrideEfxIntro
