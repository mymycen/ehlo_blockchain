pragma solidity ^0.4.22;

import "../contracts/Colloquium.sol";
import "../contracts/WaitingList.sol";

contract CoordinationCenter {

	using Colloquium for Colloquium.Session;
	Colloquium.Session session;

	WaitingList waitingList;
	CoordinationCenter ccMaster;

	address maintainer; // creator of this contract, usually the waiting lsit SC 

	/** Constructor functions **/
	constructor() public {
		maintainer = msg.sender;
	}

	function init(address initialMember) internal {
		require(maintainer == msg.sender);
		session.init_session(initialMember);
	}

	function set_as_slave(address initialMember, address ccMasterAddr) public {
		init(initialMember);
		ccMaster = CoordinationCenter(ccMasterAddr);
	}

	function set_as_master(address initialMember, address wlAddr) public {
		init(initialMember);
		waitingList = WaitingList(wlAddr);
	}

	/** Own Colloquium methods **/ 

	function propose_new_member(address new_proposed_member) public {
		session.propose_new_member(new_proposed_member, msg.sender);
	}

	function propose_member_removal(address member) public {
		session.propose_member_removal(member, msg.sender);	
	}

	function approve() public {
		session.approve(msg.sender);	
	}

	function reject() public {  	
		session.reject(msg.sender);	
	}

	function is_voting_in_process() public view returns(bool) {
		return session.is_voting_in_process();
	}	

	function get_member_count() public view returns(uint) {
		return session.get_member_count();
	} 	

	function is_member_of_colloquium(address addr) public view returns(bool) {
		return session.is_member_of_colloquium(addr);	
	}	

	function __get_member_key(uint i) public view returns(address) {
		return session.__get_member_key(i);	
	}

	/** Remote Colloquium methods **/ 


	/** WaitingList functions **/

	function addOrgan(address addr, string bt, uint age, uint region, uint country) public returns (address[20]) {
		require (is_member_of_colloquium(msg.sender) == true);
		
		return waitingList.addOrgan(addr, bt, age, region, country);
	}
}
