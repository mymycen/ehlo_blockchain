var Colloquium = artifacts.require("./Colloquium.sol");
var ColloquiumUser = artifacts.require("./ColloquiumUser.sol");
var WaitingList = artifacts.require("./WaitingList.sol");

module.exports = function(deployer) {
  deployer.deploy(Colloquium);
  deployer.link(Colloquium, [ColloquiumUser, WaitingList]);
  deployer.deploy(ColloquiumUser);

  deployer.deploy(WaitingList);
};
