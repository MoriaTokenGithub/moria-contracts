import "./HumanStandardToken.sol";
import "./DividendToken.sol";
import "./LibQatt.sol";

pragma solidity ^0.4.18;

contract MoriaToken is HumanStandardToken, DividendToken {

  function MoriaToken (uint256 _initialAmount,
                       uint8 _decimalUnits
                      )  HumanStandardToken(
                        _initialAmount,
                        "Moria dividend token",
                        _decimalUnits,
                        "MORIA"
                      ) public {                        
                      }  
}
