pragma solidity ^0.4.15;

import './HumanStandardToken.sol';
import './SafeMath.sol';

contract DividendToken is HumanStandardToken {

  uint256 public period = 0;
  mapping (uint256 => uint256) public dividends;
  mapping (address => mapping (uint256 => uint256)) internal holdings;
  mapping (address => uint256) internal last;
  mapping (address => uint256) public claimedTo;
  uint256 buyBackTime;
  bool ended = false;
  
  mapping (address => bool) admins;

  modifier canBuyBack() {
    require(now > buyBackTime);
    _;
  }

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

  function balanceOf(address _owner) public returns (uint256 balance) {
    return holdings[_owner][last[_owner]];
  }

  function mint(address _to, uint256 _amount) onlyOwner canMint public returns (bool) {
    totalSupply = totalSupply.add(_amount);
    holdings[_to][period] = holdings[_to][period].add(_amount);
    Mint(_to, _amount);
    Transfer(address(0), _to, _amount);
  }

  function transfer(address _to, uint256 _value) onlyLive public returns (bool) {
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

    return true;
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

     holdings[msg.sender][period] = holdings[_from][period].sub(_value);
    holdings[_to][period] = holdings[_to][period].add(_value);
    allowed[_from][msg.sender] = allowed[_from][msg.sender].sub(_value);
    Transfer(msg.sender, _to, _value);

    return true;
  }  

  function payIn() public onlyLive onlyAdmin payable returns (bool success) {
    dividends[period] = msg.value;
    period += 1;
    Paid(msg.sender, period - 1, msg.value);
    return true;
  }
  
  function claimDividends() public returns (uint256 amount) {
    uint256 total = 0;
    if (last[msg.sender] < period) {
      updateHoldings(msg.sender);
    }
    for (uint i = claimedTo[msg.sender]; i <= period; i++) {
      if (holdings[msg.sender][i] > 0) {
        uint256 multiplier = dividends[i].mul(holdings[msg.sender][i]);
        total += multiplier.div(totalSupply);
      }
    }
    claimedTo[msg.sender] = period+1;
    if(total > 0) {
      msg.sender.transfer(total);
      Claimed(msg.sender, i, total);
    }
    return total;
  }

  function claimDividendsFor(address _address) onlyOwner public returns (uint256 amount) {
    uint256 total = 0;
    if (last[msg.sender] < period) {
      updateHoldings(_address);
    }
    for (uint i = claimedTo[_address]; i <= period; i++) {
      if (holdings[_address][i] > 0) {
        uint256 multiplier = dividends[i].mul(holdings[_address][i]);
        total += multiplier.div(totalSupply);
      }
    }
    claimedTo[_address] = period+1;
    if(total > 0) {
      _address.transfer(total);
      Claimed(_address, i, total);
    }
    return total;
  }
  function outstandingFor(address _address) public returns (uint256 amount) {
    uint256 total = 0;
    for (uint i = 0; i < period; i++) {
      uint256 multiplier = dividends[i].mul(holdings[_address][i]);
      uint256 owed = multiplier.div(totalSupply);
      total += owed;
    }
    return total;
  }

  function outstanding() public returns (uint256 amount) {
    uint256 total = 0;
    for (uint i = 0; i < period; i++) {
      uint256 multiplier = dividends[i].mul(holdings[msg.sender][i]);
      uint256 owed = multiplier.div(totalSupply);
      total += owed;
    }
    return total;
  }

  function outstandingAtFor(uint _period, address _address) public returns (uint256 amount) {
    if (holdings[_address][_period] == 0) {
      return 0;
    }
    uint256 multiplier = dividends[_period].mul(holdings[_address][_period]);
    return multiplier.div(totalSupply);    
  }

  function outstandingAt(uint256 _period) public returns (uint256 amount) {
    if (holdings[msg.sender][_period] == 0) {
      return 0;
    }
    uint256 multiplier = dividends[_period].mul(holdings[msg.sender][_period]);
    return multiplier.div(totalSupply);    
  }

  function buyBack() public onlyAdmin onlyLive canBuyBack payable returns (bool success) {
    dividends[period] = msg.value;
    period += 1;
    Paid(msg.sender, period - 1, msg.value);
    ended = true;
  }

  event Paid(address indexed _sender, uint256 indexed _period, uint256 amount);

  event Claimed(address indexed _recipient, uint256 indexed _period, uint256 _amount);

}
