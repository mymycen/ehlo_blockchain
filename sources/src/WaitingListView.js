import React, { Component } from 'react'
import Row from 'muicss/lib/react/row';
import Col from 'muicss/lib/react/col';
import getWeb3 from './utils/getWeb3';
import WaitingList from '../build/contracts/WaitingList.json';
import { withAlert } from 'react-alert';
import Divider from 'muicss/lib/react/divider'


import './App.css'

class WaitingListView extends Component {
  constructor(props) {
    super(props)

    this.state = {
      web3: null,

      waitingListInstance: null,
      defaultAccount: null,

      wlMembers: new Map()
  	}

  	this.updateMember = this.updateMember.bind(this);
  	this.getMembers = this.getMembers.bind(this);
  	this.getRecipient = this.getRecipient.bind(this);
  }


  componentWillMount() {
    const self = this;
    getWeb3.then(results => {;
      self.setState({web3: results.web3});
    }).catch(() => {
      self.props.alert.show("Could not find metamask plugin. (No web3 found).", { type: 'error'});
      console.log('Error finding web3.')
    }).then(() => {
      self.instantiateContract(self);
    })

  }

  utcSecondsToTimeString(utcSeconds) {
	var d = new Date(0); // The 0 there is the key, which sets the date to the epoch
	d.setUTCSeconds(utcSeconds);
	var n = d.toISOString();
	var time = n.slice(11,19);
	return time;
  }

  utcSecondsToDateString(utcSeconds) {
	var d = new Date(0); // The 0 there is the key, which sets the date to the epoch
	d.setUTCSeconds(utcSeconds);
	var n = d.toISOString();
	var date = n.slice(0,10);
	return date;
  }


  halMapper(hal) {
  	switch(hal) {
  		case 1:
  		return "HAL-DPA1";
  		case 2:
  		return "HAL-DRA";
  		case 3:
  		return "HAL-DRB1";
  		case 4:
  		return "HAL-DQB1";
  		case 5:
  		return "HAL-DPB1";
  		case 6:
  		return "HAL-DQA1";
  		default:
  		return "-";
  	}
  }

  countryMapper(c) {
  	switch(c) {
  		case 1:
  		return "France";
  		case 2:
  		return "Germany";
  		case 3:
  		return "Spain";
  		case 4:
  		return "Italy";
  		default:
  		return "-";
  	}
  }

  regionMapper(r) {
  	switch(r) {
  		case 1:
  		return "Berlin";
  		case 2:
  		return "Brandenburg";
  		case 3:
  		return "Hamburg";
  		case 4:
  		return "Bayern";
  		default:
  		return "-";
  	}
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

    this.state.waitingListInstance.getRecipientBloodtype.call(addr, this.state.defaultAccount)
    .then((resbt) => {
        tmpbt = resbt;
    }).then(() => {
        return this.state.waitingListInstance.getRecipientHLA.call(addr, this.state.defaultAccount)
    }).then((reshla) => {
        tmphla = this.halMapper(reshla.c[0]);         
    }).then(() => {
        return this.state.waitingListInstance.getRecipientPriority.call(addr, this.state.defaultAccount)
    }).then((reshp) => {
        tmphp = reshp;
    }).then(() => {
        return this.state.waitingListInstance.getRecipientSignupdate.call(addr, this.state.defaultAccount)
    }).then((ressignup) => {
    	let date = ressignup.c[0];
        tmpsignup = this.utcSecondsToDateString(date) + " " + this.utcSecondsToTimeString(date);
    }).then(() => {
        return this.state.waitingListInstance.getRecipientAge.call(addr, this.state.defaultAccount)
    }).then((resage) => {
        tmpage = resage.c[0];
    }).then(() => {
        return this.state.waitingListInstance.getRecipientRegion.call(addr, this.state.defaultAccount)
    }).then((resregion) => {
        tmpregion = this.regionMapper(resregion.c[0]);
    }).then(() => {
        return this.state.waitingListInstance.getRecipientCountry.call(addr, this.state.defaultAccount)
    }).then((rescountry) => {
        tmpcountry = this.countryMapper(rescountry.c[0]);
    }).then(() => {
        return this.state.waitingListInstance.getRecipientAccMM.call(addr, this.state.defaultAccount)    
    }).then((resam) => {
        tmpam = resam;
    }).then(() => {
        let tmpaddrs = this.state.wlMembers;
        let obj = {
            address: addr,
            bt : tmpbt,
            hla: tmphla,
            am : tmpam,
            hp: tmphp,
            country: tmpcountry,
            region : tmpregion,
            signup: tmpsignup,
            age: tmpage 
        };
        tmpaddrs.set(addr, obj);
		this.setState({wlMembers: tmpaddrs});
    });
   }

  instantiateContract(self) {

     const contract = require('truffle-contract')
     const waitingList = contract(WaitingList)
     waitingList.setProvider(self.state.web3.currentProvider)

    self.state.web3.eth.getAccounts((error, accounts) => {
      waitingList.deployed().then((instance) => {
        if(instance == null) {
          self.props.alert.show("No waiting list contract found on blockchain.", { type: 'error'});
        }
        self.setState({
          waitingListInstance: instance, 
          defaultAccount: accounts[0]
        });

        this.getMembers();
    });
  });
}

  componentDidMount() {
    setInterval(this.getMembers, 5000);
  }

  updateMember(position, waitingList) {
    waitingList.get_recipient.call(position, this.state.defaultAccount)
    .then((result) => {
    	this.getRecipient(result);
    })
  }

  getMembers() {
  	const waitingList = this.state.waitingListInstance;
    waitingList.get_recipients_count.call(this.state.defaultAccount)
    .then((result) => {
      for (let i = 0; i < result.c[0]; i++) {
        this.updateMember(i, waitingList);
      }
    })
  }

  render() {
  	let wlView = this.state.wlMembers;

  	let content;
  	if(wlView.size == 0) {
  		content = <h5>No patient on the waiting list.</h5>;
  	} else {
  		content = [];
  		content.push(<div><Row> 
  					<Col md="5"> <strong>Address </strong></Col>
  					<Col md="1"> <strong>Blood type </strong></Col>
  					<Col md="1"> <strong>HAL </strong></Col>
  					<Col md="1"> <strong>Acceptable Missmatch </strong></Col>
  					<Col md="1"> <strong>High Priority </strong></Col>
  					<Col md="1"> <strong>Country, Region </strong></Col>
  					<Col md="1"> <strong>Sign-up date </strong></Col>
  					<Col md="1"> <strong>Age </strong></Col>
  				</Row>
  				</div>
  				)

  		for (var [key, value] of wlView) {
  			console.log(key + ' = ', value);
  			content.push(
  				<Row> 
  					<Col md="5"> { key } </Col>
  					<Col md="1"> { value.bt } </Col>
  					<Col md="1"> { value.hla } </Col>
  					<Col md="1"> { value.am ? "yes" : "no" } </Col>
  					<Col md="1"> { value.hp ? "yes" : "no" } </Col>
  					<Col md="1"> { value.region }, { value.country } </Col>
  					<Col md="1"> { value.signup } </Col>
  					<Col md="1"> { value.age } </Col>
  				</Row>
  				);
		}
  	}

    return (
      <div className="mui-panel">
      <h4> Patients on the waiting list </h4>
      <Divider/>
      <br/>
       { content }
      </div>
      );
  }
}

export default withAlert(WaitingListView)