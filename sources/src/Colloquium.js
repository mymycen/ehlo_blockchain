import React, { Component } from 'react'
import ColloquiumUser from '../build/contracts/ColloquiumUser.json'
import CoordinationCenter from '../build/contracts/CoordinationCenter.json'
import CoordinationCenterMaster from '../build/contracts/CoordinationCenterMaster.json'
import TransplantCenter from '../build/contracts/TransplantCenter.json';
import TransplantCenterMaster from '../build/contracts/TransplantCenterMaster.json';
import getWeb3 from './utils/getWeb3'
import { withAlert } from 'react-alert'
import Dropdown from 'react-dropdown'
import 'react-dropdown/style.css'
import {FaUserPlus, FaUserTimes, FaTimesCircle, FaCheckCircle} from 'react-icons/lib/fa'
import Button from 'muicss/lib/react/button';
import Doughnut from 'react-chartjs/lib/doughnut';
import Divider from 'muicss/lib/react/divider';
import Row from 'muicss/lib/react/row';
import Col from 'muicss/lib/react/col';
import Input from 'muicss/lib/react/input';


class Colloquium extends Component {
  constructor(props) {
    super(props)

    this.state = {
      votingInProgress: false,
      votingSubjectAddr: null,
      votingKind: true,
      votingApprovals: 0,
      votingRejections: 0,
      votingHasVoted: false,
      votingAllowedToVote: false,
      votingProposerAddr: null,
      members: [],

      web3: null,    
      ColloquiumInstance: null,
      defaultAccount: null,

      memberInputField: null,
      memberRemovalField: null
    }

    this.newMember = this.newMember.bind(this);
    this.removeMember = this.removeMember.bind(this);
    this.handleNewMemberInputChange = this.handleNewMemberInputChange.bind(this);
    this.getMembers = this.getMembers.bind(this);
    this.handleMemberRemovalDropdownChange = this.handleMemberRemovalDropdownChange.bind(this);
    this.checkForVoting = this.checkForVoting.bind(this);
    this.accept = this.accept.bind(this);
    this.reject = this.reject.bind(this);
  }

  componentWillMount() {
    // Get network provider and web3 instance.
    // See utils/getWeb3 for more info.

    getWeb3
    .then(results => {
      this.setState({web3: results.web3});
      // Instantiate contract once web3 provided.
      this.instantiateContract();
    }).catch(() => {
      this.props.alert.show("Could not find metamask plugin. (No web3 found).", { type: 'error'});
      console.log('Error finding web3.')
    })

  }

  componentDidMount() {
    setInterval(this.checkForVoting, 5000);
  }

  checkForVoting() {
    console.log("called check for voting...")
    const self = this;
    const account = this.state.defaultAccount;

    // check for voting in process
    self.state.ColloquiumInstance.is_voting_in_process.call(account)
    .then((result) => {
      // Update state with the result.
      self.setState({ votingInProgress: result })
      if ( result ) {
        // approvals
        self.state.ColloquiumInstance.get_voting_approvals.call(account)
        .then((result) => result.c[0])
        .then((result) => self.setState({votingApprovals: result}));
        // rejections
        self.state.ColloquiumInstance.get_voting_rejections.call(account)
        .then((result) => result.c[0])
        .then((result) => self.setState({votingRejections: result}));
        // is member?
        self.state.ColloquiumInstance.is_member_of_colloquium.call(account)
        .then((result) => self.setState({votingAllowedToVote: result}));
        // has voted ?
        self.state.ColloquiumInstance.has_voted.call(account)
        .then((result) => self.setState({votingHasVoted: result}));
        // voting kind
        self.state.ColloquiumInstance.get_voting_kind.call(account)
        .then((result) => self.setState({votingKind: result}));

        // proposer
        self.state.ColloquiumInstance.get_voting_proposer.call(account)
        .then((result) => self.setState({votingProposerAddr: result}));

        return self.state.ColloquiumInstance.get_voting_subject.call(account);
      }
    }).then((result) => {
      self.setState({ votingSubjectAddr: result })
    });


  }

  newMember() {
    const self = this;
    const inputText = this.state.memberInputField;

    if(! this.state.web3.isAddress(inputText.trim())) {
      this.props.alert.show("'" + inputText + "' is not a valid address.", { type: 'error'});
      return;
    }

    console.log(inputText);

    this.state.ColloquiumInstance.propose_new_member(inputText, {from: this.state.defaultAccount})
    .then((result) => {
      self.checkForVoting();
    })
  }

  removeMember() {
    const memberToRemove = this.state.memberRemovalField;
    const self = this;

    this.state.ColloquiumInstance.propose_member_removal(memberToRemove, {from: this.state.defaultAccount})
    .then((result) => {
      self.checkForVoting();
    })
  }

  updateMember(position) {
    console.log("Getting member at position: " + position);
    this.state.ColloquiumInstance.get_member_key.call(position, this.state.defaultAccount)
    .then((result) => {
      console.log("this:" + this);
      let members_tmp = this.state.members;
      members_tmp[position] = result;
      this.setState({members: members_tmp})
    })
  }

  getMembers() {
    this.state.ColloquiumInstance.get_member_count.call(this.state.defaultAccount)
    .then((result) => {
      for (let i = 0; i < result.c[0]; i++) {
        console.log("this:" + this);
        this.updateMember(i);
      }
    })
  }

  accept() {
    const self = this;
    this.state.ColloquiumInstance.approve({from: this.state.defaultAccount})
    .then(() => { 
      self.getMembers();
      self.checkForVoting();
    }).catch(() => {
      self.props.alert.show("Could not accept voting.", { type: 'error'});
    });
  }

  reject() {
    const self = this;
    this.state.ColloquiumInstance.reject({from: this.state.defaultAccount})
    .then(() => { 
      self.getMembers();
      self.checkForVoting();
    }).catch(() => {
      self.props.alert.show("Could not reject voting.", { type: 'error'});
    });
  }


  instantiateContract() {
    /*
     * SMART CONTRACT EXAMPLE
     *
     * Normally these functions would be called in the context of a
     * state management library, but for convenience I've placed them here.
     */
     let Contract;
     const contract = require('truffle-contract')

     if(this.props.type == "cc") {
      Contract = contract(CoordinationCenter);
     } else if(this.props.type == "tc") {
      Contract = contract(TransplantCenter);
     } else {
      this.props.alert.show("Could not Instantiate contract: " + this.props.type + " not understand.", {type: 'error'});
      return;
     }

     Contract.setProvider(this.state.web3.currentProvider)

    // Declaring this for later so we can chain functions on Colloquium.

    // Get accounts.
    this.state.web3.eth.getAccounts((error, accounts) => {
      Contract.at(this.props.contractAddr).then((instance) => {
        if(instance == null) {
          this.props.alert.show("No Colloquium contract found on blockchain.");
        }

        this.setState({
          ColloquiumInstance: instance, 
          defaultAccount: accounts[0],
        })

        // Stores a given value, 5 by default.
        this.getMembers();
      });
    });

  }

  handleNewMemberInputChange(e) {
    this.setState({memberInputField: e.target.value});
  }

  handleMemberRemovalDropdownChange(e) {
    this.setState({memberRemovalField: e.value});
  }


  render() {

    const votingInProgess = this.state.votingInProgress;


    let votingWindow;
    if(votingInProgess) {
      let votingKind;
      let votingKindIcon;
      if(this.state.votingKind) {
        votingKind = "addition";
        votingKindIcon = <FaUserPlus size={60}/>
      } else {
        votingKind = "removal";
        votingKindIcon = <FaUserTimes size={60}/>
      }

      let slices = [
      {
        color: "#9E9E9E",
        value: this.state.members.length - this.state.votingApprovals - this.state.votingRejections,
        label: "undecided"
      },
      {
        color: "#8BC34A",
        value: this.state.votingApprovals,
        label: "approvals"
      },
      {
        color: "#f44336",
        value: this.state.votingRejections,
        label: "rejections"
      }
      ];

      let hasVoted;
      if(this.state.votingHasVoted) {
        hasVoted = <FaCheckCircle color="#8BC34A"/>
      } else {
        hasVoted = <FaTimesCircle color="#f44336"/>
      }

      let allowedToVote;
      if(this.state.votingAllowedToVote) {
        allowedToVote = <FaCheckCircle color="#8BC34A"/>
      } else {
        allowedToVote = <FaTimesCircle color="#f44336"/>
      }

      votingWindow = 
      <div className="mui-panel">
        <Row>
          <Col md="1"><h2>{votingKindIcon}</h2></Col>
          <Col md="11"><h1 style={{marginBottom: 0}}>Member {votingKind} </h1>
          <div style={{marginBottom: 10}}><strong>{this.state.votingSubjectAddr}</strong></div>
          <Divider style={{marginBottom: 30}}/>
          <Row>
          <Col md="5"><Doughnut data={slices} width="350" height="350"/></Col>
          <Col md="7">
            <h4>{this.state.votingApprovals} approvals <strong>to</strong> {this.state.votingRejections} rejections <br/>
            {this.state.members.length - this.state.votingApprovals - this.state.votingRejections} votes pending</h4>   
            <div style={{marginBottom: 30}}/>      
            <p>{allowedToVote} you are allowed to vote</p>
            <p>{hasVoted} you have voted</p>
            <div style={{marginBottom: 30}}/>      
            <p>{this.state.votingProposerAddr} proposed the {votingKind} of {this.state.votingSubjectAddr}. <br/>
            The Voting will be open until at least 51% of the members have decided for one option. In case of a tie, the proposal is rejected.</p>
          </Col>
          </Row>
      <div className="mui--text-right">
      <Button color="primary" onClick={this.accept}>Accept</Button>
      <Button onClick={this.reject}>Reject</Button>
      </div>
      </Col>
      </Row>
      </div>
    } 

    let members = [];

    for (let i=0; i<this.state.members.length; i++) {
      if(this.state.members[i] == this.state.defaultAccount) {
        members.push(<li><a href="#">{this.state.members[i]} (you)</a></li>);
      } else {
        members.push(<li><a href="#">{this.state.members[i]}</a></li>);
      }
    }


    return (
      <div>
      {votingWindow}
      <div className="mui-panel">
      <Row>
      <Col md="12">
      <h2>Colloquium members:</h2>
      <ul>
      {members}
      </ul>
      </Col>
      <Col md="12">
      <form>
      <Row>
      <Col md="8"><Dropdown options={this.state.members} onChange={this.handleMemberRemovalDropdownChange} value={this.state.members[0]} placeholder="Select a member to remove" /></Col>
      <Col md="4"><Button onClick={this.removeMember}>Propose a member removal</Button></Col>
      </Row>
      
      <Row>
      <Col md="8"><Input  label="Ethereum Address" floatingLabel={true}  onChange={ this.handleNewMemberInputChange }></Input></Col>
      <Col md="4"><Button onClick={this.newMember}>Propse a new member</Button></Col>
      </Row>
      </form>
      </Col>
      </Row>
      </div>
      </div>
      );
  }

}

export default withAlert(Colloquium);

