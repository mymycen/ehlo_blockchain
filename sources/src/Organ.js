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
    const age = Date.UTC(this.selectAgeYear.controlEl.value, this.selectAgeMonth.controlEl.value, this.selectAgeDay.controlEl.value) / 1000;

    console.log("Sending organ: ")
    console.log("address:","0x0000000000000000000000000000000000000000");
    console.log("bt:", bt);
    console.log("age:", age);
    console.log("state:", this.selectState.controlEl.value);
    console.log("country:", this.selectCountry.controlEl.value);
    
    this.state.ccInstance.addOrgan.call(
      "0x0000000000000000000000000000000000000000",
      bt,
      age,
      this.selectState.controlEl.value,
      this.selectCountry.controlEl.value,
      {from: this.state.defaultAccount}
    ).then((list) => {
      console.log("list", list)

      this.setState({
        matching: list,
        visible: true,
        patientAddress: "0x0000000000000000000000000000000000000000",
        organAge: age,
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
        if(this.state.matching[i] != "0x0000000000000000000000000000000000000000") {
          patients.push(<li><strong>{this.state.matching[i]}</strong></li>);
        }
      }

      if(patients.length == 0) {
        patients = "No match found."
      }

      resultView = 
        <div className="mui-panel">
          <div className="mui--text-headline">Matches</div>
          <ol> {patients} </ol>
        </div>
    }

    let optYear = []
    for (var i = (new Date()).getFullYear(); i >= 1970; i--) {
      optYear.push(<Option value={i} label={i} />);
    }

    let optDay = []
    for (var i = 1; i <= 31; i++) {
      optDay.push(<Option value={i} label={i} />);
    }

    return (
      <div>
      {resultView}
      <div className="mui-panel">
      <Form onSubmit={this.onSubmit.bind(this)}>
        <legend>New organ</legend>
        Bloodtype:
        <Row>
        <Col md="1"><Radio ref={el => { this.radioBloodTypeA = el; }} name="bt" label="A" defaultChecked={true} /></Col>
        <Col md="1"><Radio ref={el => { this.radioBloodTypeB = el; }} name="bt" label="B" /></Col>
        <Col md="1"><Radio ref={el => { this.radioBloodTypeAB = el; }} name="bt" label="AB" /></Col>
        <Col md="1"><Radio ref={el => { this.radioBloodType0 = el; }} name="bt" label="0" /></Col>
        </Row>

        Birthday of patient:
        <Row>
        <Col md="4">
        <Select ref={el => { this.selectAgeDay = el; }} name="input" label="Day" defaultValue="option1">
          { optDay }
        </Select>
        </Col>
        <Col md="4">
        <Select ref={el => { this.selectAgeMonth = el; }} name="input" label="Month" defaultValue="option1">
          <Option value="0" label="January"/>
          <Option value="1" label="February"/>
          <Option value="2" label="March"/>
          <Option value="3" label="April"/>
          <Option value="4" label="May"/>
          <Option value="5" label="June"/>
          <Option value="6" label="July"/>
          <Option value="7" label="August"/>
          <Option value="8" label="Sebtemper"/>
          <Option value="9" label="October"/>
          <Option value="10" label="November"/>
          <Option value="11" label="December"/>
        </Select>
        </Col>
        <Col md="4">
        <Select ref={el => { this.selectAgeYear = el; }} name="input" label="Year" defaultValue="option1">
          { optYear }
        </Select>
        </Col>
        </Row>

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
      </div>
      </div>
      );
  }
}

export default withAlert(Organ)