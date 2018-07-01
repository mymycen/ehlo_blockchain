pragma solidity ^0.4.22;

import "../contracts/Colloquium.sol";
import "../contracts/WaitingList.sol";

contract TransplantCenterMaster {

	using Colloquium for Colloquium.Session;
	Colloquium.Session session;

	WaitingList private waitingList;
	address maintainer; // creator of this contract, usually the waiting lsit SC 

	/** Constructor functions **/
	constructor() public {
		maintainer = msg.sender;
	}

	function bind(address master) public {
		require(maintainer == msg.sender);
		waitingList = WaitingList(master);
	}

	function register(address member) public {
		require (maintainer == msg.sender);
		session.init_session(member);
	}

	function checkAuthentication() internal {
		require (is_member_of_colloquium(msg.sender) == true);
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

	function get_member_key(uint i) public view returns(address) {
		return session.get_member_key(i);	
	}

	function get_voting_subject() public view returns(address) {
		return session.voting.subject_addr;
	}

	function get_voting_proposer() public view returns(address) {
		return session.voting.proposer_addr;
	}

	function get_voting_kind() public view returns(bool) {
		return session.voting.add;
	}

	function get_voting_approvals() public view returns(uint) {
		return session.voting.approvals;
	}

	function get_voting_rejections() public view returns(uint) {
		return session.voting.rejections;
	}

	function has_voted() public view returns(bool) {
		return session.voting.has_voted[msg.sender];
	}

	function addRecipient(address adr, string bt, uint hla, bool accMM, uint signup, bool hp, uint age, uint region, uint country) public returns (address) {
		checkAuthentication();
		return waitingList.addRecipient(adr, bt, hla, accMM , signup, hp, age, region, country);
	}

	function removeRecipient(address a) public returns (address) {
		checkAuthentication();
		return waitingList.removeRecipient(a);
	}
}