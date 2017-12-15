
pragma solidity ^0.4.18;

contract DividendToken {

  function payIn(uint256 _period) public payable returns (bool success);

  function claim(uint256 _period) public returns (uint256 amount);

  function claimAll() public returns (uint256 amount);

  function outstanding() public view returns (uint256 amount);

  function outstandingAt(uint256 _period) public view returns (uint256 amount);

  function buyBack() public returns (bool success);

  event Paid(address indexed _sender, uint256 indexed _period, uint256 amount);

  event Claimed(address indexed _recipient, uint256 indexed _period, uint256 _amount);

}
