import "./DividendToken.sol";

pragma solidity ^0.4.15;

contract MoriaToken is DividendToken {

  string public constant name = "MoriaToken";
  string public constant symbol = "MOR";
  uint8 public constant decimals = 18;

  uint256 public constant INITIAL_SUPPLY = 1000 * (10 ** uint256(decimals));

  function MoriaToken (uint256 _buyBackTime
                      ) public {
                        holdings[msg.sender][0] = INITIAL_SUPPLY;
                        totalAt[0] = INITIAL_SUPPLY;
                        buyBackTime = _buyBackTime;
                        totalSupply_ = INITIAL_SUPPLY;
                        admins[msg.sender] = true;
                        owner = msg.sender;
                      }  
}
