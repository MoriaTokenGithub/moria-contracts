'use strict';

var _web = require('web3');

var _web2 = _interopRequireDefault(_web);

var _truffleContract = require('truffle-contract');

var _truffleContract2 = _interopRequireDefault(_truffleContract);

var _MoriaToken = require('../../build/contracts/MoriaToken.json');

var _MoriaToken2 = _interopRequireDefault(_MoriaToken);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var web3 = new _web2.default(new _web2.default.providers.HttpProvider("http://localhost:8545"));
var MoriaToken = (0, _truffleContract2.default)(_MoriaToken2.default);
MoriaToken.setProvider(web3.currentProvider);

var accounts;
var account;

var setAccounts = function setAccounts() {
  web3.eth.getAccounts(function (err, accs) {
    if (err != null) {
      alert("There was an error fetching your accounts.");
      return;
    }

    if (accs.length == 0) {
      alert("Couldn't get any accounts! Make sure your Ethereum client is configured correctly.");
      return;
    }

    accounts = accs;
    account = accounts[0];
  });
};

var isAddress = function isAddress(address) {
  if (!/^(0x)?[0-9a-f]{40}$/i.test(address)) {
    // check if it has the basic requirements of an address
    return false;
  } else if (/^(0x)?[0-9a-f]{40}$/.test(address) || /^(0x)?[0-9A-F]{40}$/.test(address)) {
    // If it's all small caps or all all caps, return true
    return true;
  } else {
    // Otherwise check each case
    return isChecksumAddress(address);
  }
};

var isChecksumAddress = function isChecksumAddress(address) {
  // Check each case
  address = address.replace('0x', '');
  var addressHash = sha3(address.toLowerCase());
  for (var i = 0; i < 40; i++) {
    // the nth letter should be uppercase if the nth digit of casemap is 1
    if (parseInt(addressHash[i], 16) > 7 && address[i].toUpperCase() !== address[i] || parseInt(addressHash[i], 16) <= 7 && address[i].toLowerCase() !== address[i]) {
      return false;
    }
  }
  return true;
};

module.exports = {

  init: function init() {
    setAccounts();
  },

  getBalance: function getBalance(address) {

    setAccounts();

    var token;
    var decimals;

    return MoriaToken.deployed().then(function (instance) {
      token = instance;
      return token.decimals();
    }).then(function (value) {
      decimals = value;
      var balance = token.balanceOf.call(address, { from: account });
      return balance;
    }).then(function (value) {
      return value / Math.pow(10, decimals);
    }).catch(function (e) {
      return -1;
    });
  },

  getTotalTokens: function getTotalTokens() {
    var token;
    var decimals;
    return MoriaToken.deployed().then(function (instance) {
      token = instance;
      return token.decimals();
    }).then(function (value) {
      decimals = value;
      console.log("decs = " + decimals);
      var total = token.totalSupply.call({ from: account });
      return total;
    }).then(function (value) {
      return value / Math.pow(10, decimals);
    }).catch(function (e) {
      console.log(e);
      return -1;
    });
  },

  getOutstandingDividends: function getOutstandingDividends(address) {
    setAccounts();

    return MoriaToken.deployed().then(function (instance) {
      return instance.outstandingFor.call(address, { from: account });
    });
  },

  payOutstandingDividends: function payOutstandingDividends(address, callback) {
    setAccounts();
    var token;
    return MoriaToken.deployed().then(function (instance) {
      return instance.claimDividendsFor(address, { from: account });
    }).then(function (value) {
      callback(value);
      return value;
    });
  },

  mintTokens: function mintTokens(address, amount, callback) {
    setAccounts();

    var token;
    var decimals;
    return MoriaToken.deployed().then(function (instance) {
      token = instance;
      return token.decimals();
    }).then(function (value) {
      decimals = value;
      var rawAmount = amount * Math.pow(10, decimals);
      return token.mint(address, rawAmount, { from: account });
    }).then(function (value) {
      callback(value);
      return value;
    });
  }
};
//# sourceMappingURL=api.js.map