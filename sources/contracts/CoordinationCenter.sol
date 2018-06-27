pragma solidity ^0.4.22;

import "../contracts/CoordinationCenterMaster.sol";

contract CoordinationCenter is CoordinationCenterMaster {

	CoordinationCenter ccMaster;

	// Override
	function bind(address master) public {
		require(maintainer == msg.sender);
		ccMaster = CoordinationCenter(master);
	}

	function master_propose_new_member(address new_proposed_member) public {
		checkAuthentication();
		ccMaster.propose_new_member(new_proposed_member);
	}

	function master_propose_member_removal(address member) public {
		checkAuthentication();
		ccMaster.propose_member_removal(member);
	}

	function master_approve() public {
		checkAuthentication();
		ccMaster.approve();
	}

	function master_reject() public {  	
		checkAuthentication();
		ccMaster.reject();
	}

	function master_is_voting_in_process() public view returns(bool) {
		checkAuthentication();
		return ccMaster.is_voting_in_process();
	}	

	function master_get_member_count() public view returns(uint) {
		checkAuthentication();
		return ccMaster.get_member_count();
	} 	

	function master_is_member_of_colloquium(address addr) public view returns(bool) {
		checkAuthentication();
		return ccMaster.is_member_of_colloquium(addr);
	}	

	function master_get_member_key(uint i) public view returns(address) {
		checkAuthentication();
		return ccMaster.get_member_key(i);
	}

	function master_get_voting_subject() public view returns(address) {
		checkAuthentication();
		return ccMaster.get_voting_subject();
	}

	function master_get_voting_proposer() public view returns(address) {
		checkAuthentication();
		return ccMaster.get_voting_proposer();
	}

	function master_get_voting_kind() public view returns(bool) {
		checkAuthentication();
		return ccMaster.get_voting_kind();
	}

	function master_get_voting_approvals() public view returns(uint) {
		checkAuthentication();
		return ccMaster.get_voting_approvals();
	}

	function master_get_voting_rejections() public view returns(uint) {
		checkAuthentication();
		return ccMaster.get_voting_rejections();
	}

	function master_has_voted() public view returns(bool) {
		checkAuthentication();
		return ccMaster.has_voted();
	}


	/** WaitingList functions **/

	// Override
	function addOrgan(address addr, string bt, uint age, uint region, uint country) public returns (address[20]) {
		checkAuthentication();
		return ccMaster.addOrgan(addr, bt, age, region, country);
	}
}
