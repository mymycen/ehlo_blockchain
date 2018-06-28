var Colloquium = artifacts.require("./Colloquium.sol");
var ColloquiumUser = artifacts.require("./ColloquiumUser.sol");
var WaitingList = artifacts.require("./WaitingList.sol");
//var Transplantcenter= artifacts.require("./Transplantcenter.sol");
//var Coordinatecenter= artifacts.require("./Coordinatercenter.sol");
//for testing
var ExposedWaitingList = artifacts.require("./ExposedWaitingList.sol");

module.exports = function(deployer) {
  deployer.deploy(Colloquium);
  deployer.link(Colloquium, [ColloquiumUser]);
  deployer.deploy(ColloquiumUser);
  deployer.deploy(WaitingList);
 // deployer.deploy(Transplantcenter);
 // deployer.deploy(Coordinatecenter);
  //for testing
  deployer.deploy(ExposedWaitingList);
};
