
pragma solidity ^0.4.18;

import './HumanStandardToken.sol';
import './SafeMath.sol';

contract DividendToken is HumanStandardToken {

  uint256 internal period = 0;
  mapping (uint256 => uint256) internal dividends;
  mapping (address => mapping (uint256 => uint256)) internal holdings;
  mapping (address => uint256) internal last;
  bool ended = false;  
  mapping (address => bool) admins;  

  modifier onlyLive() {
    require(!ended);
    _;
  }

  modifier onlyAdmin() {
    require(msg.sender == owner || admins[msg.sender]);
    _;
  }

  function addAdmin(address _adminAddr) onlyAdmin returns (bool success) {
    admins[_adminAddr] = true;
    return true;
  }

  function revokeAdmin(address _adminAddr) onlyAdmin returns (bool success) {
    require(msg.sender != _adminAddr);
    admins[_adminAddr] = false;
    return true;
  }

  function updateHoldings(address _holder) internal returns (bool success) {
    uint256 lastPeriod = last[_holder];
    uint256 lastAmount = holdings[_holder][lastPeriod];
    for (uint i = lastPeriod + 1; i <= period; i++) {
      holdings[_holder][i] = lastAmount;
    }
    last[_holder] = period;
    return true;
  }

  function balanceOf(address _owner) public view returns (uint256 balance) {
    return holdings[_owner][last[_owner]];
  }

  function transfer(address _to, uint256 _value) public returns (bool) {
    require(_to != address(0));
    uint256 senderLastPeriod = last[msg.sender];
    require(_value <= holdings[msg.sender][senderLastPeriod]);

    if (senderLastPeriod < period) {
      updateHoldings(msg.sender);
    }

    if (last[_to] < period) {
      updateHoldings(_to);
    }

    holdings[msg.sender][period] = holdings[msg.sender][period].sub(_value);
    holdings[_to][period] = holdings[_to][period].add(_value);
    Transfer(msg.sender, _to, _value);
  }

  function transferFrom(address _from, address _to, uint256 _value) public onlyLive returns (bool) {
    require(_to != address(0));
    uint256 senderLastPeriod = last[_from];
    require(_value <= holdings[_from][senderLastPeriod]);
    require(_value <= allowed[_from][msg.sender]);

     if (senderLastPeriod < period) {
       updateHoldings(_from);
    }

    if (last[_to] < period) {
      updateHoldings(_to);
    }

     holdings[msg.sender][period] = holdings[msg.sender][period].sub(_value);
    holdings[_to][period] = holdings[_to][period].add(_value);
    allowed[_from][msg.sender] = allowed[_from][msg.sender].sub(_value);
    Transfer(msg.sender, _to, _value);
  }  

  function payIn() public onlyLive onlyAdmin payable returns (bool success) {
    dividends[period] = msg.value;
    period += 1;
    Paid(msg.sender, period - 1, msg.value);
    return true;
  }

  function claim(uint256 _period) public returns (uint256 amount) {
    require(_period < period);
    require(holdings[msg.sender][_period] > 0);

    uint256 multiplier = dividends[_period].mul(holdings[msg.sender][_period]);
    uint256 toPay = multiplier.div(totalSupply);

    holdings[msg.sender][_period] = 0;
    msg.sender.transfer(toPay);
    Claimed(msg.sender, _period, toPay);
    return toPay;
  }

  function claimAll() public returns (uint256 amount)
  {
    uint256 claimed = 0;
    for (uint i = 0; i < period; i++) {
      if (holdings[msg.sender][i] > 0) {
        uint256 multiplier = dividends[i].mul(holdings[msg.sender][i]);
        uint256 toPay = multiplier.div(totalSupply);

        holdings[msg.sender][i] = 0;
        claimed += toPay;
      }
       msg.sender.transfer(toPay);
      Claimed(msg.sender, period-1, claimed);
      return claimed;
    }
  }

  function outstanding() public view returns (uint256 amount) {
    uint256 total = 0;
    for (uint i = 0; i < period; i++) {
      uint256 multiplier = dividends[i].mul(holdings[msg.sender][i]);
      uint256 owed = multiplier.div(totalSupply);
      total += owed;
    }
    return total;
  }

  function outstandingAt(uint256 _period) public view returns (uint256 amount) {
    if (holdings[msg.sender][_period] == 0) {
      return 0;
    }
    uint256 multiplier = dividends[_period].mul(holdings[msg.sender][_period]);
    return multiplier.div(totalSupply);    
  }

  function buyBack() public onlyLive payable returns (bool success) {
    dividends[period] = msg.value;
    period += 1;
    Paid(msg.sender, period - 1, msg.value);
    ended = true;
  }

  event Paid(address indexed _sender, uint256 indexed _period, uint256 amount);

  event Claimed(address indexed _recipient, uint256 indexed _period, uint256 _amount);

}
