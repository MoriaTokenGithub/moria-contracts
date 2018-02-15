import "./HumanStandardToken.sol";
import "./DividendToken.sol";

pragma solidity ^0.4.15;

contract MoriaToken is DividendToken {

  function MoriaToken (uint256 _initialAmount,
                       uint8 _decimalUnits,
                       uint256 _buyBackTime
                      )  HumanStandardToken(
                        _initialAmount,
                        "Moria dividend token",
                        _decimalUnits,
                        "MORIA"
                      ) public {
                        holdings[msg.sender][0] = _initialAmount;
                        buyBackTime = _buyBackTime;
                      }  
}
