const MoriaToken = artifacts.require(`./MoriaToken.sol`)

module.exports = function(deployer) {
  // ESR20 tokens
  deployer.deploy(MoriaToken, 100000000, 6);
};
