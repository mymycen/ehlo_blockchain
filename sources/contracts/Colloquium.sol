pragma solidity ^0.4.18;

contract Colloquium {
  struct Voting {
  	address subject_addr;
  	address proposer_addr;
  	bool add;
  	uint approvals;
  	uint rejections;
  	mapping (address => bool) has_voted;
  }

  mapping (address => bool) is_member;
  address[] member_keys;
  Voting voting;

  constructor() public {
  	add_member(msg.sender);
  }

  function propose_new_member(address new_proposed_member) public {
  	require (! is_member[new_proposed_member]);
  
  	init_voting(new_proposed_member, true);
  }

  function propose_member_removal(address member) public {
  	require (is_member[member]);

  	init_voting(member, false);
  }

  function init_voting(address subject, bool add) internal {
  	require (! is_voting_in_process() && is_member[msg.sender]);
  	
  	voting = Voting({
  		subject_addr: subject,
  		proposer_addr: msg.sender,
		  add: add,
		  approvals: 0,
		  rejections: 0
  	});
  }

  function approve() public {
  	// voting in process && authorized member && not voted yet
  	require (is_voting_in_process() && is_member[msg.sender] && ! voting.has_voted[msg.sender]);
  	voting.approvals++;
  	voting.has_voted[msg.sender] = true;
  	evaluate_voting();
  }

  function reject() public {  	
  	// voting in process && authorized member && not has_voted yet
  	require (is_voting_in_process() && is_member[msg.sender] && ! voting.has_voted[msg.sender]);
  	voting.rejections++;
  	voting.has_voted[msg.sender] = true;
  	evaluate_voting();
  }

  function evaluate_voting() internal {
  	// fixed points are not yet implemented:
  	// ufixed(voting.approvals) / ufixed(get_member_count()) > 0.5
  	uint positiv_voting_result = 0;
	  uint negativ_voting_result = 0;

  	if(voting.approvals != 0) {
  	  positiv_voting_result = get_member_count() / voting.approvals;
  	}
  	if(voting.rejections != 0) {
	  negativ_voting_result = get_member_count() / voting.rejections;  		
  	}

  	if(positiv_voting_result == 1) {
  	  // finish voting
  	  if(voting.add) {
  	  	add_member(voting.subject_addr);
  	  } else {
  	  	remove_member(voting.subject_addr);
  	  }
  	  clear_voting();
    } else if (negativ_voting_result == 1 
    	|| (positiv_voting_result == 2 && negativ_voting_result == 2)) {
  	  // tie or rejection
  	  clear_voting();
    }
  }

  function clear_voting() internal {
  	voting = Voting({
  		subject_addr: 0,
  		proposer_addr: 0,
		  add: false,
		  approvals: 0,
		  rejections: 0
  	});
	  // clear voting table
	  for(uint i = 0; i < member_keys.length; i++) {
	  	delete voting.has_voted[member_keys[i]];
	  }
  }

  function add_member(address addr) internal {
  	if(! is_member[addr]) {
  		is_member[addr] = true;
  		member_keys.push(addr);
  	}
  }

  function remove_member(address addr) internal {
  	if(is_member[addr]) {
  	  delete is_member[addr];

  	  // delete entry in key and restore balance
  	  // since soldity just leaves the place empty where the member
  	  // is removed we need to manual balance the list
  	  bool found = false;
	  for(uint i = 0; i<member_keys.length; i++) {
	  	  if(found) {
	  	  	// shift all entries one entry done
	  	  	member_keys[i-1] = member_keys[i];
	  	  }
  
  	  	  if(member_keys[i] == addr) {
  	  	  	// element found we want to replace
  	  	  	found = true;
	  	  }
  	  }
  	  // delete the last entry in the list (is duplicated to the pre-last element)
  	  // decrement the length counter
  	  delete member_keys[member_keys.length - 1];
  	  member_keys.length--;
  	}
  }

  function is_voting_in_process() public view returns(bool) {
  	return voting.subject_addr != 0;
  }

  function get_member_count() public view returns(uint) {
  	return member_keys.length;
  } 

  function is_member_of_colloquium(address addr) public view returns(bool) {
  	return is_member[addr];
  }

  function am_member_of_colloquium() public view returns(bool) {
  	return is_member[msg.sender];
  }

  /**
   * Debug function to return the address belonging to the given index i.
  **/
  function __get_member_key(uint i) public view returns(address) {
    require (i < get_member_count());
    return member_keys[i];
  }
  
}
