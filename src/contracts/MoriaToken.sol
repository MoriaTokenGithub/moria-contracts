import "./HumanStandardToken.sol";
import "./DividendToken.sol";
import "./LibQatt.sol";

pragma solidity ^0.4.18;

contract MoriaToken is HumanStandardToken, DividendToken {

  function MoriaToken (uint256 _initialAmount,
                       string _tokenName,
                       uint8 _decimalUnits,
                       string _tokenSymbol
                      )  HumanStandardToken(
                        _initialAmount,
                        _tokenName,
                        _decimalUnits,
                        _tokenSymbol
                      ) public {
                      }
  
   function payIn(uint256 _period) public payable returns (bool success);

  function claim(uint256 _period) public returns (uint256 amount);

  function claimAll() public returns (uint256 amount);

  function outstanding() public view returns (uint256 amount);

  function outstandingAt(uint256 _period) public view returns (uint256 amount);

  event Paid(address indexed _sender, uint256 indexed _period, uint256 amount);

  event Claimed(address indexed _recipient, uint256 indexed _period, uint256 _amount);

}
