import React, { Component } from 'react';
import Container from 'muicss/lib/react/container';
import Row from 'muicss/lib/react/row';
import Col from 'muicss/lib/react/col';
import { withAlert } from 'react-alert';
import getWeb3 from './utils/getWeb3';
import WaitingList from '../build/contracts/WaitingList.json';

import './App.css'

class WaitinglistComponent extends Component {
  constructor(props) {
    super(props);

    this.state = {
      web3: null,
      wlInstance: null,
      addresses: []
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
        wl.deployed().then((instance) => {
        if(instance == null) {
          this.props.alert.show("No Waitinglist contract found on blockchain.", { type: 'error'});
        }
        this.setState({
          wlInstance: instance, 
          defaultAccount: accounts[0]
        });
      }).then(() => this.getRecipientList());
    });

  }

  getRecipientList(){
    this.state.wlInstance.get_recipients_count.call(this.state.defaultAccount)
  .then((result) => {
     for (let i = 0; i < result.c[0]; i++) {
        this.state.wlInstance.get_recipient.call(i, this.state.defaultAccount)
        .then((addr) => {
            this.getRecipient(addr);
        });
    }
  })
}

  getRecipient(addr) {
    let tmpbt = null;
    let tmphla= null;
    let tmpam = false;
    let tmphp = null;
    let tmpsignup = null;
    let tmpage = null;
    let tmpregion = null;
    let tmpcountry = null;

    this.state.wlInstance.getRecipientBloodtype.call(addr, this.state.defaultAccount)
    .then((resbt) => {
        tmpbt = resbt;
    }).then(() => {
        return this.state.wlInstance.getRecipientHLA.call(addr, this.state.defaultAccount)
    }).then((reshla) => {
        tmphla = reshla;         
    }).then(() => {
        return this.state.wlInstance.getRecipientPriority.call(addr, this.state.defaultAccount)
    }).then((reshp) => {
        tmphp = reshp;
    }).then(() => {
        return this.state.wlInstance.getRecipientSignupdate.call(addr, this.state.defaultAccount)
    }).then((ressignup) => {
        tmpsignup = ressignup;
    }).then(() => {
        return this.state.wlInstance.getRecipientAge.call(addr, this.state.defaultAccount)
    }).then((resage) => {
        tmpage = resage;
    }).then(() => {
        return this.state.wlInstance.getRecipientRegion.call(addr, this.state.defaultAccount)
    }).then((resregion) => {
        tmpregion = resregion;
    }).then(() => {
        return this.state.wlInstance.getRecipientCountry.call(addr, this.state.defaultAccount)
    }).then((rescountry) => {
        tmpcountry = rescountry;
    }).then(() => {
        return this.state.wlInstance.getRecipientAccMM.call (addr, this.state.defaultAccount)    
    }).then((resam) => {
        tmpam = resam;
    }).then(() => {
        let tmpaddr = this.state.addresses;
        console.log("asd",             {
            addr: addr,
            bt : tmpbt,
            hla: tmphla,
            am : tmpam,
            hp: tmphp,
            country: tmpcountry,
            region : tmpregion,
            signup: tmpsignup,
            age: tmpage
        }.toString())
        tmpaddr.push(
            {
                addr: addr,
                bt : tmpbt,
                hla: tmphla,
                am : tmpam,
                hp: tmphp,
                country: tmpcountry,
                region : tmpregion,
                signup: tmpsignup,
                age: tmpage
            }
        );

        this.setState({
            addresses: tmpaddr
        });
    });
   }
  
  render() { 
    let waitingListView = [];
    waitingListView.push(<div>
        <Col md="4">Patient Address</Col>
        <Col md="1">Hal</Col>
        <Col md="1">Blood Type</Col>
        <Col md="1">Age</Col>
        <Col md="1">Country</Col>
        <Col md="1">State</Col>
        <Col md="1">High Priority</Col>
        <Col md="1">Acceptable missmatch</Col>
        <Col md="1">Sign up date</Col>
      </div>);
  for(let i = 0; this.state.addresses.length; i++) {
    /* waitingListView.push(
        <div>
        <Col md="4">this.state.addresses[i].addr</Col>
        <Col md="1">this.state.addresses[i].hal</Col>
        <Col md="1">this.state.addresses[i].bt</Col>
        <Col md="1">this.state.addresses[i].age</Col>
        <Col md="1">this.state.addresses[i].country</Col>
        <Col md="1">this.state.addresses[i].state</Col>
        <Col md="1">this.state.addresses[i].hp</Col>
        <Col md="1">this.state.addresses[i].am.toString()</Col>
        <Col md="1">this.state.addresses[i].signup</Col>
      </div> 
    )*/
  }

    return (
      <Container fluid={true}>
        <Row>
          {WaitingList}
        </Row>
      </Container>
    );
  }
}

export default withAlert(WaitinglistComponent)