import React, { Component } from 'react'
import ColloquiumUser from '../build/contracts/ColloquiumUser.json'
import getWeb3 from './utils/getWeb3'

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
      defaultAccount: null
    }

    this.newMember = this.newMember.bind(this)
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
  }

    newMember() {
        this.state.ColloquiumInstance.get.call(
          this.state.defaultAccount
          ).then((result) => {
          return this.setState({ storageValue: result.c[0]})
      })
  }

  updateMember(position) {
    this.state.ColloquiumInstance.get_member_key(position, {from: this.state.defaultAccount})
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


  render() {
    return (
      <div className="App">
        <main className="container">
          <div className="pure-g">
            <div className="pure-u-1-1">
              <h1>Colloquium Smart contract!</h1>
              <p>votingInProgress: {this.state.votingInProgress.toString()}</p>
              <p>votingSubjectAddr: {this.state.votingSubjectAddr}</p>
              <p>votingKind: {this.state.votingKind.toString()}</p>
              <p>votingApprovals: {this.state.votingApprovals}</p>
              <p>votingRejections: {this.state.votingRejections}</p>
              <p>members: {this.state.members.toString()}</p>
              <button onClick={this.newMember}>Propse a new member</button>
              <input type="text" placeholder="ethereum address"></input>
            </div>
          </div>
        </main>
      </div>
    );
  }

}

export default Colloquium;

