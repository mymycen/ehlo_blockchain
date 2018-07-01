module.exports = {
  // See <http://truffleframework.com/docs/advanced/configuration>
  // to customize your Truffle configuration!
  networks: {
  	"development": {
  		host: "127.0.0.1",
  		port: 7545,
  		network_id: "*",
      gas: 97123880
      // set up ganache with gas limit 97123880
      // and gas price 20000000000
  	},
  	"ganache-cli": {
  		host: "127.0.0.1",
  		port: 8545,
  		network_id: "*"
  	}
  }
};
