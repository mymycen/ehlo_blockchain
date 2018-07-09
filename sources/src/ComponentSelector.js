import React, { Component } from 'react'
import Tabs from 'muicss/lib/react/tabs';
import Tab from 'muicss/lib/react/tab';
import Container from 'muicss/lib/react/container'
import ContractInit from './ContractInit';
import getWeb3 from './utils/getWeb3';
import WaitingListView from './WaitingListView';
import WaitingList from '../build/contracts/WaitingList.json';
import CoordinationCenter from '../build/contracts/CoordinationCenter.json';
import CoordinationCenterMaster from '../build/contracts/CoordinationCenterMaster.json';
import TransplantCenter from '../build/contracts/TransplantCenter.json';
import TransplantCenterMaster from '../build/contracts/TransplantCenterMaster.json';
import { withAlert } from 'react-alert';

import './App.css'

class ComponentSelector extends Component {
  constructor(props) {
    super(props)

    this.state = {
      web3: null,

      waitingListInstance: null,
      defaultAccount: null,

      cc_master_address: null,
      cc_addresses: [],

      tc_master_address: null,
      tc_addresses:[]
  	}
  }


  componentWillMount() {
    const self = this;
    getWeb3.then(results => {;
      self.setState({web3: results.web3});
    }).catch(() => {
      self.props.alert.show("Could not find metamask plugin. (No web3 found).", { type: 'error'});
      console.log('Error finding web3.')
    }).then(() => {
      console.log(self.state.web)
      self.instantiateContract(self);
    })

  }

  instantiateContract(self) {

     const contract = require('truffle-contract')
     const waitingList = contract(WaitingList)
     waitingList.setProvider(self.state.web3.currentProvider)

     const ccm = contract(CoordinationCenterMaster)
     ccm.setProvider(self.state.web3.currentProvider)

     const tcm = contract(TransplantCenterMaster)
     tcm.setProvider(self.state.web3.currentProvider)

    self.state.web3.eth.getAccounts((error, accounts) => {
      waitingList.deployed().then((instance) => {
        if(instance == null) {
          self.props.alert.show("No waiting list contract found on blockchain.", { type: 'error'});
        }
        self.setState({
          waitingListInstance: instance, 
          defaultAccount: accounts[0]
        });

        // CC master contract
        return instance.get_cc_master.call(accounts[0]);
      }).then((result) => {
        self.setState({
          cc_master_address: result
        });

        return ccm.at(result);      
      }).then((result) => {
        self.getMembers(result, true);
      }).then(() => {
        
        // TC master contract
        return self.state.waitingListInstance.get_tc_master.call(accounts[0]);
      }).then((result) => {
        self.setState({
          tc_master_address: result
        });

        return tcm.at(result);      
      }).then((result) => {
        self.getMembers(result, false);
      });
    });

  }

  updateMember(position, colloquium, isCC) {
    console.log("Getting member at position: " + position);
    colloquium.get_member_key.call(position, this.state.defaultAccount)
    .then((result) => {
      console.log("this:" + this);

      let members;
      if(isCC) {
        members = this.state.cc_addresses;
      } else {
        members = this.state.tc_addresses;
      }
      members[position] = result;
      if(isCC) {
        this.setState({cc_addresses: members});
      } else {
        this.setState({tc_addresses: members});
      }
    })
  }

  getMembers(colloquium, isCC) {
    colloquium.get_member_count.call(this.state.defaultAccount)
    .then((result) => {
      for (let i = 0; i < result.c[0]; i++) {
        console.log("this:" + this);
        this.updateMember(i, colloquium, isCC);
      }
    })
  }

  render() {
    return (
      <Container>
      	<Tabs justified={true}>
      	  <Tab value="pane-1" label="Coordination Center">
      	  	<ContractInit label="Coordination Center" type="cc" master={this.state.cc_master_address} slaves={this.state.cc_addresses}></ContractInit>
      	  </Tab>
      	  <Tab value="pane-2" label="Transplantation Center">
      	  	<ContractInit label="Transplantation Center" type="tc" master={this.state.tc_master_address} slaves={this.state.tc_addresses}></ContractInit>
      	  </Tab>
      	  <Tab value="pane-3" label="Waiting List">
      	    <WaitingListView></WaitingListView>
      	  </Tab>
      	</Tabs>
      </Container>
      );
  }
}

export default withAlert(ComponentSelector)