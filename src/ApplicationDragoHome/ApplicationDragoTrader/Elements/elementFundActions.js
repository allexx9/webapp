import Dialog from 'material-ui/Dialog';
import FlatButton from 'material-ui/FlatButton';
import RaisedButton from 'material-ui/RaisedButton';
import React from 'react';
import { Grid, Row, Col } from 'react-flexbox-grid';
import IdentityIcon from '../../../IdentityIcon';
import {Toolbar, ToolbarGroup, ToolbarSeparator, ToolbarTitle} from 'material-ui/Toolbar';

import styles from '../../applicationDragoHome.module.css';

const customContentStyle = {
  minHeight: '500px',
};

export default class ElementFundActions extends React.Component {

  headerButtonsStyle = {
    selected: {
      fontWeight: 700,
      fontSize: 20
    },
    notSelected: {
      fontWeight: 700,
      fontSize: 20
    },
    bgSelected:  "#64B5F6",
    bGNotSelected: "#2196f3",
    hoverSelected: "#64B5F6",
    hoverNotSelected: "#2196F3",
  }

  state = {
    open: false,
    buy: true,
    sellButtonStyleHover: this.headerButtonsStyle.hoverNotSelected,
    buyButtonStyleHover: this.headerButtonsStyle.hoverSelected,
    sellButtonStyleBg: this.headerButtonsStyle.bGNotSelected,
    buyButtonStyleBg: this.headerButtonsStyle.bgSelected,
    sellButtonStyle: this.headerButtonsStyle.notSelected,
    buyButtonStyle: this.headerButtonsStyle.selected
  }

  buttonsStyle = {
    marginTop: 12,
    marginBottom: 12,
    color: 'white',
  }

  
  handleOpen = () => {
    this.setState({open: true});
  }

  handleClose = () => {
    this.setState({open: false});
  }


  selectBuyButton = () => {
    this.setState({
      buy: true,
      sellButtonStyleHover: this.headerButtonsStyle.hoverNotSelected,
      buyButtonStyleHover: this.headerButtonsStyle.hoverSelected,
      sellButtonStyleBg: this.headerButtonsStyle.bGNotSelected,
      buyButtonStyleBg: this.headerButtonsStyle.bgSelected,
      sellButtonStyle: this.headerButtonsStyle.notSelected,
      buyButtonStyle: this.headerButtonsStyle.selected
      }
    )
  }

  selectSellButton = () => {
    this.setState({
      buy: false,
      sellButtonStyleHover: this.headerButtonsStyle.hoverSelected,
      buyButtonStyleHover: this.headerButtonsStyle.hoverNotSelected,
      sellButtonStyleBg: this.headerButtonsStyle.bgSelected,
      buyButtonStyleBg: this.headerButtonsStyle.bGNotselected,
      sellButtonStyle: this.headerButtonsStyle.selected,
      buyButtonStyle: this.headerButtonsStyle.notSelected
      }
    )
  }

  renderAddress (dragoDetails) {
    if (!dragoDetails.address ) {
      return <p>empty</p>;
    }

    return (
    <Row className={styles.modalHeader}>
      <Col xs={12}>
        <Row className={styles.modalHeaderActions}>
          <Col xsOffset={4} xs={2}><FlatButton label="Sell" style={this.buttonsStyle} 
            backgroundColor={this.state.sellButtonStyleBg}
            hoverColor="#64B5F6"
            fullWidth={true} labelStyle={this.state.sellButtonStyle} onClick={this.selectSellButton}/>
          </Col>
          <Col xs={2}><FlatButton label="Buy" style={this.buttonsStyle} 
            backgroundColor={this.state.buyButtonStyleBg}
            hoverColor="#64B5F6"
            fullWidth={true} labelStyle={this.state.buyButtonStyle} onClick={this.selectBuyButton}/>
          </Col>
        </Row>
        <Row className={styles.modalTitle}>
          <Col xs={12} md={1} className={styles.dragoTitle}>
            <h2><IdentityIcon address={ dragoDetails.address } /></h2>
          </Col>
          <Col xs={12} md={11} className={styles.dragoTitle}>
          <p>{dragoDetails.symbol} | {dragoDetails.name} </p>
          <small>{dragoDetails.address}</small>
          </Col>
        </Row>
      </Col>
    </Row>
    );
  }

  render() {
    const { dragoDetails } = this.props
    const actions = [
      <FlatButton
        label="Cancel"
        primary={true}
        onClick={this.handleClose}
      />,
      <FlatButton
        label="Submit"
        primary={true}
        disabled={true}
        onClick={this.handleClose}
      />,
    ];

    return (
      <div>
        <RaisedButton label="Actions" primary={true} onClick={this.handleOpen} 
          labelStyle={{fontWeight: 700}}/>
        <Dialog
          title={this.renderAddress(dragoDetails)}
          actions={actions}
          modal={true}
          open={this.state.open}
          contentStyle={customContentStyle}
        >
          <p>Lorem Ipsum is simply dummy text of the printing and typesetting industry.
           Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.
          </p>
        </Dialog>
      </div>
    );
  }
}