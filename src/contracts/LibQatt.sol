/*
Quantity at Time Library
Data Structures and functions for adding and removing values over time and querying for a value at a given time.
  */

pragma solidity ^0.4.18;

library LibQatt {

  struct Node {
    uint total;
    uint time;
  }

  struct Qatt {
    Node[] nodes;
    uint head;
  }

  /*
    Gets the total value now
    */
  function total(Qatt storage self) internal constant returns (uint value) {
    if (self.head == 0) {
      return 0;
    }
    return self.nodes[self.head-1].total;
  }

  function totalAt(Qatt storage self, uint _time) internal constant returns (uint value) {
    if (self.head == 0) {
      return 0;
    }
    for (uint i = self.head - 1; i >= 0; i--) {
      if (self.nodes[i].time <= _time) {
        return self.nodes[i].total;
      }
    }
    return 0;
  }

  function add(Qatt storage self, uint _value) internal returns (bool success) {
    uint newTotal = total(self) + _value;
    require(newTotal >= total(self));
    self.head++;
    if (self.head > self.nodes.length) {
      // We need to add a new node
      self.nodes.push(Node({
        total: newTotal,
        time: now
      }));
    } else {
      // Reuse existing node
      self.nodes[self.head].total = newTotal;
      self.nodes[self.head].time = now;
    }
    return true;
  }

  function sub(Qatt storage self, uint _value) internal returns (bool success) {
    require(_value <= total(self));
    uint newTotal = total(self) - _value;
    if(newTotal == 0) {
      self.head = 0;
      return true;
    }
    for (uint i = 0; i < self.nodes.length; i++) {
      if (self.nodes[i].total <= newTotal) {
        self.head = i+1;
        self.nodes[i].total = newTotal;
      }
    }
    return true;
  }

}
