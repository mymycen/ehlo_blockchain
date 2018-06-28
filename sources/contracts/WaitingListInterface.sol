pragma solidity ^0.4.17;

interface isWaitingList {
	
	function addRecipient (address adr, string bt, uint hla, bool accMM, uint signup, bool hp, uint age, uint region, uint country) public returns (address);

	function removeRecipient (address a) public returns (address);

	function addOrgan(address addr, string bt, uint age, uint region, uint country) public returns (address[20]);
}