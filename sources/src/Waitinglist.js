import React, { Component } from 'react';
import Container from 'muicss/lib/react/container';
import Row from 'muicss/lib/react/row';
import Col from 'muicss/lib/react/col';
import { withAlert } from 'react-alert';
import getWeb3 from './utils/getWeb3';
import WaitingList from '../build/contracts/WaitingList.json';

import './App.css'

class Waitinglist extends Component {
  constructor(props) {
    super(props);

    this.state = {
      web3: null,
      matching: [],

      visible: false,

    }

  }

  componentWillMount() {
    getWeb3.then(results => {
      this.setState({web3: results.web3});
    }).catch(() => {
      this.props.alert.show("Could not find metamask plugin. (No web3 found).", { type: 'error'});
      console.log('Error finding web3.')
    }).then(() => {
      this.instantiateContract();
    })
   }
    
   instantiateContract() {

     const contract = require('truffle-contract')
     const wl = contract(WaitingList)
     wl.setProvider(this.state.web3.currentProvider)

    this.state.web3.eth.getAccounts((error, accounts) => {
      wl.at(this.props.wl).then((instance) => {
        if(instance == null) {
          this.props.alert.show("No Waitinglist contract found on blockchain.", { type: 'error'});
        }
        this.setState({
          wlInstance: instance, 
          defaultAccount: accounts[0]
        });
      });
    });

  }
 //Is the get_recipient right function to show up all recipient info??
  getRecipient() {
    this.state.wlInstance.get_recipient.call(this.state.defaultAccount)
    .then((result) => {
       let bt= this.state.wlInstance.getRecipientBloodtype;
       let age= this.state.wlInstance.getRecipientHLA;
       let am= this.state.wlInstance.getRecipientAccMM;
       let hp= this.state.wlInstance.getRecipientPriority;
       let hla= this.state.wlInstance.getRecipientHLA;
      for (let i = 0; i < result.c[0]; i++) {
        console.log("this:" + this);
        this.getRecipient(i);
      }
    })
  }

  let WaitingList;

  render() {
    return (
      <Container fluid={true}>
        <Row>
          <Col md="1">Patient Address</Col>
          <Col md="1">Hal</Col>
          <Col md="1">Blood Type</Col>
          <Col md="1">Age</Col>
          <Col md="1">Country</Col>
          <Col md="1">State</Col>
          <Col md="1">High Priority</Col>
        </Row>
        <Row>
          {WaitingList}
        </Row>
      </Container>
    );
  }
}

export default withAlert(WaitingList)