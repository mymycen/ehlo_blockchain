pragma solidity ^0.4.17;
import "./WaitingList.sol";

//contract used to test internal functions of WaitingList.sol
//not possible to test private functions like this, probably need to make them 
//public for testing and changing scope to private again after testing

contract ExposedWaitingList is WaitingList {

	function _makeList (address organAddr) public returns (address[20]) {
		return makeList(organAddr);
	}
/*
	//Compiler error: This type is only supported in the new experimental 
	//ABI encoder (problem with listItem but apparently only in this contract)
	function _insert (listItem[20] mlist, listItem item, uint pos) public returns (listItem[20]) {
		return insert(mlist, item, pos);
	}
*/
/*
	function _calculate(Organ organ, Recipient res, listItem[10] ftAM, listItem[10] ftMM) public returns (uint) {
		return calculate(organ, res, ftAM, ftMM);
	}

	function _addWaitingTime(Recipient r) public returns (uint) {
		return addWaitingTime(r);
	}

	function _calcMMP(Recipient r) public returns (uint) {
		return calcMMP(r);
	}

	function _calcHLAMissmatch(Organ o, Recipient r) public returns (uint) {
		return calcHLAMissmatch(o, r);
	}

	function _checkBloodtypeAM(Organ o, Recipient r) public returns (bool) {
		return checkBloodtypeAM(o, r);
	}
*/
}