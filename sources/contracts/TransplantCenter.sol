pragma solidity ^0.4.22;

import "../contracts/TransplantCenterMaster.sol";

contract TransplantCenter is TransplantCenterMaster {

	TransplantCenter tcMaster;

	// Override
	function bind(address master) public {
		require(maintainer == msg.sender);
		tcMaster = TransplantCenter(master);
	}

	function master_propose_new_member(address new_proposed_member) public {
		checkAuthentication();
		tcMaster.propose_new_member(new_proposed_member);
	}

	function master_propose_member_removal(address member) public {
		checkAuthentication();
		tcMaster.propose_member_removal(member);
	}

	function master_approve() public {
		checkAuthentication();
		tcMaster.approve();
	}

	function master_reject() public {  	
		checkAuthentication();
		tcMaster.reject();
	}

	function master_is_voting_in_process() public view returns(bool) {
		checkAuthentication();
		return tcMaster.is_voting_in_process();
	}	

	function master_get_member_count() public view returns(uint) {
		checkAuthentication();
		return tcMaster.get_member_count();
	} 	

	function master_is_member_of_colloquium(address addr) public view returns(bool) {
		checkAuthentication();
		return tcMaster.is_member_of_colloquium(addr);
	}	

	function master_get_member_key(uint i) public view returns(address) {
		checkAuthentication();
		return tcMaster.get_member_key(i);
	}

	function master_get_voting_subject() public view returns(address) {
		checkAuthentication();
		return tcMaster.get_voting_subject();
	}

	function master_get_voting_proposer() public view returns(address) {
		checkAuthentication();
		return tcMaster.get_voting_proposer();
	}

	function master_get_voting_kind() public view returns(bool) {
		checkAuthentication();
		return tcMaster.get_voting_kind();
	}

	function master_get_voting_approvals() public view returns(uint) {
		checkAuthentication();
		return tcMaster.get_voting_approvals();
	}

	function master_get_voting_rejections() public view returns(uint) {
		checkAuthentication();
		return tcMaster.get_voting_rejections();
	}

	function master_has_voted() public view returns(bool) {
		checkAuthentication();
		return tcMaster.has_voted();
	}


	/** WaitingList functions **/

	// Override
	function addRecipient(address adr, string bt, uint hla, bool accMM, uint signup, bool hp, uint age, uint region, uint country) public returns (address) {
		checkAuthentication();
		return tcMaster.addRecipient(adr, bt, hla, accMM , signup, hp, age, region, country);
	}

    function updateRecipient(address adr, string bt, uint hla, bool accMM, uint signup, bool hp, uint age, uint region, uint country) public returns (address) {
		checkAuthentication();
		return tcMaster.updateRecipient(adr, bt, hla, accMM, signup, hp, age, region, country);
	}
	
    function removeRecipient(address a) public returns (address) {
		checkAuthentication();
		return tcMaster.removeRecipient(a);
	}
}
