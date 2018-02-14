var MoriaToken = artifacts.require("./MoriaToken.sol");

contract('MoriaToken', function(accounts) {

  it("should put 100000000 Moria in first account", function() {
    return MoriaToken.deployed().then(function(instance) {
      return instance.balanceOf.call(accounts[0]);
    }).then(function(balance) {
      assert.equal(balance.valueOf(), 100000000, "Account initialised incorrectly");
    });
  });

// Simple dividend payment
  it("should show outstanding dividend of 1000", function() {
    return MoriaToken.deployed().then(function(instance) {
    });
  });

// Total dividends owed over 2 periods after transfer
  it("should show outstanding dividend of 1500", function() {
  });

// Pay single dividend
  it("should pay outstanding dividend of 500", function() {
  });

// 
  it("", function() {
  });

  it("", function() {
  });

  it("", function() {
  });


});
