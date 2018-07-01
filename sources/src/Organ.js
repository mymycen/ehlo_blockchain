import React, { Component } from 'react';
import Form from 'muicss/lib/react/form';
import Input from 'muicss/lib/react/input';
import Textarea from 'muicss/lib/react/textarea';
import Button from 'muicss/lib/react/button';
import Radio from 'muicss/lib/react/radio';
import Row from 'muicss/lib/react/row';
import Col from 'muicss/lib/react/col';
import Option from 'muicss/lib/react/option';
import Select from 'muicss/lib/react/select';
import Divider from 'muicss/lib/react/divider'
import CoordinationCenter from '../build/contracts/CoordinationCenter.json';
import { withAlert } from 'react-alert';
import getWeb3 from './utils/getWeb3';



import './App.css'

class Organ extends Component {
  constructor(props) {
    super(props);

    this.state = {
      ccInstance: null,
      web3: null,
      matching: [],

      visible: false,
      patientAddress: null,
      organAge: 0,
      organBT: null,
      organState: 0,
      organCountry: 0
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

    console.log("cc addr: ", this.props.cc);

     const contract = require('truffle-contract')
     const cc = contract(CoordinationCenter)
     cc.setProvider(this.state.web3.currentProvider)

    this.state.web3.eth.getAccounts((error, accounts) => {
      cc.at(this.props.cc).then((instance) => {
        if(instance == null) {
          this.props.alert.show("No cc contract found on blockchain.", { type: 'error'});
        }
        this.setState({
          ccInstance: instance, 
          defaultAccount: accounts[0]
        });
      });
    });

  }

  onSubmit(ev) {
    ev.preventDefault();  // prevent form submission
    const bt = this.getBT();

    console.log("Sending organ: ")
    console.log("address:",this.inputPatientAddress.controlEl.value);
    console.log("bt:", bt);
    console.log("age:", this.inputAge.controlEl.value);
    console.log("state:", this.selectState.controlEl.value);
    console.log("country:", this.selectCountry.controlEl.value);
    
    this.state.ccInstance.addOrgan.call(
      this.inputPatientAddress.controlEl.value,
      bt,
      this.inputAge.controlEl.value,
      this.selectState.controlEl.value,
      this.selectCountry.controlEl.value,
      {from: this.state.defaultAccount}
    ).then((list) => {
      console.log("list", list)

      this.setState({
        matching: list,
        visible: true,
        patientAddress: this.inputPatientAddress.controlEl.value,
        organAge: this.inputAge.controlEl.value,
        organBT: bt,
        organState: this.selectState.controlEl.value,
        organCountry: this.selectCountry.controlEl.value
      });
    }).catch(() => {
      this.props.alert.show("Could not announce organ.", { type: 'error'});
    });
  }

  getBT() {
    if(this.radioBloodTypeA.controlEl.checked) {
      return "A";
    }
    if(this.radioBloodTypeB.controlEl.checked) {
      return "B";
    }
    if(this.radioBloodTypeAB.controlEl.checked) {
      return "AB";
    }
    if(this.radioBloodTypeO.controlEl.checked) {
      return "O";
    }
    return null;
  }

  render() {
    let resultView;

    if(this.state.visible) {
      let patients = [];
      for (let i=0; i<this.state.matching.length; i++) {
        patients.push(<li><a href="#">{this.state.matching[i]}</a></li>);
      }

      resultView = 
        <div>
          <div className="mui--text-headline">Matches</div>
          <div className="mui--text-button">KIDNEY, {this.state.organBt}, {this.state.organAge}, {this.state.organState}, {this.state.organCountry}</div>
          <ul> {patients} </ul>
        </div>
    }

    return (
      <div className="mui-panel">
      <Form onSubmit={this.onSubmit.bind(this)}>
        <legend>New organ</legend>
        <Input ref={el => { this.inputPatientAddress = el; }} label="Patient address" floatingLabel={true}/>
        Bloodtype:
        <Row>
        <Col md="1"><Radio ref={el => { this.radioBloodTypeA = el; }} name="bt" label="A" defaultChecked={true} /></Col>
        <Col md="1"><Radio ref={el => { this.radioBloodTypeB = el; }} name="bt" label="B" /></Col>
        <Col md="1"><Radio ref={el => { this.radioBloodTypeAB = el; }} name="bt" label="AB" /></Col>
        <Col md="1"><Radio ref={el => { this.radioBloodType0 = el; }} name="bt" label="0" /></Col>
        </Row>
        <Input ref={el => { this.inputAge = el; }} label="Age" type="number" floatingLabel={true}/>
        <Select ref={el => { this.selectCountry = el; }} name="input" label="Country" defaultValue="option2">
          <Option value="1" label="France" disabled="true"/>
          <Option value="2" label="Germany" />
          <Option value="3" label="Spain" disabled="true"/>
          <Option value="4" label="Italy" disabled="true"/>
        </Select>
        <Select ref={el => { this.selectState = el; }} name="input" label="Region" defaultValue="option2">
          <Option value="1" label="Berlin" />
          <Option value="2" label="Brandenburg" />
          <Option value="3" label="Hamburg" />
          <Option value="4" label="Bayern" />
        </Select>
        <div className="mui--text-right"><Button color="primary" variant="raised">Submit</Button></div>
      </Form>
      {resultView}
      </div>
      );
  }
}

export default withAlert(Organ)