pragma solidity ^0.4.22;

import "truffle/Assert.sol";
import "truffle/DeployedAddresses.sol";
import "../contracts/WaitingList.sol";

contract TestWaitingList {

    WaitingList waitinglist = WaitingList(DeployedAddresses.WaitingList());


    function testAddRecipient() public {
        address expected = this;
        address returnedAddress = waitinglist.addRecipient(this, "A", 1, true, 1234, true, 17, 1, 10);
        Assert.equal(returnedAddress, expected, "Address doesnt match");
    }
}