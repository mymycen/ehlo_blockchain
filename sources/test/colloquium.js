var Colloquium = artifacts.require("./Colloquium.sol");

contract('Colloquium', function(accounts) {

  it("no voting process running", function() {
    return Colloquium.deployed().then(function(instance) {
      ColloquiumInstance = instance;

      return ColloquiumInstance.is_voting_in_process.call();
    }).then(function(res) {
      assert.equal(res, false, "Expected no voting running");
    });
  });

  it("propose and approve a new member (100% approval, 1 member)", function() {
    var ColloquiumInstance;
    return Colloquium.deployed().then(function(instance) {
      ColloquiumInstance = instance;

      return ColloquiumInstance.propose_new_member(accounts[1], {from: accounts[0]});
    }).then(function() {
      return assert_inProgress(ColloquiumInstance, true);
    }).then(function() {
      return ColloquiumInstance.approve({from: accounts[0]});
    }).then(function() {
      return assert_inProgress(ColloquiumInstance, false)
        .then(assert_memberCount(ColloquiumInstance, 2))
        .then(assert_isMemberOfColloquium(ColloquiumInstance, accounts[0], true))
        .then(assert_isMemberOfColloquium(ColloquiumInstance, accounts[1], true));
    });
  });

  it("propose and tie a new member (50:50, 2 members", function() {
    var ColloquiumInstance;
    return Colloquium.deployed().then(function(instance) {
      ColloquiumInstance = instance;

      return ColloquiumInstance.propose_new_member(accounts[2], {from: accounts[0]});
    }).then(function() {
      return assert_inProgress(ColloquiumInstance, true);
    }).then(function() {
      return ColloquiumInstance.reject({from: accounts[0]})
      .then(ColloquiumInstance.approve({from: accounts[1]}))
    }).then(function() {
      return assert_inProgress(ColloquiumInstance, false)
        .then(assert_memberCount(ColloquiumInstance, 2))
        .then(assert_isMemberOfColloquium(ColloquiumInstance, accounts[0], true))
        .then(assert_isMemberOfColloquium(ColloquiumInstance, accounts[1], true))
        .then(assert_isMemberOfColloquium(ColloquiumInstance, accounts[2], false));
    });
  });

  it("propose and reject a new member (100% rejection, 2 members)", function() {
    var ColloquiumInstance;
    return Colloquium.deployed().then(function(instance) {
      ColloquiumInstance = instance;

      return ColloquiumInstance.propose_new_member(accounts[2], {from: accounts[1]});
    }).then(function() {
      return assert_inProgress(ColloquiumInstance, true);
    }).then(function() {
      return ColloquiumInstance.reject({from: accounts[0]})
      .then(ColloquiumInstance.reject({from: accounts[1]}))
    }).then(function() {
      return assert_inProgress(ColloquiumInstance, false)
        .then(assert_memberCount(ColloquiumInstance, 2))
        .then(assert_isMemberOfColloquium(ColloquiumInstance, accounts[0], true))
        .then(assert_isMemberOfColloquium(ColloquiumInstance, accounts[1], true))
        .then(assert_isMemberOfColloquium(ColloquiumInstance, accounts[2], false));
    });
  });

  it("propose and approve a new member (100% approval, 2 members))", function() {
    var ColloquiumInstance;
    return Colloquium.deployed().then(function(instance) {
      ColloquiumInstance = instance;

      return ColloquiumInstance.propose_new_member(accounts[2], {from: accounts[1]});
    }).then(function() {
      return assert_inProgress(ColloquiumInstance, true);
    }).then(function() {
      return ColloquiumInstance.approve({from: accounts[0]})
      .then(ColloquiumInstance.approve({from: accounts[1]}))
    }).then(function() {
      return assert_inProgress(ColloquiumInstance, false)
        .then(assert_memberCount(ColloquiumInstance, 3))
        .then(assert_isMemberOfColloquium(ColloquiumInstance, accounts[0], true))
        .then(assert_isMemberOfColloquium(ColloquiumInstance, accounts[1], true))
        .then(assert_isMemberOfColloquium(ColloquiumInstance, accounts[2], true));
    });
  });

  it("propose and reject a new member (66% rejection, 3 members))", function() {
    var ColloquiumInstance;
    return Colloquium.deployed().then(function(instance) {
      ColloquiumInstance = instance;

      return ColloquiumInstance.propose_new_member(accounts[3], {from: accounts[0]});
    }).then(function() {
      return assert_inProgress(ColloquiumInstance, true);
    }).then(function() {
      return ColloquiumInstance.approve({from: accounts[0]})
      .then(ColloquiumInstance.reject({from: accounts[1]}))
      .then(ColloquiumInstance.reject({from: accounts[2]}))
    }).then(function() {
      return assert_inProgress(ColloquiumInstance, false)
        .then(assert_memberCount(ColloquiumInstance, 3))
        .then(assert_isMemberOfColloquium(ColloquiumInstance, accounts[0], true))
        .then(assert_isMemberOfColloquium(ColloquiumInstance, accounts[1], true))
        .then(assert_isMemberOfColloquium(ColloquiumInstance, accounts[2], true))
        .then(assert_isMemberOfColloquium(ColloquiumInstance, accounts[3], false));
    });
  });

  it("propose and approve a new member (66% approval, 3 members))", function() {
    var ColloquiumInstance;
    return Colloquium.deployed().then(function(instance) {
      ColloquiumInstance = instance;

      return ColloquiumInstance.propose_new_member(accounts[3], {from: accounts[0]});
    }).then(function() {
      return assert_inProgress(ColloquiumInstance, true);
    }).then(function() {
      return ColloquiumInstance.approve({from: accounts[0]})
      .then(ColloquiumInstance.reject({from: accounts[1]}))
      .then(ColloquiumInstance.approve({from: accounts[2]}))
    }).then(function() {
      return assert_inProgress(ColloquiumInstance, false)
        .then(assert_memberCount(ColloquiumInstance, 4))
        .then(assert_isMemberOfColloquium(ColloquiumInstance, accounts[0], true))
        .then(assert_isMemberOfColloquium(ColloquiumInstance, accounts[1], true))
        .then(assert_isMemberOfColloquium(ColloquiumInstance, accounts[2], true))
        .then(assert_isMemberOfColloquium(ColloquiumInstance, accounts[3], true));
    });
  });

  // ------------------- removal ---------------------

  it("propose and approve a member removal (75% approval, 4 members))", function() {
    var ColloquiumInstance;
    return Colloquium.deployed().then(function(instance) {
      ColloquiumInstance = instance;

      return ColloquiumInstance.propose_member_removal(accounts[1], {from: accounts[0]});
    }).then(function() {
      return assert_inProgress(ColloquiumInstance, true);
    }).then(function() {
      return ColloquiumInstance.approve({from: accounts[0]})
      .then(ColloquiumInstance.reject({from: accounts[1]}))
      .then(ColloquiumInstance.approve({from: accounts[2]}))
      .then(ColloquiumInstance.approve({from: accounts[3]}))
    }).then(function() {
      return assert_inProgress(ColloquiumInstance, false)
        .then(assert_memberCount(ColloquiumInstance, 3))
        .then(assert_isMemberOfColloquium(ColloquiumInstance, accounts[0], true))
        .then(assert_isMemberOfColloquium(ColloquiumInstance, accounts[1], false))
        .then(assert_isMemberOfColloquium(ColloquiumInstance, accounts[2], true))
        .then(assert_isMemberOfColloquium(ColloquiumInstance, accounts[3], true));
    });
  });

  it("propose and (early) approve a member removal (66% approval, 3 members))", function() {
    var ColloquiumInstance;
    return Colloquium.deployed().then(function(instance) {
      ColloquiumInstance = instance;

      return ColloquiumInstance.propose_member_removal(accounts[3], {from: accounts[0]});
    }).then(function() {
      return assert_inProgress(ColloquiumInstance, true);
    }).then(function() {
      return ColloquiumInstance.approve({from: accounts[0]})
      .then(ColloquiumInstance.approve({from: accounts[2]}))
    }).then(function() {
      return assert_inProgress(ColloquiumInstance, false)
        .then(assert_memberCount(ColloquiumInstance, 2))
        .then(assert_isMemberOfColloquium(ColloquiumInstance, accounts[0], true))
        .then(assert_isMemberOfColloquium(ColloquiumInstance, accounts[1], false))
        .then(assert_isMemberOfColloquium(ColloquiumInstance, accounts[2], true))
        .then(assert_isMemberOfColloquium(ColloquiumInstance, accounts[3], false))
        .then(assert_hasMemberKeyPosition(ColloquiumInstance, 0, accounts[0]))
        .then(assert_hasMemberKeyPosition(ColloquiumInstance, 1, accounts[2]));
    });
  });



  function assert_inProgress(instance, expected_state) {
    return instance.is_voting_in_process.call()
      .then(function(res) {
        assert.equal(res, expected_state, "States did not match");
       });
  }

  function assert_memberCount(instance, expected_count) {
    return instance.get_member_count.call()
      .then(function(res) {
        assert.equal(res, expected_count, "Count did not match");
       });
  }

  function assert_isMemberOfColloquium(instance, addr, expected_state) {
    return instance.is_member_of_colloquium(addr)
      .then(function(res) {
        assert.equal(res, expected_state, "Address state did not match");
       });
  }

  function assert_hasMemberKeyPosition(instance, index, expected_address) {
    return instance.__get_member_key(index)
      .then(function(res) {
        assert.equal(res, expected_address, "Address was misplaced")
      });
  }

});
