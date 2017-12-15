const HumanStandardToken = artifacts.require(`./HumanStandardToken.sol`)
const Crowdsale = artifacts.require(`./Crowdsale.sol`)

module.exports = function(deployer) {
  // ESR20 tokens
  deployer.deploy(HumanStandardToken, 100000000, "Premedit", 6, "PMED");
  deployer.deploy(Crowdsale, Date.now() + (10 * 1000), Date.now() + (24 * 60 * 60 * 1000), 1, 0x0123);
};
