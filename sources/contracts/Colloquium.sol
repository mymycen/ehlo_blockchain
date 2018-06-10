pragma solidity ^0.4.22;

library Colloquium {
  struct Voting {
    address subject_addr;
    address proposer_addr;
    bool add;
    uint approvals;
    uint rejections;
    mapping (address => bool) has_voted;
  }

  struct Session {
    mapping (address => bool) is_member;
    address[] member_keys;
    Voting voting;
  }

  function init_session(Session storage self, address creator) public {
    require (self.member_keys.length == 0);
    // what happens if mapping is not empty?
    
  	add_member(self, creator);
  }

  function propose_new_member(Session storage self, address new_proposed_member, address sender) public {
  	require (! self.is_member[new_proposed_member]);

  	init_voting(self, new_proposed_member, true, sender);
  }

  function propose_member_removal(Session storage self, address member, address sender) public {
  	require (self.is_member[member]);

  	init_voting(self, member, false, sender);
  }

  function init_voting(Session storage self, address subject, bool add, address sender) internal {
  	require (! is_voting_in_process(self) && self.is_member[sender]);
  	
  	self.voting = Voting({
  		subject_addr: subject,
  		proposer_addr: sender,
      add: add,
      approvals: 0,
      rejections: 0
      });
  }

  function approve(Session storage self, address sender) public {
  	// voting in process && authorized member && not voted yet
  	require (is_voting_in_process(self) && self.is_member[sender] && ! self.voting.has_voted[sender]);
  	self.voting.approvals++;
  	self.voting.has_voted[sender] = true;
  	evaluate_voting(self);
  }

  function reject(Session storage self, address sender) public {  	
  	// voting in process && authorized member && not has_voted yet
  	require (is_voting_in_process(self) && self.is_member[sender] && ! self.voting.has_voted[sender]);
  	self.voting.rejections++;
  	self.voting.has_voted[sender] = true;
  	evaluate_voting(self);
  }

  function evaluate_voting(Session storage self) internal {
  	// fixed points are not yet implemented:
  	// ufixed(voting.approvals) / ufixed(get_member_count()) > 0.5
  	uint positiv_voting_result = 0;
   uint negativ_voting_result = 0;

   if(self.voting.approvals != 0) {
     positiv_voting_result = get_member_count(self) / self.voting.approvals;
   }
   if(self.voting.rejections != 0) {
     negativ_voting_result = get_member_count(self) / self.voting.rejections;  		
   }

   if(positiv_voting_result == 1) {
     // finish voting
     if(self.voting.add) {
      add_member(self, self.voting.subject_addr);
      } else {
        remove_member(self, self.voting.subject_addr);
      }
      clear_voting(self);
      } else if (negativ_voting_result == 1 
       || (positiv_voting_result == 2 && negativ_voting_result == 2)) {
       // tie or rejection
       clear_voting(self);
     }
    }

   function clear_voting(Session storage self) internal {
     self.voting = Voting({
      subject_addr: 0,
      proposer_addr: 0,
      add: false,
      approvals: 0,
      rejections: 0
      });
     // clear voting table
     for(uint i = 0; i < self.member_keys.length; i++) {
      delete self.voting.has_voted[self.member_keys[i]];
    }
  }

  function add_member(Session storage self, address addr) internal {
  	if(! self.is_member[addr]) {
  		self.is_member[addr] = true;
  		self.member_keys.push(addr);
  	}
  }

  function remove_member(Session storage self, address addr) internal {
  	if(self.is_member[addr]) {
     delete self.is_member[addr];

     // delete entry in key and restore balance
     // since soldity just leaves the place empty where the member
     // is removed we need to manual balance the list
     bool found = false;
     for(uint i = 0; i < self.member_keys.length; i++) {
      if(found) {
       // shift all entries one entry done
       self.member_keys[i-1] = self.member_keys[i];
     }

     if(self.member_keys[i] == addr) {
       // element found we want to replace
       found = true;
     }
   }
   // delete the last entry in the list (is duplicated to the pre-last element)
   // decrement the length counter
   delete self.member_keys[self.member_keys.length - 1];
   self.member_keys.length--;
 }
}

function is_voting_in_process(Session storage self) public view returns(bool) {
 return self.voting.subject_addr != 0;
}

function get_member_count(Session storage self) public view returns(uint) {
 return self.member_keys.length;
} 

function is_member_of_colloquium(Session storage self, address addr) public view returns(bool) {
 return self.is_member[addr];
}

  /**
   * Debug function to return the address belonging to the given index i.
   **/
   function __get_member_key(Session storage self, uint i) public view returns(address) {
    require (i < get_member_count(self));
    return self.member_keys[i];
  }
  
}
