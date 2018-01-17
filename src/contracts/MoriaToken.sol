import "./HumanStandardToken.sol";
import "./DividendToken.sol";

pragma solidity ^0.4.18;

contract MoriaToken is DividendToken {

  function MoriaToken (uint256 _initialAmount,
                       uint8 _decimalUnits
                      )  HumanStandardToken(
                        _initialAmount,
                        "Moria dividend token",
                        _decimalUnits,
                        "MORIA"
                      ) public {
                        holdings[msg.sender][0] = _initialAmount;
                      }  
}
