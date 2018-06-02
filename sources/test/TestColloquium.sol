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
}
