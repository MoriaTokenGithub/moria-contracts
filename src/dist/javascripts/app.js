'use strict';

var _web = require('web3');

var _web2 = _interopRequireDefault(_web);

var _truffleContract = require('truffle-contract');

var _truffleContract2 = _interopRequireDefault(_truffleContract);

var _MoriaToken = require('../../contracts/MoriaToken.sol');

var _MoriaToken2 = _interopRequireDefault(_MoriaToken);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// Import the page's CSS. Webpack will know what to do with it.
//import aceCss from 'ace-css/css/ace.min.css'

// Import libraries we need.
require('ace-css/css/ace.css');
require('font-awesome/css/font-awesome.css');

// Import our contract artifacts and turn them into usable abstractions.


var MoriaToken = (0, _truffleContract2.default)(_MoriaToken2.default);

// The following code is simple to show off interacting with your contracts.
// As your needs grow you will likely need to change its form and structure.
// For application bootstrapping, check out window.addEventListener below.
var accounts;
var account;

window.App = {
  start: function start() {
    var self = this;

    // Bootstrap the MoriaToken abstraction for Use.
    MoriaToken.setProvider(web3.currentProvider);

    // Get the initial account balance so it can be displayed.
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

      self.refreshBalance();
    });
  },

  setStatus: function setStatus(message) {
    var status = document.getElementById("status");
    status.innerHTML = message;
  },

  refreshBalance: function refreshBalance() {
    var self = this;

    var token;
    var decimals;
    MoriaToken.deployed().then(function (instance) {
      token = instance;
      return token.decimals();
    }).then(function (value) {
      decimals = value;
      return token.balanceOf.call(account, { from: account });
    }).then(function (value) {
      var balance_element = document.getElementById("balance");
      var balance = value.valueOf() / Math.pow(10, decimals);
      balance_element.innerHTML = balance;
    }).catch(function (e) {
      console.log(e);
      self.setStatus("Error getting balance; see log.");
    });
  },

  sendCoin: function sendCoin() {
    var self = this;

    var amount = parseInt(document.getElementById("amount").value);
    var receiver = document.getElementById("receiver").value;

    this.setStatus("Initiating transaction... (please wait)");

    var token;
    var decimals;
    MoriaToken.deployed().then(function (instance) {
      token = instance;
      return token.decimals();
    }).then(function (value) {
      decimals = value;
      var realAmount = amount * Math.pow(10, decimals);
      return token.transfer(receiver, realAmount, { from: account });
    }).then(function (status) {
      self.setStatus("Transaction complete");
      self.refreshBalance();
    }).catch(function (e) {
      console.log(e);
      self.setStatus("Error sending coin; see log.");
    });
  }
};

window.addEventListener('load', function () {
  // Checking if Web3 has been injected by the browser (Mist/MetaMask)
  if (typeof web3 !== 'undefined') {
    console.warn("Using web3 detected from external source. If you find that your accounts don't appear or you have 0 MetaCoin, ensure you've configured that source properly. If using MetaMask, see the following link. Feel free to delete this warning. :) http://truffleframework.com/tutorials/truffle-and-metamask");
    // Use Mist/MetaMask's provider
    window.web3 = new _web2.default(web3.currentProvider);
  } else {
    console.warn("No web3 detected. Falling back to http://localhost:8545. You should remove this fallback when you deploy live, as it's inherently insecure. Consider switching to Metamask for development. More info here: http://truffleframework.com/tutorials/truffle-and-metamask");
    // fallback - use your fallback strategy (local node / hosted node + in-dapp id mgmt / fail)

    console.log("RPCPORT set as " + process.env.RPC);
    window.web3 = new _web2.default(new _web2.default.providers.HttpProvider("http://localhost:" + process.env.RPC));
  }
  $('.tabgroup > div').hide();
  $('.tabgroup > div:first-of-type').show();
  $('.tabs a').click(function (e) {
    e.preventDefault();
    var $this = $(this),
        tabgroup = '#' + $this.parents('.tabs').data('tabgroup'),
        others = $this.closest('li').siblings().children('a'),
        target = $this.attr('href');
    others.removeClass('active');
    $this.addClass('active');
    $(tabgroup).children('div').hide();
    $(target).show();
  });

  App.start();
});
//# sourceMappingURL=app.js.map