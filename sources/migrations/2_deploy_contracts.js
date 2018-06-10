var Colloquium = artifacts.require("./Colloquium.sol");
var ColloquiumUser = artifacts.require("./ColloquiumUser.sol");


module.exports = function(deployer) {
  deployer.deploy(Colloquium);
  deployer.link(Colloquium, [ColloquiumUser]);
  deployer.deploy(ColloquiumUser);
};
