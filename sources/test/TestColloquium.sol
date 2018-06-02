pragma solidity ^0.4.2;

import "truffle/Assert.sol";
import "truffle/DeployedAddresses.sol";
import "../contracts/Colloquium.sol";

contract TestColloquium {

  function test_is_voting_in_process_passes_forNotInProgress() public {
    Colloquium colloquium = Colloquium(DeployedAddresses.Colloquium());

    bool is_it = colloquium.is_voting_in_process();

    Assert.equal(is_it, false, "No Voting shell be running right now.");
  }

 //  function test_propose_new_member_passes() public {
 //  	Colloquium colloquium = Colloquium(DeployedAddresses.Colloquium());

	// colloquium.propose_new_member(0xBcE971cDC05E89DC053c6EFc38e55001A1699188);
	// bool is_it = colloquium.is_voting_in_process();
	// uint count = colloquium.get_member_count();

	// Assert.equal(is_it, true, "Voting is expected to not right now.");
	// Assert.equal(count, 1, "Expected 1 members in SC");

 //  }

}
