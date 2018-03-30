const MoriaToken = artifacts.require(`./MoriaToken.sol`)

module.exports = function(deployer) {
  // ESR20 tokens
  deployer.deploy(MoriaToken , 1740355200);
};
