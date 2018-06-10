pragma solidity ^0.4.22;

import "truffle/Assert.sol";
import "truffle/DeployedAddresses.sol";
import "../contracts/Colloquium.sol";

contract TestColloquium {
  using Colloquium for Colloquium.Session;
  Colloquium.Session session;
  Colloquium colloquium;

  function beforAll() public {
  	 colloquium = Colloquium(DeployedAddresses.Colloquium());
  }

  function test_init_session() public {
  	 session.init_session(msg.sender);

  	 Assert.equal(session.get_member_count(), 1, "Keylength did not match");
  }

  function test_is_voting_in_process_passes_forNotInProgress() public {
    bool is_it = session.is_voting_in_process();

    Assert.equal(is_it, false, "No Voting shell be running right now.");
  }

  function test_am_member() public {
  	 bool is_it = session.is_member_of_colloquium(msg.sender);
  	 Assert.equal(is_it, true, "I should be an member of the contract");
  }
}
