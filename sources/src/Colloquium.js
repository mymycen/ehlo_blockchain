import React, { Component } from 'react'
import ColloquiumUser from '../build/contracts/ColloquiumUser.json'
import getWeb3 from './utils/getWeb3'
import { withAlert } from 'react-alert'

class Colloquium extends Component {
  constructor(props) {
    super(props)

    this.state = {
      votingInProgress: false,
      votingSubjectAddr: null,
      votingKind: true,
      votingApprovals: 0,
      votingRejections: 0,
      members: [],

      web3: null,    
      ColloquiumInstance: null,
      defaultAccount: null,

      memberInputField: null,
      newMemberEnabled: false
    }

    this.newMember = this.newMember.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.getMembers = this.getMembers.bind(this);
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
      this.instantiateContract()
    })
    .catch(() => {
      console.log('Error finding web3.')
    })

    setTimeout(this.checkForVoting, 3000);
  }

  checkForVoting() {
        this.state.ColloquiumInstance.is_voting_in_process.call(this.defaultAccount)
      .then((result) => {
        // Update state with the result.
        this.setState({ votingInProgress: result })
        if ( result ) {
          return this.state.ColloquiumInstance.get_voting_subject.call(this.defaultAccount);
        }
      }).then((result) => {
        this.setState({ votingSubjectAddr: result })
      });
  }

  newMember() {
    var inputText = this.state.memberInputField;

    if(! this.state.web3.isAddress(inputText.trim())) {
      this.props.alert.show("'" + inputText + "' is not a valid address.");
      return;
    }

    console.log(inputText);

    this.state.ColloquiumInstance.propose_new_member(inputText, {from: this.state.defaultAccount})
    .then((result) => {
      this.getMembers();
    })
  }

  updateMember(position) {
    this.state.ColloquiumInstance.get_member_count.call(this.state.defaultAccount)
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
    this.state.ColloquiumInstance.approve.call({from: this.state.defaultAccount})
    .then(() => { 
      this.getMembers();
      this.checkForVoting();
    });
  }

  reject() {
    this.state.ColloquiumInstance.reject.call({from: this.state.defaultAccount})
    .then(() => { 
      this.getMembers();
      this.checkForVoting();
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
        this.setState({
          ColloquiumInstance: instance, 
          defaultAccount: accounts[0]
        })

        // Stores a given value, 5 by default.
        this.getMembers();
        return this.state.ColloquiumInstance.is_voting_in_process.call(accounts[0])
      }).then((result) => {
        // Update state with the result.
        return this.setState({ votingInProgress: result })
      })
    })

  }

  handleChange(e) {
    this.setState({memberInputField: e.target.value});
  }


  render() {

    const votingInProgess = this.state.votingInProgress;


    let votingWindow;
    if(votingInProgess) {
      votingWindow = <div className="container">
          <p>votingSubjectAddr: {this.state.votingSubjectAddr}</p>
          <p>votingKind: {this.state.votingKind.toString()}</p>
          <p>votingApprovals: {this.state.votingApprovals}</p>
          <p>votingRejections: {this.state.votingRejections}</p>
          <button onClick={this.accept}>Accept</button>
          <button onClick={this.reject}>Reject</button>
        </div>
    } 
        
    return (
      <div className="App">
      <main className="container">
      <div className="pure-g">
      <div className="pure-u-1-1">
      <h1>Colloquium Smart contract!</h1>
      {votingWindow}
      <p>members: {this.state.members.toString()}</p>
      <button onClick={this.newMember}>Propse a new member</button>
      <input type="text" placeholder="ethereum address"  onChange={ this.handleChange }></input>
      </div>
      </div>
      </main>
      </div>
      );
  }

}

export default withAlert(Colloquium);

