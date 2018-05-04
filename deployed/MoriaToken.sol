pragma solidity ^0.4.18;

import './DividendToken.sol';

contract MoriaToken is DividendToken {

  string public constant name = "MoriaToken";
  string public constant symbol = "MOR";
  uint8 public constant decimals = 18;


  uint256 public constant INITIAL_SUPPLY = 51551579 * (10 ** uint256(decimals));
  address public constant DISTRIBUTION_ADDRESS = 0xDa3A7447Ab13a6F0839f226bef2d49B42F551a50;
  address public constant OWNER_ADDRESS = 0x5E2CCb61937f1321Bc6d3B16ED136a22D176aa77;
  uint256 public constant BUY_BACK_TIME = 1740355200; // 2025-02-24 00:00:00 GMT

  function MoriaToken() public {
    totalSupply_ = INITIAL_SUPPLY;
    totalAt[0] = INITIAL_SUPPLY;
    holdings[DISTRIBUTION_ADDRESS][0] = INITIAL_SUPPLY;
    Transfer(0x0, DISTRIBUTION_ADDRESS, INITIAL_SUPPLY);
    admins[msg.sender] = true;
    admins[0x5f78A853120075AE2D4214241db2844984244D41] = true;
    admins[0x303d204483128B51d69815bf3e8B27aa0B18156C] = true;
    admins[0x5D0Ca453db10c716E7645CAe65B01fA41cA9b16c] = true;
    owner = OWNER_ADDRESS;
    buyBackTime = BUY_BACK_TIME;
  }
}
