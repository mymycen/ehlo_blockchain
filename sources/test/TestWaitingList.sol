pragma solidity ^0.4.22;

import "truffle/Assert.sol";
import "truffle/DeployedAddresses.sol";
import "../contracts/WaitingList.sol";
//for testing
//import "../contracts/ExposedWaitingList.sol";

contract TestWaitingList {

    //ExposedWaitingList e;

    //function beforeEach() public {
    //    e = new ExposedWaitingList();
    //}

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

    function testGetBloodtype() public {
        string memory expectedBloodtype = "A";
        string memory receivedBloodtype = waitinglist.getRecipientBloodtype(this);
        Assert.equal(expectedBloodtype, receivedBloodtype, "Not equal");
    }

    function testRemoveRecipient() public {
        address expected = this;
        address returnedAddress = waitinglist.removeRecipient(this);
        Assert.equal(returnedAddress, expected, "Address doesnt match");
    }

/*    function testAddWithUpdate() public {
        address expected = 0x07F59D32DE9C7d4de034080536AA0E00Dfb3Df97;
        address returned = waitinglist.updateRecipient(0x07F59D32DE9C7d4de034080536AA0E00Dfb3Df97, "B", 1, true, 1234, true, 20, 1, 10);
        Assert.equal(expected, returned, "Not equal");

        //address falseex = waitinglist.recipientsList[0].adr;
        //assert(falseex != 0x07F59D32DE9C7d4de034080536AA0E00Dfb3Df97);
    }
*/

    function testAddSeveralRecipients() public {
        address expected = this;
        address returnedAddress = waitinglist.addRecipient(this, "A", 1, true, 1234, true, 17, 1, 10);
        Assert.equal(returnedAddress, expected, "Address doesnt match");

        address expected1 = 0x07F59D32DE9C7d4de034080536AA0E00Dfb3Df97;
        address returnedAddress1 = waitinglist.addRecipient(0x07F59D32DE9C7d4de034080536AA0E00Dfb3Df97, "B", 1, true, 1234, true, 17, 1, 10); 
        Assert.equal(returnedAddress1, expected1, "Address doesnt match");

        address expected2 = this;
        address returnedAddress2 = waitinglist.removeRecipient(this);
        Assert.equal(returnedAddress2, expected2, "Address doesnt match");

    }

    function testUpdateRecipient() public {
        address expected = 0x07F59D32DE9C7d4de034080536AA0E00Dfb3Df97;
        address returned = waitinglist.updateRecipient(0x07F59D32DE9C7d4de034080536AA0E00Dfb3Df97, "B", 1, true, 1234, true, 20, 1, 10);
        Assert.equal(expected, returned, "Not equal");

        uint exage = 20;
        uint recage = waitinglist.getRecipientAge(0x07F59D32DE9C7d4de034080536AA0E00Dfb3Df97);
        Assert.equal(exage, recage, "not equal");
    }

//------------------POSSIBLE?-----------------
    function testRemoveFalseRecipient() public {
        address expected = 0x0;
        address returnedAddress = waitinglist.removeRecipient(1234);
        Assert.equal(returnedAddress, expected, "Address doesnt match");
    }


//-----------------HOW TO CHECK ADDRESSES IN LISTS?--------------
    function testAddOrgan() public {
        address[20] memory expected;
        expected[0] = this;
        address[20] memory returned = waitinglist.addOrgan(this, "A", 17, 1, 1);
        Assert.equal(expected[0], returned[0], "List doesnt match");
        waitinglist.removeRecipient(this);
    }


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
