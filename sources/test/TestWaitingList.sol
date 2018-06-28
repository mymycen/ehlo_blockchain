pragma solidity ^0.4.22;

import "truffle/Assert.sol";
import "truffle/DeployedAddresses.sol";
import "../contracts/WaitingList.sol";
//for testing
import "../contracts/ExposedWaitingList.sol";

contract TestWaitingList {

    ExposedWaitingList e;

    function beforeEach() public {
        e = new ExposedWaitingList();
    }

    WaitingList waitinglist = WaitingList(DeployedAddresses.WaitingList());


    function testAddRecipient() public {
        address expected = this;
        address returnedAddress = waitinglist.addRecipient(this, "A", 1, true, 1234, true, 17, 1, 10);
        //Assert.equal(returnedAddress, expected, "Address doesnt match");

        uint expectedAge = 17;
        uint receivedAge = waitinglist.getRecipientAge(this);
        Assert.equal(expectedAge, receivedAge, "Not equal");
    }

    function testGetAge() public {
        uint expectedAge = 17;
        uint receivedAge = waitinglist.getRecipientAge(this);
        Assert.equal(expectedAge, receivedAge, "Not equal");
    }

    function testRemoveRecipient() public {
        address expected = this;
        address returnedAddress = waitinglist.removeRecipient(this);
        Assert.equal(returnedAddress, expected, "Address doesnt match");
    }

/*------------------POSSIBLE?-----------------
    function testRemoveFalseRecipient() public {
        address expected = 1234;
        address returnedAddress = waitinglist.removeRecipient(1234);
        Assert.equal(returnedAddress, expected, "Address doesnt match");
    }
*/

/*-----------------HOW TO CHECK ADDRESSES IN LISTS?--------------
    function testAddOrgan() public {
        address expected = this;
        address[20] returned = waitinglist.addOrgan(this, "A", 17, 1, 1);
        Assert.equal(expected, returned[0].addr, "List doesnt match");
    }
*/

/*
    function testCheckBloodtype() public {
        //TODO
    }
*/

/*
    function testMakeList() public {
        waitinglist.addOrgan(this, "A", 17, 1, 1);
        address expected = this;
        address returned = e._makeList(this);
        Assert.equal(expected, returned, "Not equal");
    }
*/

}