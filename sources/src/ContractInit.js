import React, { Component } from 'react';
import Container from 'muicss/lib/react/container';
import Colloquium from './Colloquium';
import Organ from './Organ';
import AddRecipient from './AddRecipient';
import Input from 'muicss/lib/react/input';
import Button from 'muicss/lib/react/button';
import { withAlert } from 'react-alert';
import Divider from 'muicss/lib/react/divider';
import Row from 'muicss/lib/react/row';
import Col from 'muicss/lib/react/col';

import './App.css'

class ContractInit extends Component {
  constructor(props) {
    super(props);

    this.state = {
      renderContract: false,
      contractAddr: null,
    }

    this.updateForAddress = this.updateForAddress.bind(this);
  }

  onSubmit(ev) {
    ev.preventDefault();  // prevent form submission
    const inputAddr = this.input.controlEl.value;

    this.updateForAddress(inputAddr);
  }

  updateForAddress(address) {
    console.log(address);

    //if(! this.state.web3.isAddress(inputAddr)) {
    //  this.props.alert.show("'" + inputAddr + "' is not a valid address.", { type: 'error'});
    //  return;
    //}

    this.setState({
      renderContract: true,
      contractAddr: address
    });
  }

  render() {
    const label = this.props.label + " address";

    let content;
    let statusHeadline;
    if(this.state.renderContract) {
      content = 
        <Colloquium contractAddr={this.state.contractAddr} type={this.props.type} label={this.props.label}></Colloquium>
      statusHeadline = <div>
      <div className="mui--text-accent mui--text-subhead">Connected to</div>
      <div className="mui--text-accent mui--text-display1">{this.state.contractAddr}</div>
      <Divider></Divider>
      <div style={{marginBottom: 30}}/>
      </div>
    }


    let members = [];
    members.push(<li><a href="#" onClick={() => {this.updateForAddress(this.props.master)}}>{this.props.master} (master)</a></li>)
    for (let i=0; i<this.props.slaves.length; i++) {
      members.push(<li><a href="#" onClick={() => {this.updateForAddress(this.props.slaves[i])}}>{this.props.slaves[i]}</a></li>);
    }

    let mainForm;
    if(this.state.renderContract) {
      if(this.props.type == "cc") {
          mainForm = <Organ cc={this.state.contractAddr}></Organ>
      } else if (this.props.type == "tc") {
        mainForm = <AddRecipient tc={this.state.contractAddr}></AddRecipient>
      }
    }

    return (
      <div>
      <div className="mui-panel">
        {statusHeadline}

        <Row>
        <Col md="6">
        <h4>Found {label}:</h4>
        <ul>
        {members}
        </ul>
        </Col>
        <Col md="6">
        <form onSubmit={this.onSubmit.bind(this)}>
         <Input ref={el => { this.input = el; }} label={label} floatingLabel={true} />
         <div className="mui--text-right"><Button variant="raised" color="primary">Connect</Button></div> 
        </form>
        </Col>
        </Row>
      </div>
      {mainForm}
      {content}
      </div>
      );
  }
}

export default withAlert(ContractInit)