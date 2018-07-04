import React, { Component } from 'react';
import { withAlert } from 'react-alert';
import Input from 'muicss/lib/react/input';
import Radio from 'muicss/lib/react/radio';
import Option from 'muicss/lib/react/option';
import Button from 'muicss/lib/react/button';
import Select from 'muicss/lib/react/select';
import Divider from 'muicss/lib/react/divider';
import Row from 'muicss/lib/react/row';
import Col from 'muicss/lib/react/col';
import Checkbox from 'muicss/lib/react/checkbox';
import getWeb3 from './utils/getWeb3';
import TransplantCenter from '../build/contracts/TransplantCenter.json';
import {FaExclamationTriangle} from 'react-icons/lib/fa'

import './App.css'


class Recipient extends Component {

  constructor(props) {
    super(props)

    this.state = {
      tcInstance: null,
      web3: null,

      matching: null,

      visible: false,
      patientAddress: null,
      patientHal: null,
      patientHP: false,
      patientAge: 0,
      patientSignUpDate: 0,
      patientAccMM: false,
      patientBT: null,
      patientState: 0,
      patientCountry: 0
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
    console.log("res: ", this.props.tc);

     const contract = require('truffle-contract')
     const tc = contract(TransplantCenter)
     tc.setProvider(this.state.web3.currentProvider)

    this.state.web3.eth.getAccounts((error, accounts) => {
      tc.at(this.props.tc).then((instance) => {
        if(instance == null) {
          this.props.alert.show("No tc contract found on blockchain.", { type: 'error'});
        }
        this.setState({
          tcInstance: instance, 
          defaultAccount: accounts[0]
        });
      });
    });

  }


  onSubmitAddPatient(ev) {
    ev.preventDefault();  // prevent form submission
    const bt = this.getBT();
    const hal = this.getHal();
    const signUpDate = this.getSecondsSinceEpoch();

    console.log("Patient data: ")
    console.log("address:",this.inputPatientAddress.controlEl.value);
    console.log("bt:", bt);
    console.log("hal:", hal);
    console.log("Acceptable Missmatch: ", this.checkAccMM.controlEl.checked);
    console.log("age:", this.inputAge.controlEl.value);
    console.log("state:", this.selectState.controlEl.value);
    console.log("high priority:", this.checkHP.controlEl.checked);
    console.log("country:", this.selectCountry.controlEl.value);
    console.log("signUpDate:", signUpDate);
    
    this.state.tcInstance.addRecipient(
      this.inputPatientAddress.controlEl.value,
      bt,
      hal,
      this.checkAccMM.controlEl.checked,
      signUpDate,
      this.checkHP.controlEl.checked,
      this.inputAge.controlEl.value,
      this.selectState.controlEl.value,
      this.selectCountry.controlEl.value,
      {from: this.state.defaultAccount}
    ).then((result) => {

      console.log("res: ", result);
      this.setState({
        matching: result,
        visible: true,
        patientAddress: this.inputPatientAddress.controlEl.value,
        patientAge: this.inputAge.controlEl.value,
        patientAccMM: this.checkAccMM.controlEl.checked,
        patientBT: bt,
        patientHal: hal,
        patientSignUpDate: signUpDate,
        patientHP: this.checkHP.controlEl.checked,
        patientState: this.selectState.controlEl.value,
        patientCountry: this.selectCountry.controlEl.value
      });
    }).catch(() => {
      this.props.alert.show("Could not add patient.", { type: 'error'});
    });
  }

  onSubmitRemovePatient(ev) {
    ev.preventDefault();  // prevent form submission
    const ptAddr2Remove = this.inputPatientRemovalAddress.controlEl.value;
    console.log("address:",ptAddr2Remove);

    this.state.tcInstance.removeRecipient(
      ptAddr2Remove,
      {from: this.state.defaultAccount}
    ).then((result) => {
      console.log("result:", result)
    }).catch(() => {
      console.log("Could not remove patient.");
      this.props.alert.show("Could not remove patient.", { type: 'error'});
    });
  }

  getSecondsSinceEpoch() {
    const d = new Date();
    return Math.round(d.getTime() / 1000);
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

  getHal() {
    if(this.halDPA1.controlEl.checked) {
      return 1;
    }
    if(this.halDRA.controlEl.checked) {
      return 2;
    }
    if(this.halDRB1.controlEl.checked) {
      return 3;
    }
    if(this.halDQB1.controlEl.checked) {
      return 4;
    }
    if(this.halDPB1.controlEl.checked) {
      return 5;
    }
    if(this.halDQA1.controlEl.checked) {
      return 6;
    }
    return 0;
  }

  render() {
    let resultView;

    if(this.state.visible) {
      let ciriticalView;

      if(this.state.patientHP) {
        ciriticalView = <div><FaExclamationTriangle color="#f44336" /> Ciritical Condition</div>
      } 

      resultView = 
        <div className="mui-panel">
          <div className="mui--text-headline">Added patient</div>
          <strong>{ this.state.patientAddress }</strong>
          , { this.state.patientAge }
          , Bloodtype: { this.state.patientBT }<br/>
          { ciriticalView }
        </div>
    }

    return (
      <div>
        {resultView}
        <div className="mui-panel">
        <form onSubmit={this.onSubmitAddPatient.bind(this)}>
        <h2> Add a patient </h2>
        <Divider/>
          <div>
            <div>
              <Input ref={el => { this.inputPatientAddress = el; }} label="Patient address" floatingLabel={true} required={true}/>
            </div>
          </div>
          <div>
            <legend>Bloodtype:</legend>
            <Row>
            <Col md="1"><Radio ref={el => { this.radioBloodTypeA = el; }} name="bt" label="A" defaultChecked={true} /></Col>
            <Col md="1"><Radio ref={el => { this.radioBloodTypeB = el; }} name="bt" label="B" /></Col>
            <Col md="1"><Radio ref={el => { this.radioBloodTypeAB = el; }} name="bt" label="AB" /></Col>
            <Col md="1"><Radio ref={el => { this.radioBloodType0 = el; }} name="bt" label="0" /></Col>
            </Row>
          </div>
          <div>
            <div>
            <Input ref={el => { this.inputAge = el; }} label="Age" type="number" floatingLabel={true}  required={true}/>
            </div>
          </div>
          <div>
            <div>
            <legend>Major histocompatibility complex:</legend>
              <Row>
                <Col md="2"><Radio ref={el => { this.halDPA1 = el; }} name="hla" label="HLA-DPA1" defaultChecked={true} /></Col>
                <Col md="2"><Radio ref={el => { this.halDRA = el; }} name="hla" label="HLA-DRA" /></Col>
                <Col md="2"><Radio ref={el => { this.halDRB1 = el; }} name="hla" label="HLA-DRB1" /></Col>
                <Col md="2"><Radio ref={el => { this.halDQB1 = el; }} name="hla" label="HLA-DQB1" /></Col>
                <Col md="2"><Radio ref={el => { this.halDPB1 = el; }} name="hla" label="HLA-DPB1" /></Col>
                <Col md="2"><Radio ref={el => { this.halDQA1 = el; }} name="hla" label="HLA-DQA1" /></Col>
                </Row>
            </div>
          </div>
          <div>
            <Select ref={el => { this.selectCountry = el; }} name="input" label="Country" defaultValue="option2">
              <Option value="1" label="France" disabled="true"/>
              <Option value="2" label="Germany" />
              <Option value="3" label="Spain" disabled="true"/>
              <Option value="4" label="Italy" disabled="true"/>
            </Select>
          </div>
            <div>
              <Select ref={el => { this.selectState = el; }} name="input" label="Region" defaultValue="option2">
                <Option value="1" label="Berlin" />
                <Option value="2" label="Brandenburg" />
                <Option value="3" label="Hamburg" />
                <Option value="4" label="Bayern" />
              </Select>
            </div>
            <Checkbox ref={el => { this.checkAccMM = el; }} name="inputA2" label="Acceptable Missmatch" defaultChecked={false} />
            <Checkbox ref={el => { this.checkHP = el; }} name="inputA1" label="High Priority" defaultChecked={false} />
          <div>
            <div className="mui--text-right">
            <Button color="secondary" variant="raised">Update</Button>
            <Button color="primary" variant="raised">Create</Button>
            </div>
          </div>
        </form>
    
        </div>
        <div className="mui-panel">
          <form onSubmit={this.onSubmitRemovePatient.bind(this)}>
            <h2> Remove a patient </h2>
            <Divider/>
            <div>
              <Input ref={el => { this.inputPatientRemovalAddress = el; }} label="Patient address" floatingLabel={true}  required={true} />
            </div>
            <div className="mui--text-right"><Button color="danger" variant="raised">Remove</Button></div>
          </form>
        </div>
      </div>
    );
  }
}

export default withAlert(Recipient)
