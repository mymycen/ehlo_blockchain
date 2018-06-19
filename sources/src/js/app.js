
var Web3 = require('web3');

var web3 = new Web3("http://localhost:7545)");

var contract = new web3.eth.contract("../build/contracts/WaitingList.json");

