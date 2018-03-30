'use strict';

var _web = require('web3');

var _web2 = _interopRequireDefault(_web);

var _truffleContract = require('truffle-contract');

var _truffleContract2 = _interopRequireDefault(_truffleContract);

var _MoriaToken = require('../../build/contracts/MoriaToken.json');

var _MoriaToken2 = _interopRequireDefault(_MoriaToken);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

console.log(__dirname);


// needs to get env
var web3 = new _web2.default(new _web2.default.providers.HttpProvider("http://devnet:8545"));
var MoriaToken = (0, _truffleContract2.default)(_MoriaToken2.default);
MoriaToken.setProvider(web3.currentProvider);
fixTruffleContractCompatibilityIssue(MoriaToken);

// Workaround for a compatibility issue between web3@1.0.0-beta.29 and truffle-contract@3.0.3
// https://github.com/trufflesuite/truffle-contract/issues/57#issuecomment-331300494
function fixTruffleContractCompatibilityIssue(contract) {
  if (typeof contract.currentProvider.sendAsync !== "function") {
    contract.currentProvider.sendAsync = function () {
      return contract.currentProvider.send.apply(contract.currentProvider, arguments);
    };
  }
  return contract;
}

var accounts;
var account;

var setAccounts = function setAccounts() {
  web3.eth.getAccounts(function (err, accs) {
    if (err != null) {
      console.log("There was an error fetching your accounts." + err);
      return;
    }

    if (accs.length == 0) {
      console.log("Couldn't get any accounts! Make sure your Ethereum client is configured correctly.");
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
      console.log(e);
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
    return MoriaToken.deployed().then(function (instance) {
      return instance.outstandingFor.call(address, { from: account });
    });
  },

  payOutstandingDividends: function payOutstandingDividends(address, callback) {
    console.log("paying dividends for " + address);
    var token;

    return MoriaToken.deployed().then(function (instance) {
      token = instance;
      //console.log(web3.eth.getBalance(instance.address).toString());
      return 6700000; //token.claimDividendsFor.estimateGas(address, {from: account});
    }).then(function (gasCost) {
      console.log("gas cost = " + gasCost);
      return token.claimDividendsFor(address, { from: account, gas: gasCost });
    }).then(function (value) {
      callback(value);
      return value;
    });
  },

  mintTokens: function mintTokens(address, amount, callback) {
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
  },

  dividendHistory: function dividendHistory(address) {
    var token;
    var period;
    var dividends;

    return MoriaToken.deployed().then(function (instance) {
      token = instance;
      return token.period();
    }).then(function (_period) {
      period = _period;
      console.log('history to period: ' + period);
      return token.dividendHistoryFor.call(address, { from: account });
    }).then(function (_dividends) {
      dividends = _dividends;
      return token.dividendDateHistory.call({ from: account });
      //return dividends;
    }).then(function (_dates) {
      var historyObj = [];
      for (var i = 0; i < _dates.length; i++) {
        historyObj.push({ "amount": dividends[i],
          "date": _dates[i] * 1000 });
      }
      return historyObj;
    });
  },

  payDividend: function payDividend(amount) {
    var token;

    return MoriaToken.deployed().then(function (instance) {
      token = instance;
      //return token.payIn({from: account, value: amount});
      instance.sendTransaction({ from: account, value: amount, gas: 180000 });
    });
  },

  currentPeriod: function currentPeriod() {
    return MoriaToken.deployed().then(function (instance) {
      return instance.period.call({ from: account });
    });
  },

  claimedTo: function claimedTo(address) {
    return MoriaToken.deployed().then(function (instance) {
      return instance.claimedTo.call(address, { from: account });
    });
  },

  transfer: function transfer(to, amount) {
    var token;
    return MoriaToken.deployed().then(function (instance) {
      token = instance;
      return token.decimals();
    }).then(function (value) {
      var decimals = value;
      var rawAmount = amount * Math.pow(10, decimals);
      token.transfer.estimateGas(to, rawAmount, { from: account }).then(console.log);
      return token.transfer(to, rawAmount, { from: account, gas: 6700000 });
    });
  },

  lock: function lock(address) {
    return MoriaToken.deployed().then(function (instance) {
      return instance.addLock(address, { from: account, gas: 180000 });
    });Di;
  },

  unlock: function unlock(account) {
    return MoriaToken.deployed().then(function (instance) {
      return instance.revokeLock(address, { from: account, gas: 180000 });
    });
  },

  accountBalance: function accountBalance(account) {
    return web3.eth.getBalance(account).then(function (amount) {
      return amount;
    });
  }
};
//# sourceMappingURL=api.js.map