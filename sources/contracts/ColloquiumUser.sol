pragma solidity ^0.4.22;

import "../contracts/Colloquium.sol";

contract ColloquiumUser {

	using Colloquium for Colloquium.Session;
	Colloquium.Session session;

	constructor () public {
		session.init_session(msg.sender);
	}	

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
}
