import React, { Component } from 'react'
import ColloquiumUser from '../build/contracts/ColloquiumUser.json'
import getWeb3 from './utils/getWeb3'
import { withAlert } from 'react-alert'
import Dropdown from 'react-dropdown'
import 'react-dropdown/style.css'
import PieChart from 'react-simple-pie-chart';
import {FaUserPlus, FaUserTimes} from 'react-icons/lib/fa'
import Button from 'muicss/lib/react/button';
import Container from 'muicss/lib/react/container';

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
      this.props.alert.show("Could not find metamask plugin. (No web3 found).");
      console.log('Error finding web3.')
    })

  }

  checkForVoting() {
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
      this.props.alert.show("'" + inputText + "' is not a valid address.");
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
      var members_tmp = this.state.members;
      members_tmp[position] = result;
      this.setState({members: members_tmp})
    })
  }

  getMembers() {
    this.state.ColloquiumInstance.get_member_count.call(this.state.defaultAccount)
    .then((result) => {
      for (var i = 0; i < result.c[0]; i++) {
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
      this.props.alert.show("Could not accept voting.");
    });
  }

  reject() {
    const self = this;
    this.state.ColloquiumInstance.reject({from: this.state.defaultAccount})
    .then(() => { 
      self.getMembers();
      self.checkForVoting();
    }).catch(() => {
      this.props.alert.show("Could not reject voting.");
    });
  }


  instantiateContract() {
    /*
     * SMART CONTRACT EXAMPLE
     *
     * Normally these functions would be called in the context of a
     * state management library, but for convenience I've placed them here.
     */
     const contract = require('truffle-contract')
     const Colloquium = contract(ColloquiumUser)
     Colloquium.setProvider(this.state.web3.currentProvider)

    // Declaring this for later so we can chain functions on Colloquium.

    // Get accounts.
    this.state.web3.eth.getAccounts((error, accounts) => {
      Colloquium.deployed().then((instance) => {
        if(instance == null) {
          this.props.alert.show("No Colloquium contract found on blockchain.");
        }

        this.setState({
          ColloquiumInstance: instance, 
          defaultAccount: accounts[0],
        })

        // Stores a given value, 5 by default.
        this.getMembers();
      }).then((result) => {
        // Update state with the result.
        setTimeout(this.checkForVoting, 3000);
      })
    })

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
      if(this.state.votingKind) {
        votingKind = 
        <div className="mui-container-fluid">
        <div className="mui-col-md-2"><FaUserPlus size={60}/></div>
        <div className="mui-col-md-10"><h2> member addition </h2>{this.state.votingSubjectAddr}</div>             
        </div>;
      } else {
        votingKind = 
        <div className="mui-container-fluid">
        <div className="mui-col-md-2"><FaUserTimes size={60}/></div>
        <div className="mui-col-md-10"><h2> member removal </h2>{this.state.votingSubjectAddr}</div>             
        </div>;
      }

      let slices = [
      {
        color: "#9E9E9E",
        value: this.state.members.length - this.state.votingApprovals - this.state.votingRejections
      },
      {
        color: "#8BC34A",
        value: this.state.votingApprovals
      },
      {
        color: "#f44336",
        value: this.state.votingRejections
      }
      ];

      votingWindow = <Container>
      <div className="mui-panel">
      {votingKind}
      <PieChart slices={slices} style={{maxWidth: "250px"}}/>
      <p>hasVoted: {this.state.votingHasVoted.toString()}</p>
      <p>allowedToVote: {this.state.votingAllowedToVote.toString()}</p>
      <div className="mui--text-right">
      <Button color="primary" onClick={this.accept}>Accept</Button>
      <Button onClick={this.reject}>Reject</Button>
      </div>
      </div>
      </Container>
    } 

    return (
      <div>
      <Container>
      {votingWindow}
      <p>members: {this.state.members.toString()}</p>
      <Button onClick={this.removeMember}>Propose a member removal</Button><Dropdown options={this.state.members} onChange={this.handleMemberRemovalDropdownChange} value={this.state.members[0]} placeholder="Select a member to remove" />
      <form className="mui-form--inline">
      <div className="mui-textfield">
        <input type="text" placeholder="ethereum address"  onChange={ this.handleNewMemberInputChange }></input>
      </div>
      <Button onClick={this.newMember}>Propse a new member</Button>
      </form>
      </Container>
      </div>
      );
  }

}

export default withAlert(Colloquium);

